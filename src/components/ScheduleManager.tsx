import React from 'react';
import {CalendarClock, Check} from 'lucide-react';
import {ALL_DAYS, calculateConsumption} from '../data/defaultDevices';
import {syncScheduleToHardware} from '../services/bleController';
import {DayOfWeek, DiffuserDevice, ScheduleEvent} from '../types/diffuser';

interface ScheduleManagerProps {
  device: DiffuserDevice;
  onUpdateDevice: (updated: DiffuserDevice) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  device,
  onUpdateDevice,
}) => {
  const estimate = calculateConsumption(device);

  const updateEvent = (eventId: number, patch: Partial<ScheduleEvent>) => {
    const nextSchedules = device.schedules.map((ev) =>
      ev.id === eventId ? {...ev, ...patch} : ev,
    );
    const updatedEvent = nextSchedules.find((ev) => ev.id === eventId);
    if (updatedEvent && device.connectionType === 'bluetooth') {
      void syncScheduleToHardware(device.id, updatedEvent);
    }
    onUpdateDevice({
      ...device,
      schedules: nextSchedules,
      lastSyncedAt: 'Schedule synced just now',
    });
  };

  const toggleDay = (ev: ScheduleEvent, day: DayOfWeek) => {
    const exists = ev.days.includes(day);
    const nextDays = exists
      ? ev.days.filter((d) => d !== day)
      : ALL_DAYS.filter((d) => d === day || ev.days.includes(d));
    updateEvent(ev.id, {days: nextDays});
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
              Weekly Operating Schedule
            </h2>
            <p className="mt-1 text-sm text-[#78716C]">
              Configure up to 5 automated time periods for <strong>{device.name}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-4 border-t border-[#F0ECE3] pt-3 text-xs text-[#57534E] sm:border-t-0 sm:pt-0">
            <div>
              <span className="text-[#78716C]">Active Window: </span>
              <strong className="font-mono-tabular text-[#1C1917]">
                {estimate.dailyHoursActive} hrs/day
              </strong>
            </div>
            <span aria-hidden="true">·</span>
            <div>
              <span className="text-[#78716C]">Est. Oil Use: </span>
              <strong className="font-mono-tabular text-[#1C1917]">
                {estimate.dailyOilMl} ml/day
              </strong>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {device.schedules.map((ev) => (
          <section
            key={ev.id}
            className={`rounded-2xl border p-5 transition-colors ${
              ev.enabled
                ? 'border-[#C6A567]/60 bg-white'
                : 'border-[#E7E2D8] bg-[#FAF9F6]/70'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    ev.enabled
                      ? 'bg-[#C6A567]/15 text-[#7C5F2A]'
                      : 'bg-[#EFECE4] text-[#78716C]'
                  }`}
                >
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1C1917]">
                    Event {String(ev.id).padStart(2, '0')}
                  </h3>
                  <p className="font-mono-tabular text-xs text-[#78716C]">
                    {ev.startTime} – {ev.endTime} · Work {ev.workSeconds}s / Pause{' '}
                    {ev.pauseSeconds}s
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateEvent(ev.id, {enabled: !ev.enabled})}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  ev.enabled
                    ? 'bg-[#1C1917] text-white hover:bg-[#292524]'
                    : 'border border-[#E7E2D8] bg-white text-[#57534E] hover:bg-[#F5F2EC]'
                }`}
              >
                {ev.enabled && <Check className="h-4 w-4 text-[#C6A567]" />}
                <span>{ev.enabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#F0ECE3] pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor={`start-${ev.id}`}
                  className="block text-xs font-medium text-[#57534E]"
                >
                  Start Time
                </label>
                <input
                  id={`start-${ev.id}`}
                  type="time"
                  value={ev.startTime}
                  onChange={(e) => updateEvent(ev.id, {startTime: e.target.value})}
                  className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`end-${ev.id}`}
                  className="block text-xs font-medium text-[#57534E]"
                >
                  End Time
                </label>
                <input
                  id={`end-${ev.id}`}
                  type="time"
                  value={ev.endTime}
                  onChange={(e) => updateEvent(ev.id, {endTime: e.target.value})}
                  className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`work-${ev.id}`}
                  className="block text-xs font-medium text-[#57534E]"
                >
                  Work Time (5–300s)
                </label>
                <input
                  id={`work-${ev.id}`}
                  type="number"
                  min={5}
                  max={300}
                  value={ev.workSeconds}
                  onChange={(e) =>
                    updateEvent(ev.id, {
                      workSeconds: Math.max(5, Math.min(300, Number(e.target.value) || 5)),
                    })
                  }
                  className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`pause-${ev.id}`}
                  className="block text-xs font-medium text-[#57534E]"
                >
                  Pause Time (10–900s)
                </label>
                <input
                  id={`pause-${ev.id}`}
                  type="number"
                  min={10}
                  max={900}
                  value={ev.pauseSeconds}
                  onChange={(e) =>
                    updateEvent(ev.id, {
                      pauseSeconds: Math.max(10, Math.min(900, Number(e.target.value) || 10)),
                    })
                  }
                  className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <span className="block text-xs font-medium text-[#57534E]">Active Days</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const active = ev.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(ev, day)}
                      className={`min-h-[44px] min-w-[48px] rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? 'border-[#1C1917] bg-[#1C1917] text-white'
                          : 'border-[#E7E2D8] bg-white text-[#57534E] hover:bg-[#F5F2EC]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
