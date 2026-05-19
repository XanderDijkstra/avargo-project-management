# Project notes for Claude

## Workflow
- Push completed work directly to `main`. The user wants changes to ship to
  main as soon as they're done — no review gate, no draft PR shuffle.
  Web sessions still start on a `claude/<slug>` branch, so the flow is:
  1. Commit on the session branch.
  2. `git push origin <session-branch>:main` (fast-forward into main).
  3. If a PR was opened earlier in the session, it will auto-close as merged.
- Skip creating a draft PR unless the user explicitly asks for review.

## Stack
- Next.js 15 App Router (RSC), React 19 RC, Tailwind, Radix primitives.
- Server actions in `app/(app)/**/actions.ts`, data layer in `lib/data.ts`
  (Supabase). Use `revalidatePath` after mutations.
- UI primitives live in `components/ui/*` and follow the shadcn pattern.

## Conventions
- All user-facing copy is Norwegian (Bokmål).
- Drag-and-drop uses `@dnd-kit/core`.
- Pipeline stages and labels are centralized in `lib/constants.ts`; task
  templates auto-seed when a client transitions into `bygging`.
