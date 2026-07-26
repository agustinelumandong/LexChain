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

- [ ] **Step 1: Write the failing layout test**

Add a test that reads the rendered elements and asserts that the page container uses `max-w-5xl`, the Select PDF and Document information sections share a wrapper with `lg:grid-cols-2`, and Confirm and process remains outside that two-column wrapper:

```tsx
it('uses a compact two-column desktop layout while keeping confirmation full width', () => {
  const { container } = render(<UploadPage />);
  const page = container.firstElementChild as HTMLElement;
  const selectSection = screen.getByRole('region', { name: 'Select PDF' });
  const informationSection = screen.getByRole('region', { name: 'Document information' });
  const confirmationSection = screen.getByRole('region', { name: 'Confirm and process' });

  expect(page.className).toContain('max-w-5xl');
  expect(selectSection.parentElement).toBe(informationSection.parentElement);
  expect(selectSection.parentElement?.className).toContain('lg:grid-cols-2');
  expect(confirmationSection.parentElement).toBe(page);
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```bash
pnpm --filter @lexchain/web test -- app/portal/upload/page.test.tsx
```

Expected: FAIL because the page still uses `max-w-xl` and the two input sections do not share a responsive grid wrapper.

- [ ] **Step 3: Apply the minimal responsive classes**

In `UploadPage`:

- Replace the form container's `max-w-xl` with `w-full max-w-5xl`.
- Wrap Select PDF and Document information in `div className="grid gap-5 lg:grid-cols-2"`.
- Keep Confirm and process as a direct child of the page container.
- Change the drop zone from fixed `p-8` to `p-6 sm:p-8`.
- Do not change event handlers, data fetching, mutation behavior, validation, or copy.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run:

```bash
pnpm --filter @lexchain/web test -- app/portal/upload/page.test.tsx
```

Expected: all focused upload-page tests pass.

- [ ] **Step 5: Verify the web workspace**

Run:

```bash
pnpm --filter @lexchain/web test
pnpm --filter @lexchain/web lint
pnpm --filter @lexchain/web build
```

Expected: all tests, lint, TypeScript, and production build pass.

- [ ] **Step 6: Check the responsive result in mock mode**

At desktop width, verify the PDF and metadata cards are side by side and confirmation spans beneath them. At mobile width, verify all three sections remain stacked in their original order without horizontal overflow.

- [ ] **Step 7: Commit the implementation**

```bash
git add apps/web/app/portal/upload/page.tsx apps/web/app/portal/upload/page.test.tsx docs/superpowers/plans/2026-07-27-portal-upload-compact-layout.md
git commit -m "fix(web): compact upload page layout"
```
