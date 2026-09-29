import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useStore } from '../store';
import { useT } from '../theme';

function Count({ to, d = 0, dur }: { to: number; d?: number; dur: number }) {
  const mv = useMotionValue(0);
  const txt = useTransform(mv, (v) => v.toFixed(d));
  useEffect(() => { const c = animate(mv, to, { duration: dur, ease: 'easeOut' }); return () => c.stop(); }, [to, dur, mv]);
  return <motion.span>{txt}</motion.span>;
}

/** 240° speedometer arc; the stroke draws via pathLength while the number counts up. */
function Gauge({ value, max, hard }: { value: number; max: number; hard: boolean }) {
  const pt = (a: number) => `${100 + 90 * Math.cos((a * Math.PI) / 180)},${100 + 90 * Math.sin((a * Math.PI) / 180)}`;
  const d = `M ${pt(150)} A 90 90 0 1 1 ${pt(30)}`;
  const dur = hard ? 0.9 : 1.6;
  return (
    <div className="relative mx-auto aspect-square w-64">
      <svg viewBox="0 0 200 200" className="absolute inset-0 text-current">
        <path d={d} fill="none" stroke="currentColor" strokeWidth={10} strokeLinecap={hard ? 'butt' : 'round'} opacity={0.12} />
        <motion.path d={d} fill="none" stroke="currentColor" strokeWidth={10} strokeLinecap={hard ? 'butt' : 'round'}
          initial={{ pathLength: 0 }} animate={{ pathLength: Math.min(1, value / max) }}
          transition={hard ? { duration: dur, ease: [0.2, 0.9, 0.1, 1] } : { duration: dur, ease: 'easeInOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tabular-nums"><Count to={value} dur={dur} /></span>
        <span className="text-xs opacity-60">km/h top speed</span>
      </div>
    </div>
  );
}

export function Results() {
  const { results: r, runId, mode, error } = useStore();
  const t = useT();
  const hard = mode === 'hardcore';
  if (error) return <div className={`${t.card} p-6 text-red-500`}>{error}</div>;
  if (!r) return <div className={`${t.card} p-10 text-center ${t.label}`}>Enter your specs, then run the simulation.</div>;
  const max = Math.max(300, Math.ceil(r.topSpeed / 50) * 50 + 50);
  return (
    <motion.div key={runId} initial={{ opacity: 0, scale: hard ? 1.04 : 0.96 }} animate={{ opacity: 1, scale: 1 }}
      transition={hard ? { duration: 0.15 } : { type: 'spring', stiffness: 80, damping: 16 }} className={`${t.card} p-6`}>
      <div className={t.accent}><Gauge value={r.topSpeed} max={max} hard={hard} /></div>
      <div className="mt-4 text-center">
        <div className={`text-xs ${t.label}`}>0–100 km/h</div>
        <div className={`text-6xl font-bold tabular-nums ${t.accent}`}>
          {r.zeroTo100 === null ? '—' : <><Count to={r.zeroTo100} d={2} dur={hard ? 0.7 : 1.4} /><span className="text-2xl"> s</span></>}
        </div>
        {r.zeroTo100 === null && <p className="text-xs opacity-60">This car never reaches 100 km/h.</p>}
      </div>
      {hard && (
        <div className="mt-5 space-y-1 border-t border-red-900/60 pt-4 text-sm">
          <p>Top speed is <b className="text-red-500">{r.limiter === 'gear' ? 'GEAR-LIMITED' : 'AERO-LIMITED'}</b>
            {' '}(gear {r.gearAtTop}, {Math.round(r.rpmAtTop ?? 0)} rpm)</p>
          <p className="text-neutral-400">Peak power {Math.round(r.peakHp ?? 0)} HP · wheelspin {(r.spinSeconds ?? 0).toFixed(2)} s</p>
          <p className="text-neutral-400">Shifts: {r.shifts.map((s) => `→${s.gear} @ ${Math.round(s.kmh)}`).join('  ')}</p>
        </div>
      )}
      {!hard && <p className="mt-4 text-center text-xs opacity-60">Estimate from power-to-weight, drivetrain losses and body-type drag.</p>}
    </motion.div>
  );
}
