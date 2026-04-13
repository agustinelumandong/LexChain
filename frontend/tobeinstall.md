Expo Router
TanStack Query
NativeWind + Tailwind config for RN
React Hook Form + Zod
Supabase JS client
Expo Camera / ImagePicker / DocumentPicker

3) Project Structure (Frontend)
Use this structure as baseline:

frontend/
├── app/                         # Expo Router routes
│   ├── (auth)/
│   ├── (owner)/
│   ├── (authorized)/
│   └── (admin)/
├── src/
│   ├── modules/
│   ├── services/
│   ├── shared/
│   └── native/
├── assets/
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
