// دوال مساعدة لنظام XP والرتب
export type Tier = 'برونز' | 'فضي' | 'ذهبي' | 'بلاتيني' | 'ألماس'

export interface TierInfo {
  name: Tier
  emoji: string
  min: number
  max: number | null
  color: string
  bgClass: string
  borderClass: string
  textClass: string
}

export const TIERS: TierInfo[] = [
  { name: 'برونز',   emoji: '🥉', min: 0,    max: 499,  color: '#b45309', bgClass: 'bg-amber-900/30',   borderClass: 'border-amber-700/40',  textClass: 'text-amber-700' },
  { name: 'فضي',    emoji: '🥈', min: 500,  max: 1499, color: '#a1a1aa', bgClass: 'bg-zinc-700/30',    borderClass: 'border-zinc-500/40',   textClass: 'text-zinc-300'  },
  { name: 'ذهبي',   emoji: '🥇', min: 1500, max: 3499, color: '#eab308', bgClass: 'bg-yellow-900/30',  borderClass: 'border-yellow-500/40', textClass: 'text-yellow-400' },
  { name: 'بلاتيني', emoji: '💎', min: 3500, max: 6999, color: '#00eaff', bgClass: 'bg-cyan-900/30',    borderClass: 'border-cyan-500/40',   textClass: 'text-cyan-300'  },
  { name: 'ألماس',  emoji: '👑', min: 7000, max: null,  color: '#d946ef', bgClass: 'bg-fuchsia-900/30', borderClass: 'border-fuchsia-500/40', textClass: 'text-fuchsia-300' },
]

export function getTier(xp: number): TierInfo {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].min) return TIERS[i]
  }
  return TIERS[0]
}

export function getNextTier(xp: number): TierInfo | null {
  for (const t of TIERS) {
    if (xp < t.min) return t
  }
  return null
}

export function xpToNextTier(xp: number): number | null {
  const next = getNextTier(xp)
  if (!next) return null
  return next.min - xp
}

export function formatXP(xp: number): string {
  return xp.toLocaleString('ar-EG')
}
