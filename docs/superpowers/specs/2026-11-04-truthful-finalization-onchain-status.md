# Truthful finalization and on-chain status specification

**Issue:** [#158 Investigate truthful finalization and on-chain status wording](https://github.com/agustinelumandong/LexChain/issues/158)  
**Downstream dependencies:**
- [#159 Clarify finalization confirmation and outcome feedback](https://github.com/agustinelumandong/LexChain/issues/159)
- [#160 Explain document verification results in plain language](https://github.com/agustinelumandong/LexChain/issues/160)
- [#171 Clarify blockchain record details and explorer link](https://github.com/agustinelumandong/LexChain/issues/171)

---

## 1. Executive Summary

An audit of the document finalization and verification workflows revealed that an uncertain-finalization recheck could falsely report an on-chain anchored outcome upon encountering a `FINALIZED` lifecycle state, even when on-chain recording was pending or unconfirmed.

This investigation traces the authoritative backend contract (`openapi-updated.json`), database models, and frontend callers across the document lifecycle. It defines the exact boundaries between what current evidence can establish versus what is unsupported inference, resolves the misleading toast notification in the frontend reconciliation flow, identifies backend contract gaps as separately scoped dependencies, and sets verified acceptance conditions for downstream issues #159, #160, and #171.

---

## 2. Evidence and Contract Trace

### 2.1 Backend Contract Endpoints and Schemas

#### 1. `POST /documents/{document_id}/finalize`
- **Preconditions:** Allowed only from lifecycle `SIGNED`, restricted to the authorized document owner with permission `can_finalize: true`.
- **Response Schema:** `RecordResponse`
  ```json
  {
    "document_id": "uuid",
    "tx_hash": "string (transaction hash on the blockchain)",
    "onchain_document_id": "string (document ID stored on-chain)",
    "data_hash": "string (SHA-256 hash stored on-chain)"
  }
  ```
- **Error Codes:**
  - `401`: Missing or invalid authentication token.
  - `403`: Forbidden — only the document owner may finalize.
  - `404`: Document not found.
  - `409`: Conflict — document is not `SIGNED`, or stored file no longer matches upload.
  - `422`: Validation error.
- **Contract Boundary:** The backend does not document an idempotency key or safe retry mechanism for `finalize`. A network timeout or lost response cannot be automatically retried with another `POST`.

#### 2. `GET /documents/{document_id}`
- **Response Schema:** `DocumentResponse`
  - `lifecycle`: `'PREPARING' | 'READY_FOR_SIGNATURE' | 'SIGNED' | 'FINALIZED' | 'CANCELLED'`
  - `status`: Processing status (e.g. `'QUEUED'`, `'PROCESSING'`, `'AWAITING_REVIEW'`, `'COMPLETED'`, `'FAILED'`; `null` before finalization).
  - `on_chain`: `boolean` ("Check if document is already recorded on-chain or not").
  - `document_hash`: `string | null` ("SHA-256 of the current signed copy. This is the value anchored on-chain at finalize, so it is what verification compares against.").
  - `finalized_at`: `string | null` (timestamp).
  - `finalized_by`: `string | null` (user UUID).
  - `permissions`: `DocumentPermissions`.
- **Crucial Absence in `DocumentResponse`:**
  - `tx_hash` is **NOT** present in `DocumentResponse`.
  - `onchain_document_id` is **NOT** present in `DocumentResponse`.
  - Network provider details are **NOT** present in `DocumentResponse`.

#### 3. `GET /documents/{document_id}/verify`
- **Response Schema:** `DocumentVerificationResponse`
  - `status`: `'AUTHENTIC' | 'TAMPERED' | 'SNAPSHOT_COMPROMISED' | 'NOT_ANCHORED' | 'VERIFICATION_UNAVAILABLE'`
  - `is_authentic`: `boolean`
  - `baseline_trusted`: `boolean`
  - `onchain_hash`: `string | null`
  - `snapshot_hash`: `string | null`
  - `current_hash`: `string | null`
  - `tx_hash`: `string | null`
  - `onchain_timestamp`: `string | null`
  - `verified_at`: `string`
  - `message`: `string`

---

## 3. Supported vs. Unsupported Conclusions

| Conclusion / Claim | Supported By | Unsupported / False If Inferred From |
| :--- | :--- | :--- |
| **Document is finalized (immutable signed copy)** | `DocumentResponse.lifecycle === 'FINALIZED'` | Any state before `FINALIZED` (e.g. `SIGNED`, `READY_FOR_SIGNATURE`). |
| **Document is recorded on-chain** | `DocumentResponse.on_chain === true` OR `DocumentVerificationResponse.is_authentic === true` with verified anchor | `DocumentResponse.lifecycle === 'FINALIZED'` alone while `on_chain === false` or unconfirmed. |
| **Transaction ID / Hash** | `RecordResponse.tx_hash` (returned from `POST .../finalize`) OR `DocumentVerificationResponse.tx_hash` | `DocumentResponse` (which does not contain `tx_hash`). |
| **Blockchain Record ID** | `RecordResponse.onchain_document_id` (from `POST .../finalize`) | `DocumentResponse` (absent from schema). |
| **Base Sepolia Explorer Link** | `tx_hash` matching a valid transaction hash formatted as `0x<hex>` via client-configured `getBaseSepoliaTransactionUrl` | Assuming a network link when `tx_hash` is null, empty, or during mock mode. |
| **Cryptographic Authenticity** | `DocumentVerificationResponse.status === 'AUTHENTIC'` | Lifecycle state, `on_chain` boolean, or processing completion alone. |
| **Legal Validity** | Legal counsel and governing jurisdiction | Cryptographic hash match or blockchain anchor alone (a tamper-free hash match verifies bitwise integrity, not contract legality). |
| **Finalization Retry Safety** | Explicit backend contract with idempotency key (currently unsupported) | A `GET` returning `SIGNED` after a timeout (an in-flight finalization transaction may still commit; repeating `POST` risks duplicate submission or `409` conflict). |

---

## 4. Frontend Recheck Resolution

### Root Cause
In `src/features/documents/pages/documents-id-page.tsx`, when a timeout or transport error occurred during finalization, the frontend correctly locked the `Finalize` action and stored `portal-finalize-unknown:${id}` in `sessionStorage` to prevent blind retries.

However, when the user clicked **Check status** (`checkFinalizationMutation`), the query reconciled document state using `GET /documents/${id}`. If `updatedDocument.lifecycle === 'FINALIZED'`, the notification unconditionally triggered:
```ts
toast.success('Document finalized and anchored on-chain.');
```
This conflated document finalization with confirmed on-chain recording. If `updatedDocument.on_chain` was `false`, claiming "anchored on-chain" was false.

### Verified Remediation
In `checkFinalizationMutation.onSuccess`:
1. Check `updatedDocument.on_chain`:
   - If `mockMode`: Display synthetic demo notice (`'Demo document status confirmed. Synthetic demo data only; no real PDF digest or blockchain transaction was produced.'`).
   - If `updatedDocument.on_chain === true`: Announce `'Document finalized and recorded on-chain.'` with action `'View blockchain record →'`.
   - If `updatedDocument.on_chain === false`: Announce `'Document finalization confirmed.'` with action `'View record status →'`.
2. Do not invent absent transaction fields or explorer URLs.
3. Keep the unknown outcome latch locked if the status check is inconclusive (`lifecycle !== 'FINALIZED'`), preserving no-automatic-retry protection.

---

## 5. Separately Scoped Backend Gaps

The following requirements cannot be fulfilled by frontend changes alone and are designated as backend dependencies:

1. **`DocumentResponse` lacks transaction and onchain identifiers:**
   - *Current state:* If finalization is reconciled after a network timeout via `GET /documents/{id}`, the client receives `lifecycle: 'FINALIZED'` and `on_chain: true`, but cannot display `tx_hash` or `onchain_document_id` without invoking `GET /documents/{id}/verify`.
   - *Backend dependency:* Add optional fields `tx_hash?: string | null` and `onchain_document_id?: string | null` to `DocumentResponse`.

2. **Idempotency and Retry Guarantees on Finalize:**
   - *Current state:* `POST /documents/{id}/finalize` has no idempotency key support (`Idempotency-Key` header) and rejects duplicate attempts with `409 Conflict`.
   - *Backend dependency:* Support safe retries via idempotency key or return existing `RecordResponse` on duplicate submission of already-finalized records.

3. **Backend Network Metadata:**
   - *Current state:* The frontend hardcodes Base Sepolia explorer URLs (`https://sepolia.basescan.org/tx/0x...`). The backend does not expose the chain identifier, network name, or explorer template in its API schemas.
   - *Backend dependency:* Expose blockchain network configuration via `/office/settings` or document metadata if multi-chain or mainnet deployments are introduced.

---

## 6. Acceptance Conditions for Downstream UI Work

### Downstream Issue #159 (Clarify finalization confirmation and outcome feedback)
- **Confirmation dialog:** Explain clearly: *"This freezes the signed copy and records its fingerprint on the blockchain. It cannot be undone."* Reaffirm that finalization locks the current PDF file and initiates background OCR/processing.
- **Pending state:** Explain that the request is awaiting blockchain confirmation. Keep the submission button disabled to prevent duplicate submissions.
- **Success state:** Display the returned `RecordResponse` data (IDs and hashes) without deriving missing fields.
- **Unknown outcome banner:** Preserve the `sessionStorage` latch upon timeout/network failure. Offer **Check status** without automatic resubmission.
- **Reconciliation feedback:** Use verified status copy: announce on-chain recording only when `on_chain === true`; otherwise state that finalization is confirmed while on-chain recording is pending.

### Downstream Issue #160 (Explain document verification results in plain language)
- **Plain-language verdicts:** Clearly separate verification outcomes:
  - `AUTHENTIC`: File matches the on-chain anchor.
  - `TAMPERED`: File differs from the on-chain anchor.
  - `SNAPSHOT_COMPROMISED`: Stored baseline original was altered; no trusted diff possible.
  - `NOT_ANCHORED`: Document was never finalized or recorded on-chain.
  - `VERIFICATION_UNAVAILABLE`: Integrity could not be evaluated due to temporary service unavailability (never call this tampering).
- **Legal distinction:** Include an explicit note: *"A cryptographic hash match confirms file integrity against the blockchain record; it does not constitute legal validity or certify document enforceability."*
- **Role-based views:** Ensure lawyers and clients see appropriate context while preserving access to raw cryptographic hashes and explorer links when available.

### Downstream Issue #171 (Clarify blockchain record details and explorer link)
- **Status grouping:** Group recording status (`Saved to the blockchain`, `Waiting for confirmation`, or `No blockchain record yet`), fingerprint hash, document ID, blockchain record ID, and transaction ID logically.
- **No conflation:** Never mark a document as "Saved to the blockchain" purely because it is `SIGNED` or `FINALIZED` without `on_chain === true`.
- **Explorer links:** Render the Base Sepolia explorer button only when a valid transaction hash is present and not in mock mode. If `tx_hash` is absent or mode is mock, display an informative note (*"Transaction details are unavailable in mock mode"* or *"Transaction link unavailable"*).
