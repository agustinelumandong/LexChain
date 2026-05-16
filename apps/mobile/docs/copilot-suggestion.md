# Pull Request Overview

Adds a new Expo Router public route for document verification (`/public/verify/[code]`) and introduces a frontend "verification" feature module (UI + hook + API placeholders) to render a public-facing verification result screen.

## Changes

- Introduces `frontend/app/public/verify/[code].tsx` and `frontend/app/public/_layout.tsx` for the new public route group.
- Adds a new `src/features/verification` module (types, demo API, React Query hook, UI components, web screen).
- Registers the `public` route group in the root stack layout.

## Reviewed Changes

Copilot reviewed 10 out of 10 changed files in this pull request and generated 5 comments.

### Summary per File

| File | Description |
|------|-------------|
| `frontend/src/features/verification/types.ts` | Defines public verification status/result types used by the new UI. |
| `frontend/src/features/verification/api.ts` | Adds a (currently demo-only) API function for lookup by verification code. |
| `frontend/src/features/verification/hooks.ts` | Adds a React Query hook to fetch verification results by code. |
| `frontend/src/features/verification/components/VerificationStatusBadge.tsx` | Adds a badge UI for verification status display. |
| `frontend/src/features/verification/components/VerificationResultCard.tsx` | Adds the main result card UI for displaying verification details. |
| `frontend/src/features/verification/screens/PublicVerifyWebScreen.tsx` | Adds the public verification screen rendering states + result card + actions. |
| `frontend/src/features/verification/index.ts` | Barrel exports for the verification feature module. |
| `frontend/app/public/verify/[code].tsx` | New public route entry to render the verify screen from the URL param. |
| `frontend/app/public/_layout.tsx` | Public route-group stack configuration (header hidden). |
| `frontend/app/_layout.tsx` | Registers the `public` route group in the root navigation stack. |

## Comments Suppressed Due to Low Confidence

### `frontend/src/features/verification/screens/PublicVerifyWebScreen.tsx:76`

This button uses an "open-in-new" icon but performs an in-app `router.replace('/')`. If the intent is to open an external site, use `Linking.openURL(...)`; if the intent is to return to the app home, consider changing the label/icon to match (and avoid duplicating the CTA above).

```tsx
<Button
  label="Go to LexChain"
  leftIconName="open-in-new"
  onPress={() => router.replace('/')}
/>
```

---

## High-Priority Comments

### `frontend/app/public/verify/[code].tsx` (Lines 6–8)

**Issue:** `useLocalSearchParams` can return `string | string[]`, but this route types `code` as `string` and passes it through un-normalized. This will break if the param is provided multiple times.

**Suggested Fix:**

```tsx
const { code } = useLocalSearchParams<{ code?: string | string[] }>();
const normalizedCode = Array.isArray(code) ? code[0] : code;
return <PublicVerifyWebScreen code={normalizedCode} />;
```

### `frontend/src/features/verification/hooks.ts` (Lines 8–16)

**Issue:** The query function swallows all errors and returns demo data, which means `verificationQuery.error` will never be set and real backend/network failures are silently hidden.

**Recommendation:** Let errors propagate so the ErrorState can render, or only fall back to demo data behind an explicit flag (e.g., `env.useMockApi`).

### `frontend/src/features/verification/api.ts` (Lines 33–35)

**Issue:** `verifyDocumentByCode` currently returns demo data unconditionally, so the new public verification route never performs an actual verification call.

**Recommendation:** Integrate with the existing `apiClient + env.useMockApi` pattern (like `documentsApi`) so real environments hit the backend and demo data is only used when mock mode is enabled.

## Medium-Priority Comments

### `frontend/src/features/verification/screens/PublicVerifyWebScreen.tsx` (Lines 23–27)

**Issue:** `result` falls back to `getDemoPublicVerification` whenever `verificationCode` is present, even if the real query is still loading or has errored.

**Recommendation:** Remove this UI-level fallback and rely on the hook/API layer (or a mock-mode flag) for demo behavior.

### `frontend/src/features/verification/screens/PublicVerifyWebScreen.tsx` (Lines 67–72)

**Issue:** The "Verify another document" button's action (`router.replace('/')`) navigates to the same place as the "Go to LexChain" button below, making the label/icon misleading.

**Recommendation:** Route "Verify another document" to an actual public entry screen (or remove one of the CTAs) so the actions are distinct.

```tsx
<Button
  label="Verify another document"
  variant="secondary"
  leftIconName="search"
  onPress={() => router.replace('/')}
/>
```

