# Invitation Link Signup Note

## Current frontend behavior

The backend invitation link currently uses this app URL shape:

```txt
lexchain://sign-up?token=<invitation-token>
```

Expo Router maps this to:

```txt
app/(auth)/sign-up.tsx
```

because `(auth)` is a route group and does not appear in the real URL path.

The frontend now reads only the documented query key:

```txt
token
```

and includes it in the signup request body only when present:

```json
{
  "email": "user@example.com",
  "password": "...",
  "f_name": "...",
  "l_name": "...",
  "phone_number": null,
  "token": "<invitation-token>"
}
```

## OpenAPI note

The current `openapi-updated.json` `SignUpRequest` schema does not list `token`.
If the backend expects invitation signup through this link, the backend OpenAPI
schema should add an optional `token` field to `SignUpRequest`.

Suggested schema intent:

```ts
token?: string
```

Do not add `invitation_token` on the frontend unless the backend contract adds it.

## Recommended backend handling

When `token` is present on signup, backend should:

1. Validate the token exists and is not expired.
2. Confirm the token has not already been used.
3. Create or attach the new user to the invited role/access record.
4. Mark the invitation as accepted.
5. Return the normal signup response.

If the token is invalid, backend should return a clear validation error such as:

```json
{
  "detail": "Invitation token is invalid or expired."
}
```
