import type { Variants } from 'framer-motion';
import { useStore } from './store';

export const THEME = {
  easy: {
    font: 'font-sans', page: 'bg-sky-50 text-slate-800',
    card: 'bg-white/80 backdrop-blur border border-sky-100 shadow-xl shadow-sky-200/60 rounded-3xl',
    accent: 'text-cyan-600', label: 'text-slate-500',
    btn: 'bg-cyan-500 hover:bg-cyan-400 text-white rounded-full shadow-lg shadow-cyan-300/50',
    input: 'bg-sky-50 border-sky-200 focus:border-cyan-500 rounded-xl',
    seg: 'bg-sky-50 rounded-full', on: 'bg-cyan-500 rounded-full', off: 'text-slate-600', onText: 'text-white',
  },
  hardcore: {
    font: 'font-mono', page: 'bg-neutral-950 text-neutral-100',
    card: 'bg-black/60 border border-red-900/60 shadow-[0_0_30px_rgba(220,20,60,0.18)] rounded-sm',
    accent: 'text-red-500', label: 'text-neutral-400 uppercase tracking-wider',
    btn: 'bg-red-600 hover:bg-red-500 text-white rounded-sm font-bold tracking-widest shadow-[0_0_20px_rgba(220,20,60,0.5)]',
    input: 'bg-neutral-900 border-red-900/60 focus:border-red-500 rounded-sm text-red-50',
    seg: 'bg-neutral-900 rounded-sm', on: 'bg-red-600 rounded-sm', off: 'text-neutral-400', onText: 'text-white',
  },
} as const;
export const useT = () => THEME[useStore((s) => s.mode)];

export const CARBON = {
  backgroundImage: 'repeating-conic-gradient(#0d0d0d 0% 25%, #171717 0% 50%)',
  backgroundSize: '8px 8px',
} as const;

/** Street = slow springs, soft stagger. Track = fast tweens with a digital jitter (skew + flicker). */
export const V: Record<'easy' | 'hardcore', { page: Variants; item: Variants }> = {
  easy: {
    page: {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 18, staggerChildren: 0.08 } },
      exit: { opacity: 0, y: -14, transition: { duration: 0.25 } },
    },
    item: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 16 } },
    },
  },
  hardcore: {
    page: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { staggerChildren: 0.045 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    },
    item: {
      initial: { opacity: 0, x: -24, skewX: -8 },
      animate: { opacity: [0, 1, 0.4, 1, 0.8, 1], x: [-24, 6, -3, 0], skewX: [-8, 2, 0], transition: { duration: 0.28, ease: 'easeOut' } },
    },
  },
};
