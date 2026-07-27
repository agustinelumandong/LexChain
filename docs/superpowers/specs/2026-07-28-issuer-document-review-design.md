# Issuer Document Review Design

## Goal

Give Document Issuers a truthful path from asynchronous OCR through correction, approval, enrichment, and on-chain finalization.

## Experience

The existing upload page remains unchanged. Its successful upload continues to `/portal/upload/processing?id=<documentId>`. The processing page polls the backend document status, shows no invented percentage, and directs a ready document to an issuer-only review route.

`/portal/documents/[id]/review` is a three-region desktop workspace that stacks on narrow screens:

- A flags panel groups `ExtractionFlag` records by severity and selects the related block.
- The main panel shows `ExtractionBlock` records with page, confidence, original OCR text, and editable reviewed text. Saving sends only changed `{ index, text }` entries.
- A facts/actions panel shows engine, pages, confidence, edited count, and status. It offers optional semantic analysis, then an explicit approval confirmation.

Saving is repeatable and does not approve the text. Approval freezes the reviewed text and queues chunking, embedding, and derived analysis. The UI must not claim that indexing, insights, or blockchain anchoring has happened before the backend reports it.

## Lifecycle

1. Upload receives `202`; the processing page polls until the document can be reviewed or fails.
2. Only a Document Issuer can mutate the review workspace; participants retain the existing read-only experience.
3. A failed edit, analysis, approval, or finalization retains the UI state required to retry and displays the backend message.
4. Approval invalidates relevant queries, returns the approved content hash, then returns the issuer to processing while enrichment runs.
5. Existing document details show summary, labels, entities, and risk flags only once returned by `DocumentResponse`; finalization remains a separate explicit action.

## Constraints

- Use generated `ApiSchema` types and existing authenticated portal proxy routes.
- Authorization and lifecycle transitions remain backend-owned; client role checks are UX only.
- Do not manufacture a percentage or classify unknown statuses as completed.
- Keep mock mode contract-faithful for local demonstration.
- Preserve unrelated dirty files. Add no dependencies and do not change the OpenAPI contract.

## Out of Scope

PDF side-by-side rendering, background worker changes, OCR engine configuration, new backend endpoints, and a custom analytics dashboard.
