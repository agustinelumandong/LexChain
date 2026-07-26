# LexChain Backend Target Handoff

**Status:** Backend requirements for productionizing the approved target UI/UX

**Audience:** FastAPI/backend developers, database developers, and integrators

**Related documents:**

- `docs/LEXCHAIN-DRAWIO-TARGET-SYSTEM-DESIGN.md`
- `docs/LEXCHAIN-TARGET-SYSTEM-ARCHITECTURE.md`
- `docs/superpowers/plans/2026-07-26-drawio-target-gap-closure.md`
- `openapi-updated.json`

## 1. Purpose

The frontend can demonstrate the target flows with contract-shaped mock data.
This document defines what the backend must provide before those flows are
production-ready, and what can safely wait.

The FastAPI source code and database migrations are not in this checkout.
Backend implementers must first inspect the actual backend repository and its
local instructions before selecting files or writing migrations.

This handoff documents requirements only. No backend implementation, database,
OpenAPI contract, or generated type was changed by the two-actor portal work.
The two registered actors are Document Issuer and Document Participant.
Super Admin is a Document Issuer capability level, while anonymous verification
is a public feature rather than a registered actor.

## 2. Required Backend Updates

These are required to match the approved target system.

### 2.1 Correct the existing contract drift

Update `openapi-updated.json` and the real FastAPI operation so
`POST /documents/upload` explicitly declares the already-used query parameters:

```text
book_id: UUID, required
file_name: string, required
file: binary PDF, required
```

Add lifecycle fields to document responses:

```text
lifecycle: draft | finalized | restored
document_hash: string | null
content_hash: string | null
finalized_at: date-time | null
finalized_by: UUID | null
anchor_status: pending | confirmed | failed | null
```

Correct the ERD before migration so `document_parties.email` appears once.

### 2.2 Password recovery

Required endpoints:

```text
POST /auth/password/forgot
POST /auth/password/reset
```

Required behavior:

- accept an email and always return the same 202 response;
- do not reveal whether an account exists;
- use the existing identity provider's reset-token mechanism;
- use short-lived, single-use reset tokens;
- validate password strength server-side;
- invalidate the token after successful reset;
- rate-limit both endpoints;
- never log passwords or reset tokens;
- record a security/system audit event without sensitive values.

Minimum request shapes:

```json
{"email":"user@example.com"}
```

```json
{"token":"opaque-reset-token","new_password":"StrongPass123!"}
```

### 2.3 Atomic document finalization

Required endpoint:

```text
POST /documents/{document_id}/finalize
```

Required behavior:

1. Require an authenticated `lawyer` who owns the document.
2. Require completed OCR/extraction and insights.
3. Compute the canonical document/content hash on the backend.
4. Insert one `document_snapshots` row containing extracted text and `text_hash`.
5. Set `documents.lifecycle`, `document_hash`, `content_hash`,
   `finalized_at`, and `finalized_by`.
6. Append a `document_audit_logs` entry.
7. Attempt the existing blockchain anchoring operation.
8. Return the final lifecycle and anchor result.

The database state change must be transactional. The endpoint must be
idempotent: repeated calls return the same finalization snapshot and must not
create duplicate snapshots or audit success events.

If blockchain anchoring fails, preserve the finalized document and snapshot,
return `anchor_status: failed`, and allow an explicit retry through the same
idempotent operation.

Minimum response:

```json
{
  "document_id": "uuid",
  "document_hash": "hex-hash",
  "snapshot_id": "uuid",
  "lifecycle": "finalized",
  "finalized_at": "2026-07-26T00:00:00Z",
  "anchor_status": "confirmed",
  "transaction_hash": "0xhash"
}
```

### 2.4 Snapshot listing and restoration

Required endpoints:

```text
GET  /documents/{document_id}/snapshots
POST /documents/{document_id}/snapshots/{snapshot_id}/restore
```

Snapshot lists must return metadata and `text_hash`, not raw extracted text.

Restore must:

- require the owning lawyer;
- require a non-empty reason;
- load the snapshot using both document ID and snapshot ID;
- recompute and securely compare its text hash;
- reject a corrupted snapshot;
- create a new `document_extraction` history record;
- refresh dependent insight/chunk state using the existing processing path;
- set document lifecycle to `restored`;
- preserve the original PDF and snapshot;
- append actor, reason, source snapshot, and result to `document_audit_logs`.

Restoration means restoring verified extracted text. It must not claim to
replace or reconstruct the original PDF.

### 2.5 Integrity verification response

Keep the existing endpoint:

```text
GET /blockchain/verify/{document_id}
```

It must return enough information for the UI to distinguish:

```text
match
mismatch
not_recorded
unavailable
```

Required fields:

```json
{
  "status": "match",
  "current_hash": "hex-hash",
  "expected_hash": "hex-hash",
  "can_restore": false,
  "latest_snapshot_id": "uuid-or-null"
}
```

Only a mismatch with a valid snapshot should set `can_restore: true`.

### 2.6 Document Issuer — Super Admin user management

Required endpoint:

```text
PATCH /admin/users/{user_id}
```

Allowed fields:

```text
f_name
l_name
email
role: user | lawyer | admin
is_active
```

Required behavior:

- require the backend `admin` role that grants a Document Issuer Super Admin
  capabilities;
- PATCH only fields included in the request;
- validate email format and uniqueness;
- validate allowed role values;
- prevent suspension or demotion of the last active admin;
- prevent unauthorized self-escalation paths;
- return the updated user;
- append a `system_audit_logs` entry containing actor, target, changed field
  names, and result, but not secrets.

### 2.7 Fixed reports

Required endpoint:

```text
GET /reports/{report_type}?from={YYYY-MM-DD}&to={YYYY-MM-DD}
```

Required report types:

```text
office-document-activity
office-integrity
system-users
system-audit
```

Required authorization:

- lawyer: office reports scoped to documents they own;
- Document Issuer with the backend `admin` role: system reports;
- participant: denied.

Required response:

```json
{
  "report_type": "office-document-activity",
  "from": "2026-01-01",
  "to": "2026-12-31",
  "columns": ["document_id", "file_name", "status", "created_at"],
  "rows": []
}
```

Reports must query existing target tables synchronously. Do not add a reports
table, scheduler, report history, or generic query builder.

### 2.8 Authorization and audit requirements

Backend authorization is authoritative:

| Operation | Document Issuer (lawyer role) | Document Participant | Document Issuer (Super Admin capability) |
|---|---:|---:|---:|
| Finalize owned document | Yes | No | No |
| Restore owned document | Yes | No | No |
| View shared document | If authorized | Yes, if shared | No implicit ownership |
| Manage user accounts | No | No | Yes |
| Office reports | Yes, owned data | No | No |
| System reports | No | No | Yes |

The Document Issuer actor is a product grouping. The backend must preserve the
separate `lawyer` and `admin` permission sets; Super Admin capabilities do not
grant document ownership, and standard issuer access does not grant management
authority.

Write document actions to `document_audit_logs` and administrative/security
actions to `system_audit_logs`.

## 3. Required OpenAPI Work

After the backend operations are implemented:

1. Update `openapi-updated.json` with the exact requests, responses,
   authentication, validation failures, and operation IDs.
2. Run:

```bash
pnpm run generate:api-types
pnpm --filter @lexchain/types exec tsc --noEmit
```

3. Confirm `packages/types/src/generated/schema.ts` has no manual edits.
4. Run the black-box suite:

```bash
API_URL=http://localhost:8000 pytest tests/test_api_endpoints.py -v
```

## 4. Required Acceptance Scenarios

The backend is ready only when these pass:

1. Known and unknown password-recovery emails receive indistinguishable
   responses.
2. A reset token is single-use and expiry is enforced.
3. A completed owned document finalizes successfully.
4. Repeating finalization returns the same snapshot.
5. Finalization creates hash, snapshot, lifecycle, audit, and anchor result.
6. Anchor failure preserves finalized data and can be retried safely.
7. Snapshot restore rejects corrupted hashes.
8. Restore preserves the snapshot and original PDF while creating history.
9. Participant and non-owner lifecycle operations are denied.
10. A Document Issuer with Super Admin capabilities can edit, suspend, and
    reactivate an allowed user.
11. A standard Document Issuer cannot call Super Admin user mutations.
12. The last active admin cannot be suspended or demoted.
13. Office reports contain only the requesting lawyer's data.
14. System reports require Document Issuer Super Admin capabilities.
15. Invalid report types and date ranges are rejected.

## 5. Nice to Have Later

These are useful only after the required flows work and a real need appears.

### 5.1 Background anchor retry

Add a small retry worker only if manual/idempotent retry produces operational
problems. Do not add a general event bus.

### 5.2 Email delivery observability

Track provider delivery status and alerts if password-reset or invitation
delivery failures cannot be diagnosed from current logs.

### 5.3 Snapshot pagination

Add cursor pagination only when real documents accumulate enough snapshots to
make the current list slow or difficult to use.

### 5.4 Server-generated CSV or PDF

Keep browser CSV first. Add server-generated exports only if users need large
reports, signed reports, or consistent printable formatting.

### 5.5 Report query optimization

Add indexes or cached aggregates only after measured report queries exceed an
agreed response-time target.

### 5.6 Additional audit retention controls

Add archival or retention automation only when a legal, institutional, or
storage requirement is approved.

## 6. Not Needed

Do not add these for the approved target:

- microservices;
- service mesh;
- event-sourcing framework;
- generic workflow engine;
- generic role/permission engine;
- report builder;
- report scheduler;
- generated-report database table;
- analytics warehouse;
- second document-version system;
- a new blockchain abstraction when the existing adapter works;
- real-time collaboration;
- billing or payments.

## 7. Backend Definition of Done

Backend target work is complete when:

- every required endpoint is implemented and documented;
- role and ownership authorization is enforced server-side;
- finalization and restoration preserve data and audit history;
- password recovery is account-safe and rate-limited;
- Super Admin mutations protect the last active backend `admin` account;
- fixed reports are correctly scoped;
- generated TypeScript types compile;
- backend-native tests and `tests/test_api_endpoints.py` pass; and
- the UI can replace mock responses without changing its visible workflow.
