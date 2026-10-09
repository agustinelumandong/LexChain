# LexChain mock accounts

These accounts work only when the local mock API is enabled. They do not authenticate against the FastAPI backend and must not be used as real credentials.

## Enable mock mode

Set both flags in `.env.local`:

```dotenv
NEXT_PUBLIC_USE_MOCK_API=true
USE_MOCK_API=true
```

Start the app with `pnpm dev`, then open `/login`.

## Login accounts

| Account | Email | Login role | Access |
| --- | --- | --- | --- |
| Document issuer | `issuer@example.com` | `document_issuer` | Portal and issuer workflows |
| Document participant | `participant@example.com` | `document_participant` | Portal participant workflows |

Use the password defined in `src/app/api/auth/route.ts`; it is intentionally omitted from repository documentation.

The issuer receives portal and issuer session cookies. The participant receives portal access only; issuer and admin session cookies are cleared.

## Notes

- Mock data is kept in memory and is not a real database. Restart the development server to reset server-side mock changes.
- `admin@lexchain.local` and the other addresses in admin demo data are display fixtures, not additional login accounts.
- Mock results do not prove real backend integration. Turn both flags off when testing the FastAPI backend.

## Source of truth

- Authentication accounts: `src/app/api/auth/route.ts`
- Portal profiles and mock data: `src/lib/mocks/portal.ts`
- Environment defaults: `.env.example`
