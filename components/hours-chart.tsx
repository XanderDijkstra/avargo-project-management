import type { HourEntry } from "@/lib/types";
import { formatHours, isoWeek } from "@/lib/utils";

const WEEKS_SHOWN = 12;

type Bar = {
  key: string;
  label: string;
  hours: number;
};

function buildWeeks(entries: HourEntry[]): Bar[] {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const { year, week } = isoWeek(e.date);
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    totals.set(key, (totals.get(key) ?? 0) + e.hours);
  }

  const today = new Date();
  const bars: Bar[] = [];
  for (let i = WEEKS_SHOWN - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const iso = d.toISOString().slice(0, 10);
    const { year, week } = isoWeek(iso);
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    bars.push({
      key,
      label: `U${week}`,
      hours: totals.get(key) ?? 0,
    });
  }
  return bars;
}

export function HoursChart({ entries }: { entries: HourEntry[] }) {
  const bars = buildWeeks(entries);
  const max = Math.max(1, ...bars.map((b) => b.hours));

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Timer per uke
        </h2>
        <span className="text-xs text-gray-500">Siste {WEEKS_SHOWN} uker</span>
      </div>
      <div className="flex h-32 items-end gap-2">
        {bars.map((bar) => {
          const heightPct = (bar.hours / max) * 100;
          const empty = bar.hours === 0;
          return (
            <div
              key={bar.key}
              className="group relative flex flex-1 flex-col items-center justify-end"
            >
              <div
                className={
                  empty
                    ? "w-full rounded-sm bg-gray-100"
                    : "w-full rounded-sm bg-brand/80 transition-colors group-hover:bg-brand"
                }
                style={{ height: empty ? "4px" : `${Math.max(heightPct, 4)}%` }}
                title={`${bar.label}: ${formatHours(bar.hours)} t`}
                aria-label={`${bar.label}: ${formatHours(bar.hours)} timer`}
              />
              <span className="pointer-events-none absolute -top-6 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {formatHours(bar.hours)} t
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {bars.map((bar) => (
          <div
            key={`${bar.key}-label`}
            className="flex-1 text-center text-[10px] text-gray-500 tabular-nums"
          >
            {bar.label}
          </div>
        ))}
      </div>
    </section>
  );
}
