import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { mission3, ui } from '../data/content';
import { MissionIntro, MissionResult } from '../components/MissionFrame';
import { Modal } from '../components/Modal';
import { MissionResult as Result, clamp } from '../lib/game';
import { sfx } from '../lib/sound';

interface Stats { sea: number; crop: number; dust: number; life: number }
const START: Stats = { sea: 30, crop: 70, dust: 70, life: 25 };
const CELLS = 15;

// ---------- Арал иллюстрациясы ----------
const SEA_PATH =
  'M120,30 C150,18 190,22 210,40 C232,58 236,88 226,112 C216,136 190,150 160,150 C130,150 104,138 96,114 C88,92 92,48 120,30 Z';

export function AralScene({ sea, split = 50, crop = 60, dust = 50, trees = 0, life = 30, compact }: {
  sea: number; split?: number; crop?: number; dust?: number; trees?: number; life?: number; compact?: boolean;
}) {
  const s = 0.3 + 0.7 * (sea / 100);
  const riverToSea = 1.5 + (split / 100) * 6;
  const riverToField = 1.5 + ((100 - split) / 100) * 6;
  const treePos: [number, number][] = [[112, 52], [222, 70], [104, 100], [218, 118], [130, 140], [196, 140], [100, 76], [226, 94], [160, 148], [118, 124], [206, 40], [144, 34], [178, 30], [112, 36], [230, 108]];
  const fishN = Math.round(life / 25);
  return (
    <svg viewBox="0 0 320 180" className={`w-full ${compact ? '' : 'rounded-2xl'}`} style={{ background: '#f1d79a' }}>
      <defs>
        <linearGradient id="aralW" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6cc6f0" />
          <stop offset="1" stopColor="#2783c4" />
        </linearGradient>
        <pattern id="cracks" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#e8c98a" />
          <path d="M0 8 L6 6 L8 0 M6 6 L10 12 L16 10 M10 12 L8 16" stroke="#c99a3e" strokeWidth=".8" fill="none" />
        </pattern>
      </defs>
      {/* құрғақ табан (Аралқұм) */}
      <path d={SEA_PATH} fill="url(#cracks)" />
      <path d={SEA_PATH} fill="none" stroke="#2783c4" strokeDasharray="4 3" strokeWidth="1.2" opacity=".6" />
      <text x="160" y="14" textAnchor="middle" fontSize="8" fontWeight="800" fill="#1f6fa3" opacity=".7">1960</text>
      {/* теңіз */}
      <motion.path d={SEA_PATH} fill="url(#aralW)" style={{ transformOrigin: '170px 80px' }}
        initial={false} animate={{ scale: s }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
      {/* толқындар */}
      <motion.g initial={false} animate={{ opacity: sea > 15 ? 0.7 : 0 }}>
        <path d="M150,72 q5,-4 10,0 q5,4 10,0" stroke="#fff" strokeWidth="1.5" fill="none" />
        <path d="M168,92 q5,-4 10,0 q5,4 10,0" stroke="#fff" strokeWidth="1.5" fill="none" />
      </motion.g>
      {/* балықтар/құстар */}
      {Array.from({ length: fishN }).map((_, i) => (
        <motion.text key={i} x={150 + i * 12} y={84 + (i % 2) * 10} fontSize="9" initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 3 + i }}>🐟</motion.text>
      ))}
      {fishN >= 2 && <text x="200" y="40" fontSize="10">🕊️</text>}
      {/* сексеуілдер */}
      {treePos.slice(0, trees).map(([x, y], i) => (
        <motion.text key={i} x={x} y={y} fontSize="11" textAnchor="middle" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformOrigin: `${x}px ${y}px` }}>🌳</motion.text>
      ))}
      {/* өзендер */}
      <path d="M300,170 C270,160 250,150 225,130" stroke="#3aa7e0" strokeWidth={riverToSea} fill="none" strokeLinecap="round" />
      <path d="M20,175 C50,165 80,150 100,128" stroke="#3aa7e0" strokeWidth={riverToSea} fill="none" strokeLinecap="round" />
      <text x="312" y="176" fontSize="7" fontWeight="800" fill="#1f6fa3" textAnchor="end" stroke="#f1d79a" strokeWidth="3" paintOrder="stroke">Сырдария</text>
      <text x="8" y="176" fontSize="7" fontWeight="800" fill="#1f6fa3" stroke="#f1d79a" strokeWidth="3" paintOrder="stroke">Әмудария</text>
      {/* каналдар және егістік */}
      <path d="M270,163 C268,150 275,135 286,128" stroke="#3aa7e0" strokeWidth={riverToField} fill="none" strokeLinecap="round" />
      <path d="M52,166 C46,152 38,140 26,132" stroke="#3aa7e0" strokeWidth={riverToField} fill="none" strokeLinecap="round" />
      {[[270, 104], [290, 112], [278, 122], [8, 110], [26, 118], [12, 126]].map(([x, y], i) => (
        <motion.rect key={i} x={x} y={y} width="22" height="12" rx="2" initial={false}
          animate={{ fill: crop > 40 ? '#5fbf4a' : crop > 15 ? '#b7c86a' : '#c7a46a' }} stroke="#fff" strokeWidth="1" />
      ))}
      {/* шаң-тұз дауылы */}
      <motion.g initial={false} animate={{ opacity: dust / 110, x: [0, 8, 0] }} transition={{ x: { repeat: Infinity, duration: 4 }, opacity: { duration: 1 } }}>
        <ellipse cx="110" cy="60" rx="40" ry="14" fill="#d9c7a4" />
        <ellipse cx="210" cy="130" rx="46" ry="14" fill="#d9c7a4" />
        <ellipse cx="160" cy="25" rx="50" ry="10" fill="#e5d8bd" />
      </motion.g>
    </svg>
  );
}

function Bar({ label, value, bad, icon }: { label: string; value: number; bad?: boolean; icon: string }) {
  const good = bad ? value <= 40 : value >= 50;
  const color = bad
    ? value <= 40 ? 'from-forest-400 to-teal2-500' : value <= 70 ? 'from-sand-400 to-sand-500' : 'from-red-400 to-red-500'
    : value >= 50 ? 'from-teal2-400 to-teal2-600' : value >= 30 ? 'from-sand-400 to-sand-500' : 'from-red-400 to-red-500';
  return (
    <div>
      <div className="flex justify-between gap-1 text-[11px] font-extrabold text-forest-900/80">
        <span className="min-w-0 truncate">{icon} {label}</span>
        <span className={good ? 'text-forest-600' : ''}>{Math.round(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-forest-50 ring-1 ring-forest-100">
        <motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`} initial={false} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} />
      </div>
    </div>
  );
}

interface Props { onScore: (d: number) => void; onComplete: (r: Result) => void; onExit: () => void }

export function Mission3({ onScore, onComplete, onExit }: Props) {
  const [phase, setPhase] = useState<'slides' | 'intro' | 'play' | 'done'>('slides');
  const [slide, setSlide] = useState(0);
  const [round, setRound] = useState(1);
  const [split, setSplit] = useState(45);
  const [improved, setImproved] = useState(false);
  const [planted, setPlanted] = useState<number[]>([]);
  const [plantedNow, setPlantedNow] = useState(0);
  const [stats, setStats] = useState<Stats>(START);
  const [summary, setSummary] = useState<{ prev: Stats; next: Stats; msgs: string[] } | null>(null);
  const [slideSea, setSlideSea] = useState(100);

  // Слайдтардағы теңіздің тартылу анимациясы
  useEffect(() => {
    if (phase !== 'slides') return;
    const t = window.setTimeout(() => setSlideSea(slide === 0 ? 55 : 12), 500);
    return () => window.clearTimeout(t);
  }, [phase, slide]);

  const reset = () => {
    setRound(1); setSplit(45); setImproved(false); setPlanted([]); setPlantedNow(0); setStats(START); setSummary(null); setPhase('play');
  };

  const plant = (i: number) => {
    if (planted.includes(i) || plantedNow >= mission3.seedlingsPerRound) return;
    sfx.plant();
    setPlanted((p) => [...p, i]);
    setPlantedNow((n) => n + 1);
  };

  const applyYear = () => {
    sfx.tap();
    const toFields = 100 - split;
    const need = improved ? 35 : 55;
    const msgs: string[] = [];
    let crop = clamp(Math.round((toFields / need) * 75));
    if (toFields < need * 0.35) { crop = Math.min(crop, 10); msgs.push(mission3.cropDied); }
    const sea = clamp(Math.round(stats.sea + (split - 45) * 0.55));
    if (sea < 15) msgs.push(mission3.seaDying);
    const dust = clamp(Math.round(100 - sea * 0.6 - planted.length * 3.5));
    const life = clamp(Math.round(sea * 0.85 + (100 - dust) * 0.15));
    const next = { sea, crop, dust, life };
    if (msgs.length) sfx.wrong(); else sfx.correct();
    setSummary({ prev: stats, next, msgs });
    setStats(next);
  };

  const closeSummary = () => {
    setSummary(null);
    if (round >= mission3.rounds) setPhase('done');
    else { setRound((r) => r + 1); setPlantedNow(0); }
  };

  const win = stats.sea >= 50 && stats.crop >= 40 && stats.dust <= 40;

  // ---------- Кіріспе слайдтар ----------
  if (phase === 'slides')
    return (
      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="card overflow-hidden p-3">
          <AralScene sea={slideSea} split={slideSea > 60 ? 70 : 10} crop={80} dust={slide === 0 ? 15 : 90} life={slide === 0 ? 50 : 5} />
          <AnimatePresence mode="wait">
            <motion.p key={slide} className="mt-4 min-h-[120px] px-1 text-[15px] font-semibold leading-relaxed text-forest-900"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {mission3.slides[slide]}
            </motion.p>
          </AnimatePresence>
          <div className="mb-3 flex justify-center gap-2">
            {mission3.slides.map((_, i) => <span key={i} className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-forest-500' : 'w-2 bg-forest-100'}`} />)}
          </div>
          <button className="btn-primary w-full" onClick={() => { sfx.tap(); slide < mission3.slides.length - 1 ? setSlide(slide + 1) : setPhase('intro'); }}>
            {ui.next} →
          </button>
        </div>
      </div>
    );

  if (phase === 'intro')
    return <div className="px-4 pt-4"><MissionIntro id={3} text={mission3.instruction} onStart={reset} /></div>;

  if (phase === 'done') {
    const stars = win ? (stats.sea >= 60 && stats.dust <= 30 ? 3 : 2) : 1;
    const score = Math.round(stats.sea * 0.3 + stats.crop * 0.3 + (100 - stats.dust) * 0.2 + stats.life * 0.2) + (win ? 30 : 0);
    return (
      <div className="px-4 pt-4">
        <MissionResult id={3} score={score} stars={stars} text={mission3.final}
          extra={
            <div className="mb-3">
              <div className={`mb-2 text-lg font-black ${win ? 'text-forest-600' : 'text-red-600'}`}>{win ? `🎉 ${mission3.win}` : mission3.lose}</div>
              <div className="overflow-hidden rounded-2xl"><AralScene sea={stats.sea} crop={stats.crop} dust={stats.dust} trees={planted.length} life={stats.life} /></div>
              {!win && <button className="btn-secondary mt-3 w-full" onClick={reset}>🔄 {mission3.retry}</button>}
            </div>
          }
          onDone={() => { onScore(score); onComplete({ score, stars }); }} />
      </div>
    );
  }

  // ---------- Ойын ----------
  return (
    <div className="mx-auto max-w-xl px-3 pb-8">
      <div className="mb-2 flex items-center justify-between px-1">
        <button className="text-sm font-extrabold text-forest-700" onClick={onExit}>← {ui.missions}</button>
        <div className="flex gap-1">
          {Array.from({ length: mission3.rounds }).map((_, i) => (
            <span key={i} className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${i + 1 < round ? 'bg-forest-500 text-white' : i + 1 === round ? 'bg-sand-300 text-forest-900 ring-2 ring-sand-500' : 'bg-white text-forest-900/40'}`}>{i + 1}</span>
          ))}
        </div>
      </div>

      <div className="card mb-2 overflow-hidden p-2">
        <div className="relative">
          <AralScene sea={stats.sea} split={split} crop={stats.crop} dust={stats.dust} trees={planted.length} life={stats.life} />
          <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-black text-forest-900 shadow">
            {round}-{mission3.yearLabel}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 px-1">
          <Bar icon="🌊" label={mission3.indicators.sea} value={stats.sea} />
          <Bar icon="🌾" label={mission3.indicators.crop} value={stats.crop} />
          <Bar icon="🌪️" label={mission3.indicators.dust} value={stats.dust} bad />
          <Bar icon="🐟" label={mission3.indicators.life} value={stats.life} />
        </div>
        <div className="mt-1.5 text-center text-[11px] font-bold text-forest-900/60">
          🎯 {mission3.goal}: 🌊 ≥ 50 · 🌾 ≥ 40 · 🌪️ ≤ 40
        </div>
      </div>

      {/* а) су бөлу */}
      <div className="card mb-2 p-3">
        <div className="mb-2 flex justify-between text-sm font-extrabold">
          <span className="text-sand-500">🌾 {mission3.sliderFields} {100 - split}%</span>
          <span className="text-teal2-600">{split}% {mission3.sliderSea} 🌊</span>
        </div>
        <input type="range" min={0} max={100} step={5} value={100 - split} className="water-range"
          style={{ ['--p' as string]: `${100 - split}%` }}
          onChange={(e) => setSplit(100 - Number(e.target.value))} aria-label={mission3.sliderSea} />
      </div>

      {/* б) суару жүйесі */}
      <button disabled={improved} onClick={() => { sfx.correct(); setImproved(true); }}
        className={`btn mb-2 w-full ${improved ? 'bg-forest-50 text-forest-600 ring-1 ring-forest-100 disabled:opacity-100' : 'bg-teal2-500 text-white shadow-card'}`}>
        💧 {improved ? mission3.improved : mission3.improve}
      </button>

      {/* в) сексеуіл отырғызу */}
      <div className="card mb-3 p-3">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm font-extrabold text-forest-900">
          <span>🌱 {mission3.plantHint}</span>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-forest-50 px-2 py-0.5 text-xs text-forest-600">{mission3.seedlingsPerRound - plantedNow} {mission3.seedlingsLeft}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: CELLS }).map((_, i) => {
            const has = planted.includes(i);
            const can = !has && plantedNow < mission3.seedlingsPerRound;
            return (
              <motion.button key={i} whileTap={can ? { scale: 0.85 } : undefined} onClick={() => plant(i)} disabled={!can && !has}
                className={`flex aspect-[3/2] items-center justify-center rounded-xl text-xl ring-1 transition ${has ? 'bg-forest-100 ring-forest-400' : 'ring-sand-400 disabled:opacity-60'}`}
                style={has ? undefined : { background: 'repeating-linear-gradient(135deg,#ecd08a 0 6px,#e4c47a 6px 8px)' }}>
                <AnimatePresence>{has && <motion.span initial={{ scale: 0, y: 8 }} animate={{ scale: 1, y: 0 }}>🌳</motion.span>}</AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      <button className="btn-primary w-full text-lg" onClick={applyYear}>
        {round < mission3.rounds ? `${mission3.nextYear} →` : `${ui.finish} ✓`}
      </button>

      <Modal open={!!summary}>
        {summary && (
          <div>
            <h3 className="mb-3 text-center text-xl font-black text-forest-900">{round}-{mission3.yearLabel}</h3>
            <div className="mb-3 space-y-1.5">
              {(['sea', 'crop', 'dust', 'life'] as const).map((k) => {
                const d = summary.next[k] - summary.prev[k];
                const good = k === 'dust' ? d <= 0 : d >= 0;
                return (
                  <div key={k} className="flex items-center justify-between rounded-xl bg-forest-50 px-3 py-2 text-sm font-bold">
                    <span>{mission3.indicators[k]}</span>
                    <span>
                      {summary.next[k]}{' '}
                      <span className={good ? 'text-forest-600' : 'text-red-600'}>({d >= 0 ? '+' : ''}{d})</span>
                    </span>
                  </div>
                );
              })}
            </div>
            {summary.msgs.map((m) => (
              <motion.div key={m} className="mb-2 rounded-xl bg-red-50 p-3 text-center font-black text-red-600 ring-1 ring-red-200"
                initial={{ scale: 0.8 }} animate={{ scale: [1, 1.05, 1] }}>⚠️ {m}</motion.div>
            ))}
            <button className="btn-primary mt-1 w-full" onClick={closeSummary}>{ui.continue}</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
