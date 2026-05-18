import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SERVICE_LABELS } from "@/lib/constants";
import { listSops } from "@/lib/sops";

export const dynamic = "force-dynamic";

export default async function SopsIndexPage() {
  const sops = await listSops();

  return (
    <div className="space-y-6">
      <h1>SOPs</h1>
      <p className="max-w-2xl text-sm text-gray-600">
        Interne prosedyrer og sjekklister. Innholdet redigeres som
        markdown-filer i kodebasen.
      </p>

      {sops.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-sm text-gray-500">
          Ingen SOPs ennå.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sops.map((sop) => (
            <li key={sop.slug}>
              <Link
                href={`/sops/${sop.slug}`}
                className="flex h-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-brand"
              >
                <h2 className="text-base font-medium text-gray-900">
                  {sop.title}
                </h2>
                {sop.service && (
                  <div>
                    <Badge variant="muted">{SERVICE_LABELS[sop.service]}</Badge>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
