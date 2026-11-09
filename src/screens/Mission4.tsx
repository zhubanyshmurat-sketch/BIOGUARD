import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { mission4, questions, ui } from '../data/content';
import { MissionIntro, MissionResult } from '../components/MissionFrame';
import { MissionResult as Result, shuffle } from '../lib/game';
import { sfx } from '../lib/sound';

interface Props { onScore: (d: number) => void; onComplete: (r: Result) => void; onExit: () => void }


export function Mission4({ onScore, onComplete, onExit }: Props) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null); // '' = уақыт бітті
  const [left, setLeft] = useState(mission4.timePerQuestion);
  const [correctN, setCorrectN] = useState(0);
  const [score, setScore] = useState(0);

  const q = questions[idx];
  const options = useMemo(() => shuffle([q.correct, ...q.wrong]), [q]);
  const answered = picked !== null;

  // таймер
  useEffect(() => {
    if (phase !== 'play' || answered) return;
    if (left <= 0) { sfx.wrong(); setPicked(''); return; }
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, left, answered]);

  const choose = (o: string) => {
    if (answered) return;
    setPicked(o);
    if (o === q.correct) {
      sfx.correct();
      // жылдамдық бонусы
      const pts = mission4.pointsPerCorrect + Math.floor(left / 5);
      setCorrectN((n) => n + 1);
      setScore((s) => s + pts);
      onScore(pts);
    } else sfx.wrong();
  };

  const next = () => {
    sfx.tap();
    if (idx + 1 >= questions.length) { setPhase('done'); return; }
    setIdx((i) => i + 1);
    setPicked(null);
    setLeft(mission4.timePerQuestion);
  };

  if (phase === 'intro')
    return <div className="px-4 pt-4"><MissionIntro id={4} text={mission4.instruction} onStart={() => setPhase('play')} /></div>;

  if (phase === 'done') {
    const stars = correctN >= 9 ? 3 : correctN >= 6 ? 2 : 1;
    return (
      <div className="px-4 pt-4">
        <MissionResult id={4} score={score} stars={stars} text={mission4.final}
          extra={<div className="mb-3 text-lg font-black text-forest-700">✅ {correctN} / {questions.length}</div>}
          onDone={() => onComplete({ score, stars })} />
      </div>
    );
  }

  const pct = (left / mission4.timePerQuestion) * 100;
  return (
    <div className="mx-auto max-w-xl px-3 pb-8">
      <div className="mb-2 flex items-center justify-between px-1">
        <button className="text-sm font-extrabold text-forest-700" onClick={onExit}>← {ui.missions}</button>
        <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-forest-700 shadow-card">{ui.score}: {score}</div>
      </div>

      <div className="mb-3 flex gap-1 px-1">
        {questions.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < idx ? 'bg-forest-400' : i === idx ? 'bg-sand-400' : 'bg-white ring-1 ring-forest-100'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
          <div className="card mb-3 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">📕 {idx + 1} / {questions.length}</span>
              <div className="relative h-11 w-11">
                <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
                  <circle cx="20" cy="20" r="17" fill="none" stroke="#ecfdf3" strokeWidth="4" />
                  <circle cx="20" cy="20" r="17" fill="none" stroke={left <= 5 ? '#ef4444' : '#14b8a6'} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={107} strokeDashoffset={107 - (107 * pct) / 100} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${left <= 5 ? 'text-red-600' : 'text-forest-900'}`}>{left}</span>
              </div>
            </div>
            <h2 className="text-lg font-black leading-snug text-forest-900">{q.q}</h2>
          </div>

          <div className="grid gap-2">
            {options.map((o, i) => {
              const isCorrect = o === q.correct;
              const isPicked = o === picked;
              let cls = 'bg-white ring-forest-100 text-forest-900';
              if (answered && isCorrect) cls = 'bg-forest-500 ring-forest-600 text-white';
              else if (answered && isPicked) cls = 'bg-red-500 ring-red-600 text-white';
              else if (answered) cls = 'bg-white/60 ring-black/5 text-forest-900/50';
              return (
                <motion.button key={o} onClick={() => choose(o)} disabled={answered}
                  whileTap={!answered ? { scale: 0.97 } : undefined}
                  animate={answered && isPicked && !isCorrect ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                  className={`flex min-h-[54px] items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold shadow-card ring-2 transition-colors ${cls}`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5 text-sm font-black">
                    {answered && isCorrect ? '✓' : answered && isPicked ? '✗' : 'ABCD'[i]}
                  </span>
                  <span className="text-[15px] leading-tight">{o}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mt-3 p-4">
                <div className={`mb-1 font-black ${picked === q.correct ? 'text-forest-600' : 'text-red-600'}`}>
                  {picked === q.correct ? `🎉 ${ui.correct}` : picked === '' ? `⏰ ${ui.timeUp}` : `❌ ${ui.wrong}`}
                </div>
                <p className="mb-3 text-[15px] leading-relaxed text-forest-900/85">💡 {q.explain}</p>
                <button className="btn-primary w-full" onClick={next}>
                  {idx + 1 < questions.length ? `${ui.next} →` : `${ui.finish} ✓`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
