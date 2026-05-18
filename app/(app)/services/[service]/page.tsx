import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceTemplatesEditor } from "@/components/service-templates-editor";
import { SetupError } from "@/components/setup-error";
import { ALL_SERVICES, SERVICE_LABELS } from "@/lib/constants";
import { getServiceTemplate } from "@/lib/data";
import type { Service, ServiceTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!ALL_SERVICES.includes(service as Service)) {
    notFound();
  }
  const svc = service as Service;

  let tpl: ServiceTemplate | null = null;
  let dataError: string | null = null;
  try {
    tpl = await getServiceTemplate(svc);
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/services"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Alle tjenester
        </Link>
      </div>

      <div>
        <h1>{SERVICE_LABELS[svc]}</h1>
        <p className="mt-1 text-sm text-gray-600">
          Disse oppgavene kopieres til klienten ved overgang til «Bygging».
        </p>
      </div>

      {dataError ? (
        <SetupError message={dataError} />
      ) : tpl ? (
        <ServiceTemplatesEditor service={svc} templates={tpl.templates} />
      ) : null}
    </div>
  );
}
