"use client";

import { useTransition } from "react";

import { deleteHourEntryAction } from "@/app/(app)/timeregister/actions";
import type { HourEntry } from "@/lib/types";
import { formatHours, formatIsoDate } from "@/lib/utils";

export type HourEntryRowData = HourEntry & { clientName: string };

export type MonthWeekGroup = {
  key: string;
  label: string;
  total: number;
  entries: HourEntryRowData[];
};

export function MonthHoursCard({
  label,
  total,
  weeks,
}: {
  label: string;
  total: number;
  weeks: MonthWeekGroup[];
}) {
  const [pending, startTransition] = useTransition();

  const onDelete = (id: string) => {
    startTransition(() => {
      deleteHourEntryAction(id);
    });
  };

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="capitalize">{label}</h2>
        <p className="text-sm tabular-nums text-gray-700">
          <span className="text-gray-500">Sum: </span>
          <span className="font-semibold text-gray-900">
            {formatHours(total)} t
          </span>
        </p>
      </header>

      <table className="w-full text-sm">
        <colgroup>
          <col className="w-[140px]" />
          <col />
          <col className="w-[90px]" />
          <col />
          <col className="w-[60px]" />
        </colgroup>
        <thead className="text-left text-[11px] uppercase tracking-wide text-gray-500">
          <tr className="border-b border-gray-100">
            <th className="px-5 py-2 font-medium">Dato</th>
            <th className="px-5 py-2 font-medium">Klient</th>
            <th className="px-5 py-2 text-right font-medium">Timer</th>
            <th className="px-5 py-2 font-medium">Notat</th>
            <th className="px-5 py-2" />
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <WeekRows
              key={week.key}
              week={week}
              isFirst={weekIndex === 0}
              pending={pending}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function WeekRows({
  week,
  isFirst,
  pending,
  onDelete,
}: {
  week: MonthWeekGroup;
  isFirst: boolean;
  pending: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <tr
        className={
          isFirst
            ? "bg-gray-50/60"
            : "border-t border-gray-100 bg-gray-50/60"
        }
      >
        <td
          colSpan={5}
          className="px-5 py-1.5 text-xs font-medium text-gray-600"
        >
          <span className="text-gray-700">{week.label}</span>
          <span className="ml-2 tabular-nums text-gray-500">
            · {formatHours(week.total)} t
          </span>
        </td>
      </tr>
      {week.entries.map((e) => (
        <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50">
          <td className="px-5 py-2 text-gray-700">{formatIsoDate(e.date)}</td>
          <td className="px-5 py-2 text-gray-900">{e.clientName}</td>
          <td className="px-5 py-2 text-right tabular-nums text-gray-900">
            {formatHours(e.hours)}
          </td>
          <td className="px-5 py-2 text-gray-600">{e.note ?? "—"}</td>
          <td className="px-5 py-2 text-right">
            <button
              type="button"
              onClick={() => onDelete(e.id)}
              disabled={pending}
              className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
              aria-label="Slett oppføring"
            >
              Slett
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
