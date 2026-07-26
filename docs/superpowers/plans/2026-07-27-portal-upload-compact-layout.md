# Portal Upload Compact Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the existing upload page's desktop space efficiently while preserving its stacked mobile flow and all upload behavior.

**Architecture:** Change only Tailwind utility classes in the existing `UploadPage`. A responsive wrapper places the PDF and metadata sections in two columns at `lg`, while the header, steps, and confirmation section remain full width.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, Testing Library

## Global Constraints

- Keep `/portal/upload` as a dedicated page; do not introduce a modal or wizard.
- Reuse the existing component, sections, state, validation, submission, and processing handoff.
- Use the existing `max-w-5xl` portal workspace convention.
- Preserve DOM order, labels, alerts, focus behavior, and mobile stacking.
- Add no components, dependencies, routes, APIs, persistence, or state.

---

### Task 1: Compact the responsive upload layout

**Files:**
- Modify: `apps/web/app/portal/upload/page.tsx`
- Test: `apps/web/app/portal/upload/page.test.tsx`

**Interfaces:**
- Consumes: the existing `UploadPage` component and its Select PDF, Document information, and Confirm and process sections
- Produces: the same `UploadPage` behavior with `max-w-5xl` width and a `lg:grid-cols-2` responsive wrapper

- [x] **Step 1: Record the failing desktop browser behavior**

Run the current page in mock mode at a desktop viewport. Measure the bounding boxes of the regions named Select PDF, Document information, and Confirm and process.

```text
RED when Select PDF and Document information have different top coordinates at desktop width and the form remains narrowly capped.
```

- [x] **Step 2: Run the existing focused tests before implementation**

Run:

```bash
pnpm --filter @lexchain/web test -- app/portal/upload/page.test.tsx
```

Expected: all existing upload behavior tests pass; the browser observation from Step 1 remains the failing layout requirement.

- [x] **Step 3: Apply the minimal responsive classes**

In `UploadPage`:

- Replace the form container's `max-w-xl` with `w-full max-w-5xl`.
- Wrap Select PDF and Document information in `div className="grid gap-5 lg:grid-cols-2"`.
- Keep Confirm and process as a direct child of the page container.
- Change the drop zone from fixed `p-8` to `p-6 sm:p-8`.
- Do not change event handlers, data fetching, mutation behavior, validation, or copy.

- [x] **Step 4: Verify GREEN in desktop and mobile browsers**

At desktop width, measure that Select PDF and Document information have the same top coordinate and Confirm and process begins below both cards. At mobile width, measure that all three cards have increasing top coordinates and no horizontal overflow.

- [x] **Step 5: Run the focused upload tests**

Run:

```bash
pnpm --filter @lexchain/web test -- app/portal/upload/page.test.tsx
```

Expected: all focused upload-page tests pass.

- [x] **Step 6: Verify the web workspace**

Run:

```bash
pnpm --filter @lexchain/web test
pnpm --filter @lexchain/web lint
pnpm --filter @lexchain/web build
```

Expected: all tests, lint, TypeScript, and production build pass.

- [x] **Step 7: Commit the implementation**

```bash
git add apps/web/app/portal/upload/page.tsx apps/web/app/portal/upload/page.test.tsx docs/superpowers/plans/2026-07-27-portal-upload-compact-layout.md
git commit -m "fix(web): compact upload page layout"
```
