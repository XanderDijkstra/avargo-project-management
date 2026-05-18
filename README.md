# Avargo Project Management

Internal CRM and pipeline tool for managing delivery work across small business
marketing engagements (websites, GBP, Google Ads, Meta Ads, LinkedIn).

This is **v0.1** — the smallest useful version. Future versions will add
features; v0.1 is deliberately scoped down.

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
- JSON file storage in `/data/engagements/*.json` (no database)

## Data model

The single entity is an `Engagement` (one engagement = one card on the
kanban). Each engagement is stored as a JSON file in `/data/engagements/`.
The shape lives in `lib/types.ts` and includes contact info, source,
services, pipeline stage, optional fees/budgets, an append-only notes log,
external links, and a stage transition history. All mutations go through
`lib/data.ts`, which writes files atomically.

User-facing copy is in Norwegian; code/identifiers are in English.

## Routes

- `/` — kanban pipeline (drag cards between stages)
- `/engagements` — table view with filtering and sorting
- `/engagements/new` — create a new engagement
- `/engagements/[slug]` — detail view with notes, links, stage history

## v0.1 scope

Included:

- Kanban board with drag-and-drop
- List view with filters and sort
- Engagement detail view with notes (append-only) and links
- New engagement form
- Stage selector + stage history timeline
- Norwegian copy throughout

**Not** included (deliberately deferred):

- Authentication or any login flow
- Database — JSON files only
- Time tracking
- SOP / playbook rendering
- File uploads
- Email or calendar integrations
- Separate task / ticket system
- Custom fields, multi-user support
- Notifications
- Dashboards or analytics
- Search beyond simple filters
- Tests

## Next steps

Future versions are expected to add: auth, time tracking, SOPs as
markdown, file uploads, email/calendar integration, and a per-engagement
task system. None of these are present in v0.1.
