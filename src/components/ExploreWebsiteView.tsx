import React, {useState} from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface ExploreWebsiteViewProps {
  onBackToConsole: () => void;
}

const WIKKA_URL = 'https://wikkafragrances.com/';

const QUICK_DESTINATIONS = [
  {
    title: 'Wikka Home & Collections',
    description: 'Browse signature essential oils, diffusers, and commercial scenting lines.',
    href: 'https://wikkafragrances.com/',
  },
  {
    title: 'All Fragrance Products',
    description: 'Explore complete catalog of fragrance blends and room diffusion cartridges.',
    href: 'https://wikkafragrances.com/collections/all',
  },
  {
    title: 'Contact & B2B Inquiries',
    description: 'Connect with Wikka Fragrance Solutions for commercial installations.',
    href: 'https://wikkafragrances.com/pages/contact',
  },
];

export const ExploreWebsiteView: React.FC<ExploreWebsiteViewProps> = ({
  onBackToConsole,
}) => {
  const [frameKey, setFrameKey] = useState(0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#E7E2D8] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToConsole}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#EFECE4] whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Console</span>
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E7E2D8] bg-[#FAF9F6] px-3 py-2 text-xs text-[#57534E]">
              <Globe className="h-4 w-4 shrink-0 text-[#B5924C]" />
              <span className="font-mono-tabular truncate">{WIKKA_URL}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setFrameKey((prev) => prev + 1)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#E7E2D8] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#FAF9F6] whitespace-nowrap shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload View</span>
            </button>

            <a
              href={WIKKA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#292524] whitespace-nowrap shrink-0"
            >
              <span>Open in Browser</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#C6A567]" />
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-950 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <span>
              <strong>In-App Website Notice:</strong>{' '}
              <span className="font-mono-tabular">wikkafragrances.com</span> enforces{' '}
              <span className="font-mono-tabular">X-Frame-Options: DENY</span> in standard
              browsers. If the embedded view below is blocked by your browser, use{' '}
              <strong>Open in Browser</strong> or any quick link below.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {QUICK_DESTINATIONS.map((dest) => (
          <a
            key={dest.href}
            href={dest.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-2xl border border-[#E7E2D8] bg-white p-5 transition-colors hover:border-[#B5924C]"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <Sparkles className="h-4 w-4 text-[#B5924C]" />
                <ExternalLink className="h-4 w-4 text-[#78716C] transition-colors group-hover:text-[#1C1917]" />
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-[#1C1917]">
                {dest.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                {dest.description}
              </p>
            </div>
            <span className="mt-4 text-xs font-medium text-[#7C5F2A]">
              Visit Storefront
            </span>
          </a>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E7E2D8] bg-white">
        <div className="flex items-center justify-between border-b border-[#E7E2D8] bg-[#FAF9F6] px-4 py-2.5 text-xs text-[#57534E]">
          <span>Embedded In-App Website View · Wikka Fragrance Solutions</span>
          <a
            href={WIKKA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#7C5F2A] hover:underline"
          >
            <span>Launch Direct</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="relative h-[62vh] min-h-[420px] w-full bg-[#FAF9F6]">
          <iframe
            key={frameKey}
            src={WIKKA_URL}
            title="Wikka Fragrances Official Website"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
    </div>
  );
};
