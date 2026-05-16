# Frontend ↔ Backend Integration — Best Practices

Great question. What you're describing is called building an **API-ready** or **API-driven frontend**. Here's how seasoned engineers approach this.

---

## The Core Principle: Separation of Concerns

Your frontend should **never directly handle business logic**. It only does three things:
1. Send requests
2. Receive responses
3. Render UI

---

## Step 1 — Agree on a Contract First (API Contract)

Before writing a single line of code, you and your friend need to agree on the **API contract**. This means defining:

- **Endpoints** — e.g. `POST /api/v1/login`
- **Request shape** — what data you send
- **Response shape** — what data you get back
- **Error format** — how errors are returned

The industry standard tool for this is **OpenAPI / Swagger**. Your Python friend can generate this automatically from FastAPI (which I'd strongly recommend over Flask/Django for new projects).

---

## Step 2 — Your Expo App Structure

Create a dedicated **API layer** — never call `fetch()` or `axios` directly inside components.

```
src/
├── api/
│   ├── client.ts        ← base axios/fetch config (base URL, headers, interceptors)
│   ├── auth.ts          ← all auth-related API calls
│   ├── users.ts         ← all user-related API calls
│   └── index.ts         ← re-exports everything
├── hooks/
│   ├── useAuth.ts       ← wraps API calls with state management
│   └── useUser.ts
├── screens/
└── components/
```

---

## Step 3 — The API Client (the most important file)

```typescript
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // ← env variable, never hardcode

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — auto-attach token on every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired → redirect to login
      await AsyncStorage.removeItem('auth_token');
      // trigger navigation to login screen
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Step 4 — Individual API Modules

```typescript
// src/api/auth.ts
import apiClient from './client';

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
};
```

---

## Step 5 — Use React Query (TanStack Query)

This is the **industry standard** for data fetching in React/React Native. It handles caching, loading states, errors, and refetching automatically.

```bash
npm install @tanstack/react-query
```

```typescript
// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../api/auth';

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authAPI.login(email, password),
    onSuccess: (data) => {
      // save token, navigate, etc.
    },
    onError: (error) => {
      // show error toast
    },
  });
};
```

```typescript
// In your screen — clean and simple
const { mutate: login, isPending, isError } = useLogin();

<Button onPress={() => login({ email, password })} loading={isPending} />
```

---

## Step 6 — Environment Variables (Critical)

Never hardcode your backend URL. Use `.env` files:

```bash
# .env.development
EXPO_PUBLIC_API_URL=http://192.168.1.x:8000   ← your friend's local machine IP

# .env.production
EXPO_PUBLIC_API_URL=https://api.yourapp.com
```

---

## Step 7 — What to Tell Your Python Friend

Ask him to:
1. Use **FastAPI** — it auto-generates `/docs` (Swagger UI) so you can test endpoints without touching the app
2. Return **consistent error responses** like:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```
3. Enable **CORS** properly during development
4. Version the API — `/api/v1/...` — so future changes don't break you

---

## The Full Stack at a Glance

```
Expo App
  └── Screen/Component
        └── Custom Hook (useLogin)
              └── React Query (useMutation)
                    └── API Module (authAPI.login)
                          └── Axios Client (interceptors, base URL, token)
                                └── Python FastAPI Backend
```

---

## Tools to Set Up Together

| Purpose | Tool |
|---|---|
| API testing | Postman or Bruno |
| API documentation | FastAPI's built-in Swagger `/docs` |
| Mock backend (while he builds) | `json-server` or `msw` |
| Shared types (optional but powerful) | Define TypeScript types that match Python's Pydantic models |

---

The biggest mistake junior teams make is **skipping the API layer** and calling fetch directly in components. That becomes a nightmare to maintain. The structure above is what scales to production at any company size.


## MSW is the Right Choice for You

Here's why: **MSW (Mock Service Worker) intercepts requests at the network level**, meaning your actual API layer code (`src/api/`) stays **100% untouched**. When your friend finishes the backend, you just **turn off the mocks** — nothing else changes. That's the professional way.

`json-server` is a separate running server, which adds unnecessary complexity for your situation.

---

## Setup — Step by Step

### 1. Install MSW

```bash
npx create-expo-app@latest  # if not yet set up
npm install msw@latest --save-dev
npm install @mswjs/interceptors --save-dev
```

---

### 2. Your Folder Structure

```
src/
├── mocks/
│   ├── handlers/
│   │   ├── auth.handlers.ts     ← mock auth endpoints
│   │   ├── user.handlers.ts     ← mock user endpoints
│   │   └── index.ts             ← combine all handlers
│   ├── data/
│   │   ├── users.ts             ← fake data
│   │   └── products.ts          ← fake data
│   └── server.ts                ← MSW server setup for React Native
```

---

### 3. Create Fake Data First

```typescript
// src/mocks/data/users.ts
export const fakeUsers = [
  {
    id: '1',
    name: 'Juan dela Cruz',
    email: 'juan@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
];
```

---

### 4. Create Your Handlers

This is the core — you define what each endpoint returns.

```typescript
// src/mocks/handlers/auth.handlers.ts
import { http, HttpResponse } from 'msw';

export const authHandlers = [

  // POST /api/v1/auth/login
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // Simulate wrong credentials
    if (body.password !== 'password123') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email or password is incorrect',
          },
        },
        { status: 401 }
      );
    }

    // Simulate success
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token-abc123',
        user: {
          id: '1',
          name: 'Juan dela Cruz',
          email: body.email,
        },
      },
    });
  }),

  // POST /api/v1/auth/logout
  http.post('*/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

];
```

```typescript
// src/mocks/handlers/user.handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { fakeUsers } from '../data/users';

export const userHandlers = [

  // GET /api/v1/users/me
  http.get('*/users/me', async () => {
    await delay(500); // ← simulate real network latency!
    return HttpResponse.json({
      success: true,
      data: fakeUsers[0],
    });
  }),

  // GET /api/v1/users
  http.get('*/users', async () => {
    await delay(800);
    return HttpResponse.json({
      success: true,
      data: fakeUsers,
      meta: {
        total: fakeUsers.length,
        page: 1,
      },
    });
  }),

];
```

```typescript
// src/mocks/handlers/index.ts
import { authHandlers } from './auth.handlers';
import { userHandlers } from './user.handlers';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
];
```

---

### 5. Setup the MSW Server for React Native

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/native';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

### 6. Turn It On/Off with ONE environment variable

```typescript
// app/_layout.tsx (or App.tsx — your entry point)
import { useEffect } from 'react';

async function enableMocking() {
  if (process.env.EXPO_PUBLIC_USE_MOCK !== 'true') {
    return; // ← skip in production or when real backend is ready
  }

  const { server } = await import('../src/mocks/server');
  server.listen({
    onUnhandledRequest: 'warn', // warns you if you call an endpoint with no handler
  });
}

export default function RootLayout() {
  useEffect(() => {
    enableMocking();
  }, []);

  // ... rest of your layout
}
```

```bash
# .env.development
EXPO_PUBLIC_USE_MOCK=true
EXPO_PUBLIC_API_URL=http://localhost:8000

# .env.production
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=https://api.yourapp.com
```

---

## The Beautiful Part — Zero Code Change When Real Backend is Ready

```
EXPO_PUBLIC_USE_MOCK=true   → requests go to MSW handlers (fake data)
EXPO_PUBLIC_USE_MOCK=false  → requests go to real Python backend
```

Your `src/api/` files? **Completely unchanged.** Your screens and hooks? **Completely unchanged.** You just flip the switch.

---

## Simulate Real-World Scenarios While Developing

```typescript
// Simulate a server error to test your error UI
http.get('*/users', () => {
  return HttpResponse.json(
    { success: false, error: { code: 'SERVER_ERROR' } },
    { status: 500 }
  );
}),

// Simulate slow network to test your loading spinner
http.get('*/users', async () => {
  await delay(3000); // 3 second delay
  return HttpResponse.json({ ... });
}),

// Simulate network offline
http.get('*/users', () => {
  return HttpResponse.networkError('Connection refused');
}),
```

This is exactly how QA engineers and senior devs **stress test the UI** before the backend even exists.

---

## Summary Flow

```
Your Screen
  └── useUsers() hook
        └── React Query
              └── src/api/users.ts  ← same code always
                    └── Axios Client
                          ├── [MOCK=true]  → MSW intercepts → returns fake JSON
                          └── [MOCK=false] → real request → Python FastAPI
```

This is the professional, scalable approach used at companies like Google and Meta — your frontend team never blocks on the backend team.
