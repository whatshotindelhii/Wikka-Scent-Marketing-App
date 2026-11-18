import React, {useState} from 'react';
import {Lock, X} from 'lucide-react';
import {DiffuserDevice} from '../types/diffuser';

interface PinModalProps {
  device: DiffuserDevice;
  onUnlock: (deviceId: string) => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({device, onUnlock, onClose}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === device.pin) {
      onUnlock(device.id);
    } else {
      setError('Incorrect device PIN. Factory default is 8888.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[#E7E2D8] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F2EC] text-[#B5924C]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                Unlock Diffuser
              </h3>
              <p className="text-xs text-[#78716C]">{device.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close PIN modal"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#78716C] hover:bg-[#F5F2EC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="diffuser-pin"
              className="block text-sm font-medium text-[#44403C]"
            >
              Bluetooth Device Password
            </label>
            <input
              id="diffuser-pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setError('');
              }}
              placeholder="Enter 4-digit PIN (default 8888)"
              autoFocus
              className="font-mono-tabular mt-1.5 min-h-[44px] w-full rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-base tracking-widest text-[#1C1917] focus:border-[#B5924C] focus:outline-none"
            />
            {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
            <p className="mt-2 text-xs text-[#78716C]">
              Standard factory password for A360 / IAA360 diffusers is{' '}
              <span className="font-mono-tabular font-medium text-[#1C1917]">8888</span>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-lg border border-[#E7E2D8] px-4 py-2 text-sm font-medium text-[#44403C] hover:bg-[#F5F2EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-lg bg-[#1C1917] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#292524]"
            >
              Unlock Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
