# Task 6 report: deterministic session recovery browser check

## Result

- Added `e2e/session-recovery.mjs`, a deterministic Playwright script that uses a local production server and stubs the frontend's upstream API responses in the browser; the local logout handler runs normally.
- A present portal cookie receives a stubbed document `401`; the browser sends one navigation request to `/login` and one real local logout request. This covers frontend recovery only.
- The upload form receives stubbed `422`, `403`, and `404` responses. The validation message renders beside its field, document/page values and selected PDF remain, and the two authorization/resource failures leave the browser on the upload page without another sign-in navigation.
- Added `pnpm e2e:session-recovery` to `package.json`.

## Verification

- `pnpm build` — passed; optimized production build compiled and TypeScript completed.
- `pnpm start` — local production server ready at `http://localhost:3000`.
- `pnpm e2e:session-recovery` — passed against that server; all API responses were stubbed in Playwright. The local logout handler was exercised. No live backend was used.
- `pnpm exec vitest run --testTimeout=15000 --maxWorkers=2` — passed, 92 files and 691 tests.
- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `git diff --check` — passed.

## Scope and limitations

- No production source, API contract, cookies, request methods, payloads, upload encoding, or admin/auth flows were changed.
- The requested `.agents/skills/implement/SKILL.md` does not exist in this worktree. Repository `AGENTS.md`, the approved spec, README, architecture guide, Ponytail full, superpowers TDD, and Playwright guidance were read and followed.
- The Playwright skill prefers CLI-first manual browser use, but this task explicitly requires a repeatable Playwright script; the repository's existing `e2e/*.mjs` scripts use the same `playwright` package and convention.
- The duplicate same-path `framenavigated` callbacks were not used as navigation evidence; Playwright's document navigation request count provides the deterministic one-request assertion.
- This does not verify deployed authentication, backend authorization, or real browser/backend behavior.
