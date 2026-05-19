import { FORM_TYPE_LABELS } from "@/lib/constants";
import type { FormSchema } from "@/lib/form-schemas";
import type { FormSubmission, FormType } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function labelFor(
  schemas: Record<FormType, FormSchema>,
  formType: FormType,
  fieldName: string,
) {
  const schema = schemas[formType];
  if (!schema) return fieldName;
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.name === fieldName) return field.label;
    }
  }
  return fieldName;
}

function formatValue(v: unknown): string {
  if (v == null) return "—";
  if (Array.isArray(v)) return v.map((x) => String(x)).join(", ");
  return String(v);
}

export function SubmissionsPanel({
  submissions,
  schemas,
}: {
  submissions: FormSubmission[];
  schemas: Record<FormType, FormSchema>;
}) {
  if (submissions.length === 0) {
    return <p className="text-sm text-gray-500">Ingen mottatte skjemaer.</p>;
  }

  const sorted = [...submissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );

  return (
    <ul className="space-y-3">
      {sorted.map((sub) => (
        <li
          key={sub.id}
          className="overflow-hidden rounded-md border border-gray-200 bg-white"
        >
          <details>
            <summary className="cursor-pointer list-none px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {FORM_TYPE_LABELS[sub.formType]}
                  </p>
                  <p className="text-xs text-gray-500">
                    Mottatt {formatDateTime(sub.submittedAt)}
                  </p>
                </div>
                <span className="text-xs text-gray-400">Vis detaljer</span>
              </div>
            </summary>
            <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
              <dl className="grid grid-cols-1 gap-y-2 text-sm md:grid-cols-[200px_1fr]">
                {Object.entries(sub.data).map(([key, value]) => (
                  <div
                    key={key}
                    className="contents md:[&>dt]:pt-0.5 md:[&>dd]:pb-2"
                  >
                    <dt className="text-gray-500">
                      {labelFor(schemas, sub.formType, key)}
                    </dt>
                    <dd className="whitespace-pre-wrap text-gray-900">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
