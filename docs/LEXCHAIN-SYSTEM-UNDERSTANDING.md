# LexChain System Understanding

Last updated: 2026-05-17

## Core Idea

LexChain is a document management and verification system for legal and formal records.

The system supports three main goals:

1. Users upload or capture documents.
2. The backend stores files off-chain, hashes them, processes them with OCR/NLP, and saves metadata.
3. Blockchain records prove document hash anchoring and file integrity.

Important limitation:

```txt
Blockchain proves file integrity and anchoring.
Blockchain does not prove legal validity.
```

## Accepted Architecture

```txt
Expo mobile = real app experience
Next.js web = website, public verifier, and admin portal
Shared packages = safe cross-platform types, API helpers, and config helpers
Backend = source of truth for auth, documents, permissions, processing, and blockchain records
```

Main structure:

```txt
LexChain/
├── apps/
│   ├── mobile/       # Expo React Native mobile app
│   └── web/          # Next.js website, admin, public verifier
├── packages/
│   ├── api/          # Shared API helpers
│   ├── config/       # Shared environment/config helpers
│   └── types/        # Generated OpenAPI TypeScript types
├── docs/
├── openapi-updated.json
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Main System Flow

```txt
User signs in or signs up.
User uploads or captures a document.
Mobile app sends the file to the backend.
Backend stores the file off-chain.
Backend computes a document hash.
Backend processes the document with OCR/NLP.
Backend saves extracted metadata and summaries.
Backend anchors or checks hash data on-chain when needed.
User views document status and details in mobile.
Public or authorized users verify document integrity.
Super admin monitors users, documents, verification, processing, and blockchain records on web.
```

## Mobile App Responsibility

Path:

```txt
apps/mobile/
```

Mobile owns the real app workflow:

```txt
sign in
sign up
invitation/deep-link signup
dashboard
document list
upload document
camera capture
review captured files
processing screen
document detail
PDF viewer
mobile document verification
profile and settings
```

Mobile document flow:

```txt
Sign up/sign in
-> upload/capture document
-> processing
-> document detail
-> internal verification
```

Important mobile-only route:

```txt
apps/mobile/app/verify/[id].tsx
```

This is the internal mobile verifier for a known document ID. Do not rename or merge it with the public web verifier.

## Web App Responsibility

Path:

```txt
apps/web/
```

Web owns website and portal workflows:

```txt
landing page
public PDF verifier
public code verifier
invite fallback page
download app page
privacy page
terms page
admin login
admin dashboard
admin management pages
```

Public web flow:

```txt
Visitor opens website
-> verifies PDF or code
-> sees result
-> downloads app if needed
```

Admin web flow:

```txt
Super admin opens web admin
-> signs in
-> monitors dashboard, users, documents, verification, blockchain, processing, audit, and settings
```

## Backend Responsibility

Backend is the trusted source of truth.

Backend owns:

```txt
authentication
authorization
document ownership and access
document whitelist rules
file storage
hash computation
OCR/NLP processing
metadata extraction
blockchain anchoring
verification results
admin data
audit logs
```

Frontend responsibility:

```txt
show allowed controls
call backend APIs
display current backend state
never decide final access alone
```

## Document Upload and Processing

Main upload flow:

```txt
User uploads PDF or captures pages
-> mobile confirms upload
-> backend receives file
-> backend stores file off-chain
-> backend computes cryptographic hash
-> backend extracts text with OCR when needed
-> backend runs NLP processing
-> backend saves summary and extracted fields
-> backend anchors hash on blockchain when required
-> backend returns document status
-> mobile shows processing or document detail
```

Expected document states:

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

## Verification Workflows

LexChain has two different verification flows. They should stay separate.

### Mobile Internal Verification

Route:

```txt
apps/mobile/app/verify/[id].tsx
```

Purpose:

```txt
Verify a known/internal document ID inside the mobile app.
```

Flow:

```txt
User opens verification for a document.
Mobile requests verification data from backend.
Backend checks document hash and blockchain record.
Backend returns verification result.
Mobile shows valid, pending, failed, unknown, or tampered state.
```

### Public Website PDF Verification

Routes:

```txt
apps/web/app/verify/page.tsx
apps/web/app/api/public/verify/route.ts
```

Backend endpoint:

```txt
POST /public/verify
```

Flow:

```txt
Visitor opens https://lexchain.app/verify.
Visitor selects or drags one PDF file.
UI rejects non-PDF files.
Visitor clicks Verify.
Browser posts file to Next.js /api/public/verify.
Next.js forwards FormData to backend POST /public/verify.
Backend hashes uploaded PDF.
Backend compares hash with known document records.
Backend checks blockchain anchor when needed.
Backend returns verification result.
UI shows result details.
```

Possible results:

```txt
verified
invalid or mismatch
unknown or no matching record
pending or not anchored
```

### Public Code Verification

Route:

```txt
apps/web/app/verify/[code]/page.tsx
```

Backend support needed:

```txt
GET /public/verify/{code}
```

If the backend endpoint is missing, the UI must clearly show the limitation and point users to the PDF upload verifier.

## Invitation Workflow

Recommended email link:

```txt
https://lexchain.app/invite/<token>
```

Mobile deep link:

```txt
lexchain://sign-up?token=<token>
```

Flow:

```txt
Backend sends invitation email with HTTPS invite link.
Recipient opens https://lexchain.app/invite/<token>.
Next.js invite page shows invite context.
User can open app, download app, or continue on website.
Open in app uses lexchain://sign-up?token=<token>.
Mobile sign-up receives token from deep link.
Backend validates token during signup when contract supports it.
```

Important contract rule:

```txt
Use token, not invitation_token, unless backend OpenAPI contract changes.
```

## Admin Workflow

Base route:

```txt
apps/web/app/admin/
```

Admin monitors:

```txt
dashboard metrics
users
document issuers
documents
categories
invitations and permissions
verification logs
blockchain records
OCR/NLP processing
analytics
audit logs
system settings
```

Admin login flow:

```txt
Admin enters credentials.
Browser posts to /api/admin/auth.
Next.js route handler forwards to backend /auth/signin.
Backend returns access token.
Next.js stores token in HTTP-only admin_token cookie.
Admin moves to /admin/dashboard.
```

Current live admin endpoints wired in web:

```txt
/auth/signin
/admin/dashboard
/admin/users
```

Other admin pages can use demo fallback data until backend endpoints are stable.

## Shared Packages

Shared code lives in:

```txt
packages/types
packages/api
packages/config
```

Use shared packages for:

```txt
generated OpenAPI types
safe API helpers
shared config helpers
backend URL normalization
```

Avoid sharing:

```txt
React Native UI components
Expo Router screens
Expo SecureStore implementations
Next.js pages/components
camera/upload/PDF native logic
```

## OpenAPI and Type Generation

Source of truth:

```txt
openapi-updated.json
```

Generated output:

```txt
packages/types/src/generated/schema.ts
```

Generate command:

```bash
pnpm run generate:api-types
```

Rules:

```txt
Do not manually edit generated schema.ts.
Regenerate it from openapi-updated.json.
Keep screens/components using wrapper-level types.
```

## Security Rules

Do:

```txt
keep backend as authorization source of truth
use secure storage on mobile
use HTTP-only cookies for admin web tokens
validate file type and file size
keep document content off-chain
use generated API types
keep secrets out of frontend code
```

Do not:

```txt
put backend secrets in Next.js client components
expose private keys in frontend code
import React Native components into Next.js
import Next.js components into Expo mobile
store admin tokens in localStorage
treat blockchain verification as legal validation
manually edit generated OpenAPI schema
```

## Final Summary

```txt
Mobile user:
Sign up/sign in -> upload/capture document -> processing -> document detail -> internal verification.

Public visitor:
Open web -> verify PDF or code -> see result -> download app if needed.

Invite recipient:
Open HTTPS invite link -> open app or download app -> sign up with token.

Super admin:
Open web admin -> sign in -> monitor dashboard/users/documents/verification/blockchain/processing/audit/settings.

Developer:
Update OpenAPI -> generate types -> update wrappers -> run lint/build -> deploy mobile and web separately.
```

Accepted architecture:

```txt
Expo remains the mobile app.
Next.js becomes the real web app.
Shared packages hold only safe cross-platform code.
Backend remains source of truth.
```
