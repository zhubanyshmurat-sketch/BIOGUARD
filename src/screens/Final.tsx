import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { missions, PROJECT_URL, ui } from '../data/content';
import { Results } from '../lib/game';
import { Stars } from '../components/Stars';
import { celebrate } from '../lib/confetti';
import { sfx } from '../lib/sound';

interface Props { name: string; results: Results; total: number; onReplay: () => void; onMenu: () => void }

export function Final({ name, results, total, onReplay, onMenu }: Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const d = new Date();
  const date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const totalStars = Object.values(results).reduce((s, r) => s + (r?.stars ?? 0), 0);

  useEffect(() => {
    sfx.win();
    celebrate();
    const t = window.setTimeout(celebrate, 1200);
    return () => window.clearTimeout(t);
  }, []);

  const download = async () => {
    if (!certRef.current) return;
    setSaving(true);
    try {
      await document.fonts?.ready;
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certRef.current, { scale: 3, backgroundColor: null, useCORS: true });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `BIOGUARD-${(name || 'certificate').replace(/[^\p{L}\p{N}]+/gu, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-12">
      <motion.h1 className="mb-1 text-center text-3xl font-black text-forest-700" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        🎉 {ui.congrats}
      </motion.h1>
      <div className="mb-4 text-center text-lg font-extrabold text-forest-900/80">
        {ui.totalScore}: <span className="text-forest-600">{total}</span> · ⭐ {totalStars}/12
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2">
        {missions.map((m) => {
          const r = results[m.id as 1 | 2 | 3 | 4];
          return (
            <div key={m.id} className="card flex flex-col items-center gap-1 p-3 text-center">
              <div className="text-2xl">{m.emoji}</div>
              <div className="text-[12px] font-black leading-tight text-forest-900">{m.title}</div>
              <Stars n={r?.stars ?? 0} size={18} />
              <div className="text-xs font-bold text-forest-700/70">{r?.score ?? 0} {ui.score.toLowerCase()}</div>
            </div>
          );
        })}
      </div>

      {/* ---------- Сертификат ---------- */}
      <motion.div initial={{ y: 40, opacity: 0, rotate: -2 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ delay: 0.4, type: 'spring' }}>
        <div ref={certRef} style={{ fontFamily: 'Nunito, sans-serif', background: '#fffdf6' }}
          className="relative overflow-hidden rounded-3xl p-2 shadow-card">
          <div className="relative rounded-[20px] p-5 text-center sm:p-7" style={{ border: '3px solid #16a35a', boxShadow: 'inset 0 0 0 6px #fffdf6, inset 0 0 0 8px #deb862' }}>
            <div className="pointer-events-none absolute -left-6 -top-6 text-7xl opacity-15">🌿</div>
            <div className="pointer-events-none absolute -bottom-6 -right-4 text-7xl opacity-15">🏔️</div>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full text-3xl" style={{ background: 'linear-gradient(135deg,#34c472,#14b8a6)' }}>🛡️</div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.25em]" style={{ color: '#0d9488' }}>BIOGUARD KAZAKHSTAN</div>
            <div className="mb-3 text-2xl font-black sm:text-3xl" style={{ color: '#0a3b22' }}>{ui.certTitle}</div>
            <div className="mx-auto mb-2 h-px w-2/3" style={{ background: '#deb862' }} />
            <div className="break-words text-2xl font-black sm:text-3xl" style={{ color: '#0f8a4a' }}>{name || ui.defaultName}</div>
            <div className="mx-auto mb-3 mt-2 h-px w-2/3" style={{ background: '#deb862' }} />
            <p className="mb-4 text-[15px] font-bold leading-snug" style={{ color: '#0a3b22' }}>{ui.certText}</p>
            <div className="mb-3 flex items-center justify-center gap-4 text-sm font-extrabold" style={{ color: '#0a3b22' }}>
              <span>🏆 {total} {ui.score.toLowerCase()}</span>
              <span>⭐ {totalStars}/12</span>
            </div>
            <div className="mb-3 text-[13px] font-bold" style={{ color: '#0a3b22', opacity: 0.7 }}>{ui.certDate}: {date}</div>
            <div className="text-base font-black italic" style={{ color: '#c99a3e' }}>«{ui.slogan}»</div>
          </div>
        </div>
      </motion.div>

      <div className="mt-5 grid gap-2">
        <button className="btn-primary w-full text-lg" onClick={download} disabled={saving}>
          {saving ? '⏳' : '📥'} {ui.download}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary" onClick={() => { sfx.tap(); onReplay(); }}>🔄 {ui.replay}</button>
          <a className="btn-sand text-center" href={PROJECT_URL} target="_blank" rel="noopener noreferrer">🌐 {ui.projectSite}</a>
        </div>
        <button className="mt-1 text-sm font-extrabold text-forest-700" onClick={onMenu}>← {ui.missions}</button>
      </div>
    </div>
  );
}
