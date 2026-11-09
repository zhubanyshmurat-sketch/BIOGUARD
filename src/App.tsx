import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ui } from './data/content';
import { Results, Screen, MissionResult, saveBest } from './lib/game';
import { isMuted, setMuted, sfx } from './lib/sound';
import { TopBar } from './components/TopBar';
import { Start } from './screens/Start';
import { Menu } from './screens/Menu';
import { Mission1 } from './screens/Mission1';
import { Mission2 } from './screens/Mission2';
import { Mission3 } from './screens/Mission3';
import { Mission4 } from './screens/Mission4';
import { Final } from './screens/Final';

const NAME_KEY = 'bioguard_name';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; }
  });
  // Прогресс бетті жаңартқанда жоғалмауы үшін sessionStorage-та сақталады
  const [results, setResults] = useState<Results>(() => {
    try { return JSON.parse(sessionStorage.getItem('bioguard_results') || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    try { sessionStorage.setItem('bioguard_results', JSON.stringify(results)); } catch { /* */ }
  }, [results]);
  const [live, setLive] = useState(0); // ағымдағы миссиядағы ұпай
  const [presentation, setPresentation] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();

  const banked = Object.values(results).reduce((s, r) => s + (r?.score ?? 0), 0);
  const total = Math.max(0, banked + live);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [screen]);

  const showToast = (t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const togglePresentation = () => {
    sfx.win();
    showToast(presentation ? ui.presentationOff : ui.presentationOn);
    setPresentation(!presentation);
  };

  const toggleSound = () => {
    setMuted(!muted);
    setMutedState(!muted);
    if (muted) sfx.tap();
  };

  const complete = (id: 1 | 2 | 3 | 4) => (r: MissionResult) => {
    // Қайта ойнағанда — ең жақсы нәтиже сақталады
    const prev = results[id];
    const best = !prev || r.score > prev.score ? r : prev;
    const next = { ...results, [id]: best };
    setResults(next);
    setLive(0);
    const sum = Object.values(next).reduce((s, x) => s + (x?.score ?? 0), 0);
    saveBest(sum);
    setScreen(Object.keys(next).length === 4 && id === 4 ? 'final' : 'menu');
  };

  const exitMission = () => { setLive(0); setScreen('menu'); };
  const addLive = (d: number) => setLive((v) => v + d);

  const current = screen.startsWith('m') && screen !== 'menu' ? Number(screen[1]) : undefined;
  const missionProps = (id: 1 | 2 | 3 | 4) => ({ onScore: addLive, onComplete: complete(id), onExit: exitMission });

  return (
    <div className="min-h-[100dvh] overflow-x-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {screen !== 'start' && (
        <TopBar results={results} current={current} total={total} muted={muted} onToggleSound={toggleSound}
          onHome={screen === 'menu' ? undefined : () => { setLive(0); setScreen('menu'); }} />
      )}
      {screen === 'start' && (
        <button onClick={toggleSound} aria-label={muted ? ui.soundOff : ui.soundOn}
          className="fixed right-3 z-40 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl shadow-card"
          style={{ top: 'max(env(safe-area-inset-top, 0px), 12px)' }}>
          {muted ? '🔇' : '🔊'}
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.main key={screen} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
          {screen === 'start' && (
            <Start initialName={name} onLongPress={togglePresentation}
              onStart={(n) => {
                setName(n);
                try { localStorage.setItem(NAME_KEY, n); } catch { /* */ }
                setScreen('menu');
              }} />
          )}
          {screen === 'menu' && (
            <Menu name={name} results={results} unlockedAll={presentation} onLongPress={togglePresentation}
              onOpen={(id) => { setLive(0); setScreen(`m${id}` as Screen); }} onFinal={() => setScreen('final')} />
          )}
          {screen === 'm1' && <Mission1 {...missionProps(1)} />}
          {screen === 'm2' && <Mission2 {...missionProps(2)} />}
          {screen === 'm3' && <Mission3 {...missionProps(3)} />}
          {screen === 'm4' && <Mission4 {...missionProps(4)} />}
          {screen === 'final' && (
            <Final name={name} results={results} total={banked}
              onMenu={() => setScreen('menu')}
              onReplay={() => { setResults({}); setLive(0); setScreen('start'); }} />
          )}
        </motion.main>
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div className="fixed inset-x-0 bottom-6 z-[60] mx-auto w-fit max-w-[90vw] rounded-2xl bg-forest-900 px-4 py-3 text-center text-sm font-bold text-white shadow-xl"
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
