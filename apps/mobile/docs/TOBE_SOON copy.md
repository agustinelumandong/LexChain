## LexChain — Clean Up Quick Reference

---

### 1. Your Styles — Split Them Out

Your `styles`, `kpiStyles`, `docStyles` all sitting in one screen file is the problem. Move them.

```
app/(tabs)/
├── index.tsx              ← JSX + hook calls only
└── index.styles.ts        ← all 3 StyleSheet blocks live here
```

```typescript
// index.styles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from '@/shared/theme/theme';

export const styles = StyleSheet.create({ ... });
export const kpiStyles = StyleSheet.create({ ... });
export const docStyles = StyleSheet.create({ ... });

// index.tsx — now clean
import { styles, kpiStyles, docStyles } from './index.styles';
```

---

### 2. Barrel Files — Add to Every Feature

```typescript
// src/features/auth/index.ts
export { AuthScreenShell }   from './auth-screen-shell';
export { AuthHeader }        from './auth-header';
export { AuthInput }         from './auth-input';
export { TermsBottomSheet }  from './terms-bottom-sheet';

// src/features/documents/index.ts
export { DocumentResultCard }          from './document-result-card';
export { DocumentsHeader }             from './documents-header';
export { DocumentsSearchField }        from './documents-search-field';
export { DocumentsFilterSheet }        from './documents-filter-sheet';
export { DocumentsSortSheet }          from './documents-sort-sheet';
export { mockDocuments }               from './mock-documents';

// src/features/document/index.ts
export { DocumentPreviewBottomSheet }  from './components/document-preview-bottom-sheet';
export { VerifyDocumentBottomSheet }   from './components/verify-document-bottom-sheet';
export { DocumentSummaryCard }         from './components/document-summary-card';
export { IntegrityCheckCard }          from './components/integrity-check-card';
// ... rest

// src/features/upload/index.ts
export { UploadDropzoneCard }   from './upload-dropzone-card';
export { UploadHeader }         from './upload-header';
export { UploadTypeBottomSheet} from './upload-type-bottom-sheet';
export { AiSummaryDraftCard }   from './ai-summary-draft-card';
export { uploadSession }        from './upload-session';
export type { PickedUploadFile } from './upload-file';

// src/shared/components/ui/index.ts
export { Button }                  from './button';
export { BottomNav }               from './bottom-nav';
export { SearchInputWithResults }  from './search-input-with-results';
export { SelectDropdownField }     from './select-dropdown-field';
export { Collapsible }             from './collapsible';

// src/shared/hooks/index.ts
export { useCloseSheetOnBack }  from './use-close-sheet-on-back';
export { useColorScheme }       from './use-color-scheme';
export { useThemeColor }        from './use-theme-color';
```

---

### 3. Path Aliases — `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/features/*": ["src/features/*"],
      "@/shared/*":   ["src/shared/*"],
      "@/theme":      ["src/shared/theme/theme.ts"],
      "@/hooks":      ["src/shared/hooks/index.ts"],
      "@/ui":         ["src/shared/components/ui/index.ts"],
      "@/mocks/*":    ["src/mocks/*"]
    }
  }
}
```

```typescript
// ❌ Before
import { AuthHeader } from '../../src/features/auth/auth-header';
import { Button }     from '../../src/shared/components/ui/button';
import { COLORS }     from '../../src/shared/theme/theme';

// ✅ After
import { AuthHeader } from '@/features/auth';
import { Button }     from '@/ui';
import { COLORS }     from '@/theme';
```

---

### 4. Delete Expo Starter Leftovers

These are dead weight in your project:

```
src/shared/components/
├── hello-wave.tsx        ← DELETE
└── parallax-scroll-view.tsx  ← DELETE (unless you actually use it)
```

---

### 5. Move Mock Data

```
// ❌ Currently
src/features/documents/mock-documents.ts

// ✅ Move to
src/mocks/data/documents.ts

// Update barrel
// src/mocks/index.ts
export { mockDocuments } from './data/documents';
```

---

### 6. Dashboard Feature — Drain the Route File

```
src/features/dashboard/       ← currently empty, fill it
├── index.ts
├── dashboard-kpi-card.tsx    ← extract from app/(tabs)/index.tsx
├── dashboard-recent-list.tsx ← extract from app/(tabs)/index.tsx
└── use-dashboard.ts          ← all useState/logic moves here
```

```typescript
// app/(tabs)/index.tsx — target state, ~25 lines
import { DashboardKpiCard, DashboardRecentList } from '@/features/dashboard';
import { useDashboard } from '@/features/dashboard';

export default function DashboardScreen() {
  const { kpis, recentDocs } = useDashboard();
  return (
    <Screen>
      <DashboardKpiCard data={kpis} />
      <DashboardRecentList data={recentDocs} />
    </Screen>
  );
}
```

---

### Rules Summary

| File                      | Should Only Contain             |
| ------------------------- | ------------------------------- |
| `app/(tabs)/*.tsx`        | JSX + hook calls, ~25–40 lines  |
| `*.styles.ts`             | StyleSheet blocks, nothing else |
| `features/*/index.ts`     | Re-exports only                 |
| `use-*.ts`                | State + logic, no JSX           |
| `*-card.tsx`, `*-row.tsx` | Pure UI, props only             |

A few more things specific to LexChain:

---

### 7. Missing `types/` Folder — Types Are Scattered

```
src/types/
├── document.types.ts    ← DocumentType, VerifyStatus, WhitelistGrant
├── auth.types.ts        ← User, LoginPayload, AuthState
├── upload.types.ts      ← move PickedUploadFile here from upload-file.ts
└── index.ts             ← barrel
```

```typescript
// anywhere in the app
import type { DocumentType, WhitelistGrant } from '@/types';
```

---

### 8. Unnecessary Nesting — Flatten These

```
// ❌ One file doesn't need its own components/ folder
src/features/onboarding/
└── components/
    └── get-started-hero.tsx   ← just one file

// ✅
src/features/onboarding/
├── get-started-hero.tsx
└── index.ts
```

---

### 9. Dead Code — Remove It

```
src/features/upload/upload-select-field.tsx  ← marked as "alternative", never used
```

---

### 10. `COLORS` Has No Barrel

```typescript
// Right now you're doing this everywhere
import { COLORS } from '../../shared/theme/theme';

// With the alias already set up
import { COLORS } from '@/theme';   ← already solved by step 3, just make sure
                                       theme.ts exports COLORS explicitly
```

---

That's genuinely all of it for your current structure. Nothing else worth touching right now — the rest is backend wiring work, not cleanup.

Honestly, three small things left:

---

### 11. `'Inter'` Hardcoded in Every Style

Looking at your styles — `fontFamily: 'Inter'` is repeated on every single text style. That's a magic string.

```typescript
// src/shared/theme/theme.ts — add this
export const fonts = {
  regular:  'Inter',
  medium:   'Inter_500Medium',
  bold:     'Inter_700Bold',
} as const;

// Then in your styles
fontFamily: fonts.regular   ← change once if font ever changes
```

---

### 12. Storage Keys Are Magic Strings

```typescript
// ❌ Hardcoded in whitelist-storage.ts
'lexchain:document-whitelist'

// ✅ src/constants/storage-keys.ts
export const STORAGE_KEYS = {
  documentWhitelist: 'lexchain:document-whitelist',
  authToken:         'lexchain:auth-token',   // ← ready for when backend lands
} as const;
```

---

### 13. `tw.ts` Is Sitting at Root

```
// ❌ frontend/tw.ts  ← root level, random

// ✅ move to
src/shared/utils/tw.ts
```

---

That's genuinely everything. Your structure is already solid for a school project — honestly better than most. The remaining work is all backend wiring, not cleanup.


## Mobile Frontend Best Practices — LexChain Edition

---

### 1. Error Handling — Centralized, Not Scattered

Never handle errors inside screens. One place only.

```typescript
// src/shared/utils/api-error.ts
export type AppError = {
  code: string;
  message: string;
  status: number;
};

export function parseApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    return {
      code:    error.response?.data?.error?.code    ?? 'UNKNOWN',
      message: error.response?.data?.error?.message ?? 'Something went wrong',
      status:  error.response?.status               ?? 500,
    };
  }
  return { code: 'NETWORK_ERROR', message: 'Check your connection', status: 0 };
}
```

```typescript
// src/shared/hooks/use-error-toast.ts
export function useErrorToast() {
  return (error: unknown) => {
    const { code, message } = parseApiError(error);

    if (code === 'UNAUTHORIZED')    return router.replace('/(auth)/sign-in');
    if (code === 'NETWORK_ERROR')   return Toast.show('No internet connection');
    Toast.show(message);
  };
}

// In any hook — clean
const handleError = useErrorToast();
const { mutate } = useMutation({ onError: handleError });
```

---

### 2. Caching — React Query is Already Built For This

```typescript
// src/shared/providers/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        1000 * 60 * 5,   // data is fresh for 5 mins
      gcTime:           1000 * 60 * 10,  // keep in cache 10 mins
      retry:            2,               // retry failed requests twice
      refetchOnFocus:   true,            // refetch when app comes to foreground
    },
  },
});
```

```typescript
// Per-query override for documents (legal docs don't change often)
const { data } = useQuery({
  queryKey: ['document', id],
  queryFn:  () => documentAPI.getById(id),
  staleTime: 1000 * 60 * 30,   // 30 mins — legal docs are stable
});
```

---

### 3. Security — Token Storage

Never use plain `AsyncStorage` for tokens. It's unencrypted.

```bash
pnpm add expo-secure-store
```

```typescript
// src/shared/utils/secure-storage.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  set: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),

  get: (key: string) =>
    SecureStore.getItemAsync(key),

  delete: (key: string) =>
    SecureStore.deleteItemAsync(key),
};

// Usage — replaces AsyncStorage for tokens
await secureStorage.set('auth_token', token);
await secureStorage.get('auth_token');
```

```typescript
// ✅ Rule of thumb for LexChain
// SecureStore   → auth tokens, user ID
// AsyncStorage  → whitelist data, UI preferences (non-sensitive)
```

---

### 4. Security — Environment Variables

```bash
# ❌ Never
const API_URL = 'https://api.lexchain.com';

# ✅ .env.development
EXPO_PUBLIC_API_URL=http://192.168.1.x:8000

# ✅ .env.production
EXPO_PUBLIC_API_URL=https://api.lexchain.com
```

```typescript
// src/api/client.ts
const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});
```

---

### 5. Network State — Handle Offline Gracefully

```bash
pnpm add @react-native-community/netinfo
```

```typescript
// src/shared/hooks/use-network.ts
import NetInfo from '@react-native-community/netinfo';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
    });
  }, []);

  return { isOnline };
}

// In root _layout.tsx
const { isOnline } = useNetwork();
if (!isOnline) return <OfflineBanner />;
```

---

### 6. Loading & Error States — One Pattern Everywhere

```typescript
// src/shared/components/ui/query-states.tsx
export function LoadingState() {
  return <ActivityIndicator color={COLORS.primary} />;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View>
      <Text>Something went wrong</Text>
      <Button onPress={onRetry} label="Try again" />
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <Text>{message}</Text>;
}

// In any screen — consistent
if (isLoading) return <LoadingState />;
if (isError)   return <ErrorState onRetry={refetch} />;
if (!data)     return <EmptyState message="No documents yet" />;
```

---

### 7. Form Validation — Never Trust User Input

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

```typescript
// src/features/auth/schemas/sign-in.schema.ts
import { z } from 'zod';

export const signInSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

export type SignInForm = z.infer<typeof signInSchema>;

// sign-in.tsx
const { control, handleSubmit } = useForm<SignInForm>({
  resolver: zodResolver(signInSchema),
});
```

---

### 8. App State — Refresh Token on Foreground

```typescript
// app/_layout.tsx
import { AppState } from 'react-native';

useEffect(() => {
  const sub = AppState.addEventListener('change', state => {
    if (state === 'active') {
      queryClient.invalidateQueries(); // refetch stale data when app reopens
    }
  });
  return () => sub.remove();
}, []);
```

---

### Summary — What Covers What

| Practice               | Tool                            |
| ---------------------- | ------------------------------- |
| Token storage          | `expo-secure-store`             |
| API caching            | React Query `staleTime`         |
| Error parsing          | `parseApiError` util            |
| Offline detection      | `NetInfo`                       |
| Form validation        | `react-hook-form` + `zod`       |
| Environment vars       | `EXPO_PUBLIC_*` in `.env`       |
| Loading/error UI       | Shared `QueryStates` components |
| App foreground refresh | `AppState` listener             |

## Expo Performance — Full Playbook

---

### CDN / Webpack — Short Answer First

Expo uses **Metro bundler**, not Webpack. You don't need to switch. For a mobile app, CDN is irrelevant — there's no browser. What actually makes your app fast is everything below.

---

### 1. Bundle Size — Cut the MB Down

**Audit what's bloating you first**

```bash
npx expo-bundle-visualizer
```
This shows you exactly which packages are eating your MB.

```bash
# Also run this to see your raw bundle size
npx react-native bundle --platform android --dev false \
  --entry-file index.js --bundle-output /tmp/bundle.js
ls -lh /tmp/bundle.js
```

---

**Tree shaking — import only what you use**

```typescript
// ❌ Imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Import only the function
import debounce from 'lodash/debounce';
```

```typescript
// ❌ Pulls in all icons (~MB)
import { MaterialIcons } from '@expo/vector-icons';

// ✅ Same result, same API — already fine in Expo
// but make sure you're not importing multiple icon sets
// pick ONE and stick to it across LexChain
```

---

**Metro config — exclude dev tools from prod bundle**

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.transformer.minifierConfig = {
  compress: {
    drop_console: true,   // removes all console.log in production
    drop_debugger: true,
  },
};

module.exports = config;
```

---

**EAS Build — enable Hermes**

```json
// app.json — already enabled by default in Expo 54, but verify
{
  "expo": {
    "jsEngine": "hermes"   // ← compiles JS to bytecode, faster startup
  }
}
```

---

**Image optimization — biggest hidden culprit**

```bash
pnpm add expo-image
```

```typescript
// ❌ React Native's default Image — no caching, no optimization
import { Image } from 'react-native';

// ✅ expo-image — cached, faster, WebP support, placeholder blur
import { Image } from 'expo-image';

<Image
  source={{ uri: doc.thumbnailUrl }}
  style={styles.thumbnail}
  contentFit="cover"
  placeholder={blurhash}        // ← shows blurred placeholder while loading
  transition={200}
  cachePolicy="memory-disk"     // ← caches to disk automatically
/>
```

---

### 2. Startup Speed — Faster App Launch

**Lazy load heavy screens**

```typescript
// app/_layout.tsx
import { lazy, Suspense } from 'react';

// ❌ All screens load at startup
import DocumentDetailScreen from './document/[id]';

// ✅ Loads only when user navigates there
const DocumentDetailScreen = lazy(() => import('./document/[id]'));
```

---

**Splash screen — hide only when ready**

```typescript
// app/_layout.tsx
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();  // keep splash up

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await loadFonts();
      await preloadCriticalData();
      setReady(true);
      await SplashScreen.hideAsync();  // hide only when truly ready
    }
    prepare();
  }, []);

  if (!ready) return null;
  return <Stack />;
}
```

---

**Font loading — subset your fonts**

```typescript
// ❌ Loading all Inter weights
useFonts({
  'Inter':           require('./assets/fonts/Inter-Regular.ttf'),
  'Inter_100Thin':   require('./assets/fonts/Inter-Thin.ttf'),
  'Inter_200':       require('./assets/fonts/Inter-ExtraLight.ttf'),
  // ...all weights
});

// ✅ Only load weights you actually use in LexChain
useFonts({
  'Inter':     require('./assets/fonts/Inter-Regular.ttf'),  // weight 400
  'Inter_500': require('./assets/fonts/Inter-Medium.ttf'),   // weight 500
  'Inter_700': require('./assets/fonts/Inter-Bold.ttf'),     // weight 700
  'Inter_800': require('./assets/fonts/Inter-ExtraBold.ttf'),// weight 800
});
```

---

### 3. Runtime Performance — Smooth Scrolling & UI

**FlatList over ScrollView for lists**

```typescript
// ❌ Renders ALL documents at once — kills performance at 50+ items
<ScrollView>
  {documents.map(doc => <DocumentResultCard key={doc.id} doc={doc} />)}
</ScrollView>

// ✅ Renders only visible items
<FlatList
  data={documents}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <DocumentResultCard doc={item} />}
  getItemLayout={(_, index) => ({    // ← skip measuring, instant scroll
    length: 72, offset: 72 * index, index
  })}
  removeClippedSubviews={true}       // ← unmounts off-screen items
  maxToRenderPerBatch={8}
  windowSize={5}
/>
```

---

**Memoize components that re-render too much**

```typescript
// document-result-card.tsx
import { memo } from 'react';

// Without memo — re-renders on every parent state change
export const DocumentResultCard = memo(({ doc }: Props) => {
  return ( ... );
});

// Also memoize callbacks passed as props
const handlePress = useCallback((id: string) => {
  router.push(`/document/${id}`);
}, []);
```

---

**Avoid inline styles and objects**

```typescript
// ❌ Creates a new object on every render
<View style={{ flex: 1, padding: 16 }}>

// ✅ Stable reference — no re-render cost
<View style={styles.container}>
```

---

### 4. Animations — Premium Feel

**Always use `useNativeDriver: true`**

```typescript
// ❌ Runs on JS thread — janky under load
Animated.timing(opacity, { toValue: 1, useNativeDriver: false });

// ✅ Runs on UI thread — buttery smooth
Animated.timing(opacity, { toValue: 1, useNativeDriver: true });
```

---

**Reanimated for complex animations — you already have it**

```typescript
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';

// Cards animate in staggered on screen load — premium feel
{documents.map((doc, i) => (
  <Animated.View
    key={doc.id}
    entering={FadeInDown.delay(i * 60).springify()}  // stagger by 60ms
    layout={Layout.springify()}                       // smooth reorder
  >
    <DocumentResultCard doc={doc} />
  </Animated.View>
))}
```

---

**Haptics — makes UI feel physical**

```bash
pnpm add expo-haptics
```

```typescript
import * as Haptics from 'expo-haptics';

// On button press
const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // proceed with action
};

// On success (upload complete, verify success)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// On error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

### 5. UX Polish — Premium Feel Checklist

**Skeleton loaders instead of spinners**

```bash
pnpm add react-native-skeleton-placeholder
```

```typescript
// ❌ Generic spinner — feels cheap
if (isLoading) return <ActivityIndicator />;

// ✅ Skeleton — feels like a real app
if (isLoading) return (
  <SkeletonPlaceholder>
    <SkeletonPlaceholder.Item width="100%" height={72} borderRadius={20} />
    <SkeletonPlaceholder.Item width="100%" height={72} borderRadius={20} marginTop={12} />
  </SkeletonPlaceholder>
);
```

---

**Keyboard handling — forms don't get covered**

```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

// Wraps all auth screens
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <AuthInput ... />
</KeyboardAvoidingView>
```

---

**Pressable feedback — every touchable needs a response**

```typescript
// ❌ No feedback — feels broken
<TouchableOpacity>

// ✅ Subtle scale — feels alive
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    styles.card,
    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
  ]}
>
```

---

### 6. QA Checklist Before Every Release

```
Performance
  □ No console.log in production (Metro config handles this)
  □ FlatList used for all lists, not ScrollView
  □ All images using expo-image with cachePolicy
  □ No inline style objects

Feel
  □ Every button has pressed state (opacity/scale)
  □ Haptics on primary actions
  □ Skeleton loaders on all data screens
  □ Animations use useNativeDriver: true

Security
  □ Tokens in SecureStore, not AsyncStorage
  □ No hardcoded URLs or keys
  □ console.logs stripped in prod build

Bundle
  □ Only 4 Inter font weights loaded
  □ One icon set only (MaterialIcons)
  □ bundle-visualizer run, no surprise large packages
```

---

### What Gives the Biggest Bang for LexChain Specifically

| Priority | Action                              | Impact                     |
| -------- | ----------------------------------- | -------------------------- |
| 1        | `expo-image` replacing `Image`      | Load time + cache          |
| 2        | Reanimated stagger on document list | Feels premium instantly    |
| 3        | Haptics on upload complete + verify | Feels physical             |
| 4        | Skeleton on Documents + Dashboard   | Removes cheap spinner feel |
| 5        | `memo` on DocumentResultCard        | Smooth scroll              |
| 6        | `drop_console` in Metro config      | Smaller prod bundle        |
