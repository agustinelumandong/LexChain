# Portal Upload Compact Layout Design

## Goal

Reduce unused desktop whitespace on `/portal/upload` without turning the upload
flow into a modal or changing how upload works.

## Chosen approach

Keep the existing dedicated page and make its three existing sections
responsive:

- Use the available portal width up to the same `max-w-5xl` convention already
  used by other portal workspaces.
- Keep the heading and three-step indicator across the full width.
- At the desktop breakpoint, place **Select PDF** and **Document information**
  side by side in two equal columns.
- Keep **Confirm and process** below both columns across the full width.
- Preserve the current single-column order on small screens.
- Slightly reduce oversized drop-zone padding on small screens while retaining
  a comfortable desktop target.

## Alternatives rejected

- **Modal:** reduces available space, makes long validation and processing
  states harder to manage, and risks accidental dismissal.
- **Multi-step wizard:** hides information that currently fits on one page and
  adds navigation state without improving the upload requirements.

## Behavior and boundaries

- Reuse the existing `UploadPage` component and its three semantic sections.
- Do not add components, dependencies, routes, APIs, persistence, or state.
- Do not change file validation, required metadata, role access, submission, or
  the processing-status handoff.
- Keep the success and access-denied states intentionally narrow because they
  contain short messages rather than the full upload form.

## Accessibility and responsive behavior

- DOM order remains Select PDF, Document information, then Confirm and process.
- Existing headings, labels, alerts, focus behavior, and disabled submit state
  remain unchanged.
- The layout stacks at smaller widths and becomes two columns only at the
  desktop breakpoint.

## Verification

- Add one focused source-level layout assertion that fails while the form is
  still capped at `max-w-xl` and lacks the desktop two-column wrapper.
- Run the focused upload-page test first, then the full web tests, lint, and
  production build.
- Check the page in desktop and mobile browser viewports using mock mode.
