"use client";

import { useTransition } from "react";

import { deleteHourEntryAction } from "@/app/(app)/timeregister/actions";
import type { HourEntry } from "@/lib/types";
import { formatHours, formatIsoDate } from "@/lib/utils";

export type HourEntryRowData = HourEntry & { clientName: string };

export function HourEntriesTable({
  entries,
}: {
  entries: HourEntryRowData[];
}) {
  const [pending, startTransition] = useTransition();

  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-500">Ingen timer loggført i perioden.</p>
    );
  }

  const onDelete = (id: string) => {
    startTransition(() => {
      deleteHourEntryAction(id);
    });
  };

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-2">Dato</th>
            <th className="px-4 py-2">Klient</th>
            <th className="px-4 py-2 text-right">Timer</th>
            <th className="px-4 py-2">Notat</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-700">
                {formatIsoDate(e.date)}
              </td>
              <td className="px-4 py-2 text-gray-900">{e.clientName}</td>
              <td className="px-4 py-2 text-right tabular-nums text-gray-900">
                {formatHours(e.hours)}
              </td>
              <td className="px-4 py-2 text-gray-600">{e.note ?? "—"}</td>
              <td className="px-4 py-2 text-right">
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
        </tbody>
      </table>
    </div>
  );
}
