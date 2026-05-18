import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import type { Service } from "./types";

export type SopMeta = {
  slug: string;
  title: string;
  service?: Service;
  order: number;
};

export type Sop = SopMeta & {
  content: string;
};

const SOPS_DIR = path.join(process.cwd(), "sops");

async function readSopFile(slug: string): Promise<Sop | null> {
  try {
    const raw = await fs.readFile(path.join(SOPS_DIR, `${slug}.md`), "utf8");
    const parsed = matter(raw);
    const data = parsed.data as {
      title?: string;
      service?: string;
      order?: number;
    };
    return {
      slug,
      title: data.title ?? slug,
      service: (data.service as Service | undefined) ?? undefined,
      order: typeof data.order === "number" ? data.order : 999,
      content: parsed.content,
    };
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

export async function listSops(): Promise<SopMeta[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(SOPS_DIR);
  } catch {
    return [];
  }
  const slugs = entries
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));

  const sops = await Promise.all(slugs.map((s) => readSopFile(s)));
  return sops
    .filter((s): s is Sop => s !== null)
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title, "nb");
    });
}

export async function getSop(slug: string): Promise<Sop | null> {
  return readSopFile(slug);
}
