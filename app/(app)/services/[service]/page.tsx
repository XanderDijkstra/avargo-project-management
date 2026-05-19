import Link from "next/link";
import { notFound } from "next/navigation";

import { FormSchemaEditor } from "@/components/form-schema-editor";
import { ServicePageTabs } from "@/components/service-page-tabs";
import { ServiceTemplatesEditor } from "@/components/service-templates-editor";
import { SetupError } from "@/components/setup-error";
import {
  ALL_FORM_TYPES,
  ALL_SERVICES,
  SERVICE_LABELS,
} from "@/lib/constants";
import { getFormSchema, getServiceTemplate } from "@/lib/data";
import type { FormSchema } from "@/lib/form-schemas";
import type { FormType, Service, ServiceTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

// Map a service to its onboarding form type (only those that share a name).
function formTypeForService(service: Service): FormType | null {
  return ALL_FORM_TYPES.includes(service as FormType)
    ? (service as FormType)
    : null;
}

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
  const formType = formTypeForService(svc);

  let tpl: ServiceTemplate | null = null;
  let schema: FormSchema | null = null;
  let dataError: string | null = null;
  try {
    [tpl, schema] = await Promise.all([
      getServiceTemplate(svc),
      formType ? getFormSchema(formType) : Promise.resolve(null),
    ]);
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
  }

  const tabs = [
    {
      key: "tasks",
      label: "Mal-oppgaver",
      content: tpl ? (
        <ServiceTemplatesEditor service={svc} templates={tpl.templates} />
      ) : null,
    },
  ];
  if (formType && schema) {
    tabs.push({
      key: "form",
      label: "Onboarding-skjema",
      content: <FormSchemaEditor formType={formType} schema={schema} />,
    });
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
          Mal-oppgaver kopieres til klienten ved overgang til «Bygging».
          {formType
            ? " Onboarding-skjemaet sendes til kunden for å samle inn informasjon."
            : ""}
        </p>
      </div>

      {dataError ? (
        <SetupError message={dataError} />
      ) : (
        <ServicePageTabs tabs={tabs} />
      )}
    </div>
  );
}
