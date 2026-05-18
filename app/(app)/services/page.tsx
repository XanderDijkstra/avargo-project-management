import Link from "next/link";

import { SetupError } from "@/components/setup-error";
import { Badge } from "@/components/ui/badge";
import { SERVICE_LABELS } from "@/lib/constants";
import { listServiceTemplates } from "@/lib/data";
import type { ServiceTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ServicesIndexPage() {
  let templates: ServiceTemplate[] = [];
  let dataError: string | null = null;
  try {
    templates = await listServiceTemplates();
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Tjenester</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Mal-oppgaver per tjeneste. Når en klient går inn i stadiet
          «Bygging», kopieres alle disse oppgavene automatisk inn på
          klienten.
        </p>
      </div>

      {dataError && <SetupError message={dataError} />}

      {!dataError && (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {templates.map((t) => (
            <li key={t.service}>
              <Link
                href={`/services/${t.service}`}
                className="flex h-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-brand"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium text-gray-900">
                    {SERVICE_LABELS[t.service]}
                  </h2>
                  <Badge variant="muted">
                    {t.templates.length} oppgaver
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Klikk for å redigere mal-oppgavene.
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
