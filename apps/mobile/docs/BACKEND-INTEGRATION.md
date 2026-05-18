# Backend Integration Guide

Use this guide when the backend API is available. The goal is to connect the Expo frontend to the backend without putting API logic inside screens.

## Current Frontend Foundation

Already prepared:
- Environment helper: `src/shared/config/env.ts`
- Secure token storage: `src/shared/utils/secure-storage.ts`
- Centralized error parser: `src/shared/utils/api-error.ts`
- Error toast hook: `src/shared/hooks/use-error-toast.ts`
- React Query client/provider: `src/shared/providers/query-client.ts`
- Local env template: `.env.example`

## Backend Contract First

Before wiring screens, confirm this with the backend developer:

- Base URL, for example `http://192.168.1.100:8000`
- API version prefix, for example `/api/v1`
- Auth endpoints:
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/logout`
  - `GET /auth/me`
- Document endpoints:
  - `GET /documents`
  - `GET /documents/:id`
  - `POST /documents`
  - `POST /documents/:id/verify`
  - `GET /documents/:id/whitelist`
  - `POST /documents/:id/whitelist`
  - `DELETE /documents/:id/whitelist/:grantId`
- Standard error response shape:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

## Step 1: Create Local Env File

Create a real local env file from the template:

```bash
cp .env.example .env
```

Set the backend URL:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Do not commit `.env`. It is ignored by `.gitignore`.

## Step 2: Create API Folder

Create:

```txt
src/services/api/
src/services/query/
```

Recommended structure:

```txt
src/services/
├── api/
│   ├── client.ts
│   ├── auth.api.ts
│   ├── documents.api.ts
│   └── index.ts
└── query/
    ├── keys.ts
    ├── use-auth.ts
    ├── use-documents.ts
    └── index.ts
```

## Step 3: Create API Client

Create:

```txt
src/services/api/client.ts
```

Use this fetch-based client first:

```ts
import { requireApiUrl } from '@/shared/config';
import { authTokenStorage } from '@/shared/utils/secure-storage';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

const API_BASE_URL = requireApiUrl();

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.auth === false ? null : await authTokenStorage.get();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw {
      response: {
        status: response.status,
        data,
      },
    };
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
```

## Step 4: Create API Modules

Create:

```txt
src/services/api/auth.api.ts
```

Example:

```ts
import { apiClient } from './client';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', payload, { auth: false }),

  me: () =>
    apiClient.get<LoginResponse['user']>('/api/v1/auth/me'),

  logout: () =>
    apiClient.post<void>('/api/v1/auth/logout'),
};
```

Create:

```txt
src/services/api/index.ts
```

```ts
export { apiClient } from './client';
export { authApi } from './auth.api';
export type { LoginPayload, LoginResponse } from './auth.api';
```

## Step 5: Add Query Keys

Create:

```txt
src/services/query/keys.ts
```

```ts
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  documents: {
    all: ['documents'] as const,
    detail: (id: string) => ['documents', id] as const,
    whitelist: (id: string) => ['documents', id, 'whitelist'] as const,
  },
};
```

## Step 6: Create React Query Hooks

Create:

```txt
src/services/query/use-auth.ts
```

```ts
import { useMutation, useQuery } from '@tanstack/react-query';

import { authApi, type LoginPayload } from '@/services/api';
import { queryClient } from '@/shared/providers';
import { authTokenStorage } from '@/shared/utils/secure-storage';
import { queryKeys } from './keys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data) => {
      await authTokenStorage.set(data.token);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      await authTokenStorage.delete();
      queryClient.clear();
    },
  });
}
```

Create:

```txt
src/services/query/index.ts
```

```ts
export { queryKeys } from './keys';
export { useCurrentUser, useLogin, useLogout } from './use-auth';
```

## Step 7: Use Hooks In Screens

Example sign-in usage:

```ts
const login = useLogin();
const showErrorToast = useErrorToast();

async function handleSignIn() {
  login.mutate(
    { email, password },
    {
      onSuccess: () => {
        router.replace('/(tabs)');
      },
      onError: showErrorToast,
    },
  );
}
```

Button loading state:

```tsx
<Button
  label="Sign in"
  loading={login.isPending}
  disabled={login.isPending}
  onPress={handleSignIn}
/>
```

## Step 8: Document Query Pattern

For list screens, use `useQuery`.

Example:

```ts
export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: documentsApi.list,
  });
}
```

For create/update/delete actions, use `useMutation`, then invalidate related queries.

Example:

```ts
export function useCreateDocument() {
  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}
```

## Step 9: What Not To Do

Do not:
- call `fetch()` directly inside screens
- store auth tokens in `AsyncStorage`
- hardcode backend URLs in source files
- duplicate error parsing in every screen
- create React Query hooks before the endpoint contract is clear

## Recommended Order When Backend Is Ready

1. Confirm endpoint contract and response shapes.
2. Create `src/services/api/client.ts`.
3. Create one API module per backend resource.
4. Create query keys.
5. Create React Query hooks.
6. Replace local/mock state screen by screen.
7. Use `useErrorToast` for mutation/query errors.
8. Remove mocks only after the real flow works.

## Local Testing Checklist

- `.env` has the correct `EXPO_PUBLIC_API_URL`.
- Phone and backend are on the same network if testing against a local machine.
- Backend CORS allows Expo development origin/network requests.
- Login saves token through `authTokenStorage`.
- Authenticated requests include `Authorization: Bearer <token>`.
- `401` errors redirect to sign-in through `useErrorToast`.
- List mutations invalidate the correct React Query keys.
