"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  changeStage as changeStageData,
  createEngagement as createEngagementData,
  deleteEngagement as deleteEngagementData,
} from "@/lib/data";
import {
  ALL_SERVICES,
  ALL_SOURCES,
  ALL_STAGES,
} from "@/lib/constants";
import type {
  NewEngagementInput,
  PipelineStage,
  Service,
  Source,
} from "@/lib/types";

export async function createEngagementAction(formData: FormData) {
  const companyName = ((formData.get("companyName") as string) || "").trim();
  const contactName = ((formData.get("contactName") as string) || "").trim();
  const contactEmail = ((formData.get("contactEmail") as string) || "").trim();
  const contactPhone =
    ((formData.get("contactPhone") as string) || "").trim() || undefined;

  if (!companyName || !contactName || !contactEmail) {
    throw new Error("Mangler påkrevde felter");
  }

  const sourceRaw = (formData.get("source") as Source) || "Riktig Regnskap";
  const source: Source = ALL_SOURCES.includes(sourceRaw)
    ? sourceRaw
    : "Riktig Regnskap";

  const sourceContact =
    ((formData.get("sourceContact") as string) || "").trim() || undefined;

  const services = ALL_SERVICES.filter((s) =>
    formData.get(`service-${s}`),
  ) as Service[];

  const stageRaw = (formData.get("stage") as PipelineStage) || "henvisning-mottatt";
  const stage: PipelineStage = ALL_STAGES.includes(stageRaw)
    ? stageRaw
    : "henvisning-mottatt";

  const parseNumber = (key: string): number | undefined => {
    const v = formData.get(key);
    if (v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const adGoogle = parseNumber("adGoogle");
  const adMeta = parseNumber("adMeta");

  const input: NewEngagementInput = {
    companyName,
    contactName,
    contactEmail,
    contactPhone,
    source,
    sourceContact,
    services,
    stage,
    setupFee: parseNumber("setupFee"),
    monthlyRetainer: parseNumber("monthlyRetainer"),
    adBudget:
      adGoogle === undefined && adMeta === undefined
        ? undefined
        : { google: adGoogle, meta: adMeta },
  };

  const created = await createEngagementData(input);
  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/clients/${created.slug}`);
}

export async function changeStageFromKanbanAction(
  slug: string,
  newStage: PipelineStage,
) {
  if (!ALL_STAGES.includes(newStage)) return;
  await changeStageData(slug, newStage);
  revalidatePath("/");
  revalidatePath(`/clients/${slug}`);
}

export async function deleteClientFromListAction(slug: string) {
  await deleteEngagementData(slug);
  revalidatePath("/clients");
  revalidatePath("/");
}
