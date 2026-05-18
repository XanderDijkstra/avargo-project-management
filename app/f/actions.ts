"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  addSubmission,
  createEngagement,
  getEngagement,
} from "@/lib/data";
import { ALL_FORM_TYPES } from "@/lib/constants";
import { FORM_SCHEMAS } from "@/lib/form-schemas";
import { buildSubmission, parseFormSubmission } from "@/lib/form-actions";
import type { FormType } from "@/lib/types";

export async function submitPublicFormAction(
  formType: FormType,
  formData: FormData,
) {
  if (!ALL_FORM_TYPES.includes(formType)) {
    throw new Error("Ukjent skjematype");
  }
  const schema = FORM_SCHEMAS[formType];
  const data = parseFormSubmission(schema, formData);

  const companyName =
    typeof data.companyName === "string" ? data.companyName : "";
  const contactName =
    typeof data.contactName === "string" ? data.contactName : "Ukjent";
  const contactEmail =
    typeof data.contactEmail === "string" ? data.contactEmail : "";
  const contactPhone =
    typeof data.contactPhone === "string" ? data.contactPhone : undefined;

  if (!companyName || !contactEmail) {
    throw new Error("Mangler påkrevde felter");
  }

  const created = await createEngagement({
    companyName,
    contactName,
    contactEmail,
    contactPhone,
    source: "Other",
    services: [],
    stage: "henvisning-mottatt",
  });

  await addSubmission(created.slug, buildSubmission(schema, data));

  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/f/${formType}/thanks`);
}

export async function submitEngagementFormAction(
  slug: string,
  formType: FormType,
  formData: FormData,
) {
  if (!ALL_FORM_TYPES.includes(formType)) {
    throw new Error("Ukjent skjematype");
  }
  const engagement = await getEngagement(slug);
  if (!engagement) {
    throw new Error("Klient ikke funnet");
  }
  const schema = FORM_SCHEMAS[formType];
  const data = parseFormSubmission(schema, formData);
  await addSubmission(slug, buildSubmission(schema, data));

  revalidatePath(`/clients/${slug}`);
  redirect(`/f/${formType}/thanks`);
}
