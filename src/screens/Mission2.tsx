import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { mission2, species, threats, ZoneId, ui } from '../data/content';
import { KazMap, toPct } from '../components/KazMap';
import { Avatar } from '../components/Avatar';
import { MissionIntro, MissionResult } from '../components/MissionFrame';
import { MissionResult as Result } from '../lib/game';
import { sfx } from '../lib/sound';

// Әр аймақтағы пайда болу нүктелері (SVG координатасы)
const SPOTS: Record<ZoneId, [number, number][]> = {
  mountain: [[372, 92], [350, 122], [338, 160], [305, 172], [272, 174], [384, 100]],
  steppe: [[100, 62], [160, 40], [220, 28], [262, 50], [200, 82], [300, 82], [140, 78], [250, 98], [60, 70]],
  desert: [[40, 128], [92, 162], [100, 112], [190, 160], [170, 132], [232, 150], [130, 180]],
  water: [[22, 160], [135, 141], [285, 120], [352, 132], [364, 104]],
};

interface Item {
  id: number;
  kind: 'threat' | 'animal';
  ref: string;
  emoji: string;
  x: number;
  y: number;
  born: number;
  life: number;
}
interface Float {
  id: number;
  x: number;
  y: number;
  text: string;
  good: boolean;
  t: number;
}

interface Props {
  onScore: (delta: number) => void;
  onComplete: (r: Result) => void;
  onExit: () => void;
}

export function Mission2({ onScore, onComplete, onExit }: Props) {
  const [phase, setPhase] = useState<'intro' | 'countdown' | 'play' | 'done'>('intro');
  const [count, setCount] = useState(3);
  const [, setTick] = useState(0);
  const eng = useRef({
    start: 0,
    items: [] as Item[],
    floats: [] as Float[],
    nextSpawn: 0,
    seq: 0,
    health: 100,
    score: 0,
    hits: 0,
    misses: 0,
    animalTaps: 0,
    timeLeft: mission2.duration,
  });

  // 3-2-1
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count <= 0) {
      const e = eng.current;
      Object.assign(e, { start: performance.now(), items: [], floats: [], nextSpawn: performance.now() + 300, health: 100, score: 0, hits: 0, misses: 0, animalTaps: 0, timeLeft: mission2.duration });
      setPhase('play');
      return;
    }
    sfx.pop();
    const t = window.setTimeout(() => setCount((c) => c - 1), 750);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  // Ойын циклі
  useEffect(() => {
    if (phase !== 'play') return;
    const iv = window.setInterval(() => {
      const e = eng.current;
      const now = performance.now();
      const elapsed = (now - e.start) / 1000;
      const p = Math.min(1, elapsed / mission2.duration);
      e.timeLeft = Math.max(0, mission2.duration - elapsed);

      // мерзімі біткендер
      const alive: Item[] = [];
      for (const it of e.items) {
        if (now - it.born > it.life) {
          if (it.kind === 'threat') {
            e.health = Math.max(0, e.health - mission2.missPenalty);
            e.misses++;
            e.floats.push({ id: ++e.seq, x: it.x, y: it.y, text: `−${mission2.missPenalty}%`, good: false, t: now });
            sfx.wrong();
          }
        } else alive.push(it);
      }
      e.items = alive;
      e.floats = e.floats.filter((f) => now - f.t < 1500);

      // жаңа элемент
      if (now >= e.nextSpawn && e.items.length < 5 + Math.floor(p * 2)) {
        spawn(e, p, now);
        e.nextSpawn = now + (1050 - 550 * p) * (0.75 + Math.random() * 0.5);
      }

      if (e.timeLeft <= 0 || e.health <= 0) {
        e.items = [];
        setPhase('done');
      }
      setTick((t) => t + 1);
    }, 80);
    return () => window.clearInterval(iv);
  }, [phase]);

  const tapItem = (it: Item) => {
    const e = eng.current;
    if (!e.items.find((x) => x.id === it.id)) return;
    e.items = e.items.filter((x) => x.id !== it.id);
    if (it.kind === 'threat') {
      const t = threats.find((x) => x.id === it.ref)!;
      e.score += mission2.threatPoints;
      e.hits++;
      onScore(mission2.threatPoints);
      sfx.correct();
      e.floats.push({ id: ++e.seq, x: it.x, y: it.y, text: `${t.message} +${mission2.threatPoints}`, good: true, t: performance.now() });
    } else {
      e.score += mission2.animalPoints;
      e.animalTaps++;
      onScore(mission2.animalPoints);
      sfx.wrong();
      e.floats.push({ id: ++e.seq, x: it.x, y: it.y, text: `${mission2.animalTapMessage} ${mission2.animalPoints}`, good: false, t: performance.now() });
    }
    setTick((t) => t + 1);
  };

  const e = eng.current;

  if (phase === 'intro')
    return (
      <div className="px-4 pt-4">
        <MissionIntro id={2} text={mission2.instruction} onStart={() => { setCount(3); setPhase('countdown'); }}>
          <div className="mb-5 grid grid-cols-5 gap-1">
            {threats.map((t) => (
              <div key={t.id} className="flex flex-col items-center gap-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-2xl ring-2 ring-red-300">{t.emoji}</div>
                <div className="text-[10px] font-bold leading-tight text-forest-900/70">{t.name}</div>
              </div>
            ))}
          </div>
        </MissionIntro>
      </div>
    );

  if (phase === 'done') {
    const ratio = e.hits / Math.max(1, e.hits + e.misses);
    const stars = e.health <= 0 ? 1 : ratio >= 0.8 && e.animalTaps <= 2 ? 3 : ratio >= 0.55 ? 2 : 1;
    return (
      <div className="px-4 pt-4">
        <MissionResult
          id={2}
          score={e.score}
          stars={stars}
          text={mission2.final}
          extra={
            <div className="mb-3 flex justify-center gap-2 text-sm font-bold">
              <span className="rounded-full bg-forest-50 px-3 py-1 text-forest-700">✅ {e.hits}</span>
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">⏱️ {e.misses}</span>
              <span className="rounded-full bg-teal2-400/15 px-3 py-1 text-teal2-600">💚 {Math.round(e.health)}%</span>
            </div>
          }
          onDone={() => onComplete({ score: e.score, stars })}
        />
        {e.health <= 0 && <p className="mt-3 text-center font-bold text-red-600">{mission2.healthZero}</p>}
      </div>
    );
  }

  const healthColor = e.health > 60 ? 'from-forest-400 to-teal2-500' : e.health > 30 ? 'from-sand-400 to-sand-500' : 'from-red-400 to-red-500';

  return (
    <div className="mx-auto max-w-xl px-3 pb-8">
      <div className="mb-2 flex items-center justify-between px-1">
        <button className="text-sm font-extrabold text-forest-700" onClick={onExit}>← {ui.missions}</button>
        <div className="flex gap-2">
          <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-forest-700 shadow-card">⏱️ {Math.ceil(e.timeLeft)}</div>
          <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-forest-700 shadow-card">{ui.score}: {e.score}</div>
        </div>
      </div>

      <div className="card mb-2 px-3 py-2">
        <div className="mb-1 flex justify-between text-xs font-extrabold text-forest-900/80">
          <span>💚 {mission2.healthLabel}</span>
          <span>{Math.round(e.health)}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-forest-50 ring-1 ring-forest-100">
          <motion.div className={`h-full rounded-full bg-gradient-to-r ${healthColor}`} animate={{ width: `${e.health}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      <div className="card relative p-2">
        <KazMap showLabels={false}>
          <AnimatePresence>
            {e.items.map((it) => {
              const age = (performance.now() - it.born) / it.life;
              return (
                <motion.button
                  key={it.id}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={toPct(it.x, it.y)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  onPointerDown={(ev) => { ev.preventDefault(); tapItem(it); }}
                >
                  {it.kind === 'threat' ? (
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-lg ring-[3px] ring-red-500 sm:h-14 sm:w-14 sm:text-3xl">
                      <span className="absolute inset-0 animate-ping rounded-full ring-2 ring-red-400 opacity-60" />
                      {it.emoji}
                      <svg className="pointer-events-none absolute -inset-1 -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18.5" fill="none" stroke="#fde68a" strokeWidth="3" strokeDasharray={116} strokeDashoffset={116 * age} />
                      </svg>
                    </div>
                  ) : (
                    <div className="rounded-full ring-[3px] ring-forest-400">
                      <Avatar s={species.find((s) => s.id === it.ref)!} size={40} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
          <AnimatePresence>
            {e.floats.map((f) => (
              <motion.div
                key={f.id}
                className={`pointer-events-none absolute z-20 w-max max-w-[60%] -translate-x-1/2 rounded-xl px-2 py-1 text-center text-[11px] font-black shadow sm:text-xs ${
                  f.good ? 'bg-forest-500 text-white' : 'bg-red-500 text-white'
                }`}
                style={{ ...toPct(Math.min(330, Math.max(50, f.x)), f.y) }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: -36 }}
                transition={{ duration: 1.4 }}
              >
                {f.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </KazMap>
        <AnimatePresence>
          {phase === 'countdown' && (
            <motion.div key={count} className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/60 text-7xl font-black text-forest-600"
              initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
              {count > 0 ? count : '🚀'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {threats.map((t) => (
          <span key={t.id} className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-forest-900/70 shadow-sm">
            {t.emoji} {t.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function spawn(e: { items: Item[]; seq: number }, p: number, now: number) {
  const isAnimal = Math.random() < 0.2;
  let zone: ZoneId;
  let ref: string;
  let emoji: string;
  if (isAnimal) {
    const s = species[Math.floor(Math.random() * species.length)];
    zone = s.zone;
    ref = s.id;
    emoji = s.emoji;
  } else {
    const t = threats[Math.floor(Math.random() * threats.length)];
    zone = t.zones[Math.floor(Math.random() * t.zones.length)];
    ref = t.id;
    emoji = t.emoji;
  }
  const free = SPOTS[zone].filter(([x, y]) => !e.items.some((it) => Math.hypot(it.x - x, it.y - y) < 20));
  if (!free.length) return;
  const [x, y] = free[Math.floor(Math.random() * free.length)];
  e.items.push({ id: ++e.seq, kind: isAnimal ? 'animal' : 'threat', ref, emoji, x, y, born: now, life: 3000 - 1000 * p });
}
