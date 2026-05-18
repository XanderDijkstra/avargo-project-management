import { HourEntriesTable } from "@/components/hour-entries-table";
import { HourEntryForm } from "@/components/hour-entry-form";
import { SetupError } from "@/components/setup-error";
import { listEngagements, listHourEntries } from "@/lib/data";
import type { Engagement, HourEntry } from "@/lib/types";
import {
  formatHours,
  isoMonth,
  isoWeek,
  monthLabel,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type WeekGroup = {
  key: string;
  label: string;
  entries: HourEntry[];
  total: number;
};

type MonthGroup = {
  key: string;
  label: string;
  weeks: WeekGroup[];
  total: number;
};

function groupByMonthAndWeek(entries: HourEntry[]): MonthGroup[] {
  const months = new Map<string, MonthGroup>();

  for (const entry of entries) {
    const { year: my, month: mm } = isoMonth(entry.date);
    const monthKey = `${my}-${String(mm).padStart(2, "0")}`;
    let month = months.get(monthKey);
    if (!month) {
      month = {
        key: monthKey,
        label: monthLabel(my, mm),
        weeks: [],
        total: 0,
      };
      months.set(monthKey, month);
    }

    const { year: wy, week } = isoWeek(entry.date);
    const weekKey = `${wy}-W${String(week).padStart(2, "0")}`;
    let weekGroup = month.weeks.find((w) => w.key === weekKey);
    if (!weekGroup) {
      weekGroup = {
        key: weekKey,
        label: `Uke ${week}`,
        entries: [],
        total: 0,
      };
      month.weeks.push(weekGroup);
    }
    weekGroup.entries.push(entry);
    weekGroup.total += entry.hours;
    month.total += entry.hours;
  }

  // Sort months desc by key (which is year-month and sorts lexicographically).
  const sorted = [...months.values()].sort((a, b) => b.key.localeCompare(a.key));
  // Within each month, sort weeks desc by week number.
  for (const m of sorted) {
    m.weeks.sort((a, b) => b.key.localeCompare(a.key));
    for (const w of m.weeks) {
      w.entries.sort((a, b) => b.date.localeCompare(a.date));
    }
  }
  return sorted;
}

export default async function TimeregisterPage() {
  let entries: HourEntry[] = [];
  let clients: Engagement[] = [];
  let dataError: string | null = null;

  try {
    [entries, clients] = await Promise.all([
      listHourEntries(),
      listEngagements(),
    ]);
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
  }

  const grouped = groupByMonthAndWeek(entries);
  const totalAll = entries.reduce((sum, e) => sum + e.hours, 0);
  const clientNameMap = new Map(clients.map((c) => [c.slug, c.companyName]));
  const enrich = (e: HourEntry) => ({
    ...e,
    clientName: clientNameMap.get(e.clientSlug) ?? e.clientSlug,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>Timeregister</h1>
          <p className="mt-1 text-sm text-gray-600">
            Loggfør timer per klient. Totaler oppsummeres per uke og måned.
          </p>
        </div>
        {entries.length > 0 && (
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Totalt
            </p>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">
              {formatHours(totalAll)} t
            </p>
          </div>
        )}
      </div>

      {dataError && <SetupError message={dataError} />}

      {!dataError && (
        <>
          {clients.length === 0 ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Du må opprette en klient før du kan loggføre timer.
            </p>
          ) : (
            <HourEntryForm
              clients={clients.map((c) => ({
                slug: c.slug,
                companyName: c.companyName,
              }))}
            />
          )}

          {grouped.length === 0 ? (
            <p className="text-sm text-gray-500">
              Ingen timer loggført enda.
            </p>
          ) : (
            <div className="space-y-8">
              {grouped.map((month) => (
                <section key={month.key} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h2 className="capitalize">{month.label}</h2>
                    <p className="text-sm tabular-nums text-gray-700">
                      <span className="text-gray-500">Sum: </span>
                      <span className="font-semibold text-gray-900">
                        {formatHours(month.total)} t
                      </span>
                    </p>
                  </div>

                  {month.weeks.map((week) => (
                    <div key={week.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">
                          {week.label}
                        </h3>
                        <p className="text-xs tabular-nums text-gray-500">
                          {formatHours(week.total)} t
                        </p>
                      </div>
                      <HourEntriesTable
                        entries={week.entries.map(enrich)}
                      />
                    </div>
                  ))}
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
