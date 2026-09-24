export interface Player {
  id: number
  x: number // 0-1 (left-right)
  y: number // 0-1 (bottom=goal to top=opponent)
  label: string
  role: 'GK' | 'DF' | 'MF' | 'FW'
}

export interface Formation {
  id: string
  name: string
  desc: string
  players: Player[]
}

// 8人制: GK + 7人 ピッチ縦68m×横50m相当で正規化
const gk: Player = { id: 0, x: 0.5, y: 0.05, label: 'GK', role: 'GK' }

export const FORMATIONS: Formation[] = [
  {
    id: '2-3-2',
    name: '2-3-2',
    desc: 'バランス型。中盤を3枚で制圧',
    players: [
      gk,
      { id: 1, x: 0.33, y: 0.22, label: 'CB', role: 'DF' },
      { id: 2, x: 0.67, y: 0.22, label: 'CB', role: 'DF' },
      { id: 3, x: 0.2,  y: 0.48, label: 'MF', role: 'MF' },
      { id: 4, x: 0.5,  y: 0.52, label: 'MF', role: 'MF' },
      { id: 5, x: 0.8,  y: 0.48, label: 'MF', role: 'MF' },
      { id: 6, x: 0.33, y: 0.78, label: 'FW', role: 'FW' },
      { id: 7, x: 0.67, y: 0.78, label: 'FW', role: 'FW' },
    ],
  },
  {
    id: '3-2-2',
    name: '3-2-2',
    desc: '3バックで守備安定。速攻向き',
    players: [
      gk,
      { id: 1, x: 0.2,  y: 0.2,  label: 'CB', role: 'DF' },
      { id: 2, x: 0.5,  y: 0.18, label: 'CB', role: 'DF' },
      { id: 3, x: 0.8,  y: 0.2,  label: 'CB', role: 'DF' },
      { id: 4, x: 0.33, y: 0.5,  label: 'MF', role: 'MF' },
      { id: 5, x: 0.67, y: 0.5,  label: 'MF', role: 'MF' },
      { id: 6, x: 0.33, y: 0.78, label: 'FW', role: 'FW' },
      { id: 7, x: 0.67, y: 0.78, label: 'FW', role: 'FW' },
    ],
  },
  {
    id: '3-3-1',
    name: '3-3-1',
    desc: '中盤を厚く。ポゼッション志向',
    players: [
      gk,
      { id: 1, x: 0.2,  y: 0.2,  label: 'CB', role: 'DF' },
      { id: 2, x: 0.5,  y: 0.18, label: 'CB', role: 'DF' },
      { id: 3, x: 0.8,  y: 0.2,  label: 'CB', role: 'DF' },
      { id: 4, x: 0.2,  y: 0.48, label: 'MF', role: 'MF' },
      { id: 5, x: 0.5,  y: 0.52, label: 'MF', role: 'MF' },
      { id: 6, x: 0.8,  y: 0.48, label: 'MF', role: 'MF' },
      { id: 7, x: 0.5,  y: 0.82, label: 'FW', role: 'FW' },
    ],
  },
  {
    id: '2-2-3',
    name: '2-2-3',
    desc: '攻撃的。3トップで圧力',
    players: [
      gk,
      { id: 1, x: 0.33, y: 0.2,  label: 'CB', role: 'DF' },
      { id: 2, x: 0.67, y: 0.2,  label: 'CB', role: 'DF' },
      { id: 3, x: 0.33, y: 0.48, label: 'MF', role: 'MF' },
      { id: 4, x: 0.67, y: 0.48, label: 'MF', role: 'MF' },
      { id: 5, x: 0.2,  y: 0.78, label: 'LW', role: 'FW' },
      { id: 6, x: 0.5,  y: 0.82, label: 'CF', role: 'FW' },
      { id: 7, x: 0.8,  y: 0.78, label: 'RW', role: 'FW' },
    ],
  },
  {
    id: '1-3-2-1',
    name: '1-3-2-1',
    desc: '菱形+1ボランチ。繋ぎを重視',
    players: [
      gk,
      { id: 1, x: 0.5,  y: 0.2,  label: 'SW', role: 'DF' },
      { id: 2, x: 0.2,  y: 0.38, label: 'CB', role: 'DF' },
      { id: 3, x: 0.8,  y: 0.38, label: 'CB', role: 'DF' },
      { id: 4, x: 0.5,  y: 0.48, label: 'DM', role: 'MF' },
      { id: 5, x: 0.33, y: 0.62, label: 'MF', role: 'MF' },
      { id: 6, x: 0.67, y: 0.62, label: 'MF', role: 'MF' },
      { id: 7, x: 0.5,  y: 0.82, label: 'FW', role: 'FW' },
    ],
  },
  {
    id: '2-4-1',
    name: '2-4-1',
    desc: '中盤4枚で支配。縦に速い',
    players: [
      gk,
      { id: 1, x: 0.33, y: 0.18, label: 'CB', role: 'DF' },
      { id: 2, x: 0.67, y: 0.18, label: 'CB', role: 'DF' },
      { id: 3, x: 0.15, y: 0.48, label: 'LM', role: 'MF' },
      { id: 4, x: 0.38, y: 0.52, label: 'CM', role: 'MF' },
      { id: 5, x: 0.62, y: 0.52, label: 'CM', role: 'MF' },
      { id: 6, x: 0.85, y: 0.48, label: 'RM', role: 'MF' },
      { id: 7, x: 0.5,  y: 0.82, label: 'FW', role: 'FW' },
    ],
  },
]

export const ROLE_COLORS: Record<string, string> = {
  GK: '#f59e0b',
  DF: '#3b82f6',
  MF: '#22c55e',
  FW: '#ef4444',
}
