import { useState, useRef } from 'react'
import type { Player } from './formations'
import { ROLE_COLORS } from './formations'
import { detectPlayers, fileToBase64 } from './claudeVision'

type Team = 'home' | 'away'
type Role = 'GK' | 'DF' | 'MF' | 'FW'

interface PlacedPlayer {
  x: number
  y: number
  team: Team
  role: Role
}

const ROLES: Role[] = ['GK', 'DF', 'MF', 'FW']
const PITCH_W = 260
const PITCH_H = 380

interface Props {
  onClose: () => void
  onApply: (home: Omit<Player, 'id'>[], away: Omit<Player, 'id'>[]) => void
}

function MiniField({
  players,
  onClick,
  onRemove,
}: {
  players: PlacedPlayer[]
  onClick: (x: number, y: number) => void
  onRemove: (i: number) => void
}) {
  const ref = useRef<SVGSVGElement>(null)
  const hw = PITCH_W / 2
  const hh = PITCH_H / 2

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = ref.current!.getBoundingClientRect()
    onClick(
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
    )
  }

  const circlePoints = Array.from({ length: 33 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2
    return `${hw + Math.cos(a) * 42},${hh + Math.sin(a) * 42}`
  }).join(' ')

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${PITCH_W} ${PITCH_H}`}
      width={PITCH_W}
      height={PITCH_H}
      style={{ cursor: 'crosshair', display: 'block', maxWidth: '100%', maxHeight: '100%' }}
      onClick={handleClick}
    >
      <rect width={PITCH_W} height={PITCH_H} fill="#166534" />
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={0} y={i*55} width={PITCH_W} height={27} fill="rgba(0,0,0,0.06)" />
      ))}
      <rect x={5} y={5} width={PITCH_W-10} height={PITCH_H-10} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
      <line x1={5} y1={hh} x2={PITCH_W-5} y2={hh} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
      <polyline points={circlePoints} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
      <circle cx={hw} cy={hh} r={3} fill="rgba(255,255,255,0.7)" />
      <rect x={hw-50} y={5} width={100} height={44} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
      <rect x={hw-22} y={5} width={44} height={18} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
      <rect x={hw-50} y={PITCH_H-49} width={100} height={44} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
      <rect x={hw-22} y={PITCH_H-23} width={44} height={18} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
      <text x={hw} y={PITCH_H-8} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">ホーム側</text>
      <text x={hw} y={18} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">アウェイ側</text>

      {players.map((p, i) => {
        const cx = p.x * PITCH_W
        const cy = p.y * PITCH_H
        const color = ROLE_COLORS[p.role]
        return (
          <g key={i} style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onRemove(i) }}>
            <circle cx={cx} cy={cy} r={12} fill={color} stroke={p.team === 'home' ? '#fff' : '#000'} strokeWidth={2} />
            <text x={cx} y={cy+4} textAnchor="middle" fontSize={8} fontWeight="bold" fill="white">{p.role}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function PhotoMapper({ onClose, onApply }: Props) {
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [players, setPlayers] = useState<PlacedPlayer[]>([])
  const [team, setTeam] = useState<Team>('home')
  const [role, setRole] = useState<Role>('MF')
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [aiError, setAiError] = useState('')
  const [aiColors, setAiColors] = useState<{ home: string; away: string } | null>(null)

  function handleFile(file: File) {
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setPlayers([])
    setAiStatus('idle')
    setAiColors(null)
  }

  async function handleAiDetect() {
    if (!imageFile) return
    setAiStatus('loading')
    setAiError('')
    try {
      const { base64, mimeType } = await fileToBase64(imageFile)
      const result = await detectPlayers(base64, mimeType)
      const mapped: PlacedPlayer[] = [
        ...result.home.map(p => ({ ...p, team: 'home' as Team })),
        ...result.away.map(p => ({ ...p, team: 'away' as Team })),
      ]
      setPlayers(mapped)
      setAiColors({ home: result.homeColor, away: result.awayColor })
      setAiStatus('done')
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e))
      setAiStatus('error')
    }
  }

  function handleFieldClick(x: number, y: number) {
    setPlayers(prev => [...prev, { x, y, team, role }])
  }

  function handleApply() {
    const toPlayer = (p: PlacedPlayer): Omit<Player, 'id'> => ({
      x: p.x, y: p.y, label: p.role, role: p.role,
    })
    onApply(
      players.filter(p => p.team === 'home').map(toPlayer),
      players.filter(p => p.team === 'away').map(toPlayer),
    )
  }

  const homeCount = players.filter(p => p.team === 'home').length
  const awayCount = players.filter(p => p.team === 'away').length

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col" style={{ backdropFilter: 'blur(4px)' }}>
      {/* ヘッダー */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-white/10">
        <h2 className="text-white font-bold text-sm">📸 写真から選手配置</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左：写真 */}
        <div className="flex-1 flex flex-col bg-black/40 overflow-hidden min-h-0">
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-slate-900/60">
            <span className="text-xs text-slate-400">📷 参照写真</span>
            {imageFile && (
              <button
                onClick={handleAiDetect}
                disabled={aiStatus === 'loading'}
                className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  aiStatus === 'loading'
                    ? 'bg-purple-800 text-purple-300 cursor-wait'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {aiStatus === 'loading' ? (
                  <><span className="animate-spin">⟳</span> AI解析中...</>
                ) : (
                  <>✨ AIで自動検出</>
                )}
              </button>
            )}
          </div>

          {/* AI結果バナー */}
          {aiStatus === 'done' && aiColors && (
            <div className="shrink-0 px-3 py-1.5 bg-green-900/60 text-xs text-green-300 flex items-center gap-2">
              ✓ AI検出完了 — ホーム：{aiColors.home} / アウェイ：{aiColors.away}
              <span className="text-green-500">（マーカーをクリックで削除・フィールドをクリックで追加）</span>
            </div>
          )}
          {aiStatus === 'error' && (
            <div className="shrink-0 px-3 py-1.5 bg-red-900/60 text-xs text-red-300">
              ⚠ {aiError}
            </div>
          )}

          {imageUrl ? (
            <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
              <img src={imageUrl} className="max-w-full max-h-full object-contain rounded" draggable={false} />
            </div>
          ) : (
            <label className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-2 border-dashed border-white/20 m-3 rounded-xl">
              <span className="text-4xl mb-3">📸</span>
              <span className="text-slate-300 font-medium">写真をアップロード</span>
              <span className="text-slate-500 text-xs mt-1">クリックまたはドロップ</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </label>
          )}

          {imageUrl && (
            <label className="shrink-0 text-center text-xs text-slate-600 hover:text-slate-400 cursor-pointer py-1 transition-colors">
              別の写真を選択
              <input type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </label>
          )}
        </div>

        {/* 右：フィールド */}
        <div className="shrink-0 lg:w-80 flex flex-col bg-slate-900 border-l border-white/10">
          <div className="shrink-0 px-3 py-1.5 text-xs text-slate-400 bg-slate-800/80">
            ⚽ クリックで手動追加 / マーカークリックで削除
          </div>

          {/* チーム・ポジション選択 */}
          <div className="shrink-0 px-3 py-2 border-b border-white/10 space-y-2">
            <div className="flex gap-1.5">
              {(['home', 'away'] as Team[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTeam(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    team === t
                      ? t === 'home' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-red-600 border-red-400 text-white'
                      : 'border-white/15 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {t === 'home' ? `● ホーム (${homeCount})` : `● アウェイ (${awayCount})`}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-1 rounded text-xs font-bold border transition-all ${
                    role === r
                      ? 'bg-green-700 border-green-500 text-white'
                      : 'border-white/15 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* フィールド図 */}
          <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
            <MiniField
              players={players}
              onClick={handleFieldClick}
              onRemove={i => setPlayers(prev => prev.filter((_, j) => j !== i))}
            />
          </div>

          {/* フッター */}
          <div className="shrink-0 flex gap-2 px-3 py-3 border-t border-white/10">
            <button
              onClick={() => setPlayers([])}
              disabled={players.length === 0}
              className="px-3 py-2 rounded-lg text-xs border border-white/20 text-slate-400 disabled:opacity-30 hover:bg-white/5"
            >
              全削除
            </button>
            <button
              onClick={handleApply}
              disabled={players.length === 0}
              className="flex-1 py-2 rounded-lg text-sm bg-green-700 hover:bg-green-600 text-white font-bold disabled:opacity-30 transition-colors"
            >
              ✓ フィールドに反映
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
