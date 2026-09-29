import { motion } from 'framer-motion';
import { useStore } from '../store';
import { V } from '../theme';
import { peakPowerHp, parseTire } from '../physics';
import { Item, Num, Seg } from './ui';

export function HardcoreForm() {
  const { hardcore: h, setHardcore } = useStore();
  const tireOk = parseTire(h.tire) !== null;
  const setRatio = (i: number, v: number) => setHardcore({ ratios: h.ratios.map((r, j) => (j === i ? v : r)) });
  return (
    <motion.div variants={V.hardcore.page} initial="initial" animate="animate" exit="exit" className="grid gap-4 sm:grid-cols-3">
      <div className="sm:col-span-3"><Seg label="Clutch / shift system" value={h.clutch} onChange={(clutch) => setHardcore({ clutch })}
        options={[['street', 'Street 0.55s'], ['sport', 'Sport 0.30s'], ['dct', 'Dual-clutch 0.08s'], ['sequential', 'Sequential 0.12s']]} /></div>
      <Num label="Gears" value={h.gears} min={4} max={9} onChange={(gears) => setHardcore({ gears: Math.min(9, Math.max(4, Math.round(gears))) })} />
      <Num label="Final drive" step={0.01} value={h.finalDrive} onChange={(finalDrive) => setHardcore({ finalDrive })} />
      <Seg label="Drivetrain" value={h.drivetrain} onChange={(drivetrain) => setHardcore({ drivetrain })} options={[['FWD', 'FWD'], ['RWD', 'RWD'], ['AWD', 'AWD']]} />
      <div className="grid grid-cols-3 gap-2 sm:col-span-3 sm:grid-cols-9">
        {h.ratios.slice(0, h.gears).map((r, i) => <Num key={i} label={`G${i + 1}`} step={0.01} value={r} onChange={(v) => setRatio(i, v)} />)}
      </div>
      <Num label="Max torque" unit="Nm" value={h.maxTorque} onChange={(maxTorque) => setHardcore({ maxTorque })} />
      <Num label="Torque peak" unit="rpm" value={h.torqueRpm} onChange={(torqueRpm) => setHardcore({ torqueRpm })} />
      <Num label="Redline" unit="rpm" value={h.redline} onChange={(redline) => setHardcore({ redline })} />
      <Num label="Drag coeff. Cd" step={0.01} value={h.cd} onChange={(cd) => setHardcore({ cd })} />
      <Num label="Frontal area" unit="m²" step={0.01} value={h.frontalArea} onChange={(frontalArea) => setHardcore({ frontalArea })} />
      <Num label="Mass" unit="kg" value={h.weight} onChange={(weight) => setHardcore({ weight })} />
      <Item className="sm:col-span-2">
        <label className="block text-xs text-neutral-400">Tire size
          <input value={h.tire} onChange={(e) => setHardcore({ tire: e.target.value })}
            className={`mt-1 w-full border bg-neutral-900 px-3 py-2 outline-none ${tireOk ? 'border-red-900/60 focus:border-red-500' : 'border-yellow-500'}`} />
        </label>
      </Item>
      <Item className="self-end text-sm text-neutral-400">Implied peak power <b className="text-red-500">{Math.round(peakPowerHp(h))} HP</b></Item>
    </motion.div>
  );
}
