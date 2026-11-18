import {DiffuserDevice, ScheduleEvent} from '../types/diffuser';

interface WebBluetoothCharacteristic {
  writeValue: (value: BufferSource) => Promise<void>;
  writeValueWithoutResponse?: (value: BufferSource) => Promise<void>;
}

interface WebBluetoothService {
  getCharacteristic: (uuid: string) => Promise<WebBluetoothCharacteristic>;
  getCharacteristics: () => Promise<WebBluetoothCharacteristic[]>;
}

interface WebBluetoothRemoteGATTServer {
  connected: boolean;
  connect: () => Promise<WebBluetoothRemoteGATTServer>;
  disconnect: () => void;
  getPrimaryService: (uuid: string) => Promise<WebBluetoothService>;
  getPrimaryServices: () => Promise<WebBluetoothService[]>;
}

interface WebBluetoothDevice {
  id: string;
  name?: string;
  gatt?: WebBluetoothRemoteGATTServer;
}

interface NavigatorWithBluetooth extends Navigator {
  bluetooth?: {
    requestDevice: (options: {
      acceptAllDevices?: boolean;
      filters?: Array<{namePrefix?: string; services?: string[]}>;
      optionalServices?: string[];
    }) => Promise<WebBluetoothDevice>;
  };
}

// Common UART / GATT service UUIDs used by IAA360 / ChengHao / Aroma-Link BLE modules
const BLE_SERVICE_UUIDS = [
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000fff0-0000-1000-8000-00805f9b34fb',
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  '0000ae00-0000-1000-8000-00805f9b34fb',
];

const activeGattSessions = new Map<string, WebBluetoothCharacteristic>();

export function isWebBluetoothSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  return Boolean((navigator as NavigatorWithBluetooth).bluetooth);
}

export interface BleScanResult {
  id: string;
  name: string;
  serialNumber: string;
  connected: boolean;
  hasGattChannel: boolean;
}

export async function scanAndConnectBleDevice(): Promise<BleScanResult> {
  const nav = navigator as NavigatorWithBluetooth;
  if (!nav.bluetooth) {
    throw new Error(
      'Web Bluetooth is not supported in this browser. Use Chrome on Android/Desktop over HTTPS or add a unit by serial number.',
    );
  }

  const device = await nav.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: BLE_SERVICE_UUIDS,
  });

  let writeChar: WebBluetoothCharacteristic | null = null;
  if (device.gatt) {
    const server = await device.gatt.connect();
    for (const serviceUuid of BLE_SERVICE_UUIDS) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const chars = await service.getCharacteristics();
        if (chars.length > 0) {
          writeChar = chars[0];
          break;
        }
      } catch {
        // Try next known BLE diffuser service UUID
      }
    }
  }

  const deviceId = `ble-${device.id}`;
  if (writeChar) {
    activeGattSessions.set(deviceId, writeChar);
  }

  const cleanName = device.name?.trim() || 'Wikka BLE Diffuser';
  const serialSuffix = device.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'A36001';

  return {
    id: deviceId,
    name: cleanName,
    serialNumber: `WK-${serialSuffix}`,
    connected: true,
    hasGattChannel: Boolean(writeChar),
  };
}

export async function sendBleCommandFrame(
  deviceId: string,
  payloadBytes: number[],
): Promise<boolean> {
  const char = activeGattSessions.get(deviceId);
  if (!char) {
    return false;
  }
  const buffer = new Uint8Array(payloadBytes);
  try {
    if (char.writeValueWithoutResponse) {
      await char.writeValueWithoutResponse(buffer);
    } else {
      await char.writeValue(buffer);
    }
    return true;
  } catch {
    return false;
  }
}

export async function syncPowerToHardware(device: DiffuserDevice): Promise<boolean> {
  // Standard scent diffuser packet: [header, cmd, power, fan, workSecHi, workSecLo, pauseSecHi, pauseSecLo, checksum]
  const pwr = device.powerOn ? 0x01 : 0x00;
  const fan = device.fanOn ? 0x01 : 0x00;
  const intensity = Math.max(1, Math.min(100, device.intensityPercent));
  const frame = [0xaa, 0x01, pwr, fan, intensity, device.workSeconds & 0xff, device.pauseSeconds & 0xff, 0x55];
  return sendBleCommandFrame(device.id, frame);
}

export async function syncScheduleToHardware(
  deviceId: string,
  event: ScheduleEvent,
): Promise<boolean> {
  const [sh, sm] = event.startTime.split(':').map(Number);
  const [eh, em] = event.endTime.split(':').map(Number);
  const dayMask = event.days.reduce((acc, day, idx) => acc | (1 << idx), 0);
  const frame = [
    0xaa,
    0x02,
    event.id & 0xff,
    event.enabled ? 0x01 : 0x00,
    sh & 0xff,
    sm & 0xff,
    eh & 0xff,
    em & 0xff,
    dayMask & 0x7f,
    event.workSeconds & 0xff,
    event.pauseSeconds & 0xff,
    0x55,
  ];
  return sendBleCommandFrame(deviceId, frame);
}
