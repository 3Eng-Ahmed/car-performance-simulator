import { motion } from 'framer-motion';
import { useStore } from '../store';
import { V } from '../theme';
import { Num, Seg } from './ui';

export function EasyForm() {
  const { easy: e, setEasy } = useStore();
  return (
    <motion.div variants={V.easy.page} initial="initial" animate="animate" exit="exit" className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Seg label="Body type" value={e.body} onChange={(body) => setEasy({ body })}
          options={[['sedan', 'Sedan'], ['hatchback', 'Hatchback'], ['compactSuv', 'Compact SUV'], ['fullSuv', 'Full SUV'], ['coupe', 'Coupe']]} />
      </div>
      <Num label="Cylinders" value={e.cylinders} min={2} max={16} onChange={(cylinders) => setEasy({ cylinders })} />
      <Num label="Displacement" unit="L" step={0.1} value={e.displacement} onChange={(displacement) => setEasy({ displacement })} />
      <div className="sm:col-span-2">
        <Seg label="Aspiration" value={e.aspiration} onChange={(aspiration) => setEasy({ aspiration })}
          options={[['na', 'Naturally aspirated'], ['turbo', 'Turbo'], ['supercharged', 'Supercharged']]} />
      </div>
      <Num label="Power" unit="HP" value={e.hp} onChange={(hp) => setEasy({ hp })} />
      <Num label="Weight" unit="kg" value={e.weight} onChange={(weight) => setEasy({ weight })} />
      <Seg label="Drivetrain" value={e.drivetrain} onChange={(drivetrain) => setEasy({ drivetrain })}
        options={[['FWD', 'FWD'], ['RWD', 'RWD'], ['AWD', 'AWD']]} />
      <Seg label="Transmission" value={e.transmission} onChange={(transmission) => setEasy({ transmission })}
        options={[['manual', 'Manual'], ['auto', 'Auto'], ['dsg', 'DSG']]} />
    </motion.div>
  );
}
