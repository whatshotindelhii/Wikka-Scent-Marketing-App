import React, {useState} from 'react';
import {Check, Cpu, KeyRound, Smartphone, Trash2} from 'lucide-react';
import {WIKKA_FRAGRANCE_CATALOG} from '../data/defaultDevices';
import {DiffuserDevice} from '../types/diffuser';
import {PWAInstallButton} from './PWAInstallButton';

interface DeviceSettingsProps {
  device: DiffuserDevice;
  canDelete: boolean;
  onUpdateDevice: (updated: DiffuserDevice) => void;
  onDeleteDevice: (deviceId: string) => void;
}

export const DeviceSettings: React.FC<DeviceSettingsProps> = ({
  device,
  canDelete,
  onUpdateDevice,
  onDeleteDevice,
}) => {
  const [name, setName] = useState(device.name);
  const [locationRemark, setLocationRemark] = useState(device.locationRemark);
  const [fragranceName, setFragranceName] = useState(device.fragranceName);
  const [bottleCapacityMl, setBottleCapacityMl] = useState<100 | 200 | 500 | 1000>(
    device.bottleCapacityMl,
  );
  const [oilRemainingMl, setOilRemainingMl] = useState(device.oilRemainingMl);
  const [consumptionRate, setConsumptionRate] = useState(device.consumptionRateMlPerHour);
  const [savedNotice, setSavedNotice] = useState(false);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinStatus, setPinStatus] = useState<{type: 'ok' | 'err'; text: string} | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDevice({
      ...device,
      name: name.trim() || device.name,
      locationRemark: locationRemark.trim(),
      fragranceName,
      bottleCapacityMl,
      oilRemainingMl: Math.max(0, Math.min(oilRemainingMl, bottleCapacityMl)),
      consumptionRateMlPerHour: consumptionRate,
      lastSyncedAt: 'Settings saved just now',
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2000);
  };

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPin !== device.pin) {
      setPinStatus({type: 'err', text: 'Current PIN does not match device password.'});
      return;
    }
    if (!/^\d{4,8}$/.test(newPin)) {
      setPinStatus({type: 'err', text: 'New PIN must be 4 to 8 numeric digits.'});
      return;
    }
    onUpdateDevice({
      ...device,
      pin: newPin,
      lastSyncedAt: 'Device PIN updated',
    });
    setCurrentPin('');
    setNewPin('');
    setPinStatus({type: 'ok', text: 'Bluetooth device password updated.'});
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6 lg:col-span-7">
          <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
            Device Profile & Calibration
          </h2>
          <p className="mt-1 text-sm text-[#78716C]">
            Rename units, update room remarks, and calibrate oil consumption.
          </p>

          <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="set-name" className="block text-xs font-medium text-[#44403C]">
                  Device Name
                </label>
                <input
                  id="set-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="set-remark" className="block text-xs font-medium text-[#44403C]">
                  Location Remark
                </label>
                <input
                  id="set-remark"
                  type="text"
                  value={locationRemark}
                  onChange={(e) => setLocationRemark(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="set-scent" className="block text-xs font-medium text-[#44403C]">
                  Active Wikka Fragrance
                </label>
                <select
                  id="set-scent"
                  value={fragranceName}
                  onChange={(e) => setFragranceName(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                >
                  {WIKKA_FRAGRANCE_CATALOG.map((scent) => (
                    <option key={scent} value={scent}>
                      {scent}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="set-bottle" className="block text-xs font-medium text-[#44403C]">
                  Bottle Capacity
                </label>
                <select
                  id="set-bottle"
                  value={bottleCapacityMl}
                  onChange={(e) =>
                    setBottleCapacityMl(Number(e.target.value) as 100 | 200 | 500 | 1000)
                  }
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                >
                  <option value={100}>100 ml</option>
                  <option value={200}>200 ml</option>
                  <option value={500}>500 ml</option>
                  <option value={1000}>1000 ml</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="set-oil" className="block text-xs font-medium text-[#44403C]">
                  Remaining Oil (ml)
                </label>
                <input
                  id="set-oil"
                  type="number"
                  min={0}
                  max={bottleCapacityMl}
                  value={oilRemainingMl}
                  onChange={(e) =>
                    setOilRemainingMl(
                      Math.max(0, Math.min(bottleCapacityMl, Number(e.target.value) || 0)),
                    )
                  }
                  className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="set-rate" className="block text-xs font-medium text-[#44403C]">
                  Atomization Calibration (ml/hour)
                </label>
                <input
                  id="set-rate"
                  type="number"
                  step="0.1"
                  min={0.5}
                  max={12}
                  value={consumptionRate}
                  onChange={(e) => setConsumptionRate(Number(e.target.value) || 2.5)}
                  className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {canDelete ? (
                <button
                  type="button"
                  onClick={() => onDeleteDevice(device.id)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Unpair Device</span>
                </button>
              ) : (
                <span className="text-xs text-[#78716C]">Primary fleet unit</span>
              )}

              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#1C1917] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#292524]"
              >
                {savedNotice && <Check className="h-4 w-4 text-[#C6A567]" />}
                <span>{savedNotice ? 'Changes Saved' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </section>

        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <KeyRound className="h-5 w-5 text-[#B5924C]" />
              <h3 className="text-base font-semibold text-[#1C1917]">Device Password (PIN)</h3>
            </div>
            <p className="mt-1 text-xs text-[#78716C]">
              Change the pairing password (default factory code is 8888).
            </p>

            <form onSubmit={handlePinChange} className="mt-4 space-y-3">
              <div>
                <label htmlFor="old-pin" className="block text-xs font-medium text-[#44403C]">
                  Current PIN
                </label>
                <input
                  id="old-pin"
                  type="password"
                  inputMode="numeric"
                  value={currentPin}
                  onChange={(e) => {
                    setCurrentPin(e.target.value);
                    setPinStatus(null);
                  }}
                  placeholder="8888"
                  className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-pin" className="block text-xs font-medium text-[#44403C]">
                  New PIN (4–8 digits)
                </label>
                <input
                  id="new-pin"
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value);
                    setPinStatus(null);
                  }}
                  placeholder="Enter new PIN"
                  className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
                />
              </div>

              {pinStatus && (
                <p
                  className={`text-xs font-medium ${
                    pinStatus.type === 'ok' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {pinStatus.text}
                </p>
              )}

              <button
                type="submit"
                className="min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#EFECE4]"
              >
                Update Password
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-[#B5924C]" />
              <h3 className="text-base font-semibold text-[#1C1917]">Hardware Diagnostics</h3>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between border-b border-[#F0ECE3] pb-2">
                <dt className="text-[#78716C]">Serial Number</dt>
                <dd className="font-mono-tabular font-medium text-[#1C1917]">
                  {device.serialNumber}
                </dd>
              </div>
              <div className="flex justify-between border-b border-[#F0ECE3] pb-2">
                <dt className="text-[#78716C]">Firmware Build</dt>
                <dd className="font-mono-tabular font-medium text-[#1C1917]">
                  {device.firmwareVersion}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#78716C]">PC Board Revision</dt>
                <dd className="font-mono-tabular font-medium text-[#1C1917]">
                  {device.pcbVersion}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <Smartphone className="h-5 w-5 text-[#B5924C]" />
              <h3 className="text-base font-semibold text-[#1C1917]">
                Mobile Home Screen & App Install
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
              Wikka Scent Marketing is configured as an installable Progressive Web App with
              Web Bluetooth diffuser control. Install it directly to your Android or iPhone home
              screen for full-screen standalone launch.
            </p>
            <div className="mt-4">
              <PWAInstallButton />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
