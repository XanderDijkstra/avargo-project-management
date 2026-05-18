import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SetupError } from "@/components/setup-error";
import { listEngagements } from "@/lib/data";
import {
  ALL_SOURCES,
  ALL_STAGES,
  KANBAN_STAGES,
  SERVICE_LABELS,
  SOURCE_LABELS,
  STAGE_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Engagement, PipelineStage, Source } from "@/lib/types";

type SearchParams = {
  stage?: string;
  source?: string;
  sort?: string;
  order?: string;
};

export default async function EngagementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  let engagements: Engagement[] = [];
  let dataError: string | null = null;
  try {
    engagements = await listEngagements();
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
  }

  const stageFilter = sp.stage as PipelineStage | "all" | undefined;
  const sourceFilter = sp.source as Source | "all" | undefined;
  const sortField = (sp.sort as "companyName" | "updatedAt" | undefined) ?? "updatedAt";
  const sortOrder = (sp.order as "asc" | "desc" | undefined) ?? "desc";

  const filtered = engagements.filter((e) => {
    if (stageFilter && stageFilter !== "all" && e.stage !== stageFilter)
      return false;
    if (sourceFilter && sourceFilter !== "all" && e.source !== sourceFilter)
      return false;
    return true;
  });

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortField === "companyName") {
      cmp = a.companyName.localeCompare(b.companyName, "nb");
    } else {
      cmp = a.updatedAt.localeCompare(b.updatedAt);
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const toggleOrderHref = (field: "companyName" | "updatedAt") => {
    const params = new URLSearchParams();
    if (stageFilter) params.set("stage", stageFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    params.set("sort", field);
    const nextOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    params.set("order", nextOrder);
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Alle engasjementer</h1>
        <Button asChild>
          <Link href="/engagements/new">Ny engasjement</Link>
        </Button>
      </div>

      {dataError && <SetupError message={dataError} />}

      <form className="flex flex-wrap items-end gap-3" method="get">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Stadium</label>
          <select
            name="stage"
            defaultValue={stageFilter ?? "all"}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          >
            <option value="all">Alle</option>
            {ALL_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Kilde</label>
          <select
            name="source"
            defaultValue={sourceFilter ?? "all"}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm"
          >
            <option value="all">Alle</option>
            {ALL_SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <input type="hidden" name="sort" value={sortField} />
        <input type="hidden" name="order" value={sortOrder} />
        <Button type="submit" variant="secondary" size="sm">
          Filtrer
        </Button>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-sm text-gray-500">
          Ingen engasjementer matcher filteret.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">
                  <Link
                    href={toggleOrderHref("companyName")}
                    className="hover:text-gray-900"
                  >
                    Selskap
                    {sortField === "companyName"
                      ? sortOrder === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </Link>
                </th>
                <th className="px-4 py-3">Kontakt</th>
                <th className="px-4 py-3">Kilde</th>
                <th className="px-4 py-3">Tjenester</th>
                <th className="px-4 py-3">Stadium</th>
                <th className="px-4 py-3">
                  <Link
                    href={toggleOrderHref("updatedAt")}
                    className="hover:text-gray-900"
                  >
                    Sist oppdatert
                    {sortField === "updatedAt"
                      ? sortOrder === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <tr key={e.slug} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/engagements/${e.slug}`}
                      className="font-medium text-gray-900 hover:text-brand"
                    >
                      {e.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{e.contactName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {SOURCE_LABELS[e.source]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {e.services.map((s) => (
                        <Badge key={s} variant="muted">
                          {SERVICE_LABELS[s]}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        KANBAN_STAGES.includes(e.stage) ? "brand" : "muted"
                      }
                    >
                      {STAGE_LABELS[e.stage]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(e.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
