import React, {useState} from 'react';
import {Bluetooth, Plus, QrCode, X} from 'lucide-react';
import {
  ALL_DAYS,
  FORM_FACTOR_IMAGES,
  WIKKA_FRAGRANCE_CATALOG,
} from '../data/defaultDevices';
import {isWebBluetoothSupported, scanAndConnectBleDevice} from '../services/bleController';
import {DiffuserDevice, DiffuserFormFactor} from '../types/diffuser';

interface ScanBluetoothModalProps {
  onAddDevice: (device: DiffuserDevice) => void;
  onClose: () => void;
}

export const ScanBluetoothModal: React.FC<ScanBluetoothModalProps> = ({
  onAddDevice,
  onClose,
}) => {
  const bleAvailable = isWebBluetoothSupported();
  const [scanning, setScanning] = useState(false);
  const [bleError, setBleError] = useState('');

  const [name, setName] = useState('Boutique Reception A360');
  const [serialNumber, setSerialNumber] = useState(
    `WK-A360-${Math.floor(10000 + Math.random() * 89999)}`,
  );
  const [locationRemark, setLocationRemark] = useState('Floor 1 · Lobby');
  const [fragranceName, setFragranceName] = useState(WIKKA_FRAGRANCE_CATALOG[0]);
  const [formFactor, setFormFactor] = useState<DiffuserFormFactor>('tower');
  const [bottleCapacityMl, setBottleCapacityMl] = useState<100 | 200 | 500 | 1000>(500);

  const buildNewDevice = (
    overrides: Partial<DiffuserDevice> & {id: string; name: string; serialNumber: string},
  ): DiffuserDevice => ({
    locationRemark: locationRemark.trim() || 'Commercial Zone',
    fragranceName,
    formFactor,
    imageUrl: FORM_FACTOR_IMAGES[formFactor],
    connectionType: 'simulated',
    connected: true,
    unlocked: true,
    pin: '8888',
    powerOn: true,
    fanOn: true,
    intensityPercent: 60,
    workSeconds: 25,
    pauseSeconds: 90,
    bottleCapacityMl,
    oilRemainingMl: bottleCapacityMl,
    consumptionRateMlPerHour: formFactor === 'hvac' ? 4.8 : formFactor === 'tower' ? 3.2 : 1.8,
    firmwareVersion: 'A360-BLE-2.4',
    pcbVersion: 'CH-PCB-4.1',
    lastSyncedAt: 'Paired just now',
    schedules: [
      {
        id: 1,
        enabled: true,
        startTime: '09:00',
        endTime: '21:00',
        days: [...ALL_DAYS],
        workSeconds: 25,
        pauseSeconds: 90,
        intensityLevel: 6,
      },
      {
        id: 2,
        enabled: false,
        startTime: '08:00',
        endTime: '12:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workSeconds: 20,
        pauseSeconds: 100,
        intensityLevel: 5,
      },
      {
        id: 3,
        enabled: false,
        startTime: '12:00',
        endTime: '18:00',
        days: ['Sat', 'Sun'],
        workSeconds: 25,
        pauseSeconds: 90,
        intensityLevel: 6,
      },
      {
        id: 4,
        enabled: false,
        startTime: '18:00',
        endTime: '22:00',
        days: ['Fri', 'Sat'],
        workSeconds: 30,
        pauseSeconds: 80,
        intensityLevel: 7,
      },
      {
        id: 5,
        enabled: false,
        startTime: '07:00',
        endTime: '09:00',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workSeconds: 15,
        pauseSeconds: 120,
        intensityLevel: 4,
      },
    ],
    ...overrides,
  });

  const handleBleScan = async () => {
    setScanning(true);
    setBleError('');
    try {
      const result = await scanAndConnectBleDevice();
      const newDevice = buildNewDevice({
        id: result.id,
        name: result.name,
        serialNumber: result.serialNumber,
        connectionType: 'bluetooth',
        connected: result.connected,
        lastSyncedAt: result.hasGattChannel
          ? 'GATT UART connected'
          : 'Bluetooth paired',
      });
      onAddDevice(newDevice);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to pair Bluetooth diffuser.';
      setBleError(message);
    } finally {
      setScanning(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serialNumber.trim()) return;
    const newDevice = buildNewDevice({
      id: `wikka-${Date.now()}`,
      name: name.trim(),
      serialNumber: serialNumber.trim().toUpperCase(),
      connectionType: 'simulated',
    });
    onAddDevice(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#E7E2D8] bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
              Pair Wikka Diffuser
            </h2>
            <p className="mt-1 text-sm text-[#78716C]">
              Connect directly via Web Bluetooth or register a unit by serial code.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pairing modal"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#78716C] hover:bg-[#F5F2EC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-[#E7E2D8] bg-[#FAF9F6] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1C1917]">
                Nearby Bluetooth Hardware
              </h3>
              <p className="mt-0.5 text-xs text-[#78716C]">
                {bleAvailable
                  ? 'Keep your diffuser plugged into wall power and stay within 3 meters.'
                  : 'Web Bluetooth requires Chrome on Android, macOS, or Windows over HTTPS.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBleScan}
              disabled={scanning}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#292524] disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Bluetooth className="h-4 w-4 text-[#C6A567]" />
              <span>{scanning ? 'Scanning...' : 'Scan Bluetooth'}</span>
            </button>
          </div>
          {bleError && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {bleError}
            </p>
          )}
        </div>

        <form onSubmit={handleManualAdd} className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#78716C]">
            <QrCode className="h-4 w-4 text-[#B5924C]" />
            <span>Or add a controller profile by serial number</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="unit-name" className="block text-xs font-medium text-[#44403C]">
                Device Name
              </label>
              <input
                id="unit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="unit-serial" className="block text-xs font-medium text-[#44403C]">
                Serial Number
              </label>
              <input
                id="unit-serial"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                className="font-mono-tabular mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="unit-location" className="block text-xs font-medium text-[#44403C]">
                Location Remark
              </label>
              <input
                id="unit-location"
                type="text"
                value={locationRemark}
                onChange={(e) => setLocationRemark(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="unit-fragrance" className="block text-xs font-medium text-[#44403C]">
                Wikka Fragrance Blend
              </label>
              <select
                id="unit-fragrance"
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
              <label htmlFor="unit-model" className="block text-xs font-medium text-[#44403C]">
                Diffuser Hardware Type
              </label>
              <select
                id="unit-model"
                value={formFactor}
                onChange={(e) => setFormFactor(e.target.value as DiffuserFormFactor)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
              >
                <option value="tower">Floor Tower (A360)</option>
                <option value="hvac">Commercial HVAC Unit</option>
                <option value="wall">Wall-Mounted Unit</option>
              </select>
            </div>

            <div>
              <label htmlFor="unit-bottle" className="block text-xs font-medium text-[#44403C]">
                Oil Bottle Capacity
              </label>
              <select
                id="unit-bottle"
                value={bottleCapacityMl}
                onChange={(e) =>
                  setBottleCapacityMl(Number(e.target.value) as 100 | 200 | 500 | 1000)
                }
                className="mt-1 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-sm text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
              >
                <option value={100}>100 ml Cartridge</option>
                <option value={200}>200 ml Cartridge</option>
                <option value={500}>500 ml Bottle</option>
                <option value={1000}>1000 ml HVAC Tank</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-lg border border-[#E7E2D8] px-4 py-2 text-sm font-medium text-[#44403C] hover:bg-[#F5F2EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#B5924C] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9E7C3B]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Diffuser</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
