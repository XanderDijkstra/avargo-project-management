import { notFound } from "next/navigation";

import { submitPublicFormAction } from "@/app/f/actions";
import { FormRenderer } from "@/components/form-renderer";
import { ALL_FORM_TYPES } from "@/lib/constants";
import { getFormSchema } from "@/lib/data";
import type { FormType } from "@/lib/types";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ formType: string }>;
}) {
  const { formType } = await params;
  if (!ALL_FORM_TYPES.includes(formType as FormType)) {
    notFound();
  }

  const schema = await getFormSchema(formType as FormType);
  const action = submitPublicFormAction.bind(null, formType as FormType);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1>{schema.title}</h1>
        <p className="text-sm text-gray-600">{schema.description}</p>
      </div>
      <FormRenderer schema={schema} action={action} submitLabel="Send inn" />
    </div>
  );
}
