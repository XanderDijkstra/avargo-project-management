import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type {
  Engagement,
  Link,
  NewEngagementInput,
  PipelineStage,
} from "./types";
import { slugify } from "./utils";

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

  await writeEngagementAtomic(next);
  return next;
}
