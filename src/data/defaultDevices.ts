import {ConsumptionEstimate, DayOfWeek, DiffuserDevice, DiffuserFormFactor} from '../types/diffuser';

export const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const OIL_LOW_THRESHOLD_PERCENT = 15;

export const FORM_FACTOR_IMAGES: Record<DiffuserFormFactor, string> = {
  tower: '/src/assets/images/diffuser_tower_1794992924311.jpg',
  hvac: '/src/assets/images/diffuser_hvac_1794992924947.jpg',
  wall: '/src/assets/images/diffuser_wall_1794992925375.jpg',
};

export const WIKKA_FRAGRANCE_CATALOG = [
  'White Tea & Bergamot',
  'Oud & Smoked Cedar',
  'Santal & Cardamom',
  'Neroli Blossom & Vetiver',
  'Ambergris & Fig Leaf',
  'Eucalyptus & Silver Fir',
];

export const DEFAULT_DEVICES: DiffuserDevice[] = [
  {
    id: 'wikka-a360-01',
    serialNumber: 'WK-A360-88412',
    name: 'Grand Lobby Tower',
    locationRemark: 'Main Atrium Entrance · Ground Floor',
    fragranceName: 'White Tea & Bergamot',
    formFactor: 'tower',
    imageUrl: FORM_FACTOR_IMAGES.tower,
    connectionType: 'simulated',
    connected: true,
    unlocked: true,
    pin: '8888',
    powerOn: true,
    fanOn: true,
    intensityPercent: 65,
    workSeconds: 25,
    pauseSeconds: 90,
    bottleCapacityMl: 500,
    oilRemainingMl: 390,
    consumptionRateMlPerHour: 3.2,
    firmwareVersion: 'A360-BLE-2.4',
    pcbVersion: 'CH-PCB-4.1',
    lastSyncedAt: 'Synced just now',
    schedules: [
      {
        id: 1,
        enabled: true,
        startTime: '08:00',
        endTime: '14:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        workSeconds: 25,
        pauseSeconds: 90,
        intensityLevel: 6,
      },
      {
        id: 2,
        enabled: true,
        startTime: '14:00',
        endTime: '22:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        workSeconds: 30,
        pauseSeconds: 75,
        intensityLevel: 7,
      },
      {
        id: 3,
        enabled: false,
        startTime: '22:00',
        endTime: '23:30',
        days: ['Fri', 'Sat'],
        workSeconds: 15,
        pauseSeconds: 120,
        intensityLevel: 4,
      },
      {
        id: 4,
        enabled: false,
        startTime: '06:00',
        endTime: '08:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workSeconds: 15,
        pauseSeconds: 120,
        intensityLevel: 4,
      },
      {
        id: 5,
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        days: ['Sun'],
        workSeconds: 20,
        pauseSeconds: 100,
        intensityLevel: 5,
      },
    ],
  },
  {
    id: 'wikka-hvac-02',
    serialNumber: 'WK-HV500-39204',
    name: 'Executive Lounge HVAC',
    locationRemark: 'Level 4 Ventilation Duct · North Wing',
    fragranceName: 'Oud & Smoked Cedar',
    formFactor: 'hvac',
    imageUrl: FORM_FACTOR_IMAGES.hvac,
    connectionType: 'simulated',
    connected: true,
    unlocked: false,
    pin: '8888',
    powerOn: true,
    fanOn: true,
    intensityPercent: 80,
    workSeconds: 40,
    pauseSeconds: 60,
    bottleCapacityMl: 1000,
    oilRemainingMl: 680,
    consumptionRateMlPerHour: 4.8,
    firmwareVersion: 'HV500-BLE-3.0',
    pcbVersion: 'CH-HV-5.2',
    lastSyncedAt: 'Synced 4 min ago',
    schedules: [
      {
        id: 1,
        enabled: true,
        startTime: '09:00',
        endTime: '20:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workSeconds: 40,
        pauseSeconds: 60,
        intensityLevel: 8,
      },
      {
        id: 2,
        enabled: true,
        startTime: '10:00',
        endTime: '18:00',
        days: ['Sat'],
        workSeconds: 30,
        pauseSeconds: 80,
        intensityLevel: 6,
      },
      {
        id: 3,
        enabled: false,
        startTime: '11:00',
        endTime: '17:00',
        days: ['Sun'],
        workSeconds: 20,
        pauseSeconds: 100,
        intensityLevel: 5,
      },
      {
        id: 4,
        enabled: false,
        startTime: '07:00',
        endTime: '09:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workSeconds: 20,
        pauseSeconds: 90,
        intensityLevel: 5,
      },
      {
        id: 5,
        enabled: false,
        startTime: '20:00',
        endTime: '22:00',
        days: ['Thu', 'Fri'],
        workSeconds: 25,
        pauseSeconds: 90,
        intensityLevel: 6,
      },
    ],
  },
  {
    id: 'wikka-wall-03',
    serialNumber: 'WK-W100-71509',
    name: 'Spa Suite Corridor',
    locationRemark: 'Wellness Reception · Mezzanine',
    fragranceName: 'Santal & Cardamom',
    formFactor: 'wall',
    imageUrl: FORM_FACTOR_IMAGES.wall,
    connectionType: 'simulated',
    connected: false,
    unlocked: false,
    pin: '8888',
    powerOn: false,
    fanOn: false,
    intensityPercent: 45,
    workSeconds: 15,
    pauseSeconds: 110,
    bottleCapacityMl: 200,
    oilRemainingMl: 24,
    consumptionRateMlPerHour: 1.8,
    firmwareVersion: 'W100-BLE-1.9',
    pcbVersion: 'CH-W-2.8',
    lastSyncedAt: 'Last seen today, 08:15',
    schedules: [
      {
        id: 1,
        enabled: true,
        startTime: '10:00',
        endTime: '21:00',
        days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        workSeconds: 15,
        pauseSeconds: 110,
        intensityLevel: 5,
      },
      {
        id: 2,
        enabled: false,
        startTime: '08:00',
        endTime: '10:00',
        days: ['Sat', 'Sun'],
        workSeconds: 15,
        pauseSeconds: 120,
        intensityLevel: 4,
      },
      {
        id: 3,
        enabled: false,
        startTime: '12:00',
        endTime: '16:00',
        days: ['Mon'],
        workSeconds: 15,
        pauseSeconds: 120,
        intensityLevel: 4,
      },
      {
        id: 4,
        enabled: false,
        startTime: '16:00',
        endTime: '20:00',
        days: ['Fri', 'Sat'],
        workSeconds: 20,
        pauseSeconds: 100,
        intensityLevel: 5,
      },
      {
        id: 5,
        enabled: false,
        startTime: '21:00',
        endTime: '23:00',
        days: ['Sat'],
        workSeconds: 10,
        pauseSeconds: 150,
        intensityLevel: 3,
      },
    ],
  },
];

function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function calculateConsumption(device: DiffuserDevice): ConsumptionEstimate {
  const oilPercent = Math.max(
    0,
    Math.min(100, Math.round((device.oilRemainingMl / device.bottleCapacityMl) * 100)),
  );

  const enabledEvents = device.schedules.filter((s) => s.enabled && s.days.length > 0);
  if (enabledEvents.length === 0) {
    const cycleTotal = Math.max(1, device.workSeconds + device.pauseSeconds);
    const dutyCycleRatio = device.workSeconds / cycleTotal;
    const dailyOilMl = device.powerOn
      ? Number((device.consumptionRateMlPerHour * 8 * dutyCycleRatio * (device.intensityPercent / 100)).toFixed(2))
      : 0;
    const daysRemaining = dailyOilMl > 0 ? Math.floor(device.oilRemainingMl / dailyOilMl) : 99;
    return {
      dailyHoursActive: device.powerOn ? 8 : 0,
      dutyCycleRatio,
      dailyOilMl,
      daysRemaining,
      oilPercent,
    };
  }

  let weeklyActiveHours = 0;
  let weightedMistHours = 0;

  for (const ev of enabledEvents) {
    let startMin = parseMinutes(ev.startTime);
    let endMin = parseMinutes(ev.endTime);
    if (endMin <= startMin) {
      endMin += 24 * 60;
    }
    const durationHours = (endMin - startMin) / 60;
    const totalWindowHours = durationHours * ev.days.length;
    const duty = ev.workSeconds / Math.max(1, ev.workSeconds + ev.pauseSeconds);
    weeklyActiveHours += totalWindowHours;
    weightedMistHours += totalWindowHours * duty * (ev.intensityLevel / 10);
  }

  const dailyHoursActive = Number((weeklyActiveHours / 7).toFixed(1));
  const dailyMistHours = weightedMistHours / 7;
  const dailyOilMl = Number((dailyMistHours * device.consumptionRateMlPerHour).toFixed(2));
  const dutyCycleRatio =
    weeklyActiveHours > 0 ? weightedMistHours / weeklyActiveHours : 0;
  const daysRemaining = dailyOilMl > 0.05 ? Math.floor(device.oilRemainingMl / dailyOilMl) : 180;

  return {
    dailyHoursActive,
    dutyCycleRatio,
    dailyOilMl,
    daysRemaining,
    oilPercent,
  };
}

export function isLowOilAlert(oilPercent: number): boolean {
  return oilPercent < OIL_LOW_THRESHOLD_PERCENT;
}
