import "server-only";

import { randomUUID } from "node:crypto";

import type {
  Engagement,
  FormSubmission,
  Link,
  NewEngagementInput,
  PipelineStage,
  Service,
  Task,
  TaskStatus,
  Workstream,
} from "./types";
import { slugify } from "./utils";
import { TASK_TEMPLATES } from "./task-templates";
import { ENGAGEMENTS_TABLE, getSupabase } from "./supabase";

type Row = {
  slug: string;
  data: Engagement;
  updated_at: string;
};

function normalize(engagement: Engagement): Engagement {
  // Backfill optional arrays so legacy rows don't crash UI code.
  return {
    ...engagement,
    notes: engagement.notes ?? [],
    links: engagement.links ?? [],
    stageHistory: engagement.stageHistory ?? [],
    tasks: engagement.tasks ?? [],
    submissions: engagement.submissions ?? [],
  };
}

async function readEngagement(slug: string): Promise<Engagement | null> {
  const { data, error } = await getSupabase()
    .from(ENGAGEMENTS_TABLE)
    .select("slug,data,updated_at")
    .eq("slug", slug)
    .maybeSingle<Row>();

  if (error) throw error;
  if (!data) return null;
  return normalize(data.data);
}

async function writeEngagement(engagement: Engagement): Promise<void> {
  const row: Row = {
    slug: engagement.slug,
    data: engagement,
    updated_at: engagement.updatedAt,
  };
  const { error } = await getSupabase()
    .from(ENGAGEMENTS_TABLE)
    .upsert(row, { onConflict: "slug" });
  if (error) throw error;
}

export async function listEngagements(): Promise<Engagement[]> {
  const { data, error } = await getSupabase()
    .from(ENGAGEMENTS_TABLE)
    .select("slug,data,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => normalize((r as Row).data));
}

export async function getEngagement(slug: string): Promise<Engagement | null> {
  return readEngagement(slug);
}

export async function createEngagement(
  input: NewEngagementInput,
): Promise<Engagement> {
  const baseSlug = slugify(input.companyName);
  if (!baseSlug) throw new Error("Ugyldig selskapsnavn");

  // Find an available slug. Race-safe enough for an internal tool: the upsert
  // is keyed on slug, so a duplicate would error and we'd just retry.
  let slug = baseSlug;
  let counter = 2;
  while ((await readEngagement(slug)) !== null) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();
  const engagement: Engagement = {
    id: randomUUID(),
    slug,
    companyName: input.companyName,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    source: input.source,
    sourceContact: input.sourceContact,
    services: input.services,
    stage: input.stage,
    setupFee: input.setupFee,
    monthlyRetainer: input.monthlyRetainer,
    adBudget: input.adBudget,
    notes: [],
    links: [],
    stageHistory: [{ stage: input.stage, enteredAt: now }],
    tasks: [],
    submissions: [],
    createdAt: now,
    updatedAt: now,
  };

  await writeEngagement(engagement);
  return engagement;
}

export async function updateEngagement(
  slug: string,
  patch: Partial<Engagement>,
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const stageChanged = patch.stage && patch.stage !== current.stage;

  const next: Engagement = {
    ...current,
    ...patch,
    slug: current.slug,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  if (stageChanged && patch.stage) {
    next.stageHistory = [
      ...current.stageHistory,
      { stage: patch.stage, enteredAt: next.updatedAt },
    ];
  }

  await writeEngagement(next);
  return next;
}

export async function addNote(
  slug: string,
  content: string,
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const now = new Date().toISOString();
  const next: Engagement = {
    ...current,
    notes: [...current.notes, { id: randomUUID(), date: now, content }],
    updatedAt: now,
  };

  await writeEngagement(next);
  return next;
}

export async function addLink(slug: string, link: Link): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const next: Engagement = {
    ...current,
    links: [...current.links, link],
    updatedAt: new Date().toISOString(),
  };

  await writeEngagement(next);
  return next;
}

export async function removeLink(
  slug: string,
  linkLabel: string,
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const next: Engagement = {
    ...current,
    links: current.links.filter((l) => l.label !== linkLabel),
    updatedAt: new Date().toISOString(),
  };

  await writeEngagement(next);
  return next;
}

export async function changeStage(
  slug: string,
  newStage: PipelineStage,
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  if (current.stage === newStage) return current;

  const previousStage = current.stage;
  const now = new Date().toISOString();
  const next: Engagement = {
    ...current,
    stage: newStage,
    stageHistory: [
      ...current.stageHistory,
      { stage: newStage, enteredAt: now },
    ],
    updatedAt: now,
  };

  // Fire template tasks only on transition INTO "bygging"
  if (newStage === "bygging" && previousStage !== "bygging") {
    const generated = generateTasksFromTemplates(next.services, next.tasks);
    next.tasks = [...next.tasks, ...generated];
  }

  await writeEngagement(next);
  return next;
}

function generateTasksFromTemplates(
  services: Service[],
  existingTasks: Task[],
): Task[] {
  const existingKeys = new Set(
    existingTasks
      .filter((t) => t.fromTemplate)
      .map((t) => `${t.workstream}:${t.title}`),
  );

  const out: Task[] = [];
  for (const service of services) {
    const templates = TASK_TEMPLATES[service] ?? [];
    for (const tmpl of templates) {
      const key = `${tmpl.workstream}:${tmpl.title}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      out.push({
        id: randomUUID(),
        title: tmpl.title,
        description: tmpl.description,
        workstream: tmpl.workstream,
        status: "todo",
        createdAt: new Date().toISOString(),
        fromTemplate: true,
      });
    }
  }
  return out;
}

export async function addTask(
  slug: string,
  input: { title: string; workstream: Workstream; description?: string },
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    workstream: input.workstream,
    status: "todo",
    createdAt: now,
    fromTemplate: false,
  };

  const next: Engagement = {
    ...current,
    tasks: [...current.tasks, task],
    updatedAt: now,
  };

  await writeEngagement(next);
  return next;
}

export async function updateTaskStatus(
  slug: string,
  taskId: string,
  status: TaskStatus,
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const now = new Date().toISOString();
  const next: Engagement = {
    ...current,
    tasks: current.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status,
            completedAt: status === "done" ? now : undefined,
          }
        : t,
    ),
    updatedAt: now,
  };

  await writeEngagement(next);
  return next;
}

export async function deleteTask(
  slug: string,
  taskId: string,
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const next: Engagement = {
    ...current,
    tasks: current.tasks.filter((t) => t.id !== taskId),
    updatedAt: new Date().toISOString(),
  };

  await writeEngagement(next);
  return next;
}

export async function regenerateTemplateTasks(
  slug: string,
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const generated = generateTasksFromTemplates(current.services, current.tasks);
  if (generated.length === 0) return current;

  const next: Engagement = {
    ...current,
    tasks: [...current.tasks, ...generated],
    updatedAt: new Date().toISOString(),
  };

  await writeEngagement(next);
  return next;
}

export async function addSubmission(
  slug: string,
  submission: Omit<FormSubmission, "id" | "submittedAt"> & {
    id?: string;
    submittedAt?: string;
  },
): Promise<Engagement> {
  const current = await readEngagement(slug);
  if (!current) throw new Error("Klient ikke funnet");

  const now = new Date().toISOString();
  const full: FormSubmission = {
    id: submission.id ?? randomUUID(),
    submittedAt: submission.submittedAt ?? now,
    formType: submission.formType,
    submittedBy: submission.submittedBy,
    data: submission.data,
  };

  const next: Engagement = {
    ...current,
    submissions: [...current.submissions, full],
    updatedAt: now,
  };

  await writeEngagement(next);
  return next;
}
