import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { missions, ui } from '../data/content';
import { Stars } from './Stars';
import { celebrate } from '../lib/confetti';
import { sfx } from '../lib/sound';

export function MissionIntro({ id, text, onStart, children }: { id: number; text: string; onStart: () => void; children?: ReactNode }) {
  const m = missions[id - 1];
  return (
    <motion.div className="card mx-auto max-w-md p-6 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <motion.div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-forest-100 to-teal2-400/40 text-5xl"
        animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
        {m.emoji}
      </motion.div>
      <div className="text-xs font-extrabold uppercase tracking-widest text-teal2-600">{id}-{ui.missionWord}</div>
      <h2 className="mb-3 text-2xl font-black text-forest-900">{m.title}</h2>
      <p className="mb-5 text-[15px] leading-relaxed text-forest-900/80">{text}</p>
      {children}
      <button className="btn-primary w-full text-lg" onClick={() => { sfx.tap(); onStart(); }}>{ui.begin} ▶</button>
    </motion.div>
  );
}

export function MissionResult({ id, score, stars, text, extra, onDone }: { id: number; score: number; stars: number; text: string; extra?: ReactNode; onDone: () => void }) {
  useEffect(() => { sfx.win(); if (stars >= 2) celebrate(); }, [stars]);
  const m = missions[id - 1];
  return (
    <motion.div className="card mx-auto max-w-md p-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="text-xs font-extrabold uppercase tracking-widest text-teal2-600">{id}-{ui.missionWord}</div>
      <h2 className="mb-2 text-2xl font-black text-forest-900">{m.title}</h2>
      <Stars n={stars} size={40} />
      <div className="my-3 text-4xl font-black text-forest-600">{score} <span className="text-lg">{ui.score.toLowerCase()}</span></div>
      {extra}
      <p className="mb-5 rounded-2xl bg-forest-50 p-4 text-[15px] font-semibold leading-relaxed text-forest-900">{text}</p>
      <button className="btn-primary w-full text-lg" onClick={() => { sfx.tap(); onDone(); }}>{ui.toMenu} 🗺️</button>
    </motion.div>
  );
}
