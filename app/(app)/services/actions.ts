"use server";

import { revalidatePath } from "next/cache";

import {
  addServiceTemplate as addServiceTemplateData,
  getFormSchema,
  removeServiceTemplate as removeServiceTemplateData,
  resetFormSchema as resetFormSchemaData,
  updateFormSchema as updateFormSchemaData,
} from "@/lib/data";
import { ALL_FORM_TYPES, ALL_SERVICES } from "@/lib/constants";
import type { FormField, FormSchema } from "@/lib/form-schemas";
import type { FormType, Service } from "@/lib/types";

export async function addServiceTemplateAction(
  service: Service,
  formData: FormData,
) {
  if (!ALL_SERVICES.includes(service)) return;
  const title = ((formData.get("title") as string) || "").trim();
  const description =
    ((formData.get("description") as string) || "").trim() || undefined;
  if (!title) return;

  await addServiceTemplateData(service, { title, description });
  revalidatePath(`/services/${service}`);
  revalidatePath(`/services`);
}

export async function removeServiceTemplateAction(
  service: Service,
  index: number,
) {
  if (!ALL_SERVICES.includes(service)) return;
  await removeServiceTemplateData(service, index);
  revalidatePath(`/services/${service}`);
  revalidatePath(`/services`);
}

// ---------- Onboarding form schemas ----------

function ensureFormType(formType: FormType) {
  if (!ALL_FORM_TYPES.includes(formType)) {
    throw new Error("Ukjent skjematype");
  }
}

function revalidateForm(formType: FormType) {
  revalidatePath(`/services`);
  for (const s of ALL_SERVICES) revalidatePath(`/services/${s}`);
  revalidatePath(`/f/${formType}`);
  revalidatePath(`/clients`, "layout");
}

export async function updateFormMetaAction(
  formType: FormType,
  formData: FormData,
) {
  ensureFormType(formType);
  const title = ((formData.get("title") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  if (!title) return;
  await updateFormSchemaData(formType, { title, description });
  revalidateForm(formType);
}

export async function addSectionAction(formType: FormType, title: string) {
  ensureFormType(formType);
  const trimmed = title.trim();
  if (!trimmed) return;
  const current = await getFormSchema(formType);
  const next: FormSchema = {
    ...current,
    sections: [...current.sections, { title: trimmed, fields: [] }],
  };
  await updateFormSchemaData(formType, { sections: next.sections });
  revalidateForm(formType);
}

export async function renameSectionAction(
  formType: FormType,
  sectionIndex: number,
  title: string,
) {
  ensureFormType(formType);
  const trimmed = title.trim();
  if (!trimmed) return;
  const current = await getFormSchema(formType);
  const sections = current.sections.map((s, i) =>
    i === sectionIndex ? { ...s, title: trimmed } : s,
  );
  await updateFormSchemaData(formType, { sections });
  revalidateForm(formType);
}

export async function deleteSectionAction(
  formType: FormType,
  sectionIndex: number,
) {
  ensureFormType(formType);
  const current = await getFormSchema(formType);
  const sections = current.sections.filter((_, i) => i !== sectionIndex);
  await updateFormSchemaData(formType, { sections });
  revalidateForm(formType);
}

function parseField(formData: FormData): FormField | null {
  const name = ((formData.get("name") as string) || "").trim();
  const label = ((formData.get("label") as string) || "").trim();
  const type = (formData.get("type") as FormField["type"]) || "text";
  if (!name || !label) return null;

  const required = formData.get("required") === "on";
  const placeholder =
    ((formData.get("placeholder") as string) || "").trim() || undefined;
  const helpText =
    ((formData.get("helpText") as string) || "").trim() || undefined;
  const optionsRaw = ((formData.get("options") as string) || "").trim();

  let options: FormField["options"];
  if (type === "select" || type === "multiselect") {
    options = optionsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const idx = line.indexOf(":");
        if (idx === -1) return { value: line, label: line };
        return {
          value: line.slice(0, idx).trim(),
          label: line.slice(idx + 1).trim(),
        };
      })
      .filter((o) => o.value && o.label);
  }

  return {
    name,
    label,
    type,
    ...(required ? { required: true } : {}),
    ...(placeholder ? { placeholder } : {}),
    ...(helpText ? { helpText } : {}),
    ...(options ? { options } : {}),
  };
}

export async function addFieldAction(
  formType: FormType,
  sectionIndex: number,
  formData: FormData,
) {
  ensureFormType(formType);
  const field = parseField(formData);
  if (!field) return;
  const current = await getFormSchema(formType);
  const sections = current.sections.map((s, i) =>
    i === sectionIndex ? { ...s, fields: [...s.fields, field] } : s,
  );
  await updateFormSchemaData(formType, { sections });
  revalidateForm(formType);
}

export async function updateFieldAction(
  formType: FormType,
  sectionIndex: number,
  fieldIndex: number,
  formData: FormData,
) {
  ensureFormType(formType);
  const field = parseField(formData);
  if (!field) return;
  const current = await getFormSchema(formType);
  const sections = current.sections.map((s, i) => {
    if (i !== sectionIndex) return s;
    const fields = s.fields.map((f, j) => (j === fieldIndex ? field : f));
    return { ...s, fields };
  });
  await updateFormSchemaData(formType, { sections });
  revalidateForm(formType);
}

export async function deleteFieldAction(
  formType: FormType,
  sectionIndex: number,
  fieldIndex: number,
) {
  ensureFormType(formType);
  const current = await getFormSchema(formType);
  const sections = current.sections.map((s, i) => {
    if (i !== sectionIndex) return s;
    return { ...s, fields: s.fields.filter((_, j) => j !== fieldIndex) };
  });
  await updateFormSchemaData(formType, { sections });
  revalidateForm(formType);
}

export async function resetFormSchemaAction(formType: FormType) {
  ensureFormType(formType);
  await resetFormSchemaData(formType);
  revalidateForm(formType);
}
