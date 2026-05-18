import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
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

const DATA_DIR = path.join(process.cwd(), "data", "engagements");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePathFor(slug: string) {
  return path.join(DATA_DIR, `${slug}.json`);
}

async function readEngagementFile(slug: string): Promise<Engagement | null> {
  try {
    const raw = await fs.readFile(filePathFor(slug), "utf8");
    const parsed = JSON.parse(raw) as Engagement;
    // Backfill v0.2 fields for engagements created under v0.1
    if (!Array.isArray(parsed.tasks)) parsed.tasks = [];
    if (!Array.isArray(parsed.submissions)) parsed.submissions = [];
    return parsed;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      return null;
    }
    throw err;
  }
}

async function writeEngagementAtomic(engagement: Engagement) {
  await ensureDir();
  const target = filePathFor(engagement.slug);
  const tmp = `${target}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(engagement, null, 2), "utf8");
  await fs.rename(tmp, target);
}

export async function listEngagements(): Promise<Engagement[]> {
  await ensureDir();
  const entries = await fs.readdir(DATA_DIR);
  const slugs = entries
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.replace(/\.json$/, ""));

  const engagements = await Promise.all(
    slugs.map((slug) => readEngagementFile(slug)),
  );
  return engagements.filter((e): e is Engagement => e !== null);
}

export async function getEngagement(slug: string): Promise<Engagement | null> {
  return readEngagementFile(slug);
}

export async function createEngagement(
  input: NewEngagementInput,
): Promise<Engagement> {
  const baseSlug = slugify(input.companyName);
  if (!baseSlug) throw new Error("Ugyldig selskapsnavn");

  // If slug exists, append numeric suffix
  let slug = baseSlug;
  let counter = 2;
  while ((await readEngagementFile(slug)) !== null) {
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

  await writeEngagementAtomic(engagement);
  return engagement;
}

export async function updateEngagement(
  slug: string,
  patch: Partial<Engagement>,
): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

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

  await writeEngagementAtomic(next);
  return next;
}

export async function addNote(
  slug: string,
  content: string,
): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

  const now = new Date().toISOString();
  const next: Engagement = {
    ...current,
    notes: [
      ...current.notes,
      { id: randomUUID(), date: now, content },
    ],
    updatedAt: now,
  };

  await writeEngagementAtomic(next);
  return next;
}

export async function addLink(slug: string, link: Link): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

  const next: Engagement = {
    ...current,
    links: [...current.links, link],
    updatedAt: new Date().toISOString(),
  };

  await writeEngagementAtomic(next);
  return next;
}

export async function removeLink(
  slug: string,
  linkLabel: string,
): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

  const next: Engagement = {
    ...current,
    links: current.links.filter((l) => l.label !== linkLabel),
    updatedAt: new Date().toISOString(),
  };

  await writeEngagementAtomic(next);
  return next;
}

export async function changeStage(
  slug: string,
  newStage: PipelineStage,
): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

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

  await writeEngagementAtomic(next);
  return next;
}

// Generate tasks from templates, skipping any that already exist by
// exact title+workstream match. Idempotent for re-fires.
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
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

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

  await writeEngagementAtomic(next);
  return next;
}

export async function updateTaskStatus(
  slug: string,
  taskId: string,
  status: TaskStatus,
): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

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

  await writeEngagementAtomic(next);
  return next;
}

export async function deleteTask(
  slug: string,
  taskId: string,
): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

  const next: Engagement = {
    ...current,
    tasks: current.tasks.filter((t) => t.id !== taskId),
    updatedAt: new Date().toISOString(),
  };

  await writeEngagementAtomic(next);
  return next;
}

export async function regenerateTemplateTasks(
  slug: string,
): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

  const generated = generateTasksFromTemplates(current.services, current.tasks);
  if (generated.length === 0) return current;

  const next: Engagement = {
    ...current,
    tasks: [...current.tasks, ...generated],
    updatedAt: new Date().toISOString(),
  };

  await writeEngagementAtomic(next);
  return next;
}

export async function addSubmission(
  slug: string,
  submission: Omit<FormSubmission, "id" | "submittedAt"> & {
    id?: string;
    submittedAt?: string;
  },
): Promise<Engagement> {
  const current = await readEngagementFile(slug);
  if (!current) throw new Error("Engasjement ikke funnet");

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

  await writeEngagementAtomic(next);
  return next;
}
