import React, {useState} from 'react';
import {AlertTriangle, Bluetooth, Droplets, Lock, Power, Wind} from 'lucide-react';
import {calculateConsumption, isLowOilAlert} from '../data/defaultDevices';
import {DiffuserDevice} from '../types/diffuser';

interface DeviceCardProps {
  device: DiffuserDevice;
  selected: boolean;
  onSelect: (deviceId: string) => void;
  onTogglePower: (deviceId: string) => void;
  onToggleFan: (deviceId: string) => void;
  onRequestUnlock: (device: DiffuserDevice) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  selected,
  onSelect,
  onTogglePower,
  onToggleFan,
  onRequestUnlock,
}) => {
  const [imgError, setImgError] = useState(false);
  const estimate = calculateConsumption(device);
  const lowOil = isLowOilAlert(estimate.oilPercent);

  const handleCardClick = () => {
    if (!device.unlocked) {
      onRequestUnlock(device);
    } else {
      onSelect(device.id);
    }
  };

  return (
    <article
      className={`group rounded-2xl border transition-colors ${
        selected
          ? 'border-[#B5924C] bg-white shadow-sm'
          : 'border-[#E7E2D8] bg-white hover:border-[#D4C7B0]'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={handleCardClick}
            className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E7E2D8] bg-[#F5F2EC] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5924C]"
          >
            {!imgError ? (
              <img
                src={device.imageUrl}
                alt={`${device.name} scent diffuser`}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F5F2EC] to-[#E7E2D8] p-2 text-center">
                <Droplets className="h-5 w-5 text-[#B5924C]" />
                <span className="mt-1 text-[10px] font-medium text-[#57534E]">
                  {device.formFactor.toUpperCase()}
                </span>
              </div>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={handleCardClick}
              className="w-full text-left focus-visible:outline-2 focus-visible:outline-[#B5924C]"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-display text-xl font-semibold text-[#1C1917]">
                  {device.name}
                </h3>
                {!device.unlocked && (
                  <Lock className="h-4 w-4 shrink-0 text-[#78716C]" aria-label="PIN Locked" />
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-[#78716C]">
                {device.locationRemark}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#57534E]">
                <span className="inline-flex items-center gap-1 font-medium text-[#1C1917]">
                  <Bluetooth className="h-3.5 w-3.5 text-[#B5924C]" />
                  {device.connected ? 'Paired' : 'Standby'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{device.fragranceName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{device.serialNumber}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-[#F0ECE3] pt-3.5">
          {lowOil && (
            <div
              role="status"
              className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800"
            >
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-600" />
                <span>Low Oil Alert · Below 15%</span>
              </span>
              <span className="font-mono-tabular font-semibold">{estimate.oilPercent}%</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-[#57534E]">
            <span>
              Oil Level:{' '}
              <strong
                className={`font-mono-tabular ${
                  lowOil ? 'text-red-700' : 'text-[#1C1917]'
                }`}
              >
                {estimate.oilPercent}%
              </strong>{' '}
              <span className="font-mono-tabular text-[#78716C]">
                ({device.oilRemainingMl}/{device.bottleCapacityMl} ml)
              </span>
            </span>
            <span className="font-mono-tabular text-[#78716C]">
              Work {device.workSeconds}s · Pause {device.pauseSeconds}s
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EFECE4]">
            <div
              className={`h-full transition-all ${
                lowOil ? 'bg-red-600' : estimate.oilPercent <= 25 ? 'bg-amber-600' : 'bg-[#B5924C]'
              }`}
              style={{width: `${estimate.oilPercent}%`}}
            />
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleCardClick}
              className="min-h-[44px] rounded-lg px-3 py-2 text-xs font-medium text-[#7C5F2A] hover:bg-[#FAF9F6] whitespace-nowrap shrink-0"
            >
              {device.unlocked ? (selected ? 'Active Console' : 'Open Console') : 'Unlock with PIN'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  device.unlocked ? onToggleFan(device.id) : onRequestUnlock(device)
                }
                aria-label={`Toggle fan for ${device.name}`}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  device.fanOn && device.powerOn
                    ? 'border-[#C6A567] bg-[#C6A567]/12 text-[#7C5F2A]'
                    : 'border-[#E7E2D8] bg-white text-[#57534E] hover:bg-[#FAF9F6]'
                }`}
              >
                <Wind className="h-3.5 w-3.5" />
                <span>{device.fanOn ? 'Fan On' : 'Fan Off'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  device.unlocked ? onTogglePower(device.id) : onRequestUnlock(device)
                }
                aria-label={`Toggle power for ${device.name}`}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  device.powerOn
                    ? 'bg-[#1C1917] text-white hover:bg-[#292524]'
                    : 'border border-[#E7E2D8] bg-[#FAF9F6] text-[#57534E] hover:bg-[#EFECE4]'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{device.powerOn ? 'Running' : 'Off'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
