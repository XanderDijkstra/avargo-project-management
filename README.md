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
pnpm dev
```

Open <http://localhost:3000>.

A production build is verified with:

```bash
pnpm build
```

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- `@dnd-kit` for kanban drag-and-drop
- `react-markdown` + `gray-matter` for SOPs
- JSON file storage in `/data/engagements/*.json` (no database)

## Data model

The single CRM entity is an `Engagement` (one engagement = one card on the
kanban). Each engagement is stored as a JSON file in `/data/engagements/`.
The shape lives in `lib/types.ts` and includes contact info, source,
services, pipeline stage, optional fees/budgets, an append-only notes log,
external links, a stage transition history, an array of `Task`s (some
auto-generated from templates), and an array of immutable `FormSubmission`s.
All mutations go through `lib/data.ts`, which writes files atomically.

User-facing copy is in Norwegian; code/identifiers are in English.

## Routes

App (with shared nav header):

- `/` — kanban pipeline (drag cards between stages)
- `/engagements` — table view with filtering and sorting
- `/engagements/new` — create a new engagement
- `/engagements/[slug]` — detail view with notes, links, tasks, submissions,
  form-link generator, and stage history
- `/sops` — SOP index (cards)
- `/sops/[slug]` — single SOP rendered from markdown

Public (no app nav):

- `/f/[formType]` — generic public onboarding form (creates a new engagement
  on submit). Valid `formType`: `website`, `meta-ads`, `google-ads`,
  `software`
- `/f/e/[slug]/[formType]` — per-engagement onboarding form (appends a
  submission to an existing engagement). NOTE: the v0.2 spec listed this as
  `/f/[slug]/[formType]`, but Next.js disallows two routes that share a
  dynamic parameter at the same depth with different names; the `e`
  disambiguator keeps the structure flat while satisfying the router.
- `/f/[formType]/thanks` — thank-you page shared by both submission flows

## Task templates

When an engagement transitions **into** the `bygging` stage from any other
stage, a set of pre-defined tasks is generated for each of the engagement's
services. Templates live in `lib/task-templates.ts`. Re-entering `bygging`
(e.g. after a stop in `pauset`) does NOT duplicate existing template tasks
— matching is on `workstream:title`. A "Regenerer maler" button on the
detail view re-runs the template logic manually if you added services after
already being in `bygging`.

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
- A database (JSON files only)
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
