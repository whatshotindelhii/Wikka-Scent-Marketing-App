import React, {useState} from 'react';
import {Download, Share, X} from 'lucide-react';
import {usePWAInstall} from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{compact?: boolean}> = ({compact = false}) => {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#C6A567] bg-[#C6A567]/10 px-4 py-2 text-sm font-medium text-[#7C5F2A] transition-colors hover:bg-[#C6A567]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5924C] whitespace-nowrap shrink-0"
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>{compact ? 'Install' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E7E2D8] bg-white px-4 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F5F2EC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5924C] whitespace-nowrap shrink-0"
        >
          <Download className="h-4 w-4 shrink-0 text-[#B5924C]" />
          <span>{compact ? 'Install' : 'Install App'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-[#E7E2D8] bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                  Install Wikka Scent Marketing
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#78716C] hover:bg-[#F5F2EC]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-[#44403C]">
                <li className="flex items-center gap-2">
                  <span className="font-mono-tabular font-medium text-[#B5924C]">01.</span>
                  <span>
                    Tap the <Share className="inline h-4 w-4 text-[#1C1917]" />{' '}
                    <strong>Share</strong> button in Safari.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono-tabular font-medium text-[#B5924C]">02.</span>
                  <span>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 min-h-[44px] w-full rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#292524]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
