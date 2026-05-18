"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addLink as addLinkData,
  addNote as addNoteData,
  addTask as addTaskData,
  changeStage as changeStageData,
  deleteEngagement as deleteEngagementData,
  deleteTask as deleteTaskData,
  regenerateTemplateTasks as regenerateTemplateTasksData,
  removeLink as removeLinkData,
  updateEngagement as updateEngagementData,
  updateTaskStatus as updateTaskStatusData,
} from "@/lib/data";
import {
  ALL_SERVICES,
  ALL_SOURCES,
  ALL_STAGES,
  ALL_TASK_STATUSES,
  ALL_WORKSTREAMS,
} from "@/lib/constants";
import type {
  Engagement,
  PipelineStage,
  Service,
  Source,
  TaskStatus,
  Workstream,
} from "@/lib/types";

export async function addNoteAction(slug: string, formData: FormData) {
  const content = (formData.get("content") as string | null)?.trim();
  if (!content) return;
  await addNoteData(slug, content);
  revalidatePath(`/clients/${slug}`);
}

export async function addLinkAction(slug: string, formData: FormData) {
  const label = (formData.get("label") as string | null)?.trim();
  const url = (formData.get("url") as string | null)?.trim();
  if (!label || !url) return;
  await addLinkData(slug, { label, url });
  revalidatePath(`/clients/${slug}`);
}

export async function removeLinkAction(slug: string, label: string) {
  await removeLinkData(slug, label);
  revalidatePath(`/clients/${slug}`);
}

export async function changeStageAction(slug: string, formData: FormData) {
  const stage = formData.get("stage") as PipelineStage;
  if (!ALL_STAGES.includes(stage)) return;
  await changeStageData(slug, stage);
  revalidatePath(`/clients/${slug}`);
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
  revalidatePath(`/clients/${slug}`);
}

export async function addTaskAction(slug: string, formData: FormData) {
  const title = ((formData.get("title") as string) || "").trim();
  const description =
    ((formData.get("description") as string) || "").trim() || undefined;
  const workstream = formData.get("workstream") as Workstream;
  if (!title || !ALL_WORKSTREAMS.includes(workstream)) return;
  await addTaskData(slug, { title, description, workstream });
  revalidatePath(`/clients/${slug}`);
}

export async function updateTaskStatusAction(
  slug: string,
  taskId: string,
  status: TaskStatus,
) {
  if (!ALL_TASK_STATUSES.includes(status)) return;
  await updateTaskStatusData(slug, taskId, status);
  revalidatePath(`/clients/${slug}`);
}

export async function deleteTaskAction(slug: string, taskId: string) {
  await deleteTaskData(slug, taskId);
  revalidatePath(`/clients/${slug}`);
}

export async function regenerateTemplateTasksAction(slug: string) {
  await regenerateTemplateTasksData(slug);
  revalidatePath(`/clients/${slug}`);
}

export async function deleteClientAction(slug: string) {
  await deleteEngagementData(slug);
  revalidatePath("/");
  revalidatePath("/clients");
  redirect("/clients");
}
