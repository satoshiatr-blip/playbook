import { useState, Suspense, lazy } from 'react'
import type { Formation, Player } from './formations'
import { FORMATIONS, ROLE_COLORS } from './formations'
import PhotoMapper from './PhotoMapper'

const Field3D = lazy(() => import('./Field3D'))

function FormationCard({ formation, selected, onSelect, side }: {
  formation: Formation
  selected: boolean
  onSelect: () => void
  side: 'home' | 'away'
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
        selected
          ? side === 'home'
            ? 'border-blue-500 bg-blue-500/20'
            : 'border-red-500 bg-red-500/20'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className={`font-bold text-sm ${selected ? (side === 'home' ? 'text-blue-400' : 'text-red-400') : 'text-white'}`}>
        {formation.name}
      </div>
      <p className="text-xs text-slate-400 mt-0.5 leading-tight">{formation.desc}</p>
    </button>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs text-slate-300">
      {Object.entries(ROLE_COLORS).map(([role, color]) => (
        <div key={role} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
          <span>{role}</span>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [home, setHome] = useState<Formation>(FORMATIONS[0])
  const [away, setAway] = useState<Formation>(FORMATIONS[1])
  const [showMapper, setShowMapper] = useState(false)

  function handlePhotoApply(homePlayers: Omit<Player, 'id'>[], awayPlayers: Omit<Player, 'id'>[]) {
    if (homePlayers.length > 0) {
      setHome({
        id: 'photo-home',
        name: '写真',
        desc: `写真から ${homePlayers.length}人検出`,
        players: homePlayers.map((p, i) => ({ ...p, id: i })),
      })
    }
    if (awayPlayers.length > 0) {
      setAway({
        id: 'photo-away',
        name: '写真',
        desc: `写真から ${awayPlayers.length}人検出`,
        players: awayPlayers.map((p, i) => ({ ...p, id: i })),
      })
    }
    setShowMapper(false)
  }

  return (
    <div className="min-h-svh bg-slate-900 flex flex-col">
      <header className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <img src="icon-512.png" width={34} height={34} className="rounded-lg shrink-0" alt="PLAYBOOK" />
        <div className="flex-1">
          <h1 className="text-lg font-black italic text-white leading-tight">PLAY<span className="text-[#facc15]">BOOK</span></h1>
          <p className="text-xs text-slate-400">ジュニアサッカー 対戦シミュレーター</p>
        </div>
        {/* 写真からのAI配置はAPIキーを扱う開発サーバーの中継が必要で、公開版（サーバー無し）では動かせない */}
        {import.meta.env.DEV ? (
          <button
            onClick={() => setShowMapper(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 font-medium transition-colors border border-white/10"
          >
            📸 写真から配置
          </button>
        ) : (
          <span title="この機能は開発環境でのみ使えます" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 text-sm text-slate-500 font-medium border border-white/5 cursor-not-allowed">
            📸 写真から配置
          </span>
        )}
      </header>

      {showMapper && (
        <PhotoMapper onClose={() => setShowMapper(false)} onApply={handlePhotoApply} />
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ホームサイド */}
        <aside className="lg:w-52 p-3 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <h2 className="text-sm font-semibold text-blue-400">ホーム（下）</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
            {FORMATIONS.map(f => (
              <FormationCard key={f.id} formation={f} selected={home.id === f.id} onSelect={() => setHome(f)} side="home" />
            ))}
          </div>
        </aside>

        {/* メインフィールド */}
        <main className="flex-1 flex flex-col">
          <div className="flex justify-between items-center px-4 py-2">
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg leading-tight">{home.name}</div>
              <div className="text-xs text-slate-400">ホーム</div>
            </div>
            <div className="text-slate-500 text-sm font-bold">VS</div>
            <div className="text-center">
              <div className="text-red-400 font-bold text-lg leading-tight">{away.name}</div>
              <div className="text-xs text-slate-400">アウェイ</div>
            </div>
          </div>

          <div className="flex-1 min-h-0" style={{ height: 'clamp(380px, 65vw, 620px)' }}>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                読み込み中...
              </div>
            }>
              <Field3D homeFormation={home} awayFormation={away} />
            </Suspense>
          </div>

          <div className="py-3">
            <Legend />
          </div>
        </main>

        {/* アウェイサイド */}
        <aside className="lg:w-52 p-3 border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <h2 className="text-sm font-semibold text-red-400">アウェイ（上）</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
            {FORMATIONS.map(f => (
              <FormationCard key={f.id} formation={f} selected={away.id === f.id} onSelect={() => setAway(f)} side="away" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
