export type Screen = 'start' | 'menu' | 'm1' | 'm2' | 'm3' | 'm4' | 'final';
export interface MissionResult { score: number; stars: number }
export type Results = Partial<Record<1 | 2 | 3 | 4, MissionResult>>;

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

const BEST_KEY = 'bioguard_best';
export function getBest(): number {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
}
export function saveBest(score: number) {
  try { if (score > getBest()) localStorage.setItem(BEST_KEY, String(score)); } catch { /* */ }
}
