-- Avargo Project Management — Supabase schema
-- Run this once in the Supabase SQL Editor (or via the CLI) to create the
-- tables the app reads from and writes to. Idempotent — safe to re-run when
-- a new table is added.

------------------------------------------------------------
-- 0. Migrate any existing rows that are on removed stages.
--    The app now uses only: henvisning-mottatt, scoping, bygging,
--    lopende-drift, avsluttet. Old stages are mapped to the closest
--    kept stage. Safe to run multiple times.
------------------------------------------------------------
do $$
begin
  if to_regclass('public.engagements') is not null then
    update public.engagements
      set data = jsonb_set(data, '{stage}', '"scoping"', false)
      where data->>'stage' = 'tilbud-sendt';
    update public.engagements
      set data = jsonb_set(data, '{stage}', '"bygging"', false)
      where data->>'stage' = 'akseptert';
    update public.engagements
      set data = jsonb_set(data, '{stage}', '"lopende-drift"', false)
      where data->>'stage' = 'lansert';
    update public.engagements
      set data = jsonb_set(data, '{stage}', '"avsluttet"', false)
      where data->>'stage' = 'pauset';
  end if;
end$$;

------------------------------------------------------------
-- 1. Clients (the legacy name is 'engagements' — left as-is
--    intentionally so deployed code keeps working).
------------------------------------------------------------
create table if not exists public.engagements (
  slug         text primary key,
  data         jsonb not null,
  updated_at   timestamptz not null default now()
);

create index if not exists engagements_updated_at_idx
  on public.engagements (updated_at desc);

alter table public.engagements enable row level security;

------------------------------------------------------------
-- 2. Service task templates — one row per service. The
--    'templates' column is a JSON array of {title, description?}.
------------------------------------------------------------
create table if not exists public.service_templates (
  service      text primary key,
  templates    jsonb not null default '[]'::jsonb,
  updated_at   timestamptz not null default now()
);

alter table public.service_templates enable row level security;

------------------------------------------------------------
-- 3. Hour register — one row per logged entry.
------------------------------------------------------------
create table if not exists public.hour_entries (
  id            uuid primary key default gen_random_uuid(),
  client_slug   text not null references public.engagements(slug) on delete cascade,
  entry_date    date not null,
  hours         numeric(6,2) not null check (hours > 0),
  note          text,
  created_at    timestamptz not null default now()
);

create index if not exists hour_entries_client_idx
  on public.hour_entries (client_slug, entry_date desc);

create index if not exists hour_entries_date_idx
  on public.hour_entries (entry_date desc);

alter table public.hour_entries enable row level security;

------------------------------------------------------------
-- 4. Onboarding form schemas — one row per form type.
--    Title, description and a sections JSON array
--    ([{title, fields: [{name, label, type, required?, ...}]}]).
--    Missing rows fall back to the hardcoded defaults in
--    lib/form-schemas.ts.
------------------------------------------------------------
create table if not exists public.form_schemas (
  form_type    text primary key,
  title        text not null,
  description  text not null default '',
  sections     jsonb not null default '[]'::jsonb,
  updated_at   timestamptz not null default now()
);

alter table public.form_schemas enable row level security;

------------------------------------------------------------
-- Seed: Hjørnekontor pilot client.
------------------------------------------------------------
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

------------------------------------------------------------
-- Seed: default task templates per service. Safe to re-run.
-- Customise these later from the Services tab in the app.
------------------------------------------------------------
insert into public.service_templates (service, templates) values
  ('website', '[
    {"title": "Sett opp Google Search Console", "description": "Verifiser domenet og send inn sitemap."},
    {"title": "Sett opp GA4-property", "description": "Opprett property, installer tagging på siden."},
    {"title": "Installer Google Tag Manager", "description": "GTM-container på siden, koble til GA4 og evt. Meta Pixel."},
    {"title": "Wireframe godkjent av kunde"},
    {"title": "Innholdsproduksjon ferdig", "description": "Tekst, bilder, evt. video for alle sider."},
    {"title": "Mobiltilpasning testet"},
    {"title": "Hastighetsoptimalisering (Lighthouse > 85)"},
    {"title": "Metabeskrivelser og titler satt"},
    {"title": "robots.txt og sitemap.xml på plass"},
    {"title": "Cookie-banner og personvern"},
    {"title": "Kundegjennomgang og endringsrunde"},
    {"title": "DNS pekt til ny side"},
    {"title": "SSL verifisert"}
  ]'::jsonb),
  ('gbp', '[
    {"title": "Sjekk om GBP allerede finnes"},
    {"title": "Start verifisering (postkort/video)", "description": "KRITISK SLI — start dag én, kan ta 1–3 uker."},
    {"title": "Fyll ut alle kategorier og tjenester"},
    {"title": "Last opp 10+ bilder (logo, fasade, interiør, team)"},
    {"title": "Sett åpningstider og helligdager"},
    {"title": "Skriv første GBP-post"},
    {"title": "Verifiser NAP-konsistens (navn/adresse/telefon)"}
  ]'::jsonb),
  ('google-ads', '[
    {"title": "Opprett Google Ads-konto"},
    {"title": "Koble Ads til GA4"},
    {"title": "Konfigurer konverteringssporing"},
    {"title": "Søkeordsanalyse og negativ-liste"},
    {"title": "Bygg første Search-kampanje (pauset)"},
    {"title": "Bygg første Performance Max (pauset)"},
    {"title": "Skriv 3–5 RSA-er per annonsegruppe"},
    {"title": "Fyll ut alle annonseutvidelser"},
    {"title": "Verifiser sporing fungerer i live-modus"}
  ]'::jsonb),
  ('meta-ads', '[
    {"title": "Opprett/koble Meta Business Manager", "description": "Kunden må eie BM. Du får partner-tilgang."},
    {"title": "Installer Meta Pixel på nettsiden"},
    {"title": "Sett opp Conversions API (server-side)"},
    {"title": "Definer Custom Audiences", "description": "Besøkende, kundeliste hvis tilgjengelig."},
    {"title": "Opprett Lookalike (1% LAL)"},
    {"title": "Lag 3–5 kreative annonser (bilde/video + tekst)"},
    {"title": "Bygg første konverteringskampanje (pauset)"},
    {"title": "Verifiser sporing i Events Manager"}
  ]'::jsonb),
  ('linkedin', '[
    {"title": "Opprett/oppdater bedriftsside"},
    {"title": "Last opp logo og banner"},
    {"title": "Skriv bedriftsbeskrivelse"},
    {"title": "Be eiere/ansatte koble seg til siden"},
    {"title": "Lag innholdsmal (format, tone, hashtags)"},
    {"title": "Skriv 4 startposter"}
  ]'::jsonb),
  ('software', '[
    {"title": "Definer scope og leveranseliste skriftlig"},
    {"title": "Velg teknisk stack med kunden"},
    {"title": "Sett opp repository og deployment"},
    {"title": "Lag wireframes / brukerflyt"},
    {"title": "Definer database-skjema"},
    {"title": "Sett opp auth (hvis aktuelt)"},
    {"title": "MVP-funksjonalitet bygget"},
    {"title": "Brukerakseptansetest med kunde"},
    {"title": "Dokumentasjon levert"}
  ]'::jsonb)
on conflict (service) do nothing;
