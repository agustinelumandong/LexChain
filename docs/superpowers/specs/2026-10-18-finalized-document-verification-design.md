# Finalized Document Verification Design

## Goal

Make verification available for every viewable finalized document, preserve the backend's integrity outcomes, and let readers inspect a valid transaction on Base Sepolia.

## Behavior

- The existing document detail action shows **Verify integrity** when `permissions.can_view` is true and the lifecycle is `FINALIZED`, even if `on_chain` is false. Preserve the existing action for viewable on-chain records in other lifecycle states. Do not weaken document access checks or change the verification endpoint.
- Keep the existing outcomes distinct: `AUTHENTIC`, `TAMPERED`, `SNAPSHOT_COMPROMISED`, `NOT_ANCHORED`, and `VERIFICATION_UNAVAILABLE`. Unavailable and not-anchored results remain retryable. Never label unavailable as tampering. Preserve fail-closed handling for contradictory backend fields and distinguish HTTP request failures.
- Keep transaction hashes copyable. For a valid 32-byte hexadecimal transaction hash, link to `https://sepolia.basescan.org/tx/0x<hash>` with exactly one `0x` prefix. A missing or malformed hash has no explorer link.
- In mock mode, label the verification evidence as simulated and explicitly state that it is not a real backend or blockchain verification. Live mode has no simulated label.
- Add deterministic browser coverage for visibility, all outcomes, retry, simulated evidence and transaction link normalization. Keep the current request route and access behavior.

## Contract and scope

The checked-in OpenAPI defines `GET /documents/{document_id}/verify`, its verification result fields, and descriptive statuses, but does not define an explorer URL. `tx_hash` is optional. The UI therefore constructs the Base Sepolia explorer URL only from a valid returned transaction hash. The existing 404 behavior for missing or unanchored records remains supported alongside a 200 `NOT_ANCHORED` result.

No backend, generated type, authorization, persistence, or lifecycle changes are in scope. Do not alter unrelated work in the shared checkout.

## Acceptance checks

- A viewable `FINALIZED` document has Verify integrity with either value of `on_chain`; a non-viewable document never gets it.
- Existing viewable `on_chain` records retain the action.
- Every documented result remains correctly named and styled; unavailable and not-anchored expose retry.
- Valid hashes with zero, one or repeated `0x` prefixes resolve to one canonical explorer URL; malformed or absent hashes do not render a link and the copy row remains available when a hash exists.
- Mock verification is labeled as simulated; real backend results are not.
- Existing access behavior, endpoint, error handling, and copy-hash interaction remain intact.
