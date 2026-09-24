import type { Formation } from './formations'
import { ROLE_COLORS } from './formations'

const W = 300
const H = 420

interface Props {
  homeFormation: Formation
  awayFormation: Formation
}

export default function Field2D({ homeFormation, awayFormation }: Props) {
  const hw = W / 2
  const hh = H / 2

  function playerPos(x: number, y: number, isHome: boolean) {
    const px = x * W
    const dir = isHome ? -1 : 1
    const py = hh + dir * ((1 - y) * (hh - 20) + 10)
    return { px, py }
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${W}/${H}` }}
      >
        {/* ピッチ */}
        <rect x={0} y={0} width={W} height={H} fill="#166534" />
        {/* 外枠 */}
        <rect x={4} y={4} width={W - 8} height={H - 8} fill="none" stroke="white" strokeWidth={1.5} strokeOpacity={0.7} />
        {/* センターライン */}
        <line x1={4} y1={hh} x2={W - 4} y2={hh} stroke="white" strokeWidth={1} strokeOpacity={0.7} />
        {/* センターサークル */}
        <circle cx={hw} cy={hh} r={40} fill="none" stroke="white" strokeWidth={1} strokeOpacity={0.7} />
        {/* ペナルティエリア（上） */}
        <rect x={hw - 55} y={4} width={110} height={50} fill="none" stroke="white" strokeWidth={1} strokeOpacity={0.7} />
        {/* ペナルティエリア（下） */}
        <rect x={hw - 55} y={H - 54} width={110} height={50} fill="none" stroke="white" strokeWidth={1} strokeOpacity={0.7} />

        {/* アウェイ（上） */}
        {awayFormation.players.map((p) => {
          const { px, py } = playerPos(p.x, p.y, false)
          const color = ROLE_COLORS[p.role]
          return (
            <g key={`away-${p.id}`}>
              <circle cx={px} cy={py} r={11} fill={color} stroke="black" strokeWidth={1.5} />
              <text x={px} y={py + 4} textAnchor="middle" fontSize={8} fontWeight="bold" fill="white">{p.label}</text>
            </g>
          )
        })}

        {/* ホーム（下） */}
        {homeFormation.players.map((p) => {
          const { px, py } = playerPos(p.x, p.y, true)
          const color = ROLE_COLORS[p.role]
          return (
            <g key={`home-${p.id}`}>
              <circle cx={px} cy={py} r={11} fill={color} stroke="white" strokeWidth={1.5} />
              <text x={px} y={py + 4} textAnchor="middle" fontSize={8} fontWeight="bold" fill="white">{p.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
