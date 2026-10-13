---
name: lexchain-document-workflows
description: "Use when changing LexChain document library, upload, review, lifecycle, verification, activity, or related document access flows."
---

# LexChain document workflows

## When to use

Use this skill for work spanning the document library, upload, extracted-text review, document lifecycle, verification, activity history, or participant access. Start with the affected App Router entry point and trace into its feature code.

## Workflow

1. Locate the route and feature page or component. Follow the existing query, mutation, action, or helper and its callers before changing behavior.
2. Trace the user flow across src/features/documents/, src/features/verification/, and src/features/access/ as needed. Examples include upload through portal-upload.ts, review through extraction-api.ts, verification through integrity-api.ts, and activity through the document audit-log query.
3. Follow each network handoff to the existing browser API client or same-origin handler. For transport details, use [LexChain API integration](../lexchain-api-integration/SKILL.md) rather than restating those rules here.
4. Map the visible pending, success, empty, and error states. Preserve existing query keys, mutation outcomes, stale-state handling, and user input when requests fail.
5. Check the focused feature and route tests, including fixtures and mock behavior that represent the flow. Keep mock and source-only evidence distinct from live backend evidence.

## Boundaries

- Treat frontend role checks and access messages as UI behavior. The FastAPI backend remains the authority for authorization and document operations.
- Keep persistence, document processing, blockchain work, and business rules in the external backend.
- Keep server-only helpers and mock fixtures out of browser bundles.
- Include related participant or audit-log behavior only where the requested document flow reaches it.

## Useful result

A useful change identifies the affected route and feature path, the visible behavior and failure states, the permission boundary, and the focused checks run. State clearly whether evidence came from mocks, source and contract review, or a live backend.
