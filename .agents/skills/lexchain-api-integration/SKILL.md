---
name: lexchain-api-integration
description: "Use when changing LexChain browser API calls, same-origin Next.js API handlers, or server-only backend requests."
---

# LexChain API integration

## When to use

Use this skill for browser requests, Next.js API route handlers, server-only backend calls, or changes to their errors, cookies, and React Query behavior.

## Workflow

1. Identify the caller and execution context: browser query or mutation, server-rendered feature, Server Action, or route handler.
2. Trace the existing path. Browser calls use src/shared/api/client.ts where established, or an existing direct fetch to a same-origin route under src/app/api/. Server-rendered views and Server Actions may call src/server/api/backend.ts directly.
3. Follow the route handler or server helper to the external backend. Record the method, body encoding, headers, cookie or token source, response status and body, error mapping, and any boundary validation.
4. Preserve the current request and response contract. Keep JSON and multipart bodies in their existing encodings, retain same-origin credentials and server-held secrets, and preserve status and cookie behavior.
5. Preserve existing React Query keys, enabled conditions, mutation states, and invalidation behavior. Inspect the caller and route tests, plus only the fixtures needed to represent the same contract.
6. If a backend contract change is explicitly in scope, review openapi-updated.json and use the repository contract workflow. Never hand-edit src/shared/types/generated/schema.ts.

## Boundaries

- The external FastAPI service owns persistence, business rules, and authoritative authorization.
- Validate untrusted input in route handlers before forwarding it. Keep src/server/** and feature server modules out of client import graphs.
- Keep API responses and authenticated data out of PWA caches.
- Treat mock fixtures, generated OpenAPI types, and live backend behavior as different kinds of evidence.

## Useful result

Describe the caller-to-transport-to-handler or helper-to-backend path, the contract details preserved or intentionally changed, the focused tests or fixtures checked, and whether the result is mock, source-only, or live-backend evidence. For document-specific user states and access flows, use [LexChain document workflows](../lexchain-document-workflows/SKILL.md).
