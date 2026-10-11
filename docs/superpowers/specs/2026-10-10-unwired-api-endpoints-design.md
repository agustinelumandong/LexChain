# Unwired API endpoints frontend design

## Goal

Integrate the six API operations that currently have no clear frontend caller into useful existing LexChain workflows. Implement the operations sequentially, using the OpenAPI document supplied by the user as the contract source.

## Scope and boundaries

This work changes the LexChain frontend only. The backend remains authoritative for data, permissions, lifecycle rules, and Google access. Do not call the backend directly from browser code or duplicate backend rules in the frontend.

Before starting each endpoint, confirm that its path and method are present in the supplied OpenAPI document and use that document's request and response schemas:

If an operation is absent from the supplied OpenAPI document, defer that operation. Backend source and deployment confirmation are outside this frontend plan.

Browser requests use the existing same-origin portal proxy. The proxy keeps the portal token server-side and supports the required HTTP methods. Use the generated API types and existing feature-owned API/query patterns. Preserve backend response and error behavior, and show loading, empty, and error states where applicable. Mutations must refresh affected document or account state.

## User-facing behavior

### 1. Document lifecycle history — `GET /documents/{document_id}/history`

Add a History tab to the document workspace that displays lifecycle changes returned by the backend. Keep it distinct from audit Activity. Audit Activity stays hidden until its own backend operation is confirmed. History is read-only.

### 2. Search within one document — `POST /documents/{document_id}/search`

Add a Search tab to the document workspace. It returns passages from the selected document. Keep this separate from Ask, which is a distinct feature and operation.

### 3. Find an existing user by email — `GET /users/search`

Add an explicit “Find account” action to the participant invitation form. Show a returned user match. A not-found response must not block sending an invitation to that email. Do not search on every keystroke.

### 4. Correct a register entry — `PATCH /documents/{document_id}/entry`

When the backend reports `can_correct_entry`, allow correction of book, document number, and page number before finalization. Require document number and page number; the book defaults to the current book when omitted by the API contract.

### 5. Cancel an unsigned document — `POST /documents/{document_id}/cancel`

When the backend reports `can_cancel`, offer cancellation only for eligible documents. Ask for confirmation before submitting. Cancellation retains the document record; refresh the document state and show its cancelled status afterward.

### 6. Disconnect Google — `DELETE /google/connection`

In Account Details, show disconnect only to a lawyer with a connected Google account. Explain that LexChain access is revoked while existing drafts remain in Google Drive. Ask for confirmation, then refresh the connection status.

## Implementation sequence

Implement one endpoint at a time in the order above. Check the supplied OpenAPI document before beginning each feature. Complete and review that feature before moving to the next one. Do not substitute a different operation when one is absent from the contract.

## Out of scope

- Backend implementation or deployment changes.
- Audit-event history or restoring the hidden Activity view.
- Replacing global search or the Ask feature.
- Live API operation calls or automated test execution during planning.

## Contract reference

The user supplied `https://7680-143-44-185-113.ngrok-free.app/docs`; its OpenAPI document is available at `/openapi.json`. On 2026-10-11, all six operations were present and their OpenAPI request/response schemas were used as the contract. Backend source and deployed-version checks are outside this plan. If the documentation URL changes, use its replacement OpenAPI document as the contract source.
