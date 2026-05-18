"use server";

import { revalidatePath } from "next/cache";

import {
  addServiceTemplate as addServiceTemplateData,
  removeServiceTemplate as removeServiceTemplateData,
} from "@/lib/data";
import { ALL_SERVICES } from "@/lib/constants";
import type { Service } from "@/lib/types";

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
