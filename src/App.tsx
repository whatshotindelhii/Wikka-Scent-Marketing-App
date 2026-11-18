import React, {useEffect, useState} from 'react';
import {
  Bluetooth,
  CalendarClock,
  Globe,
  Layers,
  Plus,
  Settings,
  Sliders,
} from 'lucide-react';
import {ControlWorkspace} from './components/ControlWorkspace';
import {DeviceCard} from './components/DeviceCard';
import {DeviceSettings} from './components/DeviceSettings';
import {ExploreWebsiteView} from './components/ExploreWebsiteView';
import {OfflineIndicator} from './components/OfflineIndicator';
import {PinModal} from './components/PinModal';
import {PWAInstallButton} from './components/PWAInstallButton';
import {ScanBluetoothModal} from './components/ScanBluetoothModal';
import {ScheduleManager} from './components/ScheduleManager';
import {calculateConsumption, DEFAULT_DEVICES, isLowOilAlert} from './data/defaultDevices';
import {syncPowerToHardware} from './services/bleController';
import {DiffuserDevice} from './types/diffuser';

type ActiveTab = 'devices' | 'control' | 'schedule' | 'settings' | 'explore';

const STORAGE_KEY = 'wikka_scent_devices_v1';

export default function App() {
  const [devices, setDevices] = useState<DiffuserDevice[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DiffuserDevice[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to default devices
    }
    return DEFAULT_DEVICES;
  });

  const [selectedId, setSelectedId] = useState<string>(() => devices[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<ActiveTab>('control');
  const [showScanModal, setShowScanModal] = useState(false);
  const [pinTarget, setPinTarget] = useState<DiffuserDevice | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
    } catch {
      // Ignore storage quota errors
    }
  }, [devices]);

  const selectedDevice = devices.find((d) => d.id === selectedId) ?? devices[0];

  const handleUpdateDevice = (updated: DiffuserDevice) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    if (updated.connectionType === 'bluetooth') {
      void syncPowerToHardware(updated);
    }
  };

  const handleTogglePower = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const next = {...d, powerOn: !d.powerOn, lastSyncedAt: 'Synced just now'};
        if (next.connectionType === 'bluetooth') {
          void syncPowerToHardware(next);
        }
        return next;
      }),
    );
  };

  const handleToggleFan = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const next = {...d, fanOn: !d.fanOn, lastSyncedAt: 'Synced just now'};
        if (next.connectionType === 'bluetooth') {
          void syncPowerToHardware(next);
        }
        return next;
      }),
    );
  };

  const handleUnlock = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? {...d, unlocked: true, connected: true} : d)),
    );
    setSelectedId(deviceId);
    setPinTarget(null);
  };

  const handleAddDevice = (newDevice: DiffuserDevice) => {
    setDevices((prev) => [newDevice, ...prev]);
    setSelectedId(newDevice.id);
    setActiveTab('control');
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices((prev) => {
      const remaining = prev.filter((d) => d.id !== deviceId);
      if (remaining.length > 0 && selectedId === deviceId) {
        setSelectedId(remaining[0].id);
      }
      return remaining.length > 0 ? remaining : DEFAULT_DEVICES;
    });
    setActiveTab('devices');
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedId(deviceId);
    if (window.innerWidth < 1024) {
      setActiveTab('control');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20 text-[#1C1917] lg:pb-12">
      <header className="sticky top-0 z-30 border-b border-[#E7E2D8] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:h-16 lg:px-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('control');
            }}
            className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B5924C]"
          >
            {!logoError ? (
              <img
                src="/wikka-logo.png"
                alt="Wikka Scent Marketing"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="h-9 w-auto object-contain sm:h-10"
              />
            ) : null}
            <span className="font-display text-xl font-semibold tracking-tight text-[#1C1917] sm:text-2xl">
              Wikka Scent Marketing
            </span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 md:flex"
          >
            {(
              [
                {id: 'devices', label: 'Devices'},
                {id: 'control', label: 'Control'},
                {id: 'schedule', label: 'Schedule'},
                {id: 'settings', label: 'Settings'},
                {id: 'explore', label: 'Explore Website'},
              ] as Array<{id: ActiveTab; label: string}>
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[44px] border-b-2 px-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === item.id
                    ? 'border-[#B5924C] text-[#1C1917]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:block">
              <PWAInstallButton compact />
            </div>
            <button
              type="button"
              onClick={() => setShowScanModal(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#1C1917] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#292524] sm:px-4 sm:text-sm whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 text-[#C6A567]" />
              <span>Pair Unit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-[#E7E2D8] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              {activeTab === 'devices' && 'Connected Diffuser Fleet'}
              {activeTab === 'control' && 'Scent Diffusion Console'}
              {activeTab === 'schedule' && 'Automated Scent Schedules'}
              {activeTab === 'settings' && 'Unit Configuration & Security'}
              {activeTab === 'explore' && 'Explore Wikka Fragrances'}
            </h1>
            <p className="mt-1 text-sm text-[#57534E]">
              {devices.filter((d) => d.powerOn).length} of {devices.length} diffusers actively
              diffusing
              {(() => {
                const lowCount = devices.filter((d) =>
                  isLowOilAlert(calculateConsumption(d).oilPercent),
                ).length;
                return lowCount > 0
                  ? ` · ${lowCount} ${lowCount === 1 ? 'unit' : 'units'} below 15% oil`
                  : ' · All oil levels optimal';
              })()}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:hidden">
            <PWAInstallButton />
          </div>
        </div>

        {activeTab === 'explore' ? (
          <ExploreWebsiteView onBackToConsole={() => setActiveTab('control')} />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <aside
              className={`space-y-4 lg:col-span-4 ${
                activeTab === 'devices' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1C1917]">
                  Diffuser Units ({devices.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowScanModal(true)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[#7C5F2A] hover:bg-[#F5F2EC] whitespace-nowrap shrink-0"
                >
                  <Bluetooth className="h-3.5 w-3.5" />
                  <span>Scan BLE</span>
                </button>
              </div>

              <div className="space-y-4">
                {devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    selected={selectedDevice?.id === device.id}
                    onSelect={handleSelectDevice}
                    onTogglePower={handleTogglePower}
                    onToggleFan={handleToggleFan}
                    onRequestUnlock={(d) => setPinTarget(d)}
                  />
                ))}
              </div>
            </aside>

            <section
              className={`lg:col-span-8 ${
                activeTab === 'devices' ? 'hidden lg:block' : 'block'
              }`}
            >
              {selectedDevice && !selectedDevice.unlocked ? (
                <div className="rounded-2xl border border-[#E7E2D8] bg-white p-8 text-center">
                  <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                    {selectedDevice.name} is PIN Protected
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[#57534E]">
                    Enter the Bluetooth device password (factory default 8888) to inspect oil
                    levels, adjust duty cycles, or update weekly schedules.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPinTarget(selectedDevice)}
                    className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#1C1917] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#292524]"
                  >
                    Enter Device PIN
                  </button>
                </div>
              ) : selectedDevice ? (
                <>
                  {(activeTab === 'control' || activeTab === 'devices') && (
                    <ControlWorkspace
                      device={selectedDevice}
                      onUpdateDevice={handleUpdateDevice}
                      onOpenSchedule={() => setActiveTab('schedule')}
                    />
                  )}
                  {activeTab === 'schedule' && (
                    <ScheduleManager
                      device={selectedDevice}
                      onUpdateDevice={handleUpdateDevice}
                    />
                  )}
                  {activeTab === 'settings' && (
                    <DeviceSettings
                      key={selectedDevice.id}
                      device={selectedDevice}
                      canDelete={devices.length > 1}
                      onUpdateDevice={handleUpdateDevice}
                      onDeleteDevice={handleDeleteDevice}
                    />
                  )}
                </>
              ) : null}
            </section>
          </div>
        )}
      </main>

      <nav
        aria-label="Mobile bottom navigation"
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#E7E2D8] bg-white/95 backdrop-blur-md md:hidden"
      >
        <div className="pb-safe grid h-16 grid-cols-5 items-center">
          {(
            [
              {id: 'devices', label: 'Devices', Icon: Layers},
              {id: 'control', label: 'Control', Icon: Sliders},
              {id: 'schedule', label: 'Schedule', Icon: CalendarClock},
              {id: 'settings', label: 'Settings', Icon: Settings},
              {id: 'explore', label: 'Explore', Icon: Globe},
            ] as const
          ).map(({id, label, Icon}) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-[#B5924C]' : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium tracking-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <OfflineIndicator />

      {showScanModal && (
        <ScanBluetoothModal
          onAddDevice={handleAddDevice}
          onClose={() => setShowScanModal(false)}
        />
      )}

      {pinTarget && (
        <PinModal
          device={pinTarget}
          onUnlock={handleUnlock}
          onClose={() => setPinTarget(null)}
        />
      )}
    </div>
  );
}
