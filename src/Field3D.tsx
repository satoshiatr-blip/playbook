import { useState, useEffect, useRef } from 'react'
import type { Formation } from './formations'
import { ROLE_COLORS } from './formations'

const PITCH_W = 280
const PITCH_H = 420

interface Props {
  homeFormation: Formation
  awayFormation: Formation
}

function getPlayerPos(x: number, y: number, isHome: boolean) {
  const px = x * PITCH_W
  const hh = PITCH_H / 2
  const dir = isHome ? -1 : 1
  const py = hh + dir * ((1 - y) * (hh - 24) + 12)
  return { px, py }
}

export default function Field3D({ homeFormation, awayFormation }: Props) {
  const [rotX, setRotX] = useState(50)   // 0=side, 90=top
  const [rotY, setRotY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const last = useRef({ x: 0, y: 0 })
  const animRef = useRef<number>(0)
  const [tick, setTick] = useState(0)

  // bounce animation
  useEffect(() => {
    let frame = 0
    const loop = () => {
      frame++
      if (frame % 2 === 0) setTick(t => t + 1)
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true)
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    last.current = { x: e.clientX, y: e.clientY }
    setRotY(r => r + dx * 0.5)
    setRotX(r => Math.min(90, Math.max(10, r - dy * 0.5)))
  }
  function onPointerUp() { setDragging(false) }

  const hw = PITCH_W / 2
  const hh = PITCH_H / 2

  // センターサークル points
  const circlePoints = Array.from({ length: 33 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2
    return `${hw + Math.cos(a) * 55},${hh + Math.sin(a) * 55}`
  }).join(' ')

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-slate-800 select-none"
      style={{ overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div style={{ perspective: 900, perspectiveOrigin: '50% 50%', overflow: 'visible' }}>
        <div style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: 'preserve-3d',
          transition: dragging ? 'none' : 'transform 0.1s ease-out',
          overflow: 'visible',
        }}>
          <svg
            width={PITCH_W}
            height={PITCH_H}
            viewBox={`0 0 ${PITCH_W} ${PITCH_H}`}
            style={{ display: 'block', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))' }}
          >
            {/* ピッチ背景 */}
            <rect width={PITCH_W} height={PITCH_H} fill="#166534" rx={4} />
            {/* ストライプ */}
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} x={0} y={i * 60} width={PITCH_W} height={30}
                fill="rgba(0,0,0,0.05)" />
            ))}
            {/* 外枠 */}
            <rect x={6} y={6} width={PITCH_W - 12} height={PITCH_H - 12}
              fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
            {/* センターライン */}
            <line x1={6} y1={hh} x2={PITCH_W - 6} y2={hh}
              stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
            {/* センターサークル */}
            <polyline points={circlePoints} fill="none"
              stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
            {/* センタースポット */}
            <circle cx={hw} cy={hh} r={3} fill="rgba(255,255,255,0.7)" />
            {/* ペナルティ上 */}
            <rect x={hw - 60} y={6} width={120} height={52}
              fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
            {/* ゴールエリア上 */}
            <rect x={hw - 28} y={6} width={56} height={20}
              fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
            {/* ゴール上 */}
            <rect x={hw - 20} y={2} width={40} height={8}
              fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
            {/* ペナルティ下 */}
            <rect x={hw - 60} y={PITCH_H - 58} width={120} height={52}
              fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
            {/* ゴールエリア下 */}
            <rect x={hw - 28} y={PITCH_H - 26} width={56} height={20}
              fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
            {/* ゴール下 */}
            <rect x={hw - 20} y={PITCH_H - 10} width={40} height={8}
              fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />

            {/* アウェイ選手（上） */}
            {awayFormation.players.map((p) => {
              const { px, py } = getPlayerPos(p.x, p.y, false)
              const bounce = Math.sin(tick * 0.15 + p.x * 8) * 1.5
              const color = ROLE_COLORS[p.role]
              return (
                <g key={`away-${p.id}`} transform={`translate(${px},${py + bounce})`}>
                  <circle r={13} fill={color} stroke="#000" strokeWidth={1.5} />
                  <circle r={6} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} cx={-2} cy={-3} />
                  <text textAnchor="middle" dy={4} fontSize={9} fontWeight="bold" fill="white"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {p.label}
                  </text>
                </g>
              )
            })}

            {/* ホーム選手（下） */}
            {homeFormation.players.map((p) => {
              const { px, py } = getPlayerPos(p.x, p.y, true)
              const bounce = Math.sin(tick * 0.15 + p.x * 8 + 1) * 1.5
              const color = ROLE_COLORS[p.role]
              return (
                <g key={`home-${p.id}`} transform={`translate(${px},${py + bounce})`}>
                  <circle r={13} fill={color} stroke="#fff" strokeWidth={1.5} />
                  <circle r={6} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} cx={-2} cy={-3} />
                  <text textAnchor="middle" dy={4} fontSize={9} fontWeight="bold" fill="white"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {p.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* 角度コントロール */}
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
        <span>サイド</span>
        <input
          type="range" min={15} max={90} value={rotX}
          onChange={e => setRotX(Number(e.target.value))}
          className="w-28 accent-green-500"
          onPointerDown={e => e.stopPropagation()}
        />
        <span>俯瞰</span>
        <button
          className="px-2 py-0.5 rounded border border-white/20 hover:bg-white/10 transition-colors"
          onClick={() => { setRotX(55); setRotY(0) }}
          onPointerDown={e => e.stopPropagation()}
        >
          リセット
        </button>
      </div>
    </div>
  )
}
