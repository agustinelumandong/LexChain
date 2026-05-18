# Missing Whitelist User Lookup API

## Current OpenAPI State

The whitelist/party flow has these endpoints:

```txt
GET    /documents/{document_id}/parties
POST   /documents/{document_id}/parties
DELETE /documents/{document_id}/parties/{party_user_id}
```

Current party response only gives technical access data:

```ts
type DocumentPartyResponse = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
};
```

Missing display fields:

```ts
email?: string;
name?: string;
```

The add-party request accepts email:

```ts
type AddPartyRequest = {
  email: string;
  role?: string;
};
```

But after a party is added, the list endpoint does not return the email or name for display.

## Missing API Capability

There is no user-search endpoint in `openapi-updated.json`.

Helpful options:

```txt
GET /users/search?query=
GET /profiles/search?query=
GET /auth/users/search?query=
```

Expected response example:

```ts
type UserSearchResult = {
  user_id: string;
  email: string;
  name?: string;
};
```

## Frontend Impact

Without email/name in `DocumentPartyResponse`, the frontend can only display a shortened user ID:

```txt
User ec0a534a...9f501
Viewer access
```

Without a user-search endpoint, the frontend cannot search real backend users before adding whitelist access. Search candidates must stay local/static or the user must type an exact email.

## Recommended Backend Update

Best minimal fix:

1. Add `email` and optional `name` to `DocumentPartyResponse`.
2. Add a user lookup/search endpoint for whitelisted users.

Recommended response:

```ts
type DocumentPartyResponse = {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
};
```

Recommended search endpoint:

```txt
GET /users/search?query=<email-or-name>
```

Recommended search response:

```ts
type UserSearchResponse = {
  results: UserSearchResult[];
};
```

## If Backend Keeps No User Search

The app can still work, but whitelist UX should be changed from "search users" to "invite/add by exact email".

Flow:

1. User types email.
2. Frontend sends `POST /documents/{document_id}/parties`.
3. Backend validates whether email belongs to a user.
4. Frontend refreshes `GET /documents/{document_id}/parties`.

This is acceptable for a smaller capstone scope, but it is less polished than searchable user lookup.
