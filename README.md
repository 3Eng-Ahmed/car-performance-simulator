# Car Performance Simulator

Two modes: **Street** (empirical 0-100 / top-speed estimate) and **Track** (0.01 s numerical physics simulation).

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Structure
- `src/types.ts` – interfaces
- `src/physics.ts` – `calculateEasyPerformance`, `simulateHardcorePhysics`
- `src/store.ts` – Zustand store, mode carry-over
- `src/theme.ts` – Tailwind theme maps + Framer Motion variants
- `src/App.tsx` – container, theme toggle, mode-switch overlay
- `src/components/` – EasyForm, HardcoreForm, Results (gauge), ui helpers
