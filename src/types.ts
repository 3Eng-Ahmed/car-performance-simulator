export type Mode = 'easy' | 'hardcore';
export type Body = 'sedan' | 'hatchback' | 'compactSuv' | 'fullSuv' | 'coupe';
export type Aspiration = 'na' | 'turbo' | 'supercharged';
export type Drivetrain = 'FWD' | 'RWD' | 'AWD';
export type Transmission = 'manual' | 'auto' | 'dsg';
export type Clutch = 'street' | 'sport' | 'dct' | 'sequential';

export interface EasyData {
  body: Body; cylinders: number; displacement: number; aspiration: Aspiration;
  hp: number; weight: number; drivetrain: Drivetrain; transmission: Transmission;
}
export interface HardcoreData {
  gears: number; ratios: number[]; finalDrive: number; clutch: Clutch;
  maxTorque: number; torqueRpm: number; redline: number;
  weight: number; drivetrain: Drivetrain;
  cd: number; frontalArea: number; tire: string; // e.g. "245/40R18"
}
export interface ShiftEvent { gear: number; t: number; kmh: number }
export interface SimResult {
  zeroTo100: number | null;
  topSpeed: number; // km/h
  limiter: 'aero' | 'gear' | 'estimate';
  shifts: ShiftEvent[];
  peakHp?: number; rpmAtTop?: number; gearAtTop?: number; spinSeconds?: number;
}
