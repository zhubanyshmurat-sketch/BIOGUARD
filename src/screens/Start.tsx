import { motion } from 'framer-motion';
import { useState } from 'react';
import { ui, species } from '../data/content';
import { Logo } from '../components/Logo';
import { Avatar } from '../components/Avatar';
import { sfx } from '../lib/sound';
import { getBest } from '../lib/game';

const FLOAT_POS = [
  [4, 6], [80, 8], [2, 88], [82, 90], [0, 30], [84, 32],
];

export function Start({
  initialName,
  onStart,
  onLongPress,
}: {
  initialName: string;
  onStart: (name: string) => void;
  onLongPress: () => void;
}) {
  const [name, setName] = useState(initialName);
  const best = getBest();
  const go = () => {
    sfx.tap();
    onStart(name.trim());
  };
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center overflow-hidden px-5 py-8 text-center">
      <div className="pointer-events-none absolute inset-0">
        {species.slice(0, 6).map((s, i) => (
          <motion.div
            key={s.id}
            className="absolute opacity-80"
            style={{ left: `${FLOAT_POS[i][0]}%`, top: `${FLOAT_POS[i][1]}%` }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.4, delay: i * 0.3 }}
          >
            <Avatar s={s} size={46} />
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
        <Logo onLongPress={onLongPress} size={104} />
      </motion.div>
      <motion.h1
        className="mt-4 text-[34px] font-black leading-none tracking-tight text-forest-700 sm:text-4xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        BIOGUARD
        <br />
        <span className="bg-gradient-to-r from-teal2-600 to-forest-500 bg-clip-text text-transparent">KAZAKHSTAN</span>
      </motion.h1>
      <motion.p
        className="mt-2 text-lg font-extrabold text-sand-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {ui.slogan}
      </motion.p>

      <motion.div
        className="card relative mt-6 w-full p-5" style={{ background: '#fff' }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="mb-4 text-[15px] leading-relaxed text-forest-900/85">{ui.intro}</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          placeholder={ui.namePlaceholder}
          className="mb-3 w-full rounded-2xl border-2 border-forest-100 bg-forest-50/60 px-4 py-3 text-center text-lg font-bold text-forest-900 outline-none placeholder:text-forest-900/40 focus:border-teal2-500"
          onKeyDown={(e) => e.key === 'Enter' && go()}
        />
        <button className="btn-primary w-full text-lg" onClick={go}>
          {ui.start} 🌱
        </button>
        {best > 0 && (
          <div className="mt-3 text-sm font-bold text-forest-700/70">
            🏆 {ui.best}: {best}
          </div>
        )}
      </motion.div>
    </div>
  );
}
