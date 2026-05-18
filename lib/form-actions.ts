import { randomUUID } from "node:crypto";

import type { FormField, FormSchema } from "./form-schemas";
import type { FormSubmission } from "./types";

// Parse the submitted FormData into a strongly-typed map using the schema as
// guidance. Unknown keys are ignored. Empty optional values are stripped.
export function parseFormSubmission(
  schema: FormSchema,
  formData: FormData,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  const allFields: FormField[] = schema.sections.flatMap((s) => s.fields);

  for (const field of allFields) {
    if (field.type === "multiselect") {
      const values = formData.getAll(field.name).map((v) => String(v));
      if (values.length > 0) out[field.name] = values;
      continue;
    }

    const raw = formData.get(field.name);
    if (raw === null) continue;
    const str = String(raw).trim();
    if (str === "") continue;

    if (field.type === "number") {
      const n = Number(str);
      if (Number.isFinite(n)) out[field.name] = n;
      continue;
    }

    out[field.name] = str;
  }

  return out;
}

export function buildSubmission(
  schema: FormSchema,
  data: Record<string, unknown>,
): FormSubmission {
  const submittedBy =
    typeof data.contactEmail === "string" ? data.contactEmail : undefined;
  return {
    id: randomUUID(),
    formType: schema.formType,
    submittedAt: new Date().toISOString(),
    submittedBy,
    data,
  };
}
