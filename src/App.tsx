import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store';
import { CARBON, THEME } from './theme';
import type { Mode } from './types';
import { EasyForm } from './components/EasyForm';
import { HardcoreForm } from './components/HardcoreForm';
import { Results } from './components/Results';

export default function App() {
  const { mode, setMode, run } = useStore();
  const [flash, setFlash] = useState<Mode | null>(null);
  const t = THEME[mode];
  const hard = mode === 'hardcore';

  // Screen dims / flashes, the mode swaps under the cover, then the overlay clears (Race-mode ignition).
  const toggle = () => {
    const next: Mode = hard ? 'easy' : 'hardcore';
    setFlash(next);
    setTimeout(() => setMode(next), next === 'hardcore' ? 450 : 250);
    setTimeout(() => setFlash(null), next === 'hardcore' ? 1200 : 700);
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${t.page} ${t.font}`} style={hard ? CARBON : undefined}>
      <AnimatePresence>
        {flash && (
          <motion.div key="overlay" className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
            style={{ background: flash === 'hardcore' ? '#000' : '#fff' }}
            initial={{ opacity: 0 }} animate={{ opacity: flash === 'hardcore' ? [0, 0.95, 0.95, 0] : [0, 1, 0] }}
            transition={{ duration: flash === 'hardcore' ? 1.1 : 0.6, times: flash === 'hardcore' ? [0, 0.3, 0.7, 1] : [0, 0.4, 1] }} exit={{ opacity: 0 }}>
            {flash === 'hardcore' && (
              <motion.div className="absolute inset-x-0 h-0.5 bg-red-600 shadow-[0_0_20px_#dc143c]"
                initial={{ top: 0 }} animate={{ top: '100%' }} transition={{ duration: 0.7, delay: 0.3, ease: 'easeIn' }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <h1 className="text-2xl font-bold">
          {hard ? <span className="tracking-widest text-red-500">TRACK · DYNO</span> : <>Car <span className={t.accent}>Performance</span> Simulator</>}
        </h1>
        <button onClick={toggle} aria-label="Toggle mode" className="flex items-center gap-3 text-sm">
          <span className={t.label}>{hard ? 'Track' : 'Street'}</span>
          <span className={`flex h-7 w-14 items-center p-1 ${hard ? 'justify-end bg-red-900' : 'justify-start bg-cyan-200'} ${hard ? 'rounded-sm' : 'rounded-full'}`}>
            <motion.span layout transition={{ type: 'spring', stiffness: hard ? 700 : 200, damping: 30 }}
              className={`h-5 w-5 ${hard ? 'rounded-sm bg-red-500' : 'rounded-full bg-cyan-600'}`} />
          </span>
        </button>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 lg:grid-cols-[1.4fr_1fr]">
        <section className={`${t.card} p-6`}>
          <AnimatePresence mode="wait">
            {hard ? <HardcoreForm key="hard" /> : <EasyForm key="easy" />}
          </AnimatePresence>
          <motion.button whileTap={{ scale: hard ? 0.94 : 0.98 }} onClick={run} className={`mt-6 w-full py-3 ${t.btn}`}>
            {hard ? 'RUN SIMULATION' : 'Calculate performance'}
          </motion.button>
        </section>
        <Results />
      </main>
    </div>
  );
}
