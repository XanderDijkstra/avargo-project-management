import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNok(value: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(value);
}

// ISO-8601 week (Norway convention: Monday-start). Returns {year, week}.
// Year is the ISO week-year, which may differ from the calendar year in
// late December / early January.
export function isoWeek(dateIso: string): { year: number; week: number } {
  // Parse YYYY-MM-DD as UTC to avoid timezone drift on the week boundary.
  const [y, m, d] = dateIso.split("T")[0].split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  // Shift to Thursday of the same ISO week (ISO weeks are numbered by
  // the Thursday they contain).
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return { year: date.getUTCFullYear(), week };
}

export function isoMonth(dateIso: string): { year: number; month: number } {
  const [y, m] = dateIso.split("T")[0].split("-").map(Number);
  return { year: y, month: m };
}

export function formatHours(hours: number): string {
  return new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(hours);
}

export function formatIsoDate(dateIso: string): string {
  const [y, m, d] = dateIso.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const NB_MONTHS = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

export function monthLabel(year: number, month: number): string {
  return `${NB_MONTHS[month - 1]} ${year}`;
}
