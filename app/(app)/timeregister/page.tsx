import { HourEntryDialog } from "@/components/hour-entry-dialog";
import { HoursChart } from "@/components/hours-chart";
import {
  MonthHoursCard,
  type HourEntryRowData,
  type MonthWeekGroup,
} from "@/components/month-hours-card";
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

type MonthGroup = {
  key: string;
  label: string;
  weeks: MonthWeekGroup[];
  total: number;
};

function groupByMonthAndWeek(
  entries: HourEntry[],
  clientNameMap: Map<string, string>,
): MonthGroup[] {
  const months = new Map<string, MonthGroup>();

  for (const entry of entries) {
    const enriched: HourEntryRowData = {
      ...entry,
      clientName: clientNameMap.get(entry.clientSlug) ?? entry.clientSlug,
    };

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
    weekGroup.entries.push(enriched);
    weekGroup.total += entry.hours;
    month.total += entry.hours;
  }

  const sorted = [...months.values()].sort((a, b) =>
    b.key.localeCompare(a.key),
  );
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

  const clientNameMap = new Map(clients.map((c) => [c.slug, c.companyName]));
  const grouped = groupByMonthAndWeek(entries, clientNameMap);
  const totalAll = entries.reduce((sum, e) => sum + e.hours, 0);

  const canLog = !dataError && clients.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1>Timeregister</h1>
          <p className="mt-1 text-sm text-gray-600">
            Loggfør timer per klient. Totaler oppsummeres per uke og måned.
          </p>
        </div>
        {canLog && (
          <HourEntryDialog
            clients={clients.map((c) => ({
              slug: c.slug,
              companyName: c.companyName,
            }))}
          />
        )}
      </div>

      {dataError && <SetupError message={dataError} />}

      {!dataError && clients.length === 0 && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Du må opprette en klient før du kan loggføre timer.
        </p>
      )}

      {!dataError && (
        <>
          {entries.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
              <section className="flex flex-col justify-center rounded-lg border border-gray-200 bg-white p-5">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Totalt loggført
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-gray-900">
                  {formatHours(totalAll)} t
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {entries.length} oppføring{entries.length === 1 ? "" : "er"}
                </p>
              </section>
              <HoursChart entries={entries} />
            </div>
          )}

          {grouped.length === 0 ? (
            <p className="text-sm text-gray-500">
              Ingen timer loggført enda.
            </p>
          ) : (
            <div className="space-y-6">
              {grouped.map((month) => (
                <MonthHoursCard
                  key={month.key}
                  label={month.label}
                  total={month.total}
                  weeks={month.weeks}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
