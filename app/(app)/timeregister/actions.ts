"use server";

import { revalidatePath } from "next/cache";

import {
  addHourEntry as addHourEntryData,
  deleteHourEntry as deleteHourEntryData,
} from "@/lib/data";

export async function addHourEntryAction(formData: FormData) {
  const clientSlug = ((formData.get("clientSlug") as string) || "").trim();
  const date = ((formData.get("date") as string) || "").trim();
  const hoursRaw = ((formData.get("hours") as string) || "").trim();
  const note = ((formData.get("note") as string) || "").trim() || undefined;

  const hours = Number(hoursRaw);
  if (!clientSlug || !date || !Number.isFinite(hours) || hours <= 0) {
    throw new Error("Mangler påkrevde felter");
  }

  await addHourEntryData({ clientSlug, date, hours, note });
  revalidatePath("/timeregister");
}

export async function deleteHourEntryAction(id: string) {
  await deleteHourEntryData(id);
  revalidatePath("/timeregister");
}
