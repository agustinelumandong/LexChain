# Root web migration baseline

Branch: `codex/root-web-architecture`, created from `1d3852c74c5162d1cb30f5aa5782acafe7e17b57`.
Published Expo archive independently verified at the same commit: `codex/backup-expo-before-web-pwa-2026-09-09`.

Initial checks before any relocation:
- pnpm 11.13.0, Node 24.12.0; frozen install passed.
- Vitest: 66 files, 409 tests; 398 passed and 11 failed.
- ESLint failed with one pre-existing document-list memoization error (the initial log read preceded completion).
- TypeScript failed on obsolete schema references/fixtures, a React 19 ref initializer and test spy typings.
- Production bundle compiled, then failed type checking at portal-search-bar useRef.

The failures are repaired in a separate prerequisite commit. Baseline failures include outdated integrity fixtures, absent Next router mocks, source audit assertions pointing at a previous UI location, navigation expectation drift and a PDF import exceeding the concurrent test timeout.

Deployment root and real Android/iOS install checks are external acceptance gates; local checks alone do not verify them. The legacy E2E script performs backend mutations; do not run it against production. Credentials must come from environment variables.
