import React, {useMemo, useState} from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {TrendingDown} from 'lucide-react';
import {ALL_DAYS} from '../data/defaultDevices';
import {DayOfWeek, DiffuserDevice} from '../types/diffuser';

type TimeRange = '24h' | '7d' | '30d';

interface UsageDataPoint {
  label: string;
  intensityPercent: number;
  oilMl: number;
  activeMinutes: number;
}

interface IntensityHistoryChartProps {
  device: DiffuserDevice;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 100000;
  }
  return hash;
}

function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function buildUsageSeries(device: DiffuserDevice, range: TimeRange): UsageDataPoint[] {
  const seed = hashSeed(device.id);
  const enabledSchedules = device.schedules.filter((s) => s.enabled && s.days.length > 0);

  if (range === '24h') {
    const points: UsageDataPoint[] = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const hourMin = hour * 60 + 30;
      let matchedIntensity = 0;
      let dutyRatio = 0;

      for (const ev of enabledSchedules) {
        const start = parseMinutes(ev.startTime);
        let end = parseMinutes(ev.endTime);
        if (end <= start) end += 24 * 60;
        const normalizedHour = hourMin < start && end > 24 * 60 ? hourMin + 24 * 60 : hourMin;
        if (normalizedHour >= start && normalizedHour <= end) {
          const evIntensity = ev.intensityLevel * 10;
          if (evIntensity > matchedIntensity) {
            matchedIntensity = evIntensity;
            dutyRatio = ev.workSeconds / Math.max(1, ev.workSeconds + ev.pauseSeconds);
          }
        }
      }

      if (enabledSchedules.length === 0 && device.powerOn) {
        matchedIntensity = hour >= 8 && hour <= 20 ? device.intensityPercent : 0;
        dutyRatio = device.workSeconds / Math.max(1, device.workSeconds + device.pauseSeconds);
      }

      // Apply subtle real-world variance around active hours
      const jitter = matchedIntensity > 0 ? ((seed + hour * 7) % 9) - 4 : 0;
      const effectiveIntensity = Math.max(
        0,
        Math.min(100, matchedIntensity > 0 ? Math.round((matchedIntensity + device.intensityPercent) / 2 + jitter) : 0),
      );
      const oilMl = Number(
        (device.consumptionRateMlPerHour * dutyRatio * (effectiveIntensity / 100)).toFixed(2),
      );
      const activeMinutes = matchedIntensity > 0 ? Math.round(60 * dutyRatio) : 0;

      points.push({
        label: `${String(hour).padStart(2, '0')}:00`,
        intensityPercent: effectiveIntensity,
        oilMl,
        activeMinutes,
      });
    }
    return points;
  }

  const totalDays = range === '7d' ? 7 : 30;
  const points: UsageDataPoint[] = [];
  const today = new Date();

  for (let i = totalDays - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const jsDay = date.getDay(); // 0=Sun..6=Sat
    const mappedDay: DayOfWeek = ALL_DAYS[jsDay === 0 ? 6 : jsDay - 1];

    const matchingEvents = enabledSchedules.filter((ev) => ev.days.includes(mappedDay));

    let totalHours = 0;
    let weightedIntensitySum = 0;
    let totalOilMl = 0;

    for (const ev of matchingEvents) {
      const start = parseMinutes(ev.startTime);
      let end = parseMinutes(ev.endTime);
      if (end <= start) end += 24 * 60;
      const hours = (end - start) / 60;
      const duty = ev.workSeconds / Math.max(1, ev.workSeconds + ev.pauseSeconds);
      const evIntensity = ev.intensityLevel * 10;
      totalHours += hours;
      weightedIntensitySum += hours * evIntensity;
      totalOilMl += hours * device.consumptionRateMlPerHour * duty * (evIntensity / 100);
    }

    if (enabledSchedules.length === 0 && device.powerOn) {
      totalHours = 8;
      weightedIntensitySum = 8 * device.intensityPercent;
      const duty = device.workSeconds / Math.max(1, device.workSeconds + device.pauseSeconds);
      totalOilMl = 8 * device.consumptionRateMlPerHour * duty * (device.intensityPercent / 100);
    }

    const baseIntensity = totalHours > 0 ? weightedIntensitySum / totalHours : 0;
    const wave = ((seed + i * 13) % 15) - 7;
    const avgIntensity =
      baseIntensity > 0
        ? Math.max(15, Math.min(100, Math.round(baseIntensity * 0.65 + device.intensityPercent * 0.35 + wave)))
        : 0;
    const scaleFactor = baseIntensity > 0 ? avgIntensity / baseIntensity : 1;
    const oilMl = Number((totalOilMl * scaleFactor).toFixed(1));

    const label =
      range === '7d'
        ? mappedDay
        : date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});

    points.push({
      label,
      intensityPercent: avgIntensity,
      oilMl,
      activeMinutes: Math.round(totalHours * 60),
    });
  }

  return points;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    payload: UsageDataPoint;
  }>;
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({active, payload, label}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-[#E7E2D8] bg-white px-3.5 py-2.5 text-xs shadow-md">
      <p className="font-medium text-[#1C1917]">{label}</p>
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#78716C]">Scent Intensity</span>
          <span className="font-mono-tabular font-semibold text-[#7C5F2A]">
            {point.intensityPercent}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#78716C]">Oil Consumed</span>
          <span className="font-mono-tabular font-semibold text-[#1C1917]">
            {point.oilMl} ml
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#78716C]">Active Window</span>
          <span className="font-mono-tabular text-[#57534E]">
            {point.activeMinutes >= 60
              ? `${(point.activeMinutes / 60).toFixed(1)} hrs`
              : `${point.activeMinutes} min`}
          </span>
        </div>
      </div>
    </div>
  );
};

export const IntensityHistoryChart: React.FC<IntensityHistoryChartProps> = ({device}) => {
  const [range, setRange] = useState<TimeRange>('7d');

  const data = useMemo(() => buildUsageSeries(device, range), [device, range]);

  const summary = useMemo(() => {
    const activePoints = data.filter((d) => d.intensityPercent > 0);
    const avgIntensity =
      activePoints.length > 0
        ? Math.round(
            activePoints.reduce((sum, d) => sum + d.intensityPercent, 0) / activePoints.length,
          )
        : 0;
    const totalOil = Number(data.reduce((sum, d) => sum + d.oilMl, 0).toFixed(1));
    const peakPoint = data.reduce(
      (best, cur) => (cur.intensityPercent > best.intensityPercent ? cur : best),
      data[0] ?? {label: '-', intensityPercent: 0, oilMl: 0, activeMinutes: 0},
    );

    const savingsTip =
      avgIntensity >= 70
        ? `Peak output reaches ${peakPoint.intensityPercent}% (${peakPoint.label}). Extending pause intervals by 15s during off-peak hours can save ~18% oil.`
        : device.oilRemainingMl / device.bottleCapacityMl <= 0.25
          ? `Cartridge is below 25%. Lowering evening intensity by 10% extends your refill window.`
          : `Diffusion curve is balanced at ${avgIntensity}% average intensity with steady cartridge longevity.`;

    return {avgIntensity, totalOil, peakPoint, savingsTip};
  }, [data]);

  return (
    <section className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1C1917]">
            Historical Intensity & Consumption Patterns
          </h3>
          <p className="mt-0.5 text-xs text-[#78716C]">
            Track mist concentration alongside oil draw to optimize cartridge longevity.
          </p>
        </div>

        <div
          role="group"
          aria-label="Chart timeframe"
          className="inline-flex items-center gap-1 self-start rounded-lg bg-[#F5F2EC] p-1"
        >
          {(
            [
              {id: '24h', label: '24 Hours'},
              {id: '7d', label: '7 Days'},
              {id: '30d', label: '30 Days'},
            ] as Array<{id: TimeRange; label: string}>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRange(tab.id)}
              className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                range === tab.id
                  ? 'bg-white text-[#1C1917] shadow-sm'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-y border-[#F0ECE3] py-3.5 text-xs">
        <div>
          <span className="text-[#78716C]">Avg. Intensity</span>
          <p className="font-mono-tabular mt-0.5 text-base font-semibold text-[#1C1917]">
            {summary.avgIntensity}%
          </p>
        </div>
        <div>
          <span className="text-[#78716C]">
            {range === '24h' ? '24h Oil Draw' : range === '7d' ? '7-Day Total' : '30-Day Total'}
          </span>
          <p className="font-mono-tabular mt-0.5 text-base font-semibold text-[#1C1917]">
            {summary.totalOil} ml
          </p>
        </div>
        <div>
          <span className="text-[#78716C]">Peak Period</span>
          <p className="font-mono-tabular mt-0.5 text-base font-semibold text-[#7C5F2A]">
            {summary.peakPoint.label} · {summary.peakPoint.intensityPercent}%
          </p>
        </div>
      </div>

      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{top: 8, right: 8, left: -16, bottom: 0}}>
            <defs>
              <linearGradient id="wikkaIntensityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C6A567" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#C6A567" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{fill: '#78716C', fontSize: 11}}
              axisLine={{stroke: '#E7E2D8'}}
              tickLine={false}
              minTickGap={16}
            />
            <YAxis
              yAxisId="intensity"
              domain={[0, 100]}
              tick={{fill: '#78716C', fontSize: 11}}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="oil"
              orientation="right"
              tick={{fill: '#78716C', fontSize: 11}}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}ml`}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Bar
              yAxisId="oil"
              dataKey="oilMl"
              name="Oil Consumed (ml)"
              fill="#1C1917"
              fillOpacity={0.14}
              radius={[4, 4, 0, 0]}
              barSize={range === '30d' ? 8 : 16}
            />
            <Area
              yAxisId="intensity"
              type="monotone"
              dataKey="intensityPercent"
              name="Scent Intensity (%)"
              stroke="#B5924C"
              strokeWidth={2}
              fill="url(#wikkaIntensityFill)"
              activeDot={{r: 5, fill: '#B5924C', stroke: '#FFFFFF', strokeWidth: 2}}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[#F0ECE3] pt-3.5 text-xs text-[#57534E] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-[#B5924C]" />
          <span>{summary.savingsTip}</span>
        </div>
        <div className="flex items-center gap-4 whitespace-nowrap shrink-0 text-[#78716C]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-xs bg-[#B5924C]" />
            Intensity (%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-xs bg-[#1C1917]/20" />
            Oil Used (ml)
          </span>
        </div>
      </div>
    </section>
  );
};
