# LexChain Workflow Flowcharts

Last updated: 2026-07-26

This document contains Mermaid diagrams for the main LexChain workflows. It is meant to support adviser review, developer onboarding, and implementation planning.

## 1. Whole System Architecture

```mermaid
flowchart TB
  Issuer[Document Issuer] --> Mobile[Expo Mobile App<br/>apps/mobile]
  Issuer --> Web[Next.js Web App<br/>apps/web]
  Participant[Document Participant] --> Mobile
  Participant --> Web

  Mobile --> SharedTypes[packages/types<br/>Generated OpenAPI Types]
  Web --> SharedApi[packages/api<br/>Shared API Helpers]
  Web --> SharedConfig[packages/config<br/>Shared Config Helpers]
  SharedApi --> SharedTypes
  SharedApi --> SharedConfig

  Mobile --> Backend[Backend API<br/>FastAPI / API Domain]
  Web --> Backend

  Backend --> Storage[(Off-chain File Storage)]
  Backend --> Database[(Database)]
  Backend --> Processing[OCR / NLP Processing]
  Backend --> Blockchain[Blockchain Network<br/>Hash Anchor / Verification]

  Storage --> Backend
  Processing --> Database
  Blockchain --> Database
```

## 2. Route Ownership Split

```mermaid
flowchart LR
  Root[LexChain Monorepo] --> MobileApp[apps/mobile<br/>Expo]
  Root --> WebApp[apps/web<br/>Next.js]
  Root --> Packages[packages]

  MobileApp --> MobileAuth[Auth Routes]
  MobileApp --> MobileDocs[Documents]
  MobileApp --> MobileUpload["Upload / Camera"]
  MobileApp --> MobileProcess[Processing]
  MobileApp --> MobileVerify["Mobile Verify<br/>/verify/id"]
  MobileApp --> MobileProfile[Profile]

  WebApp --> Landing["Landing<br/>/"]
  WebApp --> PublicVerify["Public Verifier<br/>/verify"]
  WebApp --> PublicCode["Code Verifier<br/>/verify/code"]
  WebApp --> Invite["Invite Fallback<br/>/invite/token"]
  WebApp --> Download["Download<br/>/download"]
  WebApp --> Portal["Portal Workspace<br/>/portal/*"]
  WebApp --> LegacyAdmin["Legacy redirects<br/>/admin/*"]
  WebApp --> LegalPages["Terms / Privacy"]

  Packages --> Types[types]
  Packages --> Api[api]
  Packages --> Config[config]
```

## 3. Mobile Authentication Workflow

```mermaid
flowchart TD
  Start([Registered actor opens mobile app]) --> HasSession{Existing valid session?}
  HasSession -- Yes --> Dashboard[Go to Dashboard]
  HasSession -- No --> AuthScreen["Show Sign In / Sign Up"]

  AuthScreen --> SignIn["User enters email/password"]
  SignIn --> Validate[Validate form]
  Validate --> CallSignin[POST /auth/signin]
  CallSignin --> AuthOk{Auth success?}
  AuthOk -- No --> ShowError[Show login error]
  ShowError --> AuthScreen
  AuthOk -- Yes --> StoreTokens[Store access/refresh tokens<br/>Secure storage]
  StoreTokens --> Dashboard

  AuthScreen --> SignUp[User opens Sign Up]
  SignUp --> ValidateSignup[Validate signup form]
  ValidateSignup --> CallSignup[POST /auth/signup]
  CallSignup --> SignupOk{Signup success?}
  SignupOk -- No --> SignupError[Show signup error]
  SignupError --> SignUp
  SignupOk -- Yes --> EmailVerification{Email verification required?}
  EmailVerification -- Yes --> WaitVerify[User verifies email]
  EmailVerification -- No --> Dashboard
  WaitVerify --> AuthScreen
```

## 4. Invite Link Workflow

```mermaid
flowchart TD
  Backend[Backend creates invitation token] --> Email[Send email link<br/>https://lexchain.app/invite/token]
  Email --> Browser[Recipient opens link in browser]
  Browser --> InvitePage["Next.js Invite Page<br/>/invite/token"]

  InvitePage --> Choice{User choice}
  Choice --> OpenApp[Open in app]
  Choice --> Download[Download app]
  Choice --> ContinueWeb[Continue on website]

  OpenApp --> DeepLink["lexchain://sign-up?token=token"]
  DeepLink --> MobileSignup[Mobile Sign Up receives token]
  MobileSignup --> SubmitSignup[Submit signup with token if backend supports it]
  SubmitSignup --> BackendValidate[Backend validates invitation]

  Download --> DownloadPage["/download"]
  ContinueWeb --> AllowedRoute[Allowed web route]

  BackendValidate --> SignupResult{Valid token?}
  SignupResult -- Yes --> AccountCreated[Create account / grant invite access]
  SignupResult -- No --> InviteError[Show invite error]
```

## 5. Mobile Upload and Processing Workflow

```mermaid
flowchart TD
  Start([Document Issuer starts document upload]) --> Source{Upload source}

  Source -- File picker --> PickFile["Select PDF/file"]
  Source -- Camera --> Camera[Capture document pages]

  Camera --> Review[Review captured pages]
  Review --> ConvertPdf[Convert images to PDF if needed]
  PickFile --> Confirm[Confirm upload]
  ConvertPdf --> Confirm

  Confirm --> Upload[POST /documents/upload]
  Upload --> Accepted{Backend accepts file?}
  Accepted -- No --> UploadError[Show upload error]
  Accepted -- Yes --> ProcessingScreen[Show processing screen]

  ProcessingScreen --> BackendStore[Backend stores file off-chain]
  BackendStore --> Hash[Compute document hash]
  Hash --> OCR[OCR extraction]
  OCR --> NLP[NLP summary / entity extraction]
  NLP --> Metadata[Save extracted metadata]
  Metadata --> Anchor{Anchor on blockchain?}
  Anchor -- Yes --> Blockchain[Write hash proof on-chain]
  Anchor -- No --> SaveStatus[Save processing status]
  Blockchain --> SaveStatus
  SaveStatus --> DocumentReady["Document appears in list/detail"]
```

## 6. Document Detail Workflow

```mermaid
flowchart TD
  List[Documents tab] --> Select[User selects document]
  Select --> Detail["/document/id"]
  Detail --> Fetch["GET /documents/document_id"]
  Fetch --> Found{Document found and authorized?}
  Found -- No --> Error["Show not found / access error"]
  Found -- Yes --> Render[Render detail screen]

  Render --> Summary[Show summary and extracted fields]
  Render --> FileActions["Open PDF / file actions"]
  Render --> Versions[Show version history]
  Render --> Permissions["Show parties / whitelist"]
  Render --> Blockchain[Show notarization / on-chain status]
  Render --> VerifyAction[Open mobile verifier]

  VerifyAction --> MobileVerify["/verify/id"]
```

## 7. Mobile Document Verification Workflow

```mermaid
flowchart TD
  Start(["User opens /verify/id"]) --> FetchDoc[Fetch document verification data]
  FetchDoc --> Authorized{Authorized?}
  Authorized -- No --> AccessError[Show access denied]
  Authorized -- Yes --> HashCheck[Backend checks stored hash]

  HashCheck --> ChainCheck[Backend checks blockchain anchor]
  ChainCheck --> Result{Verification result}

  Result -- Match --> Valid["Show valid/authentic"]
  Result -- Mismatch --> Tampered[Show tampered/mismatch warning]
  Result -- Pending --> Pending["Show pending/not anchored"]
  Result -- Missing --> Unknown[Show unknown/no record]
```

## 8. Public PDF Verification Workflow

```mermaid
flowchart TD
  Browser[Unauthenticated browser] --> VerifyPage[Open /verify]
  VerifyPage --> SelectFile[Choose or drag one PDF]
  SelectFile --> FileCheck{Is one PDF file?}

  FileCheck -- No --> FileError[Show PDF-only error]
  FileCheck -- Yes --> ShowSelected[Show selected file]
  ShowSelected --> ClickVerify[User clicks Verify]

  ClickVerify --> Loading[Show verifying progress]
  Loading --> NextRoute[POST /api/public/verify<br/>Next.js route handler]
  NextRoute --> Backend[POST /public/verify<br/>Backend]

  Backend --> ComputeHash[Compute uploaded PDF hash]
  ComputeHash --> Lookup[Find matching known document/hash]
  Lookup --> Compare{Hash match?}

  Compare -- Yes --> Verified[Return verified result]
  Compare -- No --> Invalid[Return invalid/mismatch result]
  Compare -- No record --> Unknown[Return no matching record]

  Verified --> ResultCard[Show result details]
  Invalid --> ResultCard
  Unknown --> ResultCard
```

## 9. Public Code Verification Workflow

```mermaid
flowchart TD
  Browser[Unauthenticated browser] --> CodeUrl["Open /verify/code"]
  CodeUrl --> BackendSupport{"Backend has GET /public/verify/code?"}

  BackendSupport -- Yes --> FetchCode[Fetch code verification]
  FetchCode --> CodeResult{Result}
  CodeResult -- Valid --> ShowValid[Show valid document]
  CodeResult -- Invalid --> ShowInvalid["Show invalid/expired code"]
  CodeResult -- Missing --> ShowMissing[Show no record]

  BackendSupport -- No --> Limitation[Show clear limitation]
  Limitation --> PdfFallback[Link to /verify PDF upload]
```

## 10. Portal Login and Issuer Session Workflow

```mermaid
sequenceDiagram
  participant Issuer as Document Issuer
  participant Participant as Document Participant
  participant Browser as Browser
  participant Next as Next.js Route Handler
  participant Backend as Backend API

  alt Document Issuer login
    Issuer->>Browser: Enter email/password
  else Document Participant login
    Participant->>Browser: Enter email/password
  end
  Browser->>Next: POST /api/auth
  Next->>Backend: POST /auth/signin
  Backend-->>Next: authenticated profile / error

  alt document_issuer
    Next-->>Browser: Set HttpOnly portal_token and issuer_token cookies
    Browser->>Browser: Navigate to /portal/dashboard
  else document_participant
    Next-->>Browser: Set HttpOnly portal_token cookie
    Browser->>Browser: Navigate to permitted /portal workspace
  else login failed
    Next-->>Browser: Return error message
    Browser-->>Issuer: Show login error
    Browser-->>Participant: Show login error
  end

  Browser->>Next: POST /api/portal/logout
  Next-->>Browser: Clear portal_token and issuer_token cookies, including stale issuer cookie
```

## 11. Document Issuer System Management Workflow

```mermaid
flowchart TD
  Issuer[Document Issuer] --> Session{portal_token and issuer_token present?}
  Session -- Yes --> SystemManagement[System Management]
  Session -- No --> Login[Redirect to /login]
  SystemManagement --> Users["/portal/users"]
  SystemManagement --> Invitations["/portal/issuer-invitations"]
  SystemManagement --> Reports["/portal/system-reports"]
  SystemManagement --> Audit["/portal/audit-logs"]
  SystemManagement --> Statistics["/portal/system-statistics"]
  Participant[Document Participant] --> ParticipantSession{portal_token present?}
  ParticipantSession -- Yes --> Denied[Safe denial or participant portal]
  ParticipantSession -- No --> Login
```

## 12. Shared OpenAPI Type Generation Workflow

```mermaid
flowchart TD
  BackendContract[Backend exports OpenAPI] --> Json[openapi-updated.json]
  Json --> Generate[pnpm run generate:api-types]
  Generate --> Schema[packages/types/src/generated/schema.ts]
  Schema --> TypeExports[packages/types/src/index.ts]

  TypeExports --> MobileApi[apps/mobile/src/services/api/*]
  TypeExports --> SharedApi[packages/api]
  SharedApi --> WebApp[apps/web]

  MobileApi --> MobileScreens[Mobile screens/hooks]
  WebApp --> WebScreens[Web pages/route handlers]
```

## 13. API Request Flow

```mermaid
flowchart LR
  MobileScreen[Mobile Screen] --> MobileService[Mobile API Service]
  MobileService --> MobileClient[apiClient / openApiClient]
  MobileClient --> Backend[Backend API]

  WebClient[Web Client Component] --> NextHandler[Next.js Route Handler]
  NextHandler --> SharedApi[packages/api helper]
  SharedApi --> Backend

  Backend --> Response[Typed Response]
  Response --> MobileClient
  Response --> NextHandler
  NextHandler --> WebClient
```

## 14. Public Verifier Sequence Diagram

```mermaid
sequenceDiagram
  participant Browser
  participant Web as Next.js /verify
  participant Handler as /api/public/verify
  participant Backend as Backend /public/verify
  participant DB as Database
  participant Chain as Blockchain

  Browser->>Web: Select PDF
  Browser->>Web: Click Verify
  Web->>Handler: POST FormData(file)
  Handler->>Backend: POST FormData(file)
  Backend->>Backend: Compute file hash
  Backend->>DB: Lookup matching document hash
  Backend->>Chain: Check anchor / transaction if needed
  Chain-->>Backend: Anchor result
  DB-->>Backend: Document record
  Backend-->>Handler: Verification response
  Handler-->>Web: JSON response
  Web-->>Browser: Show verification result
```

## 15. Upload and Blockchain Sequence Diagram

```mermaid
sequenceDiagram
  participant Issuer as Document Issuer
  participant Mobile as Expo Mobile
  participant Backend as Backend API
  participant Storage as File Storage
  participant OCR as OCR/NLP Service
  participant DB as Database
  participant Chain as Blockchain

  Issuer->>Mobile: Upload or capture document
  Mobile->>Backend: POST document file
  Backend->>Storage: Store file off-chain
  Backend->>Backend: Compute hash
  Backend->>OCR: Process document text
  OCR-->>Backend: Extracted text / summary / metadata
  Backend->>DB: Save document metadata and processing state
  Backend->>Chain: Anchor document hash
  Chain-->>Backend: Transaction hash / status
  Backend->>DB: Save blockchain record
  Backend-->>Mobile: Upload accepted / document status
  Mobile-->>Issuer: Show processing or document detail
```

## 16. Deployment Flow

```mermaid
flowchart TD
  Repo[GitHub Repository] --> MobileDeploy[Expo EAS Build]
  Repo --> WebDeploy["Vercel / Netlify Next.js Deploy"]
  Repo --> BackendDeploy[Backend Deploy]

  MobileDeploy --> Android[Android Build]
  MobileDeploy --> IOS[iOS Build]

  WebDeploy --> Domain[lexchain.app]
  BackendDeploy --> ApiDomain[api.lexchain.app]

  Domain --> WebRoutes["Landing / Verify / Invite / Portal"]
  Domain --> LegacyAdmin["/admin redirects"]
  ApiDomain --> BackendRoutes["Auth / Documents / Issuer Operations / Public Verify"]

  Android --> AppLinks[Android App Links later]
  IOS --> UniversalLinks[iOS Universal Links later]
  AppLinks --> InviteLinks[https://lexchain.app/invite/token]
  UniversalLinks --> InviteLinks
```

## 17. Security Boundary Diagram

```mermaid
flowchart TB
  subgraph Frontend
    Mobile[Expo Mobile]
    Web[Next.js Web]
  end

  subgraph Shared
    Types[Generated Types]
    ApiHelpers[API Helpers]
    Config[Config Helpers]
  end

  subgraph BackendTrusted[Backend Trusted Boundary]
    Auth[Authorization]
    Permissions[Document Permissions]
    Processing["OCR/NLP Processing"]
    Hashing[Hash Computation]
    IssuerAuthorization[Issuer Authorization]
  end

  subgraph External
    Storage[(File Storage)]
    Chain[Blockchain]
  end

  Mobile --> Auth
  Web --> Auth
  Mobile --> ApiHelpers
  Web --> ApiHelpers
  ApiHelpers --> Auth

  Auth --> Permissions
  Permissions --> Processing
  Processing --> Hashing
  Hashing --> Storage
  Hashing --> Chain
  IssuerAuthorization --> Permissions
```

Security rule summary:

```txt
Frontend may request actions.
Backend must authorize actions.
Blockchain may prove integrity.
Blockchain does not prove legal validity.
```

## 18. Current State Summary

```mermaid
flowchart TD
  Done[Current Architecture Done] --> Monorepo[Monorepo in place]
  Done --> Mobile[Expo mobile focused]
  Done --> Web[Next.js web routes in place]
  Done --> Shared[Shared packages in place]
  Done --> Docs[Workflow docs in place]

  Remaining[Still needs production work] --> Smoke[Manual smoke testing]
  Remaining --> Env[Production env setup]
  Remaining --> Backend[Real backend endpoint confirmation]
  Remaining --> Deploy[Web and mobile deployment]
  Remaining --> Links["Universal/App Links"]
```
