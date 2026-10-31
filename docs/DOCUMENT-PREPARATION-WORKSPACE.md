# Document Preparation Workspace

**Status:** Proposed product direction. The workspace described here is not implemented.

## Main idea

Make LexChain the primary place to prepare and review legal documents. For fixed forms such as the LRA Deed of Absolute Sale, show a page-accurate PDF preview, keep approved wording and layout locked, and allow editing only in defined fields. Parties review in LexChain, leave comments or request corrections, and see those items resolved by the lawyer. This is a controlled legal-form workflow, not a general-purpose word processor.

## Fit with the current system

Today, a Google Doc can serve as the editable working draft. LexChain syncs its comments and treats that draft as separate from the signed PDF. The proposed workspace becomes the main user experience; keep Google draft and comment sync for existing records and staff work, with direct Google Docs access as an optional lawyer action.

## Lifecycle boundary

Use the existing backend-owned document permissions and lifecycle: `PREPARING` ↔ `READY_FOR_SIGNATURE` → `SIGNED` → `FINALIZED`. The structured fields, locked-template rendering, and in-app correction requests need their own API and data design; this note does not define endpoints or claim those capabilities exist. After finalization, the signed PDF is immutable. Any later correction needs a separately designed amendment or version flow.

## Current implementation references

- [Google draft panel](../src/features/documents/components/google-draft-panel.tsx) exposes the editable draft separately from the signed PDF.
- [Document workspace](../src/features/documents/components/document-workspace.tsx) reads and syncs Google draft comments and supports readiness actions.
- [Lifecycle API](../src/features/documents/document-lifecycle-api.ts) exposes comment listing/sync and mark-ready operations.
- [User-flow architecture](USER-FLOW-ARCHITECTURE.md) maps the current draft, comment, signed-copy, and finalization flow.
- Backend lifecycle source: `lexchain-backend/backend/app/features/documents/constants.py` and `lifecycle.py`.
