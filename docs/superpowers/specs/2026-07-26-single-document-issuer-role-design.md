# Single Document Issuer Role Design

**Date:** 2026-07-26
**Status:** Proposed for implementation planning
**Source of truth:** `docs/use_case_last.drawio`, `docs/cfd_last.drawio`, and `docs/erd_last.drawio`

## Objective

Correct the web system so it represents exactly two actors:

1. **Document Issuer**
2. **Document Participant**

`Lawyer` and `Super Admin` in the use-case actor label describe the same Document Issuer actor. They are not separate roles, permission levels, portal variants, or navigation tiers.

## Diagram-derived capabilities

The updated use-case diagram connects the single Document Issuer actor to all of these use cases:

- Upload Legal Document
- Rename Document
- View Document Status
- Manage Document Access
- View Document Insights
- Ask Questions
- Search Documents
- Finalize Document
- Verify Document Integrity
- Restore Original from Backup
- Manage User Accounts
- Manage Issuer Invitations
- Generate Reports
- View Audit Logs
- View System Statistics
- View Registered Users
- View and Manage Notifications
- Register Account
- Log In

The Document Participant actor is connected to:

- View and Manage Notifications
- Register Account
- Log In
- View Shared Documents
- View Document Details
- Request Document E-Copy
- Search Shared Documents

These diagram associations define the product permissions. The web must not introduce another issuer tier.

## Canonical role model

The target web model uses only:

```text
document_issuer
document_participant
```

The correction does not preserve `lawyer`, `admin`, `super_admin`, or `user` as target role aliases. Backend compatibility is outside this web correction because the backend has not yet been updated.

Visible role labels are exactly:

- `Document Issuer`
- `Document Participant`

Remove product-facing terms such as `Standard Document Issuer`, `Super User`, `Super Admin capabilities`, and a separate `Super Admin` navigation group.

## Portal design

Both actors continue to use the single `/portal` workspace.

Every Document Issuer receives the complete issuer navigation:

- **Workspace:** Dashboard, Documents, Upload Document
- **Integrity:** Processing Monitor, Blockchain Records
- **Office:** Categories, Analytics, Reports
- **System Management:** User Accounts, Issuer Invitations, System Reports, Audit Logs, System Statistics
- **Account:** Notifications, Office Settings, Profile and Security

Document Participants retain only their restricted shared-document, invitation, request, notification, and profile workflows.

The same navigation contract applies on desktop and mobile. Mobile may use horizontal scrolling, but it must not hide issuer capabilities based on an invented subtype.

## Session and authorization design

Use a server-issued `issuer_token` as the web authorization boundary for Document Issuer-only routes. Issue it only after the authenticated profile identifies the account as `document_issuer`.

Document Participants receive a normal portal session but no issuer session. Direct access to issuer-only routes must return a safe denial or redirect to the participant portal.

The issuer-only route set includes:

- `/portal/users`
- `/portal/issuer-invitations`
- `/portal/system-reports`
- `/portal/audit-logs`
- `/portal/system-statistics`

Remove active portal reliance on `admin_token`, `isAdminRole`, and `isPortalSuperAdminRole`. Logout must clear the portal and issuer sessions. Client-readable role hints are never authorization.

Existing `/admin/*` page redirects remain compatibility URLs only; they do not represent another workspace or actor. Existing `/api/admin/*` names may remain temporarily as transport paths, but web authorization and documentation must describe them as Document Issuer operations.

## Mock-mode target

Mock mode will provide one Document Issuer account and one Document Participant account using the canonical role values. Separate lawyer, admin, owner, or standard-issuer personas are removed from acceptance requirements.

The Document Issuer mock account must exercise every issuer navigation group, including System Management. The Document Participant mock account must be denied every issuer-only route.

## Backend handoff

No backend, database, OpenAPI, generated type, or mobile implementation is part of this correction.

The backend handoff must require the future backend to:

- return only the canonical `document_issuer` or `document_participant` product role;
- authorize all diagram-assigned issuer use cases for Document Issuers;
- preserve document ownership and document-level authorization checks;
- prevent Document Participants from issuer-only operations;
- stop describing Super Admin as a separate capability tier.

## Documentation changes

Update the web status, backend handoff, architecture, workflow, and acceptance documentation so they describe only the two actors and the diagram-derived capability lists. Remove acceptance evidence that compares admin, lawyer, or standard issuer personas.

## Testing and acceptance

The implementation must leave runnable checks for:

- canonical role mapping and labels;
- one complete Document Issuer navigation on desktop and mobile;
- no conditional Super Admin navigation;
- issuer-session creation and cleanup;
- participant denial on all issuer-only routes;
- legacy `/admin/*` redirects;
- mock Document Issuer access to all issuer pages;
- documentation scans with no product-facing issuer-tier terminology;
- full web tests, lint, production build, and real-browser acceptance.

## Explicitly excluded

- Backend implementation
- Database or ERD changes
- OpenAPI or generated-type changes
- Mobile application changes
- Editing the approved Draw.io diagrams
- Adding another permission framework or role hierarchy
