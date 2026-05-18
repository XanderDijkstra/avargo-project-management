# Avargo Project Management

Internal CRM and pipeline tool for managing delivery work across small business
marketing engagements (websites, GBP, Google Ads, Meta Ads, LinkedIn, custom
software).

Current version: **v0.2** — builds on v0.1 by adding three subsystems on top
of the core CRM: public onboarding forms, an auto-generated task system tied
to the "Bygging" stage, and a markdown-based SOPs tab.

## Running locally

```bash
pnpm install
cp .env.example .env.local   # then fill in your Supabase keys
pnpm dev
```

Open <http://localhost:3000>.

A production build is verified with:

```bash
pnpm build
```

## Deploying to Vercel

1. Push to GitHub and import the repo into Vercel.
2. In Vercel **Settings → Environment Variables**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never `NEXT_PUBLIC_…`)
3. In Supabase: create a project, open **SQL Editor**, paste and run
   `supabase/setup.sql`. This creates the `engagements`,
   `service_templates`, and `hour_entries` tables, the indexes, enables
   RLS, and seeds Hjørnekontor + the default task templates per service.
   The script is idempotent — re-run it after pulling new code to pick up
   any new tables.
4. Trigger a deployment. The SOPs markdown ships with the build via
   `outputFileTracingIncludes` in `next.config.js`.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- `@dnd-kit` for kanban drag-and-drop
- `react-markdown` + `gray-matter` for SOPs
- **Supabase Postgres** (single `engagements` table, JSONB column) for
  engagement state. SOPs remain as in-repo markdown.

## Data model

The single CRM entity is an `Engagement` (one engagement = one row in
Supabase = one card on the kanban). The `engagements` table has three
columns: `slug` (primary key), `data` (JSONB containing the full
`Engagement` shape from `lib/types.ts`), and `updated_at` (for sort/index).
All mutations go through `lib/data.ts`, which read-modify-writes the JSONB
blob. SOPs live as markdown files in `/sops`.

User-facing copy is in Norwegian; code/identifiers are in English.

## Routes

App (with shared sidebar):

- `/` — kanban pipeline (drag cards between stages)
- `/clients` — table view with filtering and sorting
- `/clients/new` — create a new client
- `/clients/[slug]` — detail view with notes, links, tasks, submissions,
  form-link generator, and stage history
- `/services` — list of services with template counts
- `/services/[service]` — edit task templates for a service (these fire
  when a client enters "Bygging")
- `/timeregister` — log hours per client, grouped by week and month
- `/sops` — SOP index (cards)
- `/sops/[slug]` — single SOP rendered from markdown

Public (no app nav):

- `/f/[formType]` — generic public onboarding form (creates a new client
  on submit). Valid `formType`: `website`, `meta-ads`, `google-ads`,
  `software`
- `/f/c/[slug]/[formType]` — per-client onboarding form (appends a
  submission to an existing client). NOTE: the v0.2 spec listed this as
  `/f/[slug]/[formType]`, but Next.js disallows two routes that share a
  dynamic parameter at the same depth with different names; the `c`
  disambiguator keeps the structure flat while satisfying the router.
- `/f/[formType]/thanks` — thank-you page shared by both submission flows

## Task templates

When a client transitions **into** the `bygging` stage from any other
stage, a set of pre-defined tasks is generated for each of the client's
services. Templates are stored in the `service_templates` Supabase table
(seeded by `supabase/setup.sql`) and editable from the **Tjenester** tab
in the app. The hardcoded `lib/task-templates.ts` is a fallback used only
when a service has no row in the database.

Re-entering `bygging` (e.g. after a stop in `pauset`) does NOT duplicate
existing template tasks — matching is on `workstream:title`. A "Regenerer
maler" button on the client detail view re-runs the template logic
manually if you added services after already being in `bygging`.

## Timeregister

`/timeregister` lets you log hours per client with an optional note. The
list is grouped by month and week with running totals — handy for batching
work into invoices. Data lives in the `hour_entries` Supabase table.

## SOPs

SOPs are markdown files in `/sops/*.md`. Each has YAML frontmatter:

```yaml
---
title: Visible title
service: website        # optional, used as a tag
order: 1                # numeric sort order, ascending
---
```

There is no in-app editor — SOPs are edited by editing the markdown files
directly in the repo.

## v0.2 scope

Included:

- v0.1 features (kanban, list view, detail view, new engagement form)
- New `software` service value
- Tasks per engagement, grouped by workstream, with status and delete
- Auto-generated task templates on entry into `bygging`
- Public onboarding forms (4 types), with submissions captured into
  engagements
- Per-engagement onboarding form links (clipboard-copyable from detail view)
- Mottatte skjemaer panel on detail view (immutable, expandable)
- SOPs tab with markdown content and frontmatter

**Not** included (deliberately deferred):

- Authentication
- Email or webhook notifications on form submission
- Form-builder UI (form schemas live in code)
- SOP editor in the app
- File upload fields (use URL fields where assets are expected)
- reCAPTCHA, rate limiting, or other spam protection on public forms
- Conditional / multi-step form logic
- Editing or deleting submissions (add a note instead)
- Time tracking
- Tests, ESLint config beyond Next.js defaults
- Notifications / dashboards / charts

## Next steps

Future versions are expected to add: auth, time tracking, email/calendar
integration, file uploads, and webhook/email notifications on form
submission. None of these are present in v0.2.
