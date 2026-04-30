# AGENT SKILLS KNOWLEDGE BASE

**Scope:** `.agents/` only  
**Role:** Local skill-pack documentation for this frontend workspace.

## OVERVIEW
This subtree stores reusable skill instructions and references consumed by coding agents. It is documentation/config support, not runtime app code.

## STRUCTURE
```text
.agents/
└── skills/
    ├── <skill-name>/
    │   ├── SKILL.md
    │   ├── references/
    │   └── scripts/ (optional)
    └── ...
```

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Skill metadata + workflow | `skills/*/SKILL.md` | Source of truth for skill behavior |
| Skill-specific references | `skills/*/references/*` | Domain notes/examples used by agents |
| Skill helper scripts | `skills/*/scripts/*` | Validation/fetch helpers for skill tasks |

## CONVENTIONS
- Keep each skill self-contained in `skills/<name>/`.
- Put long-form guidance in `references/`, not inline in app docs.
- Use scripts only when docs/schema must be fetched or validated.
- Prefer additive edits; avoid breaking established skill contracts.

## ANTI-PATTERNS
- Importing `.agents` files into runtime code paths.
- Duplicating the same reference content across multiple skills.
- Embedding secrets or environment-specific credentials in skill docs/scripts.

## NOTES
- These files influence agent behavior during development sessions.
- Runtime/frontend behavior is owned by `app/`, `components/`, `hooks/`, `constants/`.
