# LexChain System Workflow Documentation

Last updated: 2026-05-16

## 1. Purpose

LexChain is a document management and verification system for legal and formal records. The system helps users upload documents, process document content with OCR/NLP, manage access, and verify document integrity through blockchain-backed hash records.

The current frontend architecture is a monorepo:

```txt
LexChain/
├── apps/
│   ├── mobile/       # Expo React Native mobile app
│   └── web/          # Next.js website, public verifier, and /portal workspace
├── packages/
│   ├── api/          # Shared API helpers
│   ├── config/       # Shared environment/config helpers
│   └── types/        # Shared generated OpenAPI TypeScript types
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

The architecture separates responsibilities:

```txt
Expo mobile = real app experience
Next.js web = real website and web portal
Shared packages = API helpers, config helpers, generated types
Backend = source of truth for auth, documents, permissions, processing, and blockchain records
```

## 2. High-Level System Components

### 2.1 Mobile App

Path:

```txt
apps/mobile/
```

Technology:

```txt
Expo
Expo Router
React Native
React Query
NativeWind / React Native CSS
SecureStore
```

Main responsibility:

```txt
Mobile user workflows:
- sign in
- sign up
- invitation/deep-link signup
- dashboard
- document list
- upload document
- camera capture
- review captured files
- processing screen
- document detail
- PDF viewer
- mobile document verification
- profile and settings
```

Mobile routes:

```txt
apps/mobile/app/
├── (auth)/
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── forgot-password.tsx
│   └── callback.tsx
├── (tabs)/
│   ├── index.tsx
│   ├── documents.tsx
│   └── profile.tsx
├── upload.tsx
├── camera-capture.tsx
├── capture-review.tsx
├── processing.tsx
├── document/
│   ├── [id].tsx
│   ├── menu.tsx
│   └── pdf-viewer.tsx
├── verify/
│   └── [id].tsx
└── profile/
```

Important rule:

```txt
Do not rename apps/mobile/app/verify/[id].tsx.
```

That route is the mobile/internal document verification route. It is different from the public website verification route.

### 2.2 Web App

Path:

```txt
apps/web/
```

Technology:

```txt
Next.js
App Router
TypeScript
Tailwind CSS
Route handlers
```

Main responsibility:

```txt
Web workflows:
- landing page
- public PDF verifier
- public code verifier page
- invite fallback page
- download app page
- privacy page
- terms page
- /portal login and shared workspace
- Document Issuer System Management
- legacy /admin redirects for compatibility
```

Web routes:

```txt
apps/web/app/
├── page.tsx
├── verify/
│   ├── page.tsx
│   └── [code]/page.tsx
├── invite/
│   └── [token]/page.tsx
├── download/page.tsx
├── privacy/page.tsx
├── terms/page.tsx
├── login/page.tsx
├── portal/
│   ├── dashboard/page.tsx
│   ├── users/page.tsx
│   ├── issuer-invitations/page.tsx
│   ├── system-reports/page.tsx
│   ├── audit-logs/page.tsx
│   └── system-statistics/page.tsx
└── api/
    ├── admin/          # temporary issuer-operation transport names
    └── public/
        └── verify/route.ts
```

### 2.3 Shared Packages

Shared packages live under:

```txt
packages/
```

Current packages:

```txt
packages/types
packages/api
packages/config
```

#### packages/types

Purpose:

```txt
Own generated TypeScript types from openapi-updated.json.
```

Important files:

```txt
packages/types/src/generated/schema.ts
packages/types/src/index.ts
```

Generate command:

```bash
pnpm run generate:api-types
```

This generates:

```txt
packages/types/src/generated/schema.ts
```

#### packages/api

Purpose:

```txt
Shared API helper functions that are safe for web/mobile reuse.
```

Current responsibilities:

```txt
- shared public verifier helper
- shared API error message helper
- shared backend proxy helper
```

Important file:

```txt
packages/api/src/index.ts
```

#### packages/config

Purpose:

```txt
Shared environment/config helpers.
```

Current responsibilities:

```txt
- trim API base URLs
- read API_URL / NEXT_PUBLIC_API_URL / EXPO_PUBLIC_API_URL
- build backend API URLs safely
```

Important file:

```txt
packages/config/src/index.ts
```

## 3. Package Manager Workflow

The repo uses pnpm.

Root workspace file:

```txt
pnpm-workspace.yaml
```

Root lockfile:

```txt
pnpm-lock.yaml
```

Do not use:

```txt
package-lock.json
yarn.lock
```

Root scripts:

```bash
pnpm mobile
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:lint
pnpm web
pnpm web:build
pnpm web:lint
pnpm generate:api-types
pnpm lint
```

Install dependencies:

```bash
pnpm install
```

Run web:

```bash
pnpm web
```

Run mobile:

```bash
pnpm mobile
```

Run Android:

```bash
pnpm mobile:android
```

Build web:

```bash
pnpm web:build
```

Run all lint/type checks:

```bash
pnpm lint
```

## 4. Environment Variables

### 4.1 Mobile Environment

Mobile uses Expo public environment variables:

```txt
EXPO_PUBLIC_API_URL
EXPO_PUBLIC_USE_MOCK_API
```

Example:

```env
EXPO_PUBLIC_API_URL=https://api.lexchain.app
EXPO_PUBLIC_USE_MOCK_API=false
```

### 4.2 Web Environment

Web uses:

```txt
API_URL
NEXT_PUBLIC_API_URL
```

Recommended production setup:

```env
API_URL=https://api.lexchain.app
NEXT_PUBLIC_API_URL=https://api.lexchain.app
```

Use `API_URL` for server-side route handlers. Avoid putting secrets in `NEXT_PUBLIC_*` values because public values can be exposed to the browser.

### 4.3 Shared Config Helper

The shared config package checks these values:

```txt
API_URL
NEXT_PUBLIC_API_URL
EXPO_PUBLIC_API_URL
```

The helper normalizes trailing slashes so code does not accidentally build URLs like:

```txt
https://api.lexchain.app//public/verify
```

## 5. User Roles

LexChain has exactly two registered actors. The parenthetical `Lawyer + Super
Admin` in the diagram identifies the one Document Issuer actor; it is not a
role tier or second portal.

### 5.1 Document Issuer

Can:

```txt
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
```

### 5.2 Document Participant

Can:

```txt
- View and Manage Notifications
- Register Account
- Log In
- View Shared Documents
- View Document Details
- Request Document E-Copy
- Search Shared Documents
```

The canonical backend role values are `document_issuer` and
`document_participant`. Anonymous PDF verification remains a public feature,
not a registered actor.

## 6. Main Workflow Overview

The main system flow:

```txt
1. Document Issuer or Document Participant signs in or signs up.
2. Document Issuer uploads or captures a document.
3. App sends file to backend.
4. Backend stores the file off-chain.
5. Backend computes a document hash.
6. Backend processes the document with OCR/NLP.
7. Backend stores extracted metadata and summaries.
8. Backend anchors or checks hash data on-chain when needed.
9. The authorized user views document status and details in mobile or /portal.
10. An unauthenticated browser or authorized user verifies document integrity.
11. Document Issuer uses System Management in /portal for user accounts, issuer
    invitations, reports, audit logs, and system statistics.
```

## 7. Authentication Workflow

### 7.1 Mobile Sign In

Route:

```txt
apps/mobile/app/(auth)/sign-in.tsx
```

Flow:

```txt
1. User enters email and password.
2. Mobile validates input.
3. Mobile calls backend sign-in API.
4. Backend returns access token and refresh token.
5. Mobile stores tokens with secure storage.
6. User is redirected into the app.
7. Authenticated API calls include bearer token.
```

Security rule:

```txt
Do not store tokens in plain local storage in mobile.
Use secure storage.
```

### 7.2 Mobile Sign Up

Route:

```txt
apps/mobile/app/(auth)/sign-up.tsx
```

Flow:

```txt
1. User enters profile and account details.
2. Mobile validates the form.
3. Mobile calls backend sign-up API.
4. Backend creates user account.
5. If email verification is enabled, user verifies email.
6. User signs in after verification.
```

### 7.3 Portal Login and Issuer Session on Web

Route:

```txt
apps/web/app/login/page.tsx
```

Route handler:

```txt
apps/web/app/api/admin/auth/route.ts (temporary transport name)
```

Flow:

```txt
1. Document Issuer or Document Participant enters credentials in Next.js web app.
2. Browser posts credentials to the authentication route handler.
3. Next.js route handler forwards credentials to backend /auth/signin.
4. Backend returns an authenticated profile with document_issuer or document_participant.
5. Next.js creates an HTTP-only issuer_token only for document_issuer.
6. Both actors enter their permitted /portal workspace; participants have no
   issuer session.
```

Why use an HTTP-only cookie:

```txt
- JavaScript cannot directly read it.
- It keeps issuer authorization separate from client-readable role hints and
  bearer tokens in browser localStorage.
```

Current fallback behavior:

```txt
If live issuer-management data is unavailable, mock mode can show demo data for
development and presentation without granting client-side authority.
```

## 8. Mobile Document Upload Workflow

Routes:

```txt
apps/mobile/app/upload.tsx
apps/mobile/app/camera-capture.tsx
apps/mobile/app/capture-review.tsx
apps/mobile/app/processing.tsx
```

Flow:

```txt
1. User starts upload from mobile app.
2. User selects a PDF or captures pages with the camera.
3. If using camera, captured images are reviewed.
4. Images may be converted into a PDF before upload.
5. User confirms upload.
6. Mobile sends file to backend.
7. Backend accepts document and starts processing.
8. Mobile navigates to processing state.
9. User later sees document in list/detail screens.
```

Important mobile-only features:

```txt
- camera capture
- native file picker
- native PDF handling
- local PDF preview
- secure token handling
- mobile document workflow
```

Do not move these into Next.js.

## 9. Backend Document Processing Workflow

Backend responsibility:

```txt
1. Receive uploaded file.
2. Store file in backend storage.
3. Compute cryptographic hash.
4. Extract text with OCR if needed.
5. Run NLP processing.
6. Generate summary and extracted fields.
7. Save metadata and processing status.
8. Anchor or verify hash on blockchain when required.
9. Return document status to frontend.
```

Expected processing states:

```txt
queued
processing
completed
failed
verified
tampered
```

OCR/NLP states:

```txt
queued
complete
failed
success
generated
needs_retry
low_confidence
```

Blockchain states:

```txt
pending
anchored
failed
delayed
```

## 10. Document List Workflow

Route:

```txt
apps/mobile/app/(tabs)/documents.tsx
```

Flow:

```txt
1. User opens Documents tab.
2. Mobile fetches document list from backend or mock API.
3. User can search, filter, or sort documents.
4. User taps a document.
5. Mobile opens document detail route.
```

Document detail route:

```txt
apps/mobile/app/document/[id].tsx
```

Document detail can show:

```txt
- file name
- processing status
- extracted details
- summary
- owner/issuer information
- whitelist/access state
- version history
- verification status
- blockchain/notarization status
- PDF open action
```

## 11. Mobile Document Verification Workflow

Route:

```txt
apps/mobile/app/verify/[id].tsx
```

Purpose:

```txt
Mobile app verification for a known/internal document ID.
```

Flow:

```txt
1. User opens verification for a document.
2. Mobile requests verification data from backend.
3. Backend checks document hash and blockchain record.
4. Backend returns verification result.
5. Mobile shows whether the document is valid, pending, failed, or tampered.
```

Important separation:

```txt
Mobile internal verifier:
apps/mobile/app/verify/[id].tsx

Public website verifier:
apps/web/app/verify/page.tsx
apps/web/app/verify/[code]/page.tsx
```

Do not merge these flows.

## 12. Public Website Verification Workflow

Routes:

```txt
apps/web/app/verify/page.tsx
apps/web/app/verify/[code]/page.tsx
```

Route handler:

```txt
apps/web/app/api/public/verify/route.ts
```

Shared helper:

```txt
packages/api/src/index.ts
```

### 12.1 PDF Upload Public Verification

Flow:

```txt
1. Visitor opens https://lexchain.app/verify.
2. Visitor selects or drags one PDF file.
3. UI rejects non-PDF files.
4. UI shows selected file and Verify button.
5. Visitor clicks Verify.
6. UI shows progress/loading state.
7. Browser posts file to Next.js /api/public/verify.
8. Next.js route handler forwards FormData to backend POST /public/verify.
9. Backend hashes uploaded PDF and compares it with known records.
10. Backend returns verification result.
11. UI shows status, confidence, file name, transaction hash, and matched date when available.
```

Why proxy through Next.js:

```txt
- Keeps browser screen simple.
- Centralizes backend API URL handling.
- Avoids duplicating API error parsing in screens.
```

### 12.2 Public Code Verification

Route:

```txt
apps/web/app/verify/[code]/page.tsx
```

Purpose:

```txt
Public verifier page for a known verification code.
```

Current limitation:

```txt
If backend GET /public/verify/{code} is not implemented, the UI must not pretend code verification is fully working.
```

Correct behavior:

```txt
- clearly show that code lookup depends on backend support
- point user to PDF upload verifier for the live POST /public/verify flow
```

## 13. Invitation Workflow

Public route:

```txt
apps/web/app/invite/[token]/page.tsx
```

Mobile deep link:

```txt
lexchain://sign-up?token=<token>
```

Recommended email link:

```txt
https://lexchain.app/invite/<token>
```

Flow:

```txt
1. Backend sends invitation email with HTTPS invite link.
2. User opens https://lexchain.app/invite/<token>.
3. Next.js invite page shows the token context.
4. User can choose:
   - Open in app
   - Download app
   - Continue on website
5. Open in app uses lexchain://sign-up?token=<token>.
6. Mobile sign-up receives token from the deep link.
7. Backend validates token during signup when backend contract supports it.
```

Important backend note:

```txt
The runtime flow should use token, not invitation_token, unless the backend contract changes.
```

Production upgrade:

```txt
Configure Android App Links and iOS Universal Links for:
- https://lexchain.app/invite/<token>
- https://lexchain.app/verify/<code>
```

## 14. Document Issuer System Management Workflow

Base route:

```txt
/portal
```

The complete Document Issuer System Management flow has five destinations:

```txt
/portal/users
/portal/issuer-invitations
/portal/system-reports
/portal/audit-logs
/portal/system-statistics
```

Flow:

```txt
1. Document Issuer signs in at /login.
2. The backend profile identifies document_issuer.
3. Next.js creates the HTTP-only issuer_token session for issuer-only routes.
4. The issuer opens one System Management destination in /portal.
5. The backend authorizes the authenticated issuer role and applies document
   ownership or document-level checks where relevant.
6. The system returns the management result and records the action when needed.
```

Document Participant has no issuer session and is denied these routes. Existing
`/admin/*` pages redirect for compatibility, while `/api/admin/*` may remain a
temporary web transport namespace rather than an Admin actor.

## 15. Access and Permission Workflow

LexChain should treat backend authorization as the source of truth.

Frontend responsibility:

```txt
- show allowed controls
- call backend APIs
- display current permission state
- never decide final access alone
```

Backend responsibility:

```txt
- validate tokens
- validate document ownership/access
- enforce role permissions
- enforce document whitelist
- issue/revoke invitations
- log audit events
```

Document access may involve:

```txt
- owner access
- issuer access
- invited participant access
- public verification access
```

## 16. Blockchain Verification Workflow

LexChain should not store private document contents on-chain.

Correct blockchain model:

```txt
Off-chain:
- document file
- extracted text
- summaries
- metadata
- access permissions

On-chain:
- document hash
- transaction hash
- timestamp/anchor proof
- optional issuer/account reference
```

Verification flow:

```txt
1. System computes hash of uploaded file.
2. Backend compares computed hash with stored known hash.
3. Backend checks blockchain anchor record.
4. If hashes match, document is valid/authentic.
5. If hashes do not match, document may be tampered.
6. If no record exists, document is not yet anchored or unknown.
```

Important limitation:

```txt
Blockchain proves file integrity and anchoring, not legal validity.
```

## 17. API Contract Workflow

Source of truth:

```txt
openapi-updated.json
```

Generated output:

```txt
packages/types/src/generated/schema.ts
```

Generation command:

```bash
pnpm run generate:api-types
```

Rule:

```txt
Do not manually edit generated schema.ts.
Regenerate it from openapi-updated.json.
```

When backend contract changes:

```txt
1. Replace or update openapi-updated.json.
2. Run pnpm run generate:api-types.
3. Update wrappers in apps/mobile/src/services/api or packages/api.
4. Keep screens/components using wrapper-level types.
5. Run pnpm lint and pnpm web:build.
```

## 18. Mock and Demo Data Workflow

Mobile has mock API support:

```txt
EXPO_PUBLIC_USE_MOCK_API=true
```

Purpose:

```txt
- allow UI testing without backend
- allow adviser/demo presentation
- keep mobile screens usable while backend endpoints are being completed
```

Web portal mock mode uses exactly two canonical accounts:

```txt
issuer@example.com      document_issuer      Password123
participant@example.com document_participant Password123
```

The Document Issuer account must reach all five System Management destinations;
the Document Participant account must be denied every issuer-only route. Mock
data supports presentation only and never authorizes a route in production.

## 19. Deployment Workflow

### 19.1 Mobile Deployment

Recommended:

```txt
Expo EAS Build
```

Flow:

```txt
1. Configure app credentials.
2. Configure app config and deep links.
3. Build Android/iOS with EAS.
4. Test installable builds.
5. Submit to stores when ready.
```

### 19.2 Web Deployment

Recommended:

```txt
Vercel
```

Flow:

```txt
1. Deploy apps/web as Next.js app.
2. Set API_URL and NEXT_PUBLIC_API_URL.
3. Point lexchain.app DNS to Vercel.
4. Ensure /verify and /invite routes work publicly.
5. Connect backend domain such as api.lexchain.app.
```

### 19.3 Backend Deployment

Recommended domain:

```txt
api.lexchain.app
```

Backend should provide:

```txt
- auth endpoints
- document endpoints
- processing endpoints
- issuer-only System Management endpoints
- public verification endpoints
- blockchain verification endpoints
```

## 20. DNS and Linking Workflow

Recommended domains:

```txt
lexchain.app          -> Next.js web app
api.lexchain.app      -> backend API
```

Invite links:

```txt
https://lexchain.app/invite/<token>
```

Public verification links:

```txt
https://lexchain.app/verify/<code>
```

Mobile deep links:

```txt
lexchain://sign-up?token=<token>
```

Production app links:

```txt
Android App Links
iOS Universal Links
```

## 21. Security Rules

Do:

```txt
- keep backend as authorization source of truth
- use secure storage on mobile
- use HTTP-only issuer_token cookies for issuer-only web routes
- validate file type and file size
- keep document content off-chain
- use generated API types
- keep secrets out of frontend code
```

Do not:

```txt
- put backend secrets in Next.js client components
- expose private keys in frontend code
- import React Native components into Next.js
- import Next.js components into Expo mobile
- store issuer tokens in localStorage
- treat blockchain verification as legal validation
- manually edit generated OpenAPI schema
```

## 22. Current Known Limitations

### 22.1 Code-Based Public Verification

PDF upload verification uses:

```txt
POST /public/verify
```

Code verification depends on backend support for:

```txt
GET /public/verify/{code}
```

If that endpoint is missing, the UI must show the limitation clearly.

### 22.2 System Management Data

System Management remains mock-backed until backend issuer-only endpoints are
available. The current `/api/admin/*` route-handler namespace is temporary web
transport naming, not an actor or role name.

### 22.3 Invite Signup Contract

The frontend uses:

```txt
token
```

Backend OpenAPI should formally document token support if invite validation is required during signup.

## 23. Development Checklist

Before starting work:

```bash
pnpm install
git status --short
```

After API contract changes:

```bash
pnpm run generate:api-types
```

Before finishing code changes:

```bash
pnpm run lint
pnpm web:build
```

For mobile smoke testing:

```bash
pnpm mobile
```

For web smoke testing:

```bash
pnpm web
```

Manual test routes:

```txt
http://localhost:3000/
http://localhost:3000/verify
http://localhost:3000/verify/test-code
http://localhost:3000/invite/test-token
http://localhost:3000/download
http://localhost:3000/privacy
http://localhost:3000/terms
http://localhost:3000/login
http://localhost:3000/portal/dashboard
http://localhost:3000/portal/users
http://localhost:3000/portal/issuer-invitations
http://localhost:3000/portal/system-reports
http://localhost:3000/portal/audit-logs
http://localhost:3000/portal/system-statistics
```

## 24. File Ownership Guide

### Mobile-only files

Keep these in Expo:

```txt
apps/mobile/app/upload.tsx
apps/mobile/app/camera-capture.tsx
apps/mobile/app/capture-review.tsx
apps/mobile/app/processing.tsx
apps/mobile/app/document/[id].tsx
apps/mobile/app/document/pdf-viewer.tsx
apps/mobile/app/verify/[id].tsx
apps/mobile/src/features/upload/
apps/mobile/src/features/document/
apps/mobile/src/features/documents/
apps/mobile/src/features/profile/
```

### Web-only files

Keep these in Next.js:

```txt
apps/web/app/page.tsx
apps/web/app/verify/
apps/web/app/invite/
apps/web/app/download/
apps/web/app/privacy/
apps/web/app/terms/
apps/web/app/portal/
apps/web/app/api/
```

### Shared files

Use packages for:

```txt
packages/types
packages/api
packages/config
```

Avoid sharing:

```txt
React Native UI components
Expo Router screens
Expo SecureStore implementations
Next.js pages/components
camera/upload/PDF native logic
```

## 25. End-to-End Workflow Summary

```txt
Mobile user:
Sign up/sign in -> upload/capture document -> processing -> document detail -> internal verification.

Public visitor:
Open web -> verify PDF or code -> see result -> download app if needed.

Invite recipient:
Open HTTPS invite link -> open app or download app -> sign up with token.

Document Issuer:
Open /portal -> sign in -> use document workflows and all five System Management destinations.

Developer:
Update OpenAPI -> generate types -> update wrappers -> run lint/build -> deploy mobile and web separately.
```

## 26. Final Architecture Decision

The accepted architecture is:

```txt
Expo remains the mobile app.
Next.js becomes the real web app.
Shared packages hold only safe cross-platform code.
Backend remains source of truth.
```

This avoids forcing Expo web to behave like a full website and prevents Next.js web code from increasing the mobile bundle size.
