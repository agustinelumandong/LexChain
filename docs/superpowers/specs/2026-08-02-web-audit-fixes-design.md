# Web Audit Fixes — Design

**Date:** 2026-08-02
**Status:** Approved

## Context

Full web app screen audit (all public routes, auth guards, console/network
errors) surfaced a small set of user-facing issues. Backend was down during
audit — admin/portal internals not reachable, auth guard verified working.

## Scope

Three fixes. Two UI dead-end fixes, one copy fix.

### 1. Store badges → link to `/download`

No real Play Store / App Store URLs exist (app not published). Badges are
currently non-clickable UI.

- `apps/web/app/page.tsx:93-100` — wrap App Store `<Image>` badge and
  "Google Play" text in `<Link href="/download">`. Preserve styling.
- `apps/web/app/download/page.tsx` — wrap badge `div`s in
  `<Link href="/download">`. Self-link on the download page is harmless.
- Add `ponytail:` comment: swap for real store URLs when published.

### 2. Invite copy — SKIPPED

Hardcoded "as a Lawyer" in `app/invite/[token]/page.tsx:48` noted but
deferred by user decision.

### 3. 404 page "Go to Dashboard" → "Sign in"

`apps/web/app/not-found.tsx:20-25` — replace the primary CTA link
(`/portal/dashboard`, misleading for anonymous users since it bounces to
login) with `/login` labeled "Sign in". Keep secondary "Home" link.

### 4. `/mock-documents` — NO ACTION

Initially flagged as a dead route (404 on `/mock-documents`). Investigation
shows it is a mock PDF server: `app/mock-documents/[fileName]/route.ts`
serves PDFs referenced by portal mock mode (`lib/portal-mock.ts:129,433`).
The 404 for the bare path is expected. Do not delete.

## Out of scope

- Admin/portal internal screens (backend down during audit)
- `/verify` public verifier (not implemented, documented in AGENTS.md)
- `/terms`, `/privacy` MVP placeholders (self-flagged)
- Invite role copy (deferred)

## Verification

- `pnpm --filter web lint`
- Browser spot-check: landing badges clickable → `/download`; 404 page
  shows "Sign in"; `/mock-documents/lease.pdf` still serves PDF.
