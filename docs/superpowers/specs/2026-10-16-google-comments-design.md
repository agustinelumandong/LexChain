# Google comments and ready/reopen feedback design

**Issue:** [#118 Complete Google comments and ready/reopen feedback](https://github.com/agustinelumandong/LexChain/issues/118)

**Parent:** [#114 Align frontend document workflows with the backend handoff](https://github.com/agustinelumandong/LexChain/issues/114)

## Goal

Help clients leave feedback that LexChain can mirror, help lawyers find and resolve blocking discussion in Google Docs, and make the existing ready/reopen flow reflect backend state immediately.

## Current behavior

- `DocumentWorkspace` already lists and manually syncs Google draft comments. It renders quoted text and replies, and preserves `author_name` independently of `author_user_id`.
- Reply `action` values are present in the generated type but not rendered in the comment thread.
- The ready endpoint documents a `409 UNRESOLVED_COMMENTS` refusal, but the checked-in OpenAPI does not define the response body. `lifecycleFetch` currently converts error bodies to a plain `Error`, so the workspace cannot read structured count or draft-link details.
- Ready/reopen mutations call the existing endpoints and invalidate document, comments, and history queries. They currently discard the returned `DocumentResponse`, delaying permission changes until refetch.
- The client and lawyer guidance in this issue is not shown in the workspace.

## Confirmed error details and compatibility

For the issue's unresolved-comments response, the frontend will read:

```json
{
  "details": {
    "reason": "UNRESOLVED_COMMENTS",
    "unresolved": 2,
    "draft_url": "https://docs.google.com/document/d/example"
  }
}
```

The accepted field names were confirmed during issue planning because the checked-in OpenAPI documents the 409 condition but omits the response schema. This frontend expectation does not update or replace the backend contract. Runtime values remain untrusted: require the exact reason, a non-negative integer count, and a `draft_url` accepted by the existing Google Docs URL validator. If structured fields are missing or invalid, preserve and display the backend's readable error without inventing a count or rendering an unsafe link. Retain the existing status and legacy `detail`/`message` handling for other errors.

> Future contract update: add the `UNRESOLVED_COMMENTS` response body to the checked-in OpenAPI only after confirming it with the backend owner. Do not hand-edit generated schema types. Keep the accepted field names above aligned with the authoritative response.

## Design

### API and state ownership

- Keep comments as a read-only mirror and use the existing `GET /documents/{id}/comments` and `POST /documents/{id}/comments/sync` endpoints.
- Extend the existing lifecycle API error boundary to retain status and readable message while exposing the validated structured fields needed by the UI. Error handling must remain compatible with current `detail` and `message` responses.
- When manual sync succeeds, publish its returned comment list to the existing `portal-document-comments` query. On failure, keep any displayed comments and show an actionable error.
- Keep the existing ready and reopen endpoints and permission gates. On success, write their returned `DocumentResponse` into `portal-doc`, then refresh the document list, comments, and history. This applies returned permission flags immediately. On failure, preserve current document/comment state and expose the backend message.
- Do not add frontend reply, resolve, or reopen-comment mutations. Those actions remain in Google Docs; the frontend only mirrors replies and resolution events.

### Workspace guidance and comment display

- In the Comments tab for a client viewing a `PREPARING` document with a draft, show: “Leave feedback with comments (select text → comment button), not by typing in the document.” Explain that Google Docs suggestions are outside LexChain's comment mirror.
- Before a lawyer marks a document ready, show: “Check the draft for pending suggestions in Google Docs before marking it ready.” Explain that clients can only read the draft after it is ready and that the lawyer can reopen it for revisions.
- In the comment mirror, continue to show `author_name` even when `author_user_id` is null, quoted text, and replies. Render a clear activity label only for documented reply actions `resolve` and `reopen`; do not infer actions from reply text or hide reply content.
- Keep the existing `can_mark_ready` and `can_reopen` permission gates. Do not add local comment-resolution state or simulate backend lifecycle rules.

### Browser evidence

- Add a deterministic browser check around a document that already has a Google draft; draft creation from issue #117 is not a prerequisite.
- Stub the same-origin backend routes. Cover client guidance, null-author-ID names, quoted text, replies and action labels, an unresolved readiness response with a safe draft link, manual sync after the Google-side thread changes, then ready and reopen with returned permissions.
- Keep external Google calls out of this check and report the journey as frontend browser evidence, not proof of live backend or Google behavior.

### Documentation

- Update `docs/USER-FLOW-ARCHITECTURE.md` to describe the comment mirror, manual sync, Google-side reply/resolve behavior, readiness refusal details, and client read-only behavior after ready.
- Include the OpenAPI error-body gap and the accepted fields as a future backend-contract maintenance note. Keep generated OpenAPI output untouched.

## Acceptance criteria

1. Client guidance uses the specified wording and explains why typed suggestions are absent from LexChain's mirror.
2. Lawyer guidance uses the specified wording and explains client read-only access after ready and reopening for revisions.
3. A structured `UNRESOLVED_COMMENTS` response shows a validated count and a usable, validated Google Docs draft link.
4. The comment mirror preserves names when user IDs are null, quoted text, replies, and explicit resolve/reopen reply actions.
5. Sync, ready, and reopen continue to use the existing endpoints. Ready/reopen success applies returned permission flags and refreshes list/comments/history; failures keep useful feedback and prior visible comments.
6. Focused tests and a deterministic browser journey cover comments, blocked readiness, refresh, ready, reopen, and client guidance without relying on the #117 draft-creation screen.

## Boundaries and risks

- The backend remains authoritative for comments, suggestions, authorization, permission flags, and lifecycle transitions.
- The frontend expectation for the error details comes from the accepted issue handoff, not a response schema in the checked-in OpenAPI. Confirm that shape with the backend owner when updating the API contract.
- This work does not add comment editing, reply/resolve endpoints, Google Docs suggestions synchronization, or backend changes.
- Browser stubs do not verify live Google permissions, backend error serialization, or deployed Google behavior.
