# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-14T16:33:46+08:00
**Commit:** fd2fc6b
**Branch:** main

## OVERVIEW
Expo Router frontend (React Native + web) with file-based routes under `app/`, shared themed UI in `components/`, and design/domain.

## STRUCTURE
```text
frontend/
├── app/                  # Expo Router route tree + layouts
├── components/           # Reusable UI primitives + platform wrappers
├── hooks/                # Theme/color hooks used across app/components
├── constants/            # Shared tokens (colors/fonts)
├── scripts/              # Project utility script(s)
├── lexchain/             # Capstone/domain docs, diagrams, references
├── .agents/skills/       # Local skill docs/references for agent workflows
├── .opencode/            # OpenCode ECC plugin config, commands, prompts, tools
└── assets/images/        # Static image assets
```

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| App entrypoint | `package.json` (`main`) | Uses `expo-router/entry` |
| Root navigation shell | `app/_layout.tsx` | Stack + theme provider |
| Tab navigation | `app/(tabs)/_layout.tsx` | Tabs.Screen definitions |
| Screen content | `app/(tabs)/*.tsx`, `app/modal.tsx` | Route files are source of truth |
| Theme tokens | `constants/theme.ts` | Colors + Fonts |
| Theme resolution | `hooks/use-theme-color.ts`, `hooks/use-color-scheme*.ts` | Centralized hook logic |
| Cross-platform UI wrappers | `components/themed-*.tsx`, `components/ui/*` | Reuse before adding new primitives |
| Project reset behavior | `scripts/reset-project.js` | Destructive/move logic |
| Domain/capstone docs | `lexchain/` | Markdown + diagrams; non-runtime |
| OpenCode ECC integration | `.opencode/opencode.json`, `.opencode/README.md` | Plugin/agent/command catalog config |

## CODE MAP
| Symbol | Type | Location | Refs | Role |
|---|---|---|---:|---|
| `RootLayout` | function | `app/_layout.tsx` | high | App shell and stack mounting |
| `TabLayout` | function | `app/(tabs)/_layout.tsx` | high | Primary tab navigator |
| `ParallaxScrollView` | function | `components/parallax-scroll-view.tsx` | medium | Shared animated screen container |
| `ThemedText` | function | `components/themed-text.tsx` | high | Theme-aware text primitive |
| `ThemedView` | function | `components/themed-view.tsx` | high | Theme-aware container primitive |
| `useThemeColor` | function | `hooks/use-theme-color.ts` | medium | Token fallback resolver |
| `useColorScheme` | function/export | `hooks/use-color-scheme*.ts` | high | Theme mode source |
| `Colors`, `Fonts` | constants | `constants/theme.ts` | high | Shared visual tokens |

## CONVENTIONS
- Expo Router file-based routing (`app/`), no custom router registry.
- TypeScript strict mode enabled in `tsconfig.json`.
- Root import alias: `@/*` → project root.
- ESLint uses `eslint-config-expo/flat`; `dist/*` ignored.
- Theming pattern: pull colors via `useThemeColor` + `Colors`; avoid hardcoding unless deliberate visual exception.

## ANTI-PATTERNS (THIS PROJECT)
- Adding parallel navigation abstractions outside Expo Router route files.
- Bypassing themed primitives for routine UI text/view rendering.
- Introducing a second package manager workflow (both `package-lock.json` and `pnpm-lock.yaml` already exist; avoid further drift).

## UNIQUE STYLES
- Current app skeleton is create-expo-app style, but repo also contains large capstone
- `.agents/skills/` is intentionally present for local skill references; keep agent docs isolated from runtime routes/components.
- `.opencode/` is reserved for OpenCode framework integration; keep separate from app runtime and agent skills.
- Design reference is in `DESIGN.md`; refer there for color/typography specs, component patterns, and accessibility guidelines before authoring new primitives.

## COMMANDS
```bash
pnpm install
pnpm run start
pnpm run android
pnpm run ios
pnpm run web
pnpm run lint
pnpm run reset-project
```

## NOTES
- No test runner is configured in `package.json` yet.
- No CI workflow detected in this frontend directory.
- `scripts/reset-project.js` can move/delete core folders; read before use.

## SESSION LEARNINGS

### Navigation
- Expo Router root `Stack` still needs explicit `headerShown: false` for the `"(auth)"` group in `app/_layout.tsx` even when the nested `app/(auth)/_layout.tsx` JS stack also hides headers. Otherwise parent header can still appear.
- In Expo Router root layouts, route names must match actual route entries. `"(auth)"` is valid when a nested group layout exists. Without that nested group layout, using `name="(auth)"` causes route warnings.
- Auth screen-to-screen navigation should use `router.replace(...)`, not `router.push(...)`, for toggles like `"Create an account"` and `"Already have an account? Sign in"`. `push(...)` stacks duplicate auth screens and gets glitchy when spam-tapped.
- For spam-prone auth toggle buttons, add a short transition lock state and cleanup timeout on unmount. This prevents repeated taps from stacking multiple navigation actions mid-animation.

### Auth Transitions
- For auth-only custom transitions, keep root app on Expo Router native stack and add `app/(auth)/_layout.tsx` using `@react-navigation/stack` + `withLayoutContext`. Use this only where custom `cardStyleInterpolator` is needed.
- Native Expo Router `Stack` supports preset native-stack animations like `slide_from_left`, `slide_from_right`, and `fade_from_right`, but not custom `cardStyleInterpolator`. If design needs true combined slide + fade, switch that route group to `@react-navigation/stack`.
- For custom auth transitions in `app/(auth)/_layout.tsx`, centralize animation behavior there instead of scattering per-screen navigator config in screen components or shared shells.

### Bottom Sheet
- `@gorhom/bottom-sheet` exports `BottomSheet` as default import. `BottomSheetModal`, `BottomSheetView`, and hooks are named exports. Importing `BottomSheet` as named export causes runtime `Element type is invalid` errors.
- On this app, landing-screen sheet should use plain `BottomSheet`, not `BottomSheetModal`, when behavior must be scoped strictly to `app/index.tsx`. `BottomSheetModal` goes through global provider/portal behavior and was easier to leak across route transitions.
- `BottomSheet` `index` is best treated as initial state. After mount, use imperative methods such as `snapToIndex(0)` and `close()` for reliable animated reopen/close behavior.
- If a sheet or other navigator-driven animation fails to replay on return, prefer focus-based handling (`useIsFocused` / focus effect) over mount-only logic. Expo Router can restore a screen without fully remounting it.
- For landing-sheet behavior:
  - open on landing focus
  - close before auth navigation
  - reopen when returning to landing
  - if animation is hard to notice before route change, add a short delay before `router.push(...)`

### Dependency Pitfalls
- `pnpm` in this repo must keep `lightningcss` pinned to `1.30.1`. Keep both root `overrides` and `pnpm.overrides` in `package.json`; otherwise installs can drift to `1.32.0` and break `react-native-css` / NativeWind bundling with `failed to deserialize; expected an object-like struct named Specifier`.
- This repo already mixes `package-lock.json` and `pnpm-lock.yaml`; avoid adding more package-manager drift. Prefer `pnpm` for changes because project commands use it.

### Maintenance Rule
- When a session uncovers a new repo-specific lesson, pitfall, workaround, or preferred pattern that would help future work, explicitly ask the user whether to add it to `AGENTS.md` instead of updating the file silently.
- Ask in a simple yes/no form. If the user says yes, update `AGENTS.md` with the new learning in the most relevant section or create a new subsection if needed.
