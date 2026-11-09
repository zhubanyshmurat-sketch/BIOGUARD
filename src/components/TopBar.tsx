import { motion } from 'framer-motion';
import { Results } from '../lib/game';
import { ui } from '../data/content';

interface Props {
  results: Results;
  current?: number; // қазіргі миссия
  total: number;
  muted: boolean;
  onToggleSound: () => void;
  onHome?: () => void;
}

export function TopBar({ results, current, total, muted, onToggleSound, onHome }: Props) {
  return (
    <div className="sticky top-0 z-40 bg-gradient-to-b from-[#e8f7ef] via-[#e8f7ef]/95 to-transparent px-3 pb-2" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}>
      <div className="mx-auto flex max-w-xl items-center gap-2">
        <button onClick={onHome} disabled={!onHome} aria-label={ui.missions}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-card active:scale-95 disabled:opacity-100">
          🌿
        </button>
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((i) => {
            const done = !!results[i as 1 | 2 | 3 | 4];
            const active = current === i;
            return (
              <div key={i} className="relative h-3 flex-1 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-forest-100">
                <motion.div
                  className={done ? 'h-full bg-gradient-to-r from-forest-400 to-teal2-500' : 'h-full bg-sand-300'}
                  initial={false}
                  animate={{ width: done ? '100%' : active ? '45%' : '0%' }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-2xl bg-white px-3 py-2 text-sm font-black text-forest-700 shadow-card">
          🏆 <motion.span key={total} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>{total}</motion.span>
        </div>
        <button onClick={onToggleSound} aria-label={muted ? ui.soundOff : ui.soundOn}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-card active:scale-95">
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
