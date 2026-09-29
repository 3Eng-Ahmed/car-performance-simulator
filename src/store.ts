import { create } from 'zustand';
import type { EasyData, HardcoreData, Mode, SimResult } from './types';
import { BODY, calculateEasyPerformance, simulateHardcorePhysics } from './physics';

export const DEFAULT_RATIOS = [3.62, 2.19, 1.62, 1.27, 1.0, 0.82, 0.7, 0.6, 0.52];
const easy0: EasyData = { body: 'sedan', cylinders: 4, displacement: 2, aspiration: 'turbo', hp: 250, weight: 1450, drivetrain: 'FWD', transmission: 'dsg' };
const hard0: HardcoreData = {
  gears: 6, ratios: DEFAULT_RATIOS, finalDrive: 3.7, clutch: 'dct', maxTorque: 350, torqueRpm: 4200, redline: 6800,
  weight: 1450, drivetrain: 'FWD', cd: 0.28, frontalArea: 2.2, tire: '245/40R18',
};

interface State {
  mode: Mode; easy: EasyData; hardcore: HardcoreData; weightTouched: boolean;
  results: SimResult | null; runId: number; error: string | null;
  setEasy: (p: Partial<EasyData>) => void;
  setHardcore: (p: Partial<HardcoreData>) => void;
  setMode: (m: Mode) => void;
  run: () => void;
}

export const useStore = create<State>((set, get) => ({
  mode: 'easy', easy: easy0, hardcore: hard0, weightTouched: false, results: null, runId: 0, error: null,

  setEasy: (p) => set((s) => {
    const easy = { ...s.easy, ...p };
    if (p.body && !s.weightTouched) easy.weight = BODY[p.body].weight; // body implies baseline weight until user edits it
    return { easy, weightTouched: s.weightTouched || p.weight !== undefined };
  }),
  setHardcore: (p) => set((s) => ({ hardcore: { ...s.hardcore, ...p } })),

  setMode: (mode) => set((s) => {
    if (mode === 'hardcore') {
      const e = s.easy, b = BODY[e.body];
      const torqueRpm = { na: 4600, turbo: 3200, supercharged: 3800 }[e.aspiration];
      // carry-over: shared fields + torque estimated from HP
      const hardcore: HardcoreData = {
        ...s.hardcore, weight: e.weight, drivetrain: e.drivetrain, cd: b.cd, frontalArea: b.area, torqueRpm,
        clutch: { manual: 'street', auto: 'sport', dsg: 'dct' }[e.transmission] as HardcoreData['clutch'],
        maxTorque: Math.round(((e.hp * 7121) / (s.hardcore.redline * 0.88)) * 1.08),
      };
      return { mode, hardcore, results: null, error: null };
    }
    return { mode, easy: { ...s.easy, weight: s.hardcore.weight, drivetrain: s.hardcore.drivetrain }, results: null, error: null };
  }),

  run: () => {
    const s = get();
    try {
      const results = s.mode === 'easy' ? calculateEasyPerformance(s.easy) : simulateHardcorePhysics(s.hardcore);
      set({ results, error: null, runId: s.runId + 1 });
    } catch (e) { set({ results: null, error: (e as Error).message }); }
  },
}));
