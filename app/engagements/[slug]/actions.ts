"use server";

import { revalidatePath } from "next/cache";

import {
  addLink as addLinkData,
  addNote as addNoteData,
  changeStage as changeStageData,
  removeLink as removeLinkData,
  updateEngagement as updateEngagementData,
} from "@/lib/data";
import { ALL_SERVICES, ALL_SOURCES, ALL_STAGES } from "@/lib/constants";
import type {
  Engagement,
  PipelineStage,
  Service,
  Source,
} from "@/lib/types";

export async function addNoteAction(slug: string, formData: FormData) {
  const content = (formData.get("content") as string | null)?.trim();
  if (!content) return;
  await addNoteData(slug, content);
  revalidatePath(`/engagements/${slug}`);
}

export async function addLinkAction(slug: string, formData: FormData) {
  const label = (formData.get("label") as string | null)?.trim();
  const url = (formData.get("url") as string | null)?.trim();
  if (!label || !url) return;
  await addLinkData(slug, { label, url });
  revalidatePath(`/engagements/${slug}`);
}

export async function removeLinkAction(slug: string, label: string) {
  await removeLinkData(slug, label);
  revalidatePath(`/engagements/${slug}`);
}

export async function changeStageAction(slug: string, formData: FormData) {
  const stage = formData.get("stage") as PipelineStage;
  if (!ALL_STAGES.includes(stage)) return;
  await changeStageData(slug, stage);
  revalidatePath(`/engagements/${slug}`);
  revalidatePath("/");
}

export async function updateEngagementAction(
  slug: string,
  formData: FormData,
) {
  const services = ALL_SERVICES.filter((s) => formData.get(`service-${s}`));
  const source = formData.get("source") as Source;
  const validSource: Source = ALL_SOURCES.includes(source) ? source : "Other";

  const parseNumber = (key: string): number | undefined => {
    const v = formData.get(key);
    if (v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const adGoogle = parseNumber("adGoogle");
  const adMeta = parseNumber("adMeta");

  const patch: Partial<Engagement> = {
    companyName: (formData.get("companyName") as string).trim(),
    contactName: (formData.get("contactName") as string).trim(),
    contactEmail: (formData.get("contactEmail") as string).trim(),
    contactPhone:
      ((formData.get("contactPhone") as string) || "").trim() || undefined,
    source: validSource,
    sourceContact:
      ((formData.get("sourceContact") as string) || "").trim() || undefined,
    services: services as Service[],
    setupFee: parseNumber("setupFee"),
    monthlyRetainer: parseNumber("monthlyRetainer"),
    adBudget:
      adGoogle === undefined && adMeta === undefined
        ? undefined
        : { google: adGoogle, meta: adMeta },
  };

  await updateEngagementData(slug, patch);
  revalidatePath(`/engagements/${slug}`);
}
