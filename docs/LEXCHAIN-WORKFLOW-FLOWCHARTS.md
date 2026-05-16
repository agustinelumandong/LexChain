# LexChain Workflow Flowcharts

Last updated: 2026-05-16

This document contains Mermaid diagrams for the main LexChain workflows. It is meant to support adviser review, developer onboarding, and implementation planning.

## 1. Whole System Architecture

```mermaid
flowchart TB
  User[Mobile User] --> Mobile[Expo Mobile App<br/>apps/mobile]
  Public[Public Visitor] --> Web[Next.js Web App<br/>apps/web]
  Admin[Super Admin] --> Web

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
  MobileApp --> MobileUpload[Upload / Camera]
  MobileApp --> MobileProcess[Processing]
  MobileApp --> MobileVerify[Mobile Verify<br/>/verify/[id]]
  MobileApp --> MobileProfile[Profile]

  WebApp --> Landing[Landing<br/>/]
  WebApp --> PublicVerify[Public Verifier<br/>/verify]
  WebApp --> PublicCode[Code Verifier<br/>/verify/[code]]
  WebApp --> Invite[Invite Fallback<br/>/invite/[token]]
  WebApp --> Download[Download<br/>/download]
  WebApp --> AdminPortal[Admin Portal<br/>/admin/*]
  WebApp --> LegalPages[Terms / Privacy]

  Packages --> Types[types]
  Packages --> Api[api]
  Packages --> Config[config]
```

## 3. Mobile Authentication Workflow

```mermaid
flowchart TD
  Start([User opens mobile app]) --> HasSession{Existing valid session?}
  HasSession -- Yes --> Dashboard[Go to Dashboard]
  HasSession -- No --> AuthScreen[Show Sign In / Sign Up]

  AuthScreen --> SignIn[User enters email/password]
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
  Browser --> InvitePage[Next.js Invite Page<br/>/invite/[token]]

  InvitePage --> Choice{User choice}
  Choice --> OpenApp[Open in app]
  Choice --> Download[Download app]
  Choice --> ContinueWeb[Continue on website]

  OpenApp --> DeepLink[lexchain://sign-up?token=token]
  DeepLink --> MobileSignup[Mobile Sign Up receives token]
  MobileSignup --> SubmitSignup[Submit signup with token if backend supports it]
  SubmitSignup --> BackendValidate[Backend validates invitation]

  Download --> DownloadPage[/download]
  ContinueWeb --> AdminOrWeb[Allowed web route]

  BackendValidate --> SignupResult{Valid token?}
  SignupResult -- Yes --> AccountCreated[Create account / grant invite access]
  SignupResult -- No --> InviteError[Show invite error]
```

## 5. Mobile Upload and Processing Workflow

```mermaid
flowchart TD
  Start([User starts document upload]) --> Source{Upload source}

  Source -- File picker --> PickFile[Select PDF/file]
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
  SaveStatus --> DocumentReady[Document appears in list/detail]
```

## 6. Document Detail Workflow

```mermaid
flowchart TD
  List[Documents tab] --> Select[User selects document]
  Select --> Detail[/document/[id]]
  Detail --> Fetch[GET /documents/{document_id}]
  Fetch --> Found{Document found and authorized?}
  Found -- No --> Error[Show not found / access error]
  Found -- Yes --> Render[Render detail screen]

  Render --> Summary[Show summary and extracted fields]
  Render --> FileActions[Open PDF / file actions]
  Render --> Versions[Show version history]
  Render --> Permissions[Show parties / whitelist]
  Render --> Blockchain[Show notarization / on-chain status]
  Render --> VerifyAction[Open mobile verifier]

  VerifyAction --> MobileVerify[/verify/[id]]
```

## 7. Mobile Document Verification Workflow

```mermaid
flowchart TD
  Start([User opens /verify/[id]]) --> FetchDoc[Fetch document verification data]
  FetchDoc --> Authorized{Authorized?}
  Authorized -- No --> AccessError[Show access denied]
  Authorized -- Yes --> HashCheck[Backend checks stored hash]

  HashCheck --> ChainCheck[Backend checks blockchain anchor]
  ChainCheck --> Result{Verification result}

  Result -- Match --> Valid[Show valid/authentic]
  Result -- Mismatch --> Tampered[Show tampered/mismatch warning]
  Result -- Pending --> Pending[Show pending/not anchored]
  Result -- Missing --> Unknown[Show unknown/no record]
```

## 8. Public PDF Verification Workflow

```mermaid
flowchart TD
  Visitor[Public visitor] --> VerifyPage[Open /verify]
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
  Visitor[Public visitor] --> CodeUrl[Open /verify/[code]]
  CodeUrl --> BackendSupport{Backend has GET /public/verify/{code}?}

  BackendSupport -- Yes --> FetchCode[Fetch code verification]
  FetchCode --> CodeResult{Result}
  CodeResult -- Valid --> ShowValid[Show valid document]
  CodeResult -- Invalid --> ShowInvalid[Show invalid/expired code]
  CodeResult -- Missing --> ShowMissing[Show no record]

  BackendSupport -- No --> Limitation[Show clear limitation]
  Limitation --> PdfFallback[Link to /verify PDF upload]
```

## 10. Admin Login and Session Workflow

```mermaid
sequenceDiagram
  participant Admin as Super Admin
  participant Browser as Browser
  participant Next as Next.js Route Handler
  participant Backend as Backend API

  Admin->>Browser: Enter email/password
  Browser->>Next: POST /api/admin/auth
  Next->>Backend: POST /auth/signin
  Backend-->>Next: access_token / error

  alt login success
    Next-->>Browser: Set HttpOnly admin_token cookie
    Browser->>Browser: Navigate to /admin/dashboard
  else login failed
    Next-->>Browser: Return error message
    Browser-->>Admin: Show login error
  end
```

## 11. Admin Dashboard Data Workflow

```mermaid
flowchart TD
  Admin[Admin opens /admin/dashboard] --> CheckCookie{admin_token cookie exists?}

  CheckCookie -- Yes --> FetchLive[Fetch backend /admin/dashboard]
  FetchLive --> LiveOk{Backend success?}
  LiveOk -- Yes --> ShowLive[Show live dashboard metrics]
  LiveOk -- No --> DemoFallback[Show demo fallback data]

  CheckCookie -- No --> DemoFallback

  DemoFallback --> Notice[Show demo fallback notice]
  ShowLive --> Dashboard[Render dashboard cards/charts]
  Notice --> Dashboard
```

## 12. Admin Page-by-Page Workflow

```mermaid
flowchart TB
  AdminShell[Admin Shell<br/>Sidebar + Content Layout] --> Dashboard[Dashboard]
  AdminShell --> Users[Users]
  AdminShell --> Documents[Documents]
  AdminShell --> Issuers[Document Issuers]
  AdminShell --> Categories[Categories]
  AdminShell --> Invitations[Invitations & Permissions]
  AdminShell --> Verifications[Verification Logs]
  AdminShell --> Blockchain[Blockchain Records]
  AdminShell --> Processing[OCR / NLP Processing]
  AdminShell --> Analytics[Analytics]
  AdminShell --> Audit[Audit Logs]
  AdminShell --> Settings[System Settings]

  Dashboard --> Metrics[Platform Metrics]
  Users --> UserTable[User Table]
  Documents --> DocumentTable[Document Table]
  Issuers --> IssuerTable[Issuer Table]
  Categories --> CategoryRules[Category Rules]
  Invitations --> AccessEvents[Access Events]
  Verifications --> VerificationTable[Verification Attempts]
  Blockchain --> ChainTable[Hash Anchors]
  Processing --> ProcessingTable[Processing Jobs]
  Analytics --> MetricTable[Operational Metrics]
  Audit --> AuditTable[Security/Activity Events]
  Settings --> ConfigTable[System Configuration]
```

## 13. Admin Monitoring Workflow

```mermaid
flowchart TD
  Start([Admin reviews system]) --> Dashboard[Check dashboard health]
  Dashboard --> Issues{Any issue?}

  Issues -- Failed documents --> Processing[Open OCR/NLP Processing]
  Issues -- Tamper alerts --> VerificationLogs[Open Verification Logs]
  Issues -- Chain failures --> BlockchainRecords[Open Blockchain Records]
  Issues -- User problems --> Users[Open Users]
  Issues -- Permission problems --> Invitations[Open Invitations & Permissions]
  Issues -- No issue --> Analytics[Review Analytics]

  Processing --> ReviewAction[Investigate / retry later via backend action]
  VerificationLogs --> ReviewAction
  BlockchainRecords --> ReviewAction
  Users --> ReviewAction
  Invitations --> ReviewAction
  Analytics --> Done([Monitoring complete])
  ReviewAction --> AuditLogs[Check Audit Logs]
  AuditLogs --> Done
```

## 14. Shared OpenAPI Type Generation Workflow

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

## 15. API Request Flow

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

## 16. Public Verifier Sequence Diagram

```mermaid
sequenceDiagram
  participant Visitor
  participant Web as Next.js /verify
  participant Handler as /api/public/verify
  participant Backend as Backend /public/verify
  participant DB as Database
  participant Chain as Blockchain

  Visitor->>Web: Select PDF
  Visitor->>Web: Click Verify
  Web->>Handler: POST FormData(file)
  Handler->>Backend: POST FormData(file)
  Backend->>Backend: Compute file hash
  Backend->>DB: Lookup matching document hash
  Backend->>Chain: Check anchor / transaction if needed
  Chain-->>Backend: Anchor result
  DB-->>Backend: Document record
  Backend-->>Handler: Verification response
  Handler-->>Web: JSON response
  Web-->>Visitor: Show verification result
```

## 17. Upload and Blockchain Sequence Diagram

```mermaid
sequenceDiagram
  participant User
  participant Mobile as Expo Mobile
  participant Backend as Backend API
  participant Storage as File Storage
  participant OCR as OCR/NLP Service
  participant DB as Database
  participant Chain as Blockchain

  User->>Mobile: Upload or capture document
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
  Mobile-->>User: Show processing or document detail
```

## 18. Deployment Flow

```mermaid
flowchart TD
  Repo[GitHub Repository] --> MobileDeploy[Expo EAS Build]
  Repo --> WebDeploy[Vercel / Netlify Next.js Deploy]
  Repo --> BackendDeploy[Backend Deploy]

  MobileDeploy --> Android[Android Build]
  MobileDeploy --> IOS[iOS Build]

  WebDeploy --> Domain[lexchain.app]
  BackendDeploy --> ApiDomain[api.lexchain.app]

  Domain --> WebRoutes[Landing / Verify / Invite / Admin]
  ApiDomain --> BackendRoutes[Auth / Documents / Admin / Public Verify]

  Android --> AppLinks[Android App Links later]
  IOS --> UniversalLinks[iOS Universal Links later]
  AppLinks --> InviteLinks[https://lexchain.app/invite/token]
  UniversalLinks --> InviteLinks
```

## 19. Security Boundary Diagram

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
    Processing[OCR/NLP Processing]
    Hashing[Hash Computation]
    AdminRules[Admin Rules]
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
  AdminRules --> Permissions
```

Security rule summary:

```txt
Frontend may request actions.
Backend must authorize actions.
Blockchain may prove integrity.
Blockchain does not prove legal validity.
```

## 20. Current State Summary

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
  Remaining --> Links[Universal/App Links]
```
