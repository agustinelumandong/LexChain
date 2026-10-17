# Owned and shared documents, with accurate lifecycle and processing states

## Status

Design approved by the product owner on 2026-10-17. This revision clarifies dashboard lifecycle and finalized-failure wording, plus portal-shell status behavior discovered during plan preparation, and is pending product-owner review. Implementation is not yet approved.

## Problem

The document directory currently mixes records the user owns with records shared to them. Its cards and document screens also show processing status before the document is finalized. The library's Ready for Review summary does not count the canonical `AWAITING_REVIEW` status. The upload processing route treats every `FAILED` status as a reason to upload again, even though processing can fail after successful finalization.

## Goals

- Separate owned and shared records using the backend-provided `is_owner` field.
- Keep list controls and library summaries consistent with the active ownership tab.
- Show lifecycle and processing as distinct concepts, and display processing only after finalization.
- Describe `FINALIZED` plus `FAILED` as a processing failure on a finalized document.
- Keep existing role-based entry actions and backend-owned permissions unchanged.
- Cover mixed ownership and lifecycle/status combinations in deterministic UI and browser tests.

## User-visible behavior

### Document directory

The directory presents **My documents** and **Shared with me** tabs. Both use the `is_owner` value returned by the existing documents endpoint. Lawyers default to My documents; clients default to Shared with me. Switching tabs resets pagination and shows the selected partition's documents.

Search, lifecycle and date filters, sorting, and pagination operate on the selected partition. The lifecycle filter options, lifecycle distribution, total/finalized/review/failed summary cards, and Recently Created list are also derived from that partition. Tab counts show the unfiltered number of records in each ownership partition. Filtered results have an ownership-specific empty state; existing loading, request-error, retry, and overall empty states remain available. Desktop and mobile views render the same paginated result set.

The canonical `AWAITING_REVIEW` processing status is included in Ready for Review. Existing aliases may remain supported for compatibility, but cannot substitute for the canonical status. Processing-based summary counts, including Ready for Review and Failed, count finalized records only.

### Dashboard

The dashboard keeps its current layout and has no second ownership-tab control. Existing recent, attention, and processing document cards are lawyer-only; those cards use owned records from `is_owner`. The client's current welcome panel remains unchanged and no shared-document cards are added to it. Dashboard cards must not treat a non-finalized record's status as processing state.

### Lifecycle and processing

Lifecycle remains visible regardless of stage. Processing badges, rows, and counts are omitted unless lifecycle is `FINALIZED`. This applies to directory cards and rows, dashboard document cards, portal-shell processing count, document detail, workspace overview, signed-upload result, and upload processing screen. Dashboard document cards show lifecycle even while pre-finalized. `PREPARING`, `READY_FOR_SIGNATURE`, and `SIGNED` do not display OCR/processing state even if the response contains a status value. On the upload processing screen, a non-finalized record shows its lifecycle and that OCR processing waits for finalization; polling may continue so the screen can transition after finalization.

When a finalized document has status `FAILED`, the UI labels it **Processing failed** while retaining finalized lifecycle context. The upload processing route links to the existing document for inspection and does not offer a reupload or refinalization action. A finalized record still waiting on or completing processing uses its current lifecycle and normal processing state. Existing backend lifecycle actions, lawyer-only entry controls, and client navigation remain governed by their current role and backend contracts. `is_owner` is used only to partition lists; it does not grant or infer document-action permissions.

## Data and architecture

- Continue using the existing documents and profile queries and the backend `is_owner`, `lifecycle`, and `status` fields; do not add an endpoint or backend state.
- Keep ownership partitioning in the document library's current feature flow and reuse its search/sort/filter helpers.
- Keep lifecycle presentation separate from processing presentation. Any shared status helper used for document processing must not alter extraction/review status semantics in the review workspace.
- Preserve existing routes, API request behavior, React Query keys, action permissions, and error contracts.

## Error and empty states

- Preserve the existing document query loading, failure, and retry behavior.
- Distinguish a genuinely empty ownership tab from a partition with records that do not match the active filters.
- If a finalized processing lookup fails, retain the existing status-query error and retry behavior. A known finalized `FAILED` result links to the document rather than upload.
- Do not infer ownership or permissions when backend fields are absent; use only the declared response values and the existing profile role mapping for defaults.

## Verification

Focused component tests cover:

- Mixed owned/shared records, role-specific initial tabs, switching tabs, and per-tab search, lifecycle/date filters, sort, and pagination.
- Tab counts and library summary/distribution/recent items scoped to the active partition.
- Canonical `AWAITING_REVIEW`, with compatibility aliases tested only if retained.
- Processing status hidden for `PREPARING`, `READY_FOR_SIGNATURE`, and `SIGNED`, and shown for `FINALIZED`.
- Portal-shell processing count excludes non-finalized records even when their response has a processing-like status.
- `FINALIZED` plus `FAILED` wording and recovery link without an upload/refinalize action.
- The exact **Processing failed** label is used for finalized failure in document processing contexts; review-workspace extraction labels retain their existing meaning.
- Existing lawyer dashboard cards scoped to owned records; the client welcome panel remains unchanged.
- Existing loading, error, filtered-empty, and empty-partition behavior.

A deterministic Playwright browser check with backend-shaped fixtures exercises a lawyer and client against mixed ownership and lifecycle/status combinations. It verifies the visible tabs, role defaults, filters, summary scope, lifecycle visibility, processing-status gating, and finalized processing-failure recovery. This is frontend browser evidence, not proof of live backend behavior.

Run the focused Vitest files, the browser check, and repository typecheck/lint/build checks as detailed in the approved implementation plan. Report mocked/browser evidence separately from live backend verification.

## Out of scope

- Backend persistence, response changes, authorization, lifecycle transitions, OCR repair, or blockchain behavior.
- New document-action permissions or use of `is_owner` as an authorization decision.
- A new dashboard tab control, new dashboard layout, new list endpoint, or speculative role behavior.
- Reuploading or refinalizing a finalized document to recover from a processing failure.
- Unrelated document UX changes or changes to extraction/review status behavior.

## Decisions and assumptions

1. Existing lawyer dashboard cards use owned records because the dashboard has no active ownership tab; the client dashboard remains the existing welcome panel.
2. Library summaries use the active tab's full ownership partition, not only the filtered or paginated results. Tab counts remain unfiltered so the user can see how many records are in each partition.
3. Document lifecycle is authoritative for whether processing status may be shown; a non-null status alone does not establish that processing has begun.
4. A finalized `FAILED` processing result is recoverable by viewing the existing record. This frontend does not introduce a processing retry operation absent from the contract.
