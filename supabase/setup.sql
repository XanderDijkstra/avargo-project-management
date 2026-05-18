-- Avargo Project Management — Supabase schema
-- Run this once in the Supabase SQL Editor (or via the CLI) to create the
-- engagements table the app reads from and writes to.

create table if not exists public.engagements (
  slug         text primary key,
  data         jsonb not null,
  updated_at   timestamptz not null default now()
);

create index if not exists engagements_updated_at_idx
  on public.engagements (updated_at desc);

-- The app uses the service_role key (server-only) which bypasses RLS, so
-- RLS itself is optional. Enabling it as defense-in-depth: no anon access.
alter table public.engagements enable row level security;

-- Seed: Hjørnekontor pilot engagement. Safe to re-run.
insert into public.engagements (slug, data, updated_at)
values (
  'hjornekontor',
  '{
    "id": "01938a4f-7c2e-7000-9000-000000000001",
    "slug": "hjornekontor",
    "companyName": "Hjørnekontor AS",
    "contactName": "Rikke",
    "contactEmail": "rikke@riktigregnskap.no",
    "source": "Riktig Regnskap",
    "sourceContact": "Rikke",
    "services": ["website", "gbp", "google-ads", "meta-ads", "linkedin"],
    "stage": "scoping",
    "notes": [
      {
        "id": "01938a4f-7c2e-7000-9000-000000000002",
        "date": "2026-05-18T10:00:00Z",
        "content": "Pilotprosjekt. Eiendomsselskap eid av Frode, Mattis, Anniken og Rikke. Rikke fungerer som kunde-stedfortreder. Full pakke. Skal teste produktifisert leveranse og notere faktisk tidsbruk for fastpris-benchmark."
      }
    ],
    "links": [{ "label": "Domene", "url": "https://hjornekontor.no" }],
    "stageHistory": [
      { "stage": "henvisning-mottatt", "enteredAt": "2026-05-15T12:00:00Z" },
      { "stage": "scoping", "enteredAt": "2026-05-18T10:00:00Z" }
    ],
    "tasks": [],
    "submissions": [],
    "createdAt": "2026-05-15T12:00:00Z",
    "updatedAt": "2026-05-18T10:00:00Z"
  }'::jsonb,
  '2026-05-18T10:00:00Z'
)
on conflict (slug) do nothing;
