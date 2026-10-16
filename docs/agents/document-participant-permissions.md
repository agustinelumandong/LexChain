# Document participant permissions

Issue [#119](https://github.com/agustinelumandong/LexChain/issues/119) is implemented from the frontend contract available in this repository.

- The document response supplies `permissions.can_share` and `permissions.can_revoke`; the participant screen uses these flags independently and fails closed until the document response is available.
- Invitation roles remain `viewer`, `signer`, and `editor`. The generated OpenAPI schema describes the invitation role as a string with those documented values (`DocumentInvitationResponse.role`); the frontend validates and displays the same options.
- This work did not verify which roles the deployed backend currently accepts. No deployed role restriction is asserted here, and no role option was removed. Verify against the deployed backend before changing these options.
- The deterministic browser check is `pnpm e2e:document-permissions`. It stubs same-origin API responses, tests separate lawyer and client browser contexts, and does not establish deployed authorization or role support.

When a backend error contract blocks a design, record the exact missing schema fields and the agreed field names before implementation. Do not infer runtime behavior from generated TypeScript types alone.
