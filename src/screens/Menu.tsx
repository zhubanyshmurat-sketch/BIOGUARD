import { motion } from 'framer-motion';
import { missions, ui } from '../data/content';
import { Results } from '../lib/game';
import { Stars } from '../components/Stars';
import { Logo } from '../components/Logo';
import { KazMap } from '../components/KazMap';
import { sfx } from '../lib/sound';

interface Props {
  name: string;
  results: Results;
  unlockedAll: boolean;
  onOpen: (id: number) => void;
  onLongPress: () => void;
  onFinal: () => void;
}

export function Menu({ name, results, unlockedAll, onOpen, onLongPress, onFinal }: Props) {
  const doneCount = Object.keys(results).length;
  const isUnlocked = (id: number) => unlockedAll || id === 1 || !!results[(id - 1) as 1 | 2 | 3];
  return (
    <div className="mx-auto max-w-xl px-4 pb-10">
      <div className="mb-3 flex items-center gap-3">
        <Logo size={60} onLongPress={onLongPress} />
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate text-xl font-black text-forest-900">{name || ui.defaultName}</div>
          <div className="text-sm font-bold text-forest-700/70">
            {ui.missions}: {doneCount} / 4
          </div>
        </div>
      </div>

      <div className="card mb-4 p-2">
        <KazMap />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {missions.map((m, i) => {
          const open = isUnlocked(m.id);
          const r = results[m.id as 1 | 2 | 3 | 4];
          return (
            <motion.button
              key={m.id}
              disabled={!open}
              onClick={() => {
                sfx.tap();
                onOpen(m.id);
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={open ? { scale: 0.95 } : undefined}
              className={`relative flex min-h-[156px] flex-col items-center justify-between gap-1 rounded-3xl p-3 text-center shadow-card ring-1 transition ${
                open ? 'bg-white ring-forest-100' : 'bg-white/50 ring-black/5'
              }`}
            >
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal2-600">
                {m.id}-{ui.missionWord}
              </div>
              <div className={`text-4xl ${open ? '' : 'opacity-40 grayscale'}`}>{open ? m.emoji : '🔒'}</div>
              <div className={`text-[13px] font-black leading-tight ${open ? 'text-forest-900' : 'text-forest-900/40'}`}>
                {m.title}
              </div>
              {r ? (
                <Stars n={r.stars} size={16} animate={false} />
              ) : (
                <div className="text-[11px] font-semibold leading-tight text-forest-900/55">{open ? m.desc : ui.locked}</div>
              )}
              {r && (
                <div className="absolute right-2 top-2 rounded-full bg-forest-500 px-2 text-[11px] font-black text-white">
                  {r.score}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {doneCount === 4 && (
        <motion.button
          className="btn-sand mt-4 w-full text-lg"
          onClick={() => {
            sfx.tap();
            onFinal();
          }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          🎓 {ui.toFinal}
        </motion.button>
      )}
    </div>
  );
}
