# AGENT SKILLS KNOWLEDGE BASE

**Scope:** `.agent/` only
**Role:** Local skill-pack documentation for this frontend workspace.

---

## OVERVIEW

This subtree stores reusable skill instructions and references consumed by coding agents. It is documentation/config support, **not runtime app code**.

**Read `.agent/rules/expo.md` FIRST** before any Expo-related work — it enforces official Expo LLM docs usage.

---

## STRUCTURE (VERIFIED)

```text
.agents/
├── AGENTS.md           # This file — skill pack documentation
├── rules/
│   └── expo.md        # Expo project rule — READ THIS FIRST
├── skills/            # Local skill docs (14 skills installed)
│   ├── building-native-ui/
│   │   ├── SKILL.md
│   │   └── references/     # animations, controls, form-sheet, gradients, icons, ...
│   ├── expo-api-routes/
│   │   └── SKILL.md
│   ├── expo-cicd-workflows/
│   │   ├── SKILL.md
│   │   └── scripts/        # fetch.js, validate.js
│   ├── expo-deployment/
│   │   ├── SKILL.md
│   │   └── references/     # app-store-metadata, ios-app-store, play-store, ...
│   ├── expo-dev-client/
│   │   └── SKILL.md
│   ├── expo-module/
│   │   ├── SKILL.md
│   │   └── references/     # config-plugin, lifecycle, native-module, native-view, ...
│   ├── expo-tailwind-setup/
│   │   └── SKILL.md
│   ├── expo-ui-jetpack-compose/
│   │   └── SKILL.md
│   ├── expo-ui-swiftui/
│   │   └── SKILL.md
│   ├── native-data-fetching/
│   │   ├── SKILL.md
│   │   └── references/     # expo-router-loaders
│   ├── ui-ux-pro-max/
│   │   ├── SKILL.md
│   │   └── data/           # app-interface, charts, colors, fonts, products, ... (CSV)
│   ├── upgrading-expo/
│   │   ├── SKILL.md
│   │   └── references/     # react-19, react-compiler, new-architecture, ...
│   └── use-dom/
│       └── SKILL.md
└── plugins/
    └── marketplace.json
```

---

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Expo project rule | `.agents/rules/expo.md` | **MANDATORY FIRST** — enforces Expo LLM docs |
| Skill workflow | `.agents/skills/<name>/SKILL.md` | Source of truth for skill behavior |
| Skill references | `.agents/skills/<name>/references/*` | Domain notes/examples used by agents |
| Skill scripts | `.agents/skills/<name>/scripts/*` | Validation/fetch helpers |

---

## AVAILABLE SKILLS (14 local + user global)

| Skill | Domain | When to invoke |
|---|---|---|
| `/building-native-ui` | Expo UI | UI components, animations, navigation, styling |
| `/expo-api-routes` | EAS Hosting | Creating API routes in Expo Router |
| `/expo-cicd-workflows` | EAS CI/CD | Workflow YAML, EAS builds |
| `/expo-deployment` | App/Play Store | iOS/Android deployment |
| `/expo-dev-client` | Dev builds | Local dev client, TestFlight |
| `/expo-module` | Native modules | Swift/Kotlin native modules |
| `/expo-tailwind-setup` | NativeWind | Tailwind v4 setup, CSS |
| `/expo-ui-jetpack-compose` | Jetpack Compose | Compose Views in Expo |
| `/expo-ui-swiftui` | SwiftUI | SwiftUI Views in Expo |
| `/native-data-fetching` | Data fetching | API calls, React Query, expo-router loaders |
| `/ui-ux-pro-max` | UI/UX design | Design intelligence, color palettes, patterns |
| `/upgrading-expo` | SDK upgrades | Expo SDK version upgrades |
| `/use-dom` | DOM components | Web code in Expo webview |
| `/react-doctor` | (opencode built-in) | Catch React issues after changes |

**User global skills** (from `.agent/skills/`): Many more including authjs, claude-api, deep-research, exa-search, etc.

---

## CONVENTIONS

- Keep each skill self-contained in `skills/<name>/`.
- Put long-form guidance in `references/`, not inline in skill docs.
- Use scripts only when docs/schema must be fetched or validated.
- Prefer additive edits; avoid breaking established skill contracts.
- **NEVER import `.agents/` files into runtime code paths.**
- **NEVER** embed secrets or credentials in skill docs/scripts.

---

## NOTES

- These files influence agent behavior during development sessions.
- Runtime/frontend behavior is owned by `app/`, `src/features/`, `src/shared/`.
- **MANDATORY reading order**: `.agent/rules/expo.md` → `AGENTS.md` → then pick relevant skill.
- User-level `.agent/` directory mirrors this structure with global/user-installed skills.
