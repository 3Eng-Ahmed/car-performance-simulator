import { motion } from 'framer-motion';
import { useStore } from '../store';
import { useT, V } from '../theme';

export function Item({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const mode = useStore((s) => s.mode);
  return <motion.div variants={V[mode].item} className={className}>{children}</motion.div>;
}

export function Num(p: { label: string; value: number; onChange: (v: number) => void; step?: number; unit?: string; min?: number; max?: number }) {
  const t = useT();
  return (
    <Item>
      <label className="block">
        <span className={`text-xs ${t.label}`}>{p.label}{p.unit && ` (${p.unit})`}</span>
        <input type="number" step={p.step ?? 1} min={p.min} max={p.max} value={p.value}
          onChange={(e) => p.onChange(parseFloat(e.target.value) || 0)}
          className={`mt-1 w-full border px-3 py-2 outline-none transition-colors ${t.input}`} />
      </label>
    </Item>
  );
}

export function Seg<T extends string>(p: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const t = useT();
  return (
    <Item>
      <span className={`text-xs ${t.label}`}>{p.label}</span>
      <div className={`mt-1 flex flex-wrap gap-1 p-1 ${t.seg}`}>
        {p.options.map(([id, text]) => (
          <button key={id} type="button" onClick={() => p.onChange(id)}
            className={`relative flex-1 whitespace-nowrap px-3 py-1.5 text-sm ${p.value === id ? t.onText : t.off}`}>
            {p.value === id && (
              <motion.span layoutId={p.label} className={`absolute inset-0 ${t.on}`}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            )}
            <span className="relative z-10">{text}</span>
          </button>
        ))}
      </div>
    </Item>
  );
}
