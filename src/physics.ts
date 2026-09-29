import type { Body, EasyData, HardcoreData, SimResult, ShiftEvent } from './types';

export const BODY: Record<Body, { cd: number; area: number; weight: number }> = {
  sedan: { cd: 0.28, area: 2.2, weight: 1450 },
  hatchback: { cd: 0.31, area: 2.1, weight: 1300 },
  compactSuv: { cd: 0.33, area: 2.45, weight: 1550 },
  fullSuv: { cd: 0.37, area: 2.9, weight: 2100 },
  coupe: { cd: 0.29, area: 2.0, weight: 1400 },
};
const RHO = 1.225, G = 9.81, CRR = 0.013, MU = 1.1;
const V100 = 100 / 3.6;

/** Bisection on P_wheel = 0.5*rho*Cd*A*v^3 + Crr*m*g*v */
function aeroTopSpeed(powerW: number, cd: number, area: number, m: number) {
  let lo = 0, hi = 150;
  for (let i = 0; i < 60; i++) {
    const v = (lo + hi) / 2;
    (0.5 * RHO * cd * area * v ** 3 + CRR * m * G * v > powerW ? (hi = v) : (lo = v));
  }
  return lo * 3.6;
}

/* ---------------- EASY: empirical model ---------------- */
export function calculateEasyPerformance(d: EasyData): SimResult {
  const b = BODY[d.body];
  const loss = { FWD: 0.11, RWD: 0.13, AWD: 0.17 }[d.drivetrain] + { manual: 0.02, auto: 0.06, dsg: 0.03 }[d.transmission];
  const pw = d.hp * 745.7 * (1 - loss);
  const lowEnd =
    { na: 1 + Math.min(0.04, Math.max(0, (d.displacement - 2) * 0.01)), turbo: 0.96, supercharged: 1.02 }[d.aspiration] +
    (d.cylinders >= 8 ? 0.01 : 0);
  const aero = 1 + (0.05 * b.cd * b.area) / 0.6;
  const ke = 0.5 * d.weight * 1.05 * V100 ** 2;
  const tPower = (ke * aero) / (0.75 * pw * lowEnd);
  const driven = { FWD: 0.58, RWD: 0.68, AWD: 0.95 }[d.drivetrain];
  const tTraction = (V100 / (MU * G * driven)) * 1.15;
  const shifts = { manual: 0.45, auto: 0.3, dsg: 0.08 }[d.transmission] * 2;
  return {
    zeroTo100: Math.max(tPower, tTraction) + shifts,
    topSpeed: aeroTopSpeed(pw, b.cd, b.area, d.weight),
    limiter: 'estimate', shifts: [],
  };
}

/* ---------------- HARDCORE: numerical integration ---------------- */
export const parseTire = (s: string) => {
  const m = s.match(/(\d{3})\s*\/\s*(\d{2})\s*[A-Za-z-]*\s*(\d{2})/);
  return m ? ((+m[3] * 25.4) / 2 + (+m[1] * +m[2]) / 100) / 1000 : null; // rolling radius, m
};
const SHIFT_TIME = { street: 0.55, sport: 0.3, dct: 0.08, sequential: 0.12 };

export function torqueAt(rpm: number, d: Pick<HardcoreData, 'maxTorque' | 'torqueRpm' | 'redline'>) {
  const p = d.torqueRpm;
  const x = rpm < p ? (p - rpm) / p : (rpm - p) / (d.redline - p);
  return d.maxTorque * Math.max(0.15, 1 - (rpm < p ? 0.45 : 0.4) * x * x);
}
export function peakPowerHp(d: Pick<HardcoreData, 'maxTorque' | 'torqueRpm' | 'redline'>) {
  let best = 0;
  for (let r = 1000; r <= d.redline; r += 100) best = Math.max(best, (torqueAt(r, d) * r) / 7121);
  return best;
}

export function simulateHardcorePhysics(d: HardcoreData): SimResult {
  const r = parseTire(d.tire);
  if (!r) throw new Error('Tire size not recognised. Use a format like 245/40R18.');
  const n = d.gears, m = d.weight, dt = 0.01, shiftT = SHIFT_TIME[d.clutch];
  const eff = { FWD: 0.92, RWD: 0.9, AWD: 0.86 }[d.drivetrain];
  const hL = 0.22; // CG height / wheelbase, for load transfer
  let v = 0, a = 0, g = 0, shiftLeft = 0, still = 0, spin = 0, t100: number | null = null, limiter: SimResult['limiter'] = 'aero';
  let rpm = 0;
  const shifts: ShiftEvent[] = [];

  for (let i = 0; i < 40000; i++) {
    const t = i * dt;
    const gr = d.ratios[g] * d.finalDrive;
    rpm = ((v / r) * gr * 60) / (2 * Math.PI);
    let F = 0;
    if (shiftLeft > 0) shiftLeft -= dt; // clutch open: no drive force
    else if (rpm >= d.redline * 0.98 && g < n - 1) {
      g++; shiftLeft = shiftT;
      shifts.push({ gear: g + 1, t, kmh: v * 3.6 });
    } else if (rpm < d.redline) {
      const rpmE = g === 0 ? Math.max(rpm, d.torqueRpm * 0.75) : rpm; // clutch slip on launch
      const fWheel = (torqueAt(rpmE, d) * gr * eff) / r;
      const N = { FWD: 0.6 * m * G - hL * m * a, RWD: 0.5 * m * G + hL * m * a, AWD: m * G }[d.drivetrain];
      const fTrac = MU * Math.max(0, N);
      if (fTrac < fWheel && t < 6) spin += dt;
      F = Math.min(fWheel, fTrac);
    }
    const drag = 0.5 * RHO * d.cd * d.frontalArea * v * v;
    const roll = v > 0 ? CRR * m * G : 0;
    const mEff = m * (1.04 + 0.0025 * gr * gr); // rotating inertia grows with ratio
    a = (F - drag - roll) / mEff;
    v = Math.max(0, v + a * dt);
    if (t100 === null && v >= V100) t100 = t;

    const atLimiter = g === n - 1 && rpm >= d.redline * 0.995;
    if (shiftLeft <= 0 && (atLimiter || (Math.abs(a) < 0.002 && v > 5))) {
      if (++still > 150) { limiter = atLimiter ? 'gear' : 'aero'; break; }
    } else still = 0;
  }
  return {
    zeroTo100: t100, topSpeed: v * 3.6, limiter, shifts,
    peakHp: peakPowerHp(d), rpmAtTop: rpm, gearAtTop: g + 1, spinSeconds: spin,
  };
}
