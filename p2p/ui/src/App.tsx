import { useEffect, useMemo, useRef, useState } from 'react'
import NetworkViz from './components/NetworkViz'
import './App.css'

type PeerId = string

type QueryMessage = {
  type: 'QUERY'
  id: string
  origin: PeerId
  ttl: number
  key: string
}

type QueryHitMessage = {
  type: 'QUERY_HIT'
  id: string
  from: PeerId
  payload: { key: string; meta?: Record<string, unknown> }
}

type DataMessage = QueryMessage | QueryHitMessage

type VizEvent = {
  id: string
  type: 'QUERY' | 'QUERY_HIT'
  from: PeerId
  to?: PeerId
  phase: 'send' | 'recv'
  ts: number
}

type SignalOut =
  | { type: 'hello'; peerId: PeerId }
  | { type: 'signal'; from: PeerId; to: PeerId; data: unknown }
  | { type: 'peers' }

type SignalIn =
  | { type: 'welcome'; self: PeerId; peers: PeerId[] }
  | { type: 'peer-joined'; peerId: PeerId }
  | { type: 'peer-left'; peerId: PeerId }
  | { type: 'signal'; from: PeerId; data: any }

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

function generateHumanName() {
  const adjectives = ['rojo','azul','verde','amarillo','morado','naranja','negro','blanco','dorado','plata']
  const animals = ['zorro','lobo','puma','jaguar','halcon','tigre','condor','orca','panda','colibri']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adj}-${animal}`
}

function App() {
  const [displayName] = useState<string>(() => generateHumanName())
  const [selfId] = useState<PeerId>(() => `${displayName}-${Math.random().toString(36).slice(2,6)}`)
  const [knownPeers, setKnownPeers] = useState<PeerId[]>([])
  const [neighbors, setNeighbors] = useState<PeerId[]>([])
  const DOC_POOL = ['doca', 'docb', 'docc', 'docd', 'doce', 'docf']
  const [localStore, setLocalStore] = useState<string[]>(() => {
    const pool = [...DOC_POOL]
    const takeOne = () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
    return [takeOne(), takeOne()]
  })
  const [queryKey, setQueryKey] = useState<string>('doca')
  const [ttl, setTtl] = useState<number>(3)
  const [logLines, setLogLines] = useState<string[]>([])
  const [results, setResults] = useState<{ id: string; from: PeerId; key: string }[]>([])
  const [vizEvents, setVizEvents] = useState<VizEvent[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const pcByPeer = useRef<Map<PeerId, RTCPeerConnection>>(new Map())
  const dcByPeer = useRef<Map<PeerId, RTCDataChannel>>(new Map())

  const seenMessages = useRef<Set<string>>(new Set())
  const parents = useRef<Map<string, PeerId>>(new Map())

  const signalingUrl = useMemo(() => `ws://localhost:3001`, [])
  const dashboardUrl = useMemo(() => `http://localhost:3002`, [])

  function shouldInitiate(self: PeerId, other: PeerId): boolean {
    return self > other
  }

  function log(msg: string) {
    setLogLines((l) => [msg, ...l].slice(0, 200))
    publishTelemetry({ log: { level: 'info', msg } })
  }

  function pushEvent(evt: VizEvent) {
    setVizEvents((evts) => [evt, ...evts].slice(0, 300))
  }

  useEffect(() => {
    document.title = `P2P Peer - ${displayName}`
    const ws = new WebSocket(signalingUrl)
    wsRef.current = ws
    ws.onopen = () => {
      const hello: SignalOut = { type: 'hello', peerId: selfId }
      ws.send(JSON.stringify(hello))
      log(`ws: hello as ${selfId}`)
      // Enviar un primer latido de telemetría
      publishTelemetry({ neighbors: Array.from(dcByPeer.current.keys()) })
    }
    ws.onmessage = async (ev) => {
      const msg: SignalIn = JSON.parse(String(ev.data))
      if (msg.type === 'welcome') {
        setKnownPeers(msg.peers)
        // pick at most 1 candidate to auto-connect (degree limit = 2 overall)
        const candidates = msg.peers.filter((pid) => shouldInitiate(selfId, pid)).slice(0, 1)
        for (const pid of candidates) {
          if (neighbors.length < 2) await connectToPeer(pid)
        }
      } else if (msg.type === 'peer-joined') {
        setKnownPeers((p) => Array.from(new Set([...p, msg.peerId])))
        if (shouldInitiate(selfId, msg.peerId) && neighbors.length < 2) {
          try { await connectToPeer(msg.peerId) } catch {}
        }
      } else if (msg.type === 'peer-left') {
        setKnownPeers((p) => p.filter((x) => x !== msg.peerId))
        const pc = pcByPeer.current.get(msg.peerId)
        pc?.close()
        pcByPeer.current.delete(msg.peerId)
        dcByPeer.current.delete(msg.peerId)
        setNeighbors((n) => n.filter((x) => x !== msg.peerId))
      } else if (msg.type === 'signal') {
        await handleSignal(msg.from, msg.data)
      }
    }
    return () => ws.close()
  }, [signalingUrl, selfId, neighbors.length, displayName])

  // Heartbeat de telemetría para el dashboard
  useEffect(() => {
    const t = setInterval(() => {
      publishTelemetry({ neighbors: Array.from(dcByPeer.current.keys()) })
    }, 1500)
    return () => clearInterval(t)
  }, [])

  async function connectToPeer(peerId: PeerId) {
    if (pcByPeer.current.has(peerId)) return
    if (neighbors.length >= 2) return
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    pcByPeer.current.set(peerId, pc)

    const dc = pc.createDataChannel('p2p')
    dc.binaryType = 'arraybuffer'
    dc.onopen = () => {
      dcByPeer.current.set(peerId, dc)
      setNeighbors((n) => {
        const updated = Array.from(new Set([...n, peerId]))
        publishTelemetry({ neighbors: updated })
        return updated
      })
      log(`channel open -> ${peerId}`)
    }
    dc.onclose = () => {
      dcByPeer.current.delete(peerId)
      setNeighbors((n) => {
        const updated = n.filter((x) => x !== peerId)
        publishTelemetry({ neighbors: updated })
        return updated
      })
      log(`channel closed -> ${peerId}`)
    }
    dc.onmessage = (ev) => onData(peerId, ev.data)

    pc.onicecandidate = (ev) => {
      if (ev.candidate) sendSignal(peerId, { candidate: ev.candidate })
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await sendSignal(peerId, { sdp: offer })
  }

  async function handleSignal(from: PeerId, data: any) {
    let pc = pcByPeer.current.get(from)
    if (!pc) {
      pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
      pcByPeer.current.set(from, pc)
      pc.ondatachannel = (ev) => {
        const dc = ev.channel
        dc.binaryType = 'arraybuffer'
        dc.onopen = () => {
          dcByPeer.current.set(from, dc)
          setNeighbors((n) => Array.from(new Set([...n, from])))
          log(`channel open <- ${from}`)
        }
        dc.onclose = () => {
          dcByPeer.current.delete(from)
          setNeighbors((n) => n.filter((x) => x !== from))
          log(`channel closed <- ${from}`)
        }
        dc.onmessage = (ev) => onData(from, ev.data)
      }
      pc.onicecandidate = (ev) => {
        if (ev.candidate) sendSignal(from, { candidate: ev.candidate })
      }
    }

    if (data.sdp) {
      const desc = new RTCSessionDescription(data.sdp)
      if (desc.type === 'answer') {
        if (pc.signalingState !== 'have-local-offer') {
          // Unexpected/duplicate answer; ignore
          return
        }
      }
      if (desc.type === 'offer') {
        if (pc.signalingState !== 'stable') {
          // Glare: we already have an offer out or set; ignore for simplicity in this demo
          return
        }
      }
      await pc.setRemoteDescription(desc)
      if (desc.type === 'offer') {
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        await sendSignal(from, { sdp: answer })
      }
    } else if (data.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
      } catch {}
    }
  }

  async function sendSignal(to: PeerId, data: unknown) {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const out: SignalOut = { type: 'signal', from: selfId, to, data }
    ws.send(JSON.stringify(out))
  }

  function broadcast(data: DataMessage, except?: PeerId) {
    for (const [pid, dc] of dcByPeer.current) {
      if (dc.readyState === 'open' && pid !== except) {
        dc.send(JSON.stringify(data))
        pushEvent({ id: (data as any).id, type: data.type, from: selfId, to: pid, phase: 'send', ts: Date.now() })
      }
    }
  }

  function onData(from: PeerId, raw: any) {
    try {
      const msg = JSON.parse(String(raw)) as DataMessage
      // Visual: registrar recepción
      pushEvent({ id: (msg as any).id, type: msg.type, from, to: selfId, phase: 'recv', ts: Date.now() })
      if (msg.type === 'QUERY') {
        if (seenMessages.current.has(msg.id)) {
          return
        }
        seenMessages.current.add(msg.id)
        parents.current.set(msg.id, from)
        log(`QUERY(${msg.id}) from ${from}, ttl=${msg.ttl}, key=${msg.key}`)
        if (localStore.includes(msg.key.toLowerCase())) {
          const hit: QueryHitMessage = {
            type: 'QUERY_HIT',
            id: msg.id,
            from: selfId,
            payload: { key: msg.key.toLowerCase() },
          }
          routeBack(hit)
        }
        if (msg.ttl > 0) {
          const fwd: QueryMessage = { ...msg, ttl: msg.ttl - 1 }
          broadcast(fwd, from)
        }
      } else if (msg.type === 'QUERY_HIT') {
        if (msg.id && parents.current.has(msg.id)) {
          const parent = parents.current.get(msg.id)!
          const dc = dcByPeer.current.get(parent)
          if (dc && dc.readyState === 'open') {
            dc.send(JSON.stringify(msg))
            // Visual: reenvío de HIT hacia atrás
            pushEvent({ id: msg.id, type: 'QUERY_HIT', from: selfId, to: parent, phase: 'send', ts: Date.now() })
          }
        } else {
          setResults((r) => [{ id: msg.id, from: msg.from, key: msg.payload.key }, ...r])
          log(`HIT for ${msg.payload.key} from ${msg.from}`)
        }
      }
    } catch {}
  }

  function routeBack(hit: QueryHitMessage) {
    const parent = parents.current.get(hit.id)
    if (!parent) {
      setResults((r) => [{ id: hit.id, from: hit.from, key: hit.payload.key }, ...r])
      return
    }
    const dc = dcByPeer.current.get(parent)
    if (dc && dc.readyState === 'open') {
      dc.send(JSON.stringify(hit))
      pushEvent({ id: hit.id, type: 'QUERY_HIT', from: selfId, to: parent, phase: 'send', ts: Date.now() })
    }
  }

  function startSearch() {
    const id = generateId('q')
    const key = queryKey.trim().toLowerCase()
    if (!key) return
    const msg: QueryMessage = { type: 'QUERY', id, origin: selfId, ttl, key }
    seenMessages.current.add(id)
    log(`START QUERY ${id} key=${key} ttl=${ttl}`)
    broadcast(msg)
  }

  function publishTelemetry(partial?: { neighbors?: PeerId[]; log?: { level: 'info' | 'warn' | 'error'; msg: string } }) {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: 'telemetry', neighbors: partial?.neighbors ?? Array.from(dcByPeer.current.keys()), log: partial?.log }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16 }}>
      <div>
        <h2>Peer {displayName}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={queryKey} onChange={(e) => setQueryKey(e.target.value)} placeholder="key" />
          <input type="number" value={ttl} min={0} max={10} onChange={(e) => setTtl(Number(e.target.value))} />
          <button onClick={startSearch} disabled={neighbors.length === 0}>Buscar</button>
        </div>

        <h3>Almacén local</h3>
        <div style={{ color: '#666', marginBottom: 8 }}>Este peer inicia con 2 documentos aleatorios del pool: {DOC_POOL.join(', ')}.</div>
        <ul>
          {localStore.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>

        <h3>Vecinos ({neighbors.length})</h3>
        <div style={{ color: neighbors.length < 2 ? '#b26a00' : '#666' }}>Grado máximo: 2</div>
        <ul>
          {neighbors.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        <h3>Peers conocidos</h3>
        <ul>
          {knownPeers.map((p) => (
            <li key={p}>{p} <button onClick={() => neighbors.length < 2 ? connectToPeer(p) : undefined} disabled={neighbors.length >= 2}>conectar</button></li>
          ))}
        </ul>

        {neighbors.length === 0 && (
          <div style={{ padding: 8, background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', borderRadius: 4 }}>
            Sin vecinos conectados todavía. Abrí otra pestaña o presioná "conectar" en un peer.
          </div>
        )}

        <h3>Resultados</h3>
        <ul>
          {results.map((r) => (
            <li key={`${r.id}-${r.from}`}>{r.key} encontrado en {r.from}</li>
          ))}
        </ul>

        <h3>Dashboard central</h3>
        <div>
          <a href={`${dashboardUrl}/dashboard`} target="_blank">Ver dashboard (HTML)</a> | <a href={`${dashboardUrl}/dashboard/graph`} target="_blank">Grafo (JSON)</a> | <a href={`${dashboardUrl}/dashboard/logs`} target="_blank">Logs (JSON)</a>
        </div>
      </div>

      <div>
        <h3>Red y propagación</h3>
        <NetworkViz selfId={selfId} neighbors={neighbors} knownPeers={knownPeers} events={vizEvents} />
        <br />
        <h3>Log</h3>
        <pre style={{ maxHeight: 500, overflow: 'auto', background: '#111', color: '#0f0', padding: 8 }}>
{logLines.join('\n')}
        </pre>
      </div>
    </div>
  )
}

export default App
