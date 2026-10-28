# LexChain UI design system

This document records shared typography for the LexChain application UI. The Google Docs agreement body has its own formatting; the document preparation page links to it but does not render it.

## Typeface and scale

Use the global Poppins font configured in `src/app/layout.tsx` and assigned to Tailwind's sans stack in `src/app/globals.css`. Keep the UI to one sans-serif family. Use the existing Tailwind size utilities rather than adding a parallel token layer.

| Role | Size | Utility | Line height | Use |
| --- | ---: | --- | ---: | --- |
| Compact metadata | 12px | `text-xs` | 16px | Status details and dense metadata only |
| Label / secondary UI | 14px | `text-sm` | 20px | Labels, helper text, secondary controls |
| Body | 16px | `text-base` | 24px | Default reading text, form controls, buttons |
| Panel title | 18px | `text-lg` | 24px | Card and panel headings |
| Section title | 20px | `text-xl` | 28px | Subsection headings |
| Page title | 24px | `text-2xl` | 32px | Main heading within an application screen |

Use 16px for readable body copy. Long supporting paragraphs may use 28px leading where the layout benefits from more air. Keep 12px text to glanceable metadata; do not use it for body copy or primary labels.

## Consistency

- Use sentence case for labels and keep the typeface, weight, and size consistent for the same role across screens.
- Prefer `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, and `text-2xl` over arbitrary font sizes.
- Replace existing 10px labels with 12px metadata or 14px labels as their role requires; use 14px instead of 13px for standard labels and 24px instead of 25px for page titles.
- Keep monospace for code and technical identifiers only.

## Shared components

Reuse the browser-safe UI in `src/shared/components/ui/` before adding page-specific copies.

| Need | Shared component | Rule |
| --- | --- | --- |
| Action | `Button`, `InlineButton`, `IconButton`, `ToggleButton` | Use the named variant and size; icon-only actions need an accessible name. |
| Text entry | `Input`, `SearchInput` | Keep a visible label on form fields. `SearchInput` requires an `aria-label`. |
| Selection | `Checkbox`, `Switch` | A checkbox selects an option; a switch changes a setting immediately. Pair checkboxes with a visible label. |
| Surface and status | `Card`, `Badge` | Cards group related content. Badges describe a status or category and are not interactive. |
| Tabular data | `Table`, `DataTable` | `Table` renders loaded rows. `DataTable` adds client-side pagination. Search, filters, sorting, and backend paging stay with the feature that owns the data. |

Shared controls use the existing semantic color variables in `src/app/globals.css`, a 14px control radius, and a 48px default height. Small controls retain at least a 44px target; larger controls use 52px. Inputs and buttons share those heights and the same visible focus color. Cards use an 18px radius. Use `rounded-full` for pills.

Search and filter state belongs to each feature. Compose `SearchInput`, the feature's filter controls, and `DataTable` where they are needed; do not add search or filter state to a universal table component.

## Scope

These rules apply to LexChain's application interface. They do not define the font or size of contracts drafted in Google Docs or the finalized PDF. The standalone `public/offline.html` fallback keeps a system font so it remains self-contained offline. The shared app font is defined in `src/app/globals.css`; the document workspace uses these utilities in `src/features/documents/components/document-workspace.tsx` and `src/features/documents/components/google-draft-panel.tsx`.
