import React, {useEffect, useState} from 'react';
import {
  AlertTriangle,
  Bluetooth,
  Clock,
  Droplets,
  Gauge,
  Power,
  RotateCcw,
  Sparkles,
  Wind,
} from 'lucide-react';
import {
  calculateConsumption,
  isLowOilAlert,
  OIL_LOW_THRESHOLD_PERCENT,
} from '../data/defaultDevices';
import {DiffuserDevice} from '../types/diffuser';
import {IntensityHistoryChart} from './IntensityHistoryChart';

interface ControlWorkspaceProps {
  device: DiffuserDevice;
  onUpdateDevice: (updated: DiffuserDevice) => void;
  onOpenSchedule: () => void;
}

export const ControlWorkspace: React.FC<ControlWorkspaceProps> = ({
  device,
  onUpdateDevice,
  onOpenSchedule,
}) => {
  const [imgError, setImgError] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const estimate = calculateConsumption(device);
  const lowOil = isLowOilAlert(estimate.oilPercent);

  useEffect(() => {
    setImgError(false);
  }, [device.id]);

  const handleTriggerPulse = () => {
    setPulseActive(true);
    window.setTimeout(() => setPulseActive(false), 1800);
  };

  const handleResetOil = () => {
    onUpdateDevice({
      ...device,
      oilRemainingMl: device.bottleCapacityMl,
      lastSyncedAt: 'Oil level reset just now',
    });
    setResetConfirmed(true);
    window.setTimeout(() => setResetConfirmed(false), 2000);
  };

  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - estimate.oilPercent / 100);

  return (
    <div className="space-y-6">
      {lowOil && (
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-950">
                Low Fragrance Oil Alert ({estimate.oilPercent}% remaining)
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-red-800">
                {device.name} has dropped below the {OIL_LOW_THRESHOLD_PERCENT}% refill threshold (
                <span className="font-mono-tabular font-medium">
                  {device.oilRemainingMl} ml / {device.bottleCapacityMl} ml
                </span>
                , ~{estimate.daysRemaining} days left). Replace or refill the{' '}
                {device.fragranceName} cartridge to prevent dry pump operation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetOil}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-800 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{resetConfirmed ? 'Reset to 100%' : 'Refill & Reset Oil'}</span>
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E7E2D8] bg-[#F5F2EC]">
              {!imgError ? (
                <img
                  src={device.imageUrl}
                  alt={device.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Droplets className="h-5 w-5 text-[#B5924C]" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#1C1917] sm:text-3xl">
                {device.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#78716C]">
                <span>{device.locationRemark}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#44403C]">{device.fragranceName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{device.lastSyncedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                onUpdateDevice({
                  ...device,
                  fanOn: !device.fanOn,
                  lastSyncedAt: 'Synced just now',
                })
              }
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                device.fanOn && device.powerOn
                  ? 'border-[#C6A567] bg-[#C6A567]/12 text-[#7C5F2A]'
                  : 'border-[#E7E2D8] bg-[#FAF9F6] text-[#57534E] hover:bg-[#EFECE4]'
              }`}
            >
              <Wind className="h-4 w-4" />
              <span>{device.fanOn ? 'Internal Fan On' : 'Fan Off'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateDevice({
                  ...device,
                  powerOn: !device.powerOn,
                  lastSyncedAt: 'Synced just now',
                })
              }
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                device.powerOn
                  ? 'bg-[#1C1917] text-white hover:bg-[#292524]'
                  : 'border border-[#E7E2D8] bg-white text-[#1C1917] hover:bg-[#F5F2EC]'
              }`}
            >
              <Power className="h-4 w-4" />
              <span>{device.powerOn ? 'Power On' : 'Standby Off'}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#1C1917]">Fragrance Oil Level</h3>
              <p className="text-xs text-[#78716C]">
                {device.bottleCapacityMl} ml cartridge · Calibrated {device.consumptionRateMlPerHour}{' '}
                ml/hr
              </p>
            </div>
            <Bluetooth className="h-4 w-4 text-[#B5924C]" />
          </div>

          <div className="my-6 flex items-center justify-center gap-6">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                <circle
                  cx="64"
                  cy="64"
                  r={ringRadius}
                  fill="none"
                  stroke="#EFECE4"
                  strokeWidth="10"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={ringRadius}
                  fill="none"
                  stroke={
                    lowOil ? '#DC2626' : estimate.oilPercent <= 25 ? '#D97706' : '#B5924C'
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono-tabular text-3xl font-semibold text-[#1C1917]">
                  {estimate.oilPercent}%
                </span>
                <span className="font-mono-tabular text-xs text-[#78716C]">
                  {device.oilRemainingMl} ml left
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-xs text-[#78716C]">Est. Daily Usage</p>
                <p className="font-mono-tabular text-base font-semibold text-[#1C1917]">
                  {estimate.dailyOilMl} ml/day
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Refill Autonomy</p>
                <p className="font-mono-tabular text-base font-semibold text-[#1C1917]">
                  ~{estimate.daysRemaining} days
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Scheduled Runtime</p>
                <p className="font-mono-tabular text-base font-semibold text-[#1C1917]">
                  {estimate.dailyHoursActive} hrs/day
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleResetOil}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#EFECE4]"
            >
              <RotateCcw className="h-4 w-4 text-[#B5924C]" />
              <span>{resetConfirmed ? 'Reset to 100%' : 'Reset Oil After Refill'}</span>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6 lg:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-[#1C1917]">
                Atomization & Duty Cycle
              </h3>
              <p className="text-xs text-[#78716C]">
                Configure mist concentration and pump work/pause intervals in seconds.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTriggerPulse}
              disabled={!device.powerOn}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#C6A567] bg-[#C6A567]/10 px-3.5 py-2 text-xs font-medium text-[#7C5F2A] transition-colors hover:bg-[#C6A567]/20 disabled:opacity-45 whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{pulseActive ? 'Diffusing Pulse...' : 'Test Mist Pulse'}</span>
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-[#1C1917]">
                  <Gauge className="h-4 w-4 text-[#B5924C]" />
                  Mist Concentration
                </span>
                <span className="font-mono-tabular font-semibold text-[#1C1917]">
                  {device.intensityPercent}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={device.intensityPercent}
                onChange={(e) =>
                  onUpdateDevice({
                    ...device,
                    intensityPercent: Number(e.target.value),
                    lastSyncedAt: 'Synced just now',
                  })
                }
                aria-label="Mist Concentration Percentage"
                className="mt-3 h-2 w-full cursor-pointer accent-[#B5924C]"
              />
              <div className="mt-1.5 flex justify-between text-xs text-[#78716C]">
                <span>Subtle (10%)</span>
                <span>Balanced (50%)</span>
                <span>Maximum (100%)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-[#F0ECE3] pt-5 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E7E2D8] bg-[#FAF9F6] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#57534E]">Work Time</span>
                  <span className="font-mono-tabular text-lg font-semibold text-[#1C1917]">
                    {device.workSeconds}s
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#78716C]">Active pump mist duration</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDevice({
                        ...device,
                        workSeconds: Math.max(5, device.workSeconds - 5),
                        lastSyncedAt: 'Synced just now',
                      })
                    }
                    className="min-h-[44px] flex-1 rounded-lg border border-[#E7E2D8] bg-white text-sm font-medium text-[#1C1917] hover:bg-[#F5F2EC]"
                  >
                    -5s
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDevice({
                        ...device,
                        workSeconds: Math.min(300, device.workSeconds + 5),
                        lastSyncedAt: 'Synced just now',
                      })
                    }
                    className="min-h-[44px] flex-1 rounded-lg border border-[#E7E2D8] bg-white text-sm font-medium text-[#1C1917] hover:bg-[#F5F2EC]"
                  >
                    +5s
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#E7E2D8] bg-[#FAF9F6] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#57534E]">Pause Time</span>
                  <span className="font-mono-tabular text-lg font-semibold text-[#1C1917]">
                    {device.pauseSeconds}s
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#78716C]">Rest interval between bursts</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDevice({
                        ...device,
                        pauseSeconds: Math.max(10, device.pauseSeconds - 10),
                        lastSyncedAt: 'Synced just now',
                      })
                    }
                    className="min-h-[44px] flex-1 rounded-lg border border-[#E7E2D8] bg-white text-sm font-medium text-[#1C1917] hover:bg-[#F5F2EC]"
                  >
                    -10s
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateDevice({
                        ...device,
                        pauseSeconds: Math.min(900, device.pauseSeconds + 10),
                        lastSyncedAt: 'Synced just now',
                      })
                    }
                    className="min-h-[44px] flex-1 rounded-lg border border-[#E7E2D8] bg-white text-sm font-medium text-[#1C1917] hover:bg-[#F5F2EC]"
                  >
                    +10s
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#F0ECE3] pt-4 text-xs text-[#57534E]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#B5924C]" />
                <span>
                  {device.schedules.filter((s) => s.enabled).length} of 5 weekly schedule events
                  active
                </span>
              </span>
              <button
                type="button"
                onClick={onOpenSchedule}
                className="min-h-[44px] rounded-lg px-3 py-2 font-medium text-[#7C5F2A] hover:bg-[#FAF9F6] whitespace-nowrap shrink-0"
              >
                Edit Weekly Schedule
              </button>
            </div>
          </div>
        </section>
      </div>

      <IntensityHistoryChart device={device} />
    </div>
  );
};
