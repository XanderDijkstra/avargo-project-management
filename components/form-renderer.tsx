import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormField, FormSchema } from "@/lib/form-schemas";

type RendererProps = {
  schema: FormSchema;
  action: (formData: FormData) => void | Promise<void>;
  defaults?: Record<string, unknown>;
  submitLabel?: string;
};

function renderField(field: FormField, defaultValue: unknown) {
  const common = {
    id: field.name,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder,
  } as const;

  if (field.type === "textarea") {
    return (
      <Textarea
        {...common}
        rows={3}
        defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
      />
    );
  }

  if (field.type === "select") {
    return (
      <Select
        {...common}
        defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
      >
        <option value="" disabled={field.required}>
          Velg…
        </option>
        {(field.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    );
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(defaultValue)
      ? (defaultValue as string[])
      : [];
    return (
      <div className="flex flex-wrap gap-2">
        {(field.options ?? []).map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm"
          >
            <input
              type="checkbox"
              name={field.name}
              value={opt.value}
              defaultChecked={selected.includes(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }

  // text / email / url / number / tel
  return (
    <Input
      {...common}
      type={field.type}
      defaultValue={
        typeof defaultValue === "string" || typeof defaultValue === "number"
          ? String(defaultValue)
          : ""
      }
    />
  );
}

export function FormRenderer({
  schema,
  action,
  defaults = {},
  submitLabel = "Send inn",
}: RendererProps) {
  return (
    <form action={action} className="space-y-8">
      {schema.sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2>{section.title}</h2>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-600">*</span>
                  )}
                </Label>
                {renderField(field, defaults[field.name])}
                {field.helpText && (
                  <p className="text-xs text-gray-500">{field.helpText}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
