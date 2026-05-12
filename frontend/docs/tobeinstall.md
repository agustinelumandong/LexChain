Expo Router
TanStack Query

<!-- NativeWind + Tailwind config for RN -->

React Hook Form + Zod
Supabase JS client
Expo Camera / ImagePicker / DocumentPicker

@tanstack/react-query`
- `react-hook-form`
- `zod`
- `@supabase/supabase-js`
- `expo-camera`
- `expo-image-picker`
- `expo-document-picker
- 
3. Project Structure (Frontend)
   Use this structure as baseline:

## Assistant

Then keep `src/services` focused on frontend data access, not backend implementation.

You do not need backend folders or server architecture in this repo. For a frontend-only Expo app, the clean structure is:

```text
frontend/
├── app/
│ ├── (auth)/
│ ├── (tabs)/
│ └── admin/
├── src/
│ ├── modules/
│ ├── services/
│ ├── shared/
│ └── native/
├── assets/
```

What each one should mean for your case:

- `app/`
  Expo Router screens, layouts, redirects, navigation wiring only.
- `src/modules/`
  Feature-based frontend code like `auth`, `dashboard`, `documents`, `admin`.
- `src/services/`
  API receiver layer: HTTP client, Supabase client if used, request functions, TanStack Query hooks setup, token/session handling, storage adapters.
- `src/shared/`
  Reusable UI, hooks, theme, constants, types, utils.
- `src/native/`
  Camera, image picker, document picker, permissions, native-specific wrappers.

For a frontend-only app, I’d shape `services` like this:

```text
src/services/
├── api/
│ ├── client.ts
│ ├── types.ts
│ └── endpoints/
│   ├── auth.api.ts
│   ├── documents.api.ts
│   └── admin.api.ts
├── query/
│ ├── query-client.ts
│ └── keys.ts
├── storage/
│ ├── token-storage.ts
│ └── session-storage.ts
└── supabase/
    └── client.ts
```

A good rule is:

- Backend logic stays out of this repo.
- Frontend only keeps API calling code and response handling.
- Feature UI and feature state stay in `modules`.

Example split:

```text
src/modules/auth/
├── screens/
├── components/
├── hooks/
├── schemas/
└── utils/

src/modules/dashboard/
├── components/
├── hooks/
└── types/
```

And your current root folders should move like this:

- `components/` → `src/shared/components/` or `src/modules/*/components/`
- `hooks/` → `src/shared/hooks/` or `src/modules/*/hooks/`
- `constants/` → `src/shared/constants/` or `src/shared/theme/`

So yes, for your case the structure should be centered on:
- route layer
- feature layer
- API consumption layer
- shared UI/utilities layer

Not backend architecture.

A practical final recommendation for LexChain:

```text
src/
├── modules/
│ ├── auth/
│ ├── dashboard/
│ ├── documents/
│ └── admin/
├── services/
│ ├── api/
│ ├── query/
│ ├── storage/
│ └── supabase/
├── shared/
│ ├── components/
│ ├── hooks/
│ ├── theme/
│ ├── constants/
│ ├── utils/
│ └── types/
└── native/
```




```text
frontend/
├── app/
│ ├── (auth)/
│ ├── (tabs)/
│ └── admin/
├── src/
│ ├── modules/
│ ├── services/
│ ├── shared/
│ └── native/
├── assets/
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

Why this version works:

- `app/` stays focused on Expo Router only.
- `admin/` is a real URL segment, so `/admin/...` stays clear.
- `src/modules` gives you feature ownership.
- `src/services` is the frontend API/data-access layer.
- `src/shared` absorbs your current loose `components`, `hooks`, and `constants`.
- `src/native` is the right place for camera/picker/permission wrappers.

A clean target shape for your current root folders is:

```text
src/shared/components/
src/shared/hooks/
src/shared/theme/
src/shared/constants/
src/shared/utils/
src/shared/types/
```

And feature-specific code should move into:

```text
src/modules/auth/
src/modules/dashboard/
src/modules/documents/
src/modules/admin/
```

**Current codebase**
Your current repo is only partially aligned with that structure. The live tree is still mostly Expo-template style.

What is already good:

- `app/` exists and is clearly separated from non-route code.
- `app/(tabs)` plus `app/admin` is the right routing direction.
- `src/` already exists, so you have a place to migrate into.
- The project is still small enough to reorganize without much pain.

What is not clean yet:

- `src/` does not own the app code yet. Right now it mostly contains [`src/global.css`](/home/cshan28/Dev/Projects/School-Project/LexChain/frontend/src/global.css:1) and `src/tw/*`.
- Shared code is still spread across root folders:
  - [`components/`](/home/cshan28/Dev/Projects/School-Project/LexChain/frontend/components)
  - [`hooks/`](/home/cshan28/Dev/Projects/School-Project/LexChain/frontend/hooks)
  - [`constants/`](/home/cshan28/Dev/Projects/School-Project/LexChain/frontend/constants)
- Your alias in [`tsconfig.json`](/home/cshan28/Dev/Projects/School-Project/LexChain/frontend/tsconfig.json:4) still points `@/*` to the repo root, which encourages imports like `@/hooks/...` instead of `@/src/...`.
- The live app tree is thinner than the earlier examples. Right now `app/(auth)` and `app/admin` exist as folders, but the files in them are not present in the current filesystem.
- There is extra repo clutter for a frontend app:
  - `docs/app`, `docs/components`, `docs/hooks`, `docs/constants`
  - multiple build output folders like `dist-web-check`, `dist-tailwind-check`, `dist-android-check`
  - nested `frontend/frontend` directories
  These may be intentional, but they make the project feel less clean.

One more important check: several items listed in `tobeinstall.md` are not installed yet in [`package.json`](/home/cshan28/Dev/Projects/School-Project/LexChain/frontend/package.json:1). I do not see:

- `@tanstack/react-query`
- `react-hook-form`
- `zod`
- `@supabase/supabase-js`
- `expo-camera`
- `expo-image-picker`
- `expo-document-picker`

So the structure plan is fine, but the stack list in `tobeinstall.md` is still more of a target state than the current state.

**Verdict**
The proposed structure is good. The current codebase is not there yet, but it is in a reasonable starting state. I would call it:

- good routing foundation
- weak internal organization
- still mostly template-style outside `app/`
- ready for migration into `src/shared`, `src/modules`, and `src/services`

The first cleanup I’d do is:

1. Move root `components`, `hooks`, and `constants` under `src/shared`.
2. Change imports to use `src` as the real app source.
3. Keep `app/` thin and move screen logic into `src/modules`.
4. Add `services/` only when you start wiring API calls and TanStack Query.

If you want, I can next give you a file-by-file migration map for this repo, like “move `components/themed-text.tsx` to X, move `hooks/use-theme-color.ts` to Y,” based on the files that currently exist.

