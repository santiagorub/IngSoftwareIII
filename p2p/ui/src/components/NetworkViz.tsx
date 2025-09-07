import { useEffect, useMemo, useState } from 'react'

type PeerId = string

type VizEvent = {
  id: string
  type: 'QUERY' | 'QUERY_HIT'
  from: PeerId
  to?: PeerId
  phase: 'send' | 'recv'
  ts: number
}

type Props = {
  selfId: PeerId
  neighbors: PeerId[]
  knownPeers: PeerId[]
  events: VizEvent[]
  width?: number
  height?: number
}

export default function NetworkViz({ selfId, neighbors, knownPeers, events, width = 680, height = 420 }: Props) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 120)
    return () => clearInterval(t)
  }, [])

  const layout = useMemo(() => {
    const center = { x: width / 2, y: height / 2 }
    const neighborRing = 130
    const knownRing = 190
    const neighborsSorted = [...neighbors].sort()
    const others = [...new Set(knownPeers.filter((p) => !neighbors.includes(p)))].sort()
    const positions = new Map<PeerId, { x: number; y: number }>()
    positions.set(selfId, center)

    function polar(angle: number, radius: number) {
      return {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      }
    }

    neighborsSorted.forEach((pid, idx) => {
      const angle = (idx / Math.max(1, neighborsSorted.length)) * Math.PI * 2
      positions.set(pid, polar(angle, neighborRing))
    })
    others.forEach((pid, idx) => {
      const angle = (idx / Math.max(1, others.length)) * Math.PI * 2
      positions.set(pid, polar(angle, knownRing))
    })

    return { positions, neighborsSorted, others, center }
  }, [selfId, neighbors, knownPeers, width, height])

  const recent = events.filter((e) => now - e.ts <= 1400)

  function colorFor(type: VizEvent['type']) {
    return type === 'QUERY' ? '#ff9800' : '#4caf50'
  }

  function nodeColor(pid: PeerId): string {
    if (pid === selfId) return '#1e88e5'
    if (neighbors.includes(pid)) return '#90a4ae'
    return '#cfd8dc'
  }

  function short(id: string) {
    return id.length > 10 ? id.slice(0, 10) : id
  }

  return (
    <svg width={width} height={height} style={{ background: '#0b1220', borderRadius: 8 }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#90caf9" />
        </marker>
      </defs>

      {/* static edges from self to neighbors */}
      {layout.neighborsSorted.map((n) => {
        const a = layout.positions.get(selfId)!
        const b = layout.positions.get(n)!
        return <line key={`edge-${n}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#263238" strokeWidth={2} />
      })}

      {/* animated recent events */}
      {recent.map((e, idx) => {
        if (!e.to) return null
        const from = layout.positions.get(e.from)
        const to = layout.positions.get(e.to)
        if (!from || !to) return null
        const age = Math.max(0, Math.min(1, (now - e.ts) / 1400))
        const opacity = 1 - age
        const stroke = colorFor(e.type)
        return (
          <g key={`evt-${idx}`}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={stroke} strokeOpacity={opacity} strokeWidth={4} markerEnd="url(#arrow)" />
          </g>
        )
      })}

      {/* nodes */}
      {[selfId, ...layout.neighborsSorted, ...layout.others].map((pid) => {
        const p = layout.positions.get(pid)!
        return (
          <g key={`node-${pid}`}>
            <circle cx={p.x} cy={p.y} r={16} fill={nodeColor(pid)} stroke="#102027" strokeWidth={2} />
            <text x={p.x} y={p.y + 28} fontSize={12} textAnchor="middle" fill="#e3f2fd">{short(pid)}</text>
          </g>
        )
      })}
    </svg>
  )
}


