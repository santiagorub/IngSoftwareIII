import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import cors from 'cors';

type PeerId = string;

type SignalMessage =
  | { type: 'hello'; peerId: PeerId }
  | { type: 'signal'; from: PeerId; to: PeerId; data: unknown }
  | { type: 'peers' }
  | { type: 'goodbye' };

type ServerToClient =
  | { type: 'welcome'; self: PeerId; peers: PeerId[] }
  | { type: 'peer-joined'; peerId: PeerId }
  | { type: 'peer-left'; peerId: PeerId }
  | { type: 'signal'; from: PeerId; data: unknown };

const PORT = Number(process.env.PORT || 3001);

const wss = new WebSocketServer({ port: PORT });

// Telemetría simple en memoria
type Telemetry = {
  neighborsByPeer: Map<PeerId, Set<PeerId>>;
  logs: Array<{ ts: number; peerId: PeerId; level: 'info' | 'warn' | 'error'; msg: string }>;
};

const telemetry: Telemetry = {
  neighborsByPeer: new Map(),
  logs: [],
};

const peerIdToSocket = new Map<PeerId, WebSocket>();

function safeSend(socket: WebSocket, msg: ServerToClient) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

wss.on('connection', (socket) => {
  let assignedPeerId: PeerId | null = null;

  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(String(raw)) as SignalMessage;
      if (msg.type === 'hello') {
        const requestedId = msg.peerId;
        // If duplicated, add suffix
        let finalId = requestedId;
        let counter = 1;
        while (peerIdToSocket.has(finalId)) {
          finalId = `${requestedId}-${counter++}`;
        }
        assignedPeerId = finalId;
        peerIdToSocket.set(finalId, socket);

        const peers = Array.from(peerIdToSocket.keys()).filter((p) => p !== finalId);
        safeSend(socket, { type: 'welcome', self: finalId, peers });
        // notify others
        for (const [pid, ws] of peerIdToSocket) {
          if (pid !== finalId) {
            safeSend(ws, { type: 'peer-joined', peerId: finalId });
          }
        }
      } else if (msg.type === 'signal') {
        const target = peerIdToSocket.get(msg.to);
        if (assignedPeerId && target) {
          safeSend(target, { type: 'signal', from: assignedPeerId, data: msg.data });
        }
      } else if (msg.type === 'peers') {
        if (assignedPeerId) {
          const peers = Array.from(peerIdToSocket.keys()).filter((p) => p !== assignedPeerId);
          safeSend(socket, { type: 'welcome', self: assignedPeerId, peers });
        }
      } else if ((msg as any).type === 'telemetry') {
        const { neighbors, log } = (msg as any) as { neighbors?: PeerId[]; log?: { level: 'info' | 'warn' | 'error'; msg: string } };
        if (assignedPeerId) {
          if (neighbors) {
            telemetry.neighborsByPeer.set(assignedPeerId, new Set(neighbors));
          }
          if (log) {
            telemetry.logs.unshift({ ts: Date.now(), peerId: assignedPeerId, level: log.level, msg: log.msg });
            telemetry.logs = telemetry.logs.slice(0, 1000);
          }
        }
      }
    } catch (err) {
      // ignore malformed messages
    }
  });

  socket.on('close', () => {
    if (assignedPeerId) {
      peerIdToSocket.delete(assignedPeerId);
      telemetry.neighborsByPeer.delete(assignedPeerId);
      for (const [, ws] of peerIdToSocket) {
        safeSend(ws, { type: 'peer-left', peerId: assignedPeerId });
      }
    }
  });
});

// eslint-disable-next-line no-console
console.log(`[signal-server] Listening on ws://localhost:${PORT}`);

// HTTP dashboard (solo para visualizar grafo y logs)
const app = express();
app.use(cors());

app.get('/dashboard/graph', (_req, res) => {
  const nodes = Array.from(new Set([...
    Array.from(peerIdToSocket.keys()),
    ...Array.from(telemetry.neighborsByPeer.keys()),
  ].flat())).map((id) => ({ id }));
  const edges: Array<{ from: PeerId; to: PeerId }> = [];
  for (const [peer, set] of telemetry.neighborsByPeer) {
    for (const nb of set) {
      edges.push({ from: peer, to: nb });
    }
  }
  res.json({ nodes, edges });
});

app.get('/dashboard/logs', (_req, res) => {
  res.json({ logs: telemetry.logs.slice(0, 500) });
});

const HTTP_PORT = Number(process.env.HTTP_PORT || 3002);
app.listen(HTTP_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[dashboard] HTTP on http://localhost:${HTTP_PORT}`);
});

// Simple HTML dashboard for visualization
app.get('/dashboard', (_req, res) => {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>P2P Dashboard</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; background:#0b1220; color:#e3f2fd; }
      header { padding: 12px 16px; border-bottom: 1px solid #14314a; }
      main { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; padding: 12px; }
      .panel { background: #0f172a; border: 1px solid #14314a; border-radius: 8px; padding: 8px; }
      .title { margin: 0 0 8px 0; font-size: 14px; color: #90caf9; }
      svg { width: 100%; height: 560px; background: #0b1220; border-radius: 6px; }
      pre { height: 560px; overflow: auto; background: #0b1220; color: #c8e6c9; padding: 8px; border-radius: 6px; }
      .legend span { display: inline-block; margin-right: 12px; font-size: 12px; }
      .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; }
    </style>
  </head>
  <body>
    <header>
      <strong>Dashboard Global</strong>
      <div class="legend">
        <span><span class="dot" style="background:#1e88e5"></span>Self (no aplica aquí)</span>
        <span><span class="dot" style="background:#90a4ae"></span>Vecino</span>
        <span><span class="dot" style="background:#cfd8dc"></span>Peer conocido</span>
        <span><span class="dot" style="background:#ff9800"></span>Arista</span>
      </div>
    </header>
    <main>
      <div class="panel">
        <h3 class="title">Grafo de peers (global)</h3>
        <svg id="graph" viewBox="0 0 900 560"></svg>
      </div>
      <div class="panel">
        <h3 class="title">Logs recientes</h3>
        <pre id="logs"></pre>
      </div>
    </main>
    <script>
      const svg = document.getElementById('graph');
      const logsEl = document.getElementById('logs');
      const W = 900, H = 560, CX = W/2, CY = H/2, R = 220;

      function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }

      function drawGraph(data){
        clear(svg);
        const nodes = data.nodes || [];
        const edges = data.edges || [];
        const n = nodes.length;
        const pos = new Map();
        nodes.forEach((node, i) => {
          const angle = (i / Math.max(1, n)) * Math.PI * 2;
          const x = CX + R * Math.cos(angle);
          const y = CY + R * Math.sin(angle);
          pos.set(node.id, { x, y });
        });

        // edges
        edges.forEach(e => {
          const a = pos.get(e.from); const b = pos.get(e.to);
          if (!a || !b) return;
          const line = document.createElementNS('http://www.w3.org/2000/svg','line');
          line.setAttribute('x1', a.x);
          line.setAttribute('y1', a.y);
          line.setAttribute('x2', b.x);
          line.setAttribute('y2', b.y);
          line.setAttribute('stroke', '#ff9800');
          line.setAttribute('stroke-width', '2');
          svg.appendChild(line);
        });

        // nodes
        nodes.forEach(node => {
          const p = pos.get(node.id); if (!p) return;
          const g = document.createElementNS('http://www.w3.org/2000/svg','g');
          const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
          c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 14);
          c.setAttribute('fill', '#90a4ae'); c.setAttribute('stroke', '#102027'); c.setAttribute('stroke-width','2');
          const t = document.createElementNS('http://www.w3.org/2000/svg','text');
          t.setAttribute('x', p.x); t.setAttribute('y', p.y + 26); t.setAttribute('font-size','11'); t.setAttribute('text-anchor','middle'); t.setAttribute('fill','#e3f2fd');
          t.textContent = String(node.id).slice(0, 10);
          g.appendChild(c); g.appendChild(t); svg.appendChild(g);
        });
      }

      async function refresh(){
        try {
          const g = await fetch('/dashboard/graph').then(r => r.json());
          drawGraph(g);
          const l = await fetch('/dashboard/logs').then(r => r.json());
          logsEl.textContent = (l.logs || []).map(e => {
            const ts = new Date(e.ts).toLocaleTimeString();
            return \`${'$'}{ts}  [${'$'}{e.level}]  ${'$'}{e.peerId}: ${'$'}{e.msg}\`;
          }).join('\n');
        } catch {}
      }
      refresh();
      setInterval(refresh, 1500);
    </script>
  </body>
</html>`;
  res.type('html').send(html);
});


