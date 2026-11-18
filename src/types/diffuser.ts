export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type DiffuserFormFactor = 'tower' | 'hvac' | 'wall';

export interface ScheduleEvent {
  id: number;
  enabled: boolean;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  days: DayOfWeek[];
  workSeconds: number; // 5 - 300s pump atomization duration
  pauseSeconds: number; // 5 - 900s interval pause duration
  intensityLevel: number; // 1 - 10
}

export interface DiffuserDevice {
  id: string;
  serialNumber: string;
  name: string;
  locationRemark: string;
  fragranceName: string;
  formFactor: DiffuserFormFactor;
  imageUrl: string;
  connectionType: 'bluetooth' | 'simulated';
  connected: boolean;
  unlocked: boolean;
  pin: string; // Default factory PIN is "8888"
  powerOn: boolean;
  fanOn: boolean;
  intensityPercent: number; // 10 - 100
  workSeconds: number; // active manual/default work cycle (s)
  pauseSeconds: number; // active manual/default pause cycle (s)
  bottleCapacityMl: 100 | 200 | 500 | 1000;
  oilRemainingMl: number;
  consumptionRateMlPerHour: number; // calibrated ml/h at 100% continuous mist
  firmwareVersion: string;
  pcbVersion: string;
  lastSyncedAt: string;
  schedules: ScheduleEvent[];
}

export interface ConsumptionEstimate {
  dailyHoursActive: number;
  dutyCycleRatio: number;
  dailyOilMl: number;
  daysRemaining: number;
  oilPercent: number;
}
