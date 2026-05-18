import { notFound } from "next/navigation";

import { submitEngagementFormAction } from "@/app/f/actions";
import { FormRenderer } from "@/components/form-renderer";
import { ALL_FORM_TYPES } from "@/lib/constants";
import { getEngagement } from "@/lib/data";
import { FORM_SCHEMAS } from "@/lib/form-schemas";
import type { FormType } from "@/lib/types";

export default async function EngagementFormPage({
  params,
}: {
  params: Promise<{ slug: string; formType: string }>;
}) {
  const { slug, formType } = await params;
  if (!ALL_FORM_TYPES.includes(formType as FormType)) {
    notFound();
  }
  const engagement = await getEngagement(slug);
  if (!engagement) {
    notFound();
  }

  const schema = FORM_SCHEMAS[formType as FormType];

  // Pre-fill matching fields from the engagement record.
  const defaults: Record<string, unknown> = {
    companyName: engagement.companyName,
    contactName: engagement.contactName,
    contactEmail: engagement.contactEmail,
    contactPhone: engagement.contactPhone,
  };

  const action = submitEngagementFormAction.bind(
    null,
    slug,
    formType as FormType,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1>{schema.title}</h1>
        <p className="text-sm text-gray-600">{schema.description}</p>
      </div>
      <FormRenderer
        schema={schema}
        action={action}
        defaults={defaults}
        submitLabel="Send inn"
      />
    </div>
  );
}
