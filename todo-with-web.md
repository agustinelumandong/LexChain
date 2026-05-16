You are working on my LexChain frontend repo.

## Current Implementation Status

- [x] Move the old Expo app from `frontend/` to `apps/mobile/`.
- [x] Keep mobile-native routes and features in Expo, including `apps/mobile/app/verify/[id].tsx`.
- [x] Create `apps/web` with Next.js App Router.
- [x] Add Next.js landing, public verifier, invite fallback, admin login, admin dashboard, and admin section routes.
- [x] Add `/download`, `/privacy`, and `/terms` web pages.
- [x] Add `packages/types`, `packages/api`, and `packages/config`.
- [x] Move generated OpenAPI types ownership to `packages/types`.
- [x] Use shared config/API helpers from the Next.js web app.
- [x] Keep one root `pnpm-lock.yaml`.
- [ ] Finish production-grade admin feature parity page by page.
- [ ] Remove Expo web fallback files only after the Next.js site is deployed and confirmed.

I want to update the architecture so Expo remains the mobile app, and Next.js becomes the new web app for:
- Landing page
- Admin panel
- Public verifier
- Invite fallback pages

Current repo state:
The project is currently an Expo Router frontend using React Native + web. It has mobile features like upload documents, AI processing, document verification, ECC cryptography, whitelist access, and user profiles.

Current important structure:
frontend/
  app/
    _layout.tsx
    _layout.web.tsx
    index.tsx
    index.web.tsx
    upload.tsx
    upload.web.tsx
    camera-capture.tsx
    camera-capture.web.tsx
    capture-review.tsx
    capture-review.web.tsx
    processing.tsx
    processing.web.tsx
    (auth)/
    auth/
    (tabs)/
    document/
    verify/
    profile/
    public/
      verify/
        index.tsx
        [code].tsx
    admin/
      login.tsx
      (protected)/
        dashboard.tsx
        documents.tsx
        users.tsx
        analytics.tsx
        audit-logs.tsx
        blockchain-records.tsx
        categories.tsx
        document-issuers.tsx
        invitations-permissions.tsx
        ocr-nlp-processing.tsx
        system-settings.tsx
        verification-logs.tsx
  src/
    features/
      admin/
      verification/
      website/
      upload/
      documents/
      document/
      auth/
      profile/
    services/
      api/
      query/
    shared/
    types/

Current web behavior:
- app/_layout.web.tsx allows /, /admin, and /public.
- app/index.web.tsx renders the current WebsiteLandingScreen.
- app/admin/* is the current web-only admin panel.
- app/public/verify is the current public verification area.
- Most native-only routes have .web.tsx redirect stubs.

Goal:
Create a safer architecture where:
- Expo is mobile-only or mostly mobile-only.
- Next.js handles the real website/web portal.
- Landing page, Admin, Public Verifier, and Invite fallback move to Next.js.
- Shared API types and API client are extracted gradually.
- Existing Expo mobile app must not break.

Target architecture:

lexchain/
  apps/
    mobile/       Existing Expo app
    web/          New Next.js app
  packages/
    api/          Shared API client/helpers
    types/        Shared TypeScript types/generated OpenAPI types
    config/       Shared environment/config helpers
    ui/ optional  Shared design tokens only, not React Native UI components

Important:
Do not blindly migrate everything.
Do not delete working Expo web files immediately.
Do not break the Expo mobile app.
Do not rename app/verify/[id].tsx.
Do not move mobile upload/camera/document screens to Next.js.
Do not import React Native components into Next.js unless there is a clear compatibility plan.
Do not create unnecessary abstractions.

Please inspect the repo first before editing:
1. Read .agents/rules/expo.md.
2. Read AGENTS.md.
3. Read graphify-out/GRAPH_REPORT.md.
4. Inspect package.json, pnpm workspace status, tsconfig.json, babel config, metro config, app config, env files, and current aliases.
5. Inspect current web-only code:
   - app/index.web.tsx
   - src/features/website/
   - app/admin/
   - src/features/admin/
   - app/public/verify/
   - src/features/verification/
   - src/services/api/public.api.ts
   - src/services/api/admin.api.ts
   - src/services/query/use-public.ts
   - src/services/query/use-admin.ts

Main task:
Prepare a safe migration plan and, only if safe, create the initial Next.js app structure.

Recommended migration approach:

Phase 0 — Repo safety check
- Confirm current package manager is pnpm.
- Confirm whether the repo root can become a pnpm workspace.
- Confirm whether current frontend/ should become apps/mobile or stay temporarily as frontend/.
- Check whether moving the Expo app will break path aliases, asset paths, app config, EAS config, NativeWind, Metro, or tsconfig.
- Identify what should be migrated now versus later.

Phase 1 — Create Next.js web app without breaking Expo
- Add apps/web as a new Next.js app.
- Use TypeScript.
- Use App Router.
- Use Tailwind if compatible with the repo.
- Add routes:
  - /
  - /verify
  - /verify/[code]
  - /invite/[token]
  - /admin/login
  - /admin/dashboard
- Keep this web app minimal first.
- Do not move the full admin UI yet unless dependencies are safe.
- Do not delete Expo web routes yet.

Phase 2 — Extract shared packages gradually
Create shared packages only if the workspace is ready:
- packages/types
- packages/api
- packages/config

Move only safe shared code first:
- OpenAPI/generated types
- request/response types
- API endpoint helpers
- environment base URL helpers

Do not move:
- React Native UI components
- Expo-specific hooks
- SecureStore implementation
- Expo Router screens
- Native upload/camera/PDF viewer logic

Phase 3 — Migrate website/landing to Next.js
Move or recreate:
- src/features/website/components
- src/features/website/screens/WebsiteLandingScreen

But adapt them to normal web:
- use HTML elements
- use Next.js Image where useful
- use browser-friendly CSS/Tailwind
- do not depend on react-native primitives

Phase 4 — Migrate public verifier to Next.js
Move/recreate:
- /public/verify upload page → Next.js /verify
- /public/verify/[code] → Next.js /verify/[code]

Use browser-native APIs:
- input type="file"
- FormData
- File
- Blob
- fetch or shared API client

Important public verifier notes:
- Current PDF upload verifier uses POST /public/verify.
- Current code-based verification has a backend stub if GET /public/verify/{code} is not implemented yet.
- Preserve that limitation clearly in the UI or API layer.
- Do not pretend code verification is fully working if backend endpoint is missing.

Phase 5 — Migrate Admin to Next.js
Move/recreate:
- app/admin/login.tsx → apps/web/app/admin/login/page.tsx
- app/admin/(protected)/dashboard.tsx → apps/web/app/admin/dashboard/page.tsx
- documents, users, analytics, audit logs, blockchain records, categories, document issuers, invitations permissions, OCR/NLP, system settings, verification logs

Use normal web layout:
- sidebar
- topbar
- protected route handling
- admin session/token handling
- browser storage/cookies as appropriate

Important:
- Do not use Expo SecureStore in Next.js.
- Do not expose secrets in the frontend.
- Backend remains source of truth for authorization.
- Admin APIs should stay typed and centralized.

Phase 6 — Update Expo mobile app
After Next.js web routes exist:
- Keep Expo mobile focused on native app features.
- Keep app/verify/[id].tsx as mobile-specific verification.
- Keep upload, camera, processing, document detail, PDF viewer native.
- Remove or simplify Expo web landing/admin/public only after Next.js is confirmed working.
- app/_layout.web.tsx and .web.tsx redirect stubs can be removed later, not immediately.

Expected final route split:

Expo mobile:
- /(auth)/sign-in
- /(auth)/sign-up
- /(tabs)
- /upload
- /camera-capture
- /capture-review
- /processing
- /document/[id]
- /document/pdf-viewer
- /verify/[id]
- /profile/*

Next.js web:
- /
- /verify
- /verify/[code]
- /invite/[token]
- /admin/login
- /admin/dashboard
- /admin/documents
- /admin/users
- /admin/analytics
- /admin/audit-logs
- /admin/blockchain-records
- /admin/categories
- /admin/document-issuers
- /admin/invitations-permissions
- /admin/ocr-nlp-processing
- /admin/system-settings
- /admin/verification-logs

Deep link and invite strategy:
- Email invitation links should use HTTPS:
  https://lexchain.app/invite/[token]
- The Next.js invite page should show:
  - Open in app
  - Download app
  - Continue on website, if allowed
- The Open in app button may use:
  lexchain://sign-up?token=[token]
- Later, configure Android App Links and iOS Universal Links for:
  https://lexchain.app/invite/[token]
  https://lexchain.app/verify/[code]

Deployment recommendation:
- Expo mobile: EAS Build
- Next.js web: Vercel preferred, or Netlify
- Namecheap should be DNS/domain provider, not necessarily the app host
- lexchain.app points to Next.js web
- API remains on the backend domain or subdomain, for example api.lexchain.app

Output format:
Before editing, give me:
1. Current repo assessment
2. Whether monorepo migration is safe right now
3. Recommended final structure
4. Exact files to move later
5. Exact files that should not be touched yet
6. Migration risks
7. Commands you will run
8. First small implementation step

If implementing:
- Make the smallest safe change.
- Prefer creating apps/web first without moving the Expo app.
- Do not delete current Expo web routes yet.
- Do not change mobile route behavior.
- Run pnpm install only if needed.
- Run pnpm lint or typecheck if available.
- Report any untested areas.

Critical rules:
- Use pnpm.
- Keep lightningcss pinned to 1.30.1 if touching package.json.
- Do not import .agents or .agent into runtime code.
- Do not add secrets to frontend code.
- Do not modify parseApiError(), request(), or other god nodes unless required.
- Do not use raw fetch inside screens if a shared API layer already exists, except for temporary isolated Next.js bootstrapping with a clear TODO.
- Keep changes small and reviewable.

My recommendation for your first actual move is this:

Do not move the Expo app yet.
First create apps/web as a separate Next.js app.
Keep frontend/ untouched.
Then slowly copy/rebuild landing, verifier, and admin into Next.js.
