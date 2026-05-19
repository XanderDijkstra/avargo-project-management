import "server-only";

import { randomUUID } from "node:crypto";

import type {
  Engagement,
  FormSubmission,
  FormType,
  HourEntry,
  Link,
  NewEngagementInput,
  PipelineStage,
  Service,
  ServiceTemplate,
  Task,
  TaskStatus,
  Workstream,
} from "./types";
import { slugify } from "./utils";
import { TASK_TEMPLATES } from "./task-templates";
import { ALL_FORM_TYPES, ALL_SERVICES } from "./constants";
import { DEFAULT_FORM_SCHEMAS, type FormSchema } from "./form-schemas";
import {
  ENGAGEMENTS_TABLE,
  FORM_SCHEMAS_TABLE,
  HOUR_ENTRIES_TABLE,
  SERVICE_TEMPLATES_TABLE,
  getSupabase,
} from "./supabase";

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

export async function deleteEngagement(slug: string): Promise<void> {
  const { error } = await getSupabase()
    .from(ENGAGEMENTS_TABLE)
    .delete()
    .eq("slug", slug);
  if (error) throw error;
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
    const generated = await generateTasksFromTemplates(
      next.services,
      next.tasks,
    );
    next.tasks = [...next.tasks, ...generated];
  }

  await writeEngagement(next);
  return next;
}

// Pull templates for the given services from Supabase. Falls back to the
// hardcoded TASK_TEMPLATES if the row is missing (e.g. setup.sql not run yet
// for a new service). Returns synthesised Task objects, skipping any that
// already exist on the client (matched by workstream:title).
async function generateTasksFromTemplates(
  services: Service[],
  existingTasks: Task[],
): Promise<Task[]> {
  const existingKeys = new Set(
    existingTasks
      .filter((t) => t.fromTemplate)
      .map((t) => `${t.workstream}:${t.title}`),
  );

  const { data, error } = await getSupabase()
    .from(SERVICE_TEMPLATES_TABLE)
    .select("service,templates")
    .in("service", services);
  if (error) throw error;

  const fromDb = new Map<Service, { title: string; description?: string }[]>();
  for (const row of (data ?? []) as Array<{
    service: Service;
    templates: { title: string; description?: string }[];
  }>) {
    fromDb.set(row.service, row.templates ?? []);
  }

  const out: Task[] = [];
  for (const service of services) {
    const templates =
      fromDb.get(service) ??
      (TASK_TEMPLATES[service] ?? []).map(({ title, description }) => ({
        title,
        description,
      }));
    for (const tmpl of templates) {
      const key = `${service}:${tmpl.title}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      out.push({
        id: randomUUID(),
        title: tmpl.title,
        description: tmpl.description,
        workstream: service,
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

  const generated = await generateTasksFromTemplates(
    current.services,
    current.tasks,
  );
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

// ---------- Service templates ----------

export async function listServiceTemplates(): Promise<ServiceTemplate[]> {
  const { data, error } = await getSupabase()
    .from(SERVICE_TEMPLATES_TABLE)
    .select("service,templates");
  if (error) throw error;

  const byService = new Map<Service, ServiceTemplate["templates"]>();
  for (const row of (data ?? []) as Array<{
    service: Service;
    templates: ServiceTemplate["templates"];
  }>) {
    byService.set(row.service, row.templates ?? []);
  }

  // Always return one entry per service so the UI can render even when a row
  // is missing in the DB.
  return ALL_SERVICES.map((service) => ({
    service,
    templates: byService.get(service) ?? [],
  }));
}

export async function getServiceTemplate(
  service: Service,
): Promise<ServiceTemplate> {
  const { data, error } = await getSupabase()
    .from(SERVICE_TEMPLATES_TABLE)
    .select("service,templates")
    .eq("service", service)
    .maybeSingle<{ service: Service; templates: ServiceTemplate["templates"] }>();
  if (error) throw error;
  return {
    service,
    templates: data?.templates ?? [],
  };
}

async function writeServiceTemplate(tpl: ServiceTemplate): Promise<void> {
  const { error } = await getSupabase()
    .from(SERVICE_TEMPLATES_TABLE)
    .upsert(
      {
        service: tpl.service,
        templates: tpl.templates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "service" },
    );
  if (error) throw error;
}

export async function addServiceTemplate(
  service: Service,
  template: { title: string; description?: string },
): Promise<ServiceTemplate> {
  const current = await getServiceTemplate(service);
  const next: ServiceTemplate = {
    service,
    templates: [...current.templates, template],
  };
  await writeServiceTemplate(next);
  return next;
}

export async function removeServiceTemplate(
  service: Service,
  index: number,
): Promise<ServiceTemplate> {
  const current = await getServiceTemplate(service);
  const next: ServiceTemplate = {
    service,
    templates: current.templates.filter((_, i) => i !== index),
  };
  await writeServiceTemplate(next);
  return next;
}

// ---------- Hour entries ----------

type HourEntryRow = {
  id: string;
  client_slug: string;
  entry_date: string;
  hours: number;
  note: string | null;
  created_at: string;
};

function rowToHourEntry(r: HourEntryRow): HourEntry {
  return {
    id: r.id,
    clientSlug: r.client_slug,
    date: r.entry_date,
    hours: Number(r.hours),
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}

export async function listHourEntries(): Promise<HourEntry[]> {
  const { data, error } = await getSupabase()
    .from(HOUR_ENTRIES_TABLE)
    .select("id,client_slug,entry_date,hours,note,created_at")
    .order("entry_date", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as HourEntryRow[]).map(rowToHourEntry);
}

export async function addHourEntry(input: {
  clientSlug: string;
  date: string;
  hours: number;
  note?: string;
}): Promise<HourEntry> {
  const { data, error } = await getSupabase()
    .from(HOUR_ENTRIES_TABLE)
    .insert({
      client_slug: input.clientSlug,
      entry_date: input.date,
      hours: input.hours,
      note: input.note ?? null,
    })
    .select("id,client_slug,entry_date,hours,note,created_at")
    .single<HourEntryRow>();
  if (error) throw error;
  return rowToHourEntry(data);
}

export async function deleteHourEntry(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from(HOUR_ENTRIES_TABLE)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------- Form schemas ----------

type FormSchemaRow = {
  form_type: FormType;
  title: string;
  description: string;
  sections: FormSchema["sections"];
};

function rowToSchema(row: FormSchemaRow): FormSchema {
  return {
    formType: row.form_type,
    title: row.title,
    description: row.description,
    sections: row.sections ?? [],
  };
}

export async function listFormSchemas(): Promise<Record<FormType, FormSchema>> {
  const { data, error } = await getSupabase()
    .from(FORM_SCHEMAS_TABLE)
    .select("form_type,title,description,sections");
  if (error) throw error;

  const fromDb = new Map<FormType, FormSchema>();
  for (const row of (data ?? []) as FormSchemaRow[]) {
    fromDb.set(row.form_type, rowToSchema(row));
  }

  const out = {} as Record<FormType, FormSchema>;
  for (const ft of ALL_FORM_TYPES) {
    out[ft] = fromDb.get(ft) ?? DEFAULT_FORM_SCHEMAS[ft];
  }
  return out;
}

export async function getFormSchema(formType: FormType): Promise<FormSchema> {
  const { data, error } = await getSupabase()
    .from(FORM_SCHEMAS_TABLE)
    .select("form_type,title,description,sections")
    .eq("form_type", formType)
    .maybeSingle<FormSchemaRow>();
  if (error) throw error;
  return data ? rowToSchema(data) : DEFAULT_FORM_SCHEMAS[formType];
}

export async function updateFormSchema(
  formType: FormType,
  patch: Partial<Pick<FormSchema, "title" | "description" | "sections">>,
): Promise<FormSchema> {
  const current = await getFormSchema(formType);
  const next: FormSchema = {
    formType,
    title: patch.title ?? current.title,
    description: patch.description ?? current.description,
    sections: patch.sections ?? current.sections,
  };
  const { error } = await getSupabase()
    .from(FORM_SCHEMAS_TABLE)
    .upsert(
      {
        form_type: formType,
        title: next.title,
        description: next.description,
        sections: next.sections,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "form_type" },
    );
  if (error) throw error;
  return next;
}

export async function resetFormSchema(formType: FormType): Promise<FormSchema> {
  const { error } = await getSupabase()
    .from(FORM_SCHEMAS_TABLE)
    .delete()
    .eq("form_type", formType);
  if (error) throw error;
  return DEFAULT_FORM_SCHEMAS[formType];
}
