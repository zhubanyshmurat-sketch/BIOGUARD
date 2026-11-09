import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { mission1, species, Species, ZoneId, zones, ui } from '../data/content';
import { KazMap, toPct, zoneAtPoint } from '../components/KazMap';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { MissionIntro, MissionResult } from '../components/MissionFrame';
import { MissionResult as Result, shuffle } from '../lib/game';
import { sfx } from '../lib/sound';

interface Props {
  onScore: (delta: number) => void;
  onComplete: (r: Result) => void;
  onExit: () => void;
}

export function Mission1({ onScore, onComplete, onExit }: Props) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [order] = useState(() => shuffle(species));
  const [placed, setPlaced] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [fact, setFact] = useState<Species | null>(null);
  const [flash, setFlash] = useState<{ zone: ZoneId; ok: boolean } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<{ id: string; n: number } | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [hoverZone, setHoverZone] = useState<ZoneId | null>(null);
  const press = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const hintTimer = useRef<number>();

  const remaining = useMemo(() => order.filter((s) => !placed.includes(s.id)), [order, placed]);

  const attempt = (id: string, zone: ZoneId) => {
    const s = species.find((x) => x.id === id)!;
    setSelected(null);
    if (s.zone === zone) {
      sfx.correct();
      setFlash({ zone, ok: true });
      setPlaced((p) => [...p, id]);
      setScore((v) => v + mission1.correctPoints);
      onScore(mission1.correctPoints);
      setHint(null);
      setFact(s);
    } else {
      sfx.wrong();
      setFlash({ zone, ok: false });
      setMistakes((m) => m + 1);
      setScore((v) => v + mission1.wrongPoints);
      onScore(mission1.wrongPoints);
      setShakeId({ id, n: Date.now() });
      setHint(mission1.wrongHint);
      window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setHint(null), 2600);
    }
    window.setTimeout(() => setFlash(null), 600);
  };

  const closeFact = () => {
    setFact(null);
    if (placed.length === species.length) setPhase('done');
  };

  // --- pointer (саусақ + тінтуір) ---
  const onDown = (e: React.PointerEvent, id: string) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    press.current = { id, x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) {
      p.moved = true;
      setSelected(null);
    }
    if (p.moved) {
      setDrag({ id: p.id, x: e.clientX, y: e.clientY });
      setHoverZone(zoneAtPoint(e.clientX, e.clientY));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    setDrag(null);
    setHoverZone(null);
    if (!p) return;
    if (p.moved) {
      const z = zoneAtPoint(e.clientX, e.clientY);
      if (z) attempt(p.id, z);
    } else {
      sfx.tap();
      setSelected((cur) => (cur === p.id ? null : p.id));
    }
  };
  const onCancel = () => {
    press.current = null;
    setDrag(null);
    setHoverZone(null);
  };

  const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;

  if (phase === 'intro') return <div className="px-4 pt-4"><MissionIntro id={1} text={mission1.instruction} onStart={() => setPhase('play')} /></div>;
  if (phase === 'done')
    return (
      <div className="px-4 pt-4">
        <MissionResult id={1} score={score} stars={stars} text={mission1.final} onDone={() => onComplete({ score, stars })} />
      </div>
    );

  const dragSpecies = drag ? species.find((s) => s.id === drag.id)! : null;
  const selSpecies = selected ? species.find((s) => s.id === selected)! : null;

  return (
    <div className="mx-auto max-w-xl px-3 pb-8">
      <div className="mb-2 flex items-center justify-between px-1">
        <button className="text-sm font-extrabold text-forest-700" onClick={onExit}>← {ui.missions}</button>
        <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-forest-700 shadow-card">
          {placed.length}/{species.length} · {ui.score}: {score}
        </div>
      </div>

      <div className="card relative p-2">
        <KazMap
          highlight={hoverZone}
          flash={flash}
          onZoneTap={selected ? (z) => attempt(selected, z) : undefined}
        >
          {placed.map((id) => {
            const s = species.find((x) => x.id === id)!;
            return (
              <motion.div
                key={id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={toPct(s.mapPos[0], s.mapPos[1])}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Avatar s={s} size={26} />
              </motion.div>
            );
          })}
        </KazMap>
        <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 px-1 text-[11px] font-bold text-forest-900/70">
          {(Object.keys(zones) as ZoneId[]).map((z) => (
            <span key={z} className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: zones[z].color }} />
              {zones[z].name}
            </span>
          ))}
        </div>
      </div>

      <div className="my-2 min-h-[44px]">
        <AnimatePresence mode="wait">
          {hint ? (
            <motion.div key="h" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-700 ring-1 ring-red-200">
              {hint} <span className="opacity-70">({mission1.wrongPoints})</span>
            </motion.div>
          ) : selSpecies ? (
            <motion.div key="s" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-teal2-400/20 px-3 py-2 text-center text-sm font-bold text-teal2-600">
              👆 {selSpecies.name}: {mission1.selectHint}
            </motion.div>
          ) : (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-2 text-center text-[13px] font-semibold leading-snug text-forest-900/70">
              {mission1.instruction}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence>
          {remaining.map((s) => (
            <SpeciesCard
              key={s.id}
              s={s}
              selected={selected === s.id}
              dragging={drag?.id === s.id}
              shake={shakeId?.id === s.id ? shakeId.n : 0}
              onPointerDown={(e) => onDown(e, s.id)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onCancel}
            />
          ))}
        </AnimatePresence>
      </div>

      {dragSpecies && drag && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[70%]" style={{ left: drag.x, top: drag.y }}>
          <div className="scale-110 drop-shadow-xl">
            <Avatar s={dragSpecies} size={64} />
          </div>
        </div>
      )}

      <Modal open={!!fact}>
        {fact && (
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>
                <Avatar s={fact} size={92} />
              </motion.div>
            </div>
            <div className="text-sm font-black text-forest-500">{ui.correct} +{mission1.correctPoints}</div>
            <h3 className="text-2xl font-black text-forest-900">{fact.name}</h3>
            <div className="mb-3 text-sm font-bold text-teal2-600">
              {zones[fact.zone].emoji} {zones[fact.zone].name}
            </div>
            <p className="mb-4 rounded-2xl bg-forest-50 p-3 text-[15px] leading-relaxed text-forest-900">💡 {fact.fact}</p>
            <button className="btn-primary w-full" onClick={closeFact}>
              {ui.continue}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function SpeciesCard({
  s,
  selected,
  dragging,
  shake,
  ...handlers
}: {
  s: Species;
  selected: boolean;
  dragging: boolean;
  shake: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: () => void;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake) controls.start({ x: [0, -10, 10, -8, 8, -4, 0], transition: { duration: 0.45 } });
  }, [shake, controls]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: dragging ? 0.35 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <motion.div
        animate={controls}
        {...handlers}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
        className={`no-select flex h-full cursor-grab flex-col items-center gap-1 rounded-2xl bg-white p-2 text-center shadow-card ring-2 transition-colors active:cursor-grabbing ${
          selected ? 'ring-teal2-500 bg-teal2-400/10' : 'ring-transparent'
        }`}
      >
        <Avatar s={s} size={48} />
        <div className="text-[12px] font-extrabold leading-tight text-forest-900">{s.name}</div>
      </motion.div>
    </motion.div>
  );
}
