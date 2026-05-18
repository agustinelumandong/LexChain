# Expo Best Practices — Code Snippets

---

## 🦴 Skeleton Loading

### moti/skeleton — wrap any component
> Works in Expo Go. Needs `react-native-reanimated` + `expo-linear-gradient`.

```tsx
import { MotiView } from 'moti'
import { Skeleton } from 'moti/skeleton'

export function CardSkeleton({ isLoading, children }) {
  return (
    <Skeleton.Group show={isLoading}>
      <MotiView style={styles.card}>
        <Skeleton colorMode="light" radius="round" height={48} width={48} />
        <MotiView style={{ flex: 1, gap: 8 }}>
          <Skeleton colorMode="light" height={16} width="80%" />
          <Skeleton colorMode="light" height={12} width="50%" />
        </MotiView>
      </MotiView>
      {!isLoading && children}
    </Skeleton.Group>
  )
}
```

### Manual shimmer — zero dependencies

```tsx
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'

export function ShimmerBox({ width, height }) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return <Animated.View style={[styles.box, { width, height, opacity }]} />
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#E0E0E0', borderRadius: 6 },
})
```

---

## 🔔 Toast Notifications

### sonner-native — setup in root layout
> Place `<Toaster />` once in `app/_layout.tsx`. Call `toast()` from anywhere.

```tsx
// app/_layout.tsx
import { Toaster } from 'sonner-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
      <Toaster position="bottom-center" />
    </GestureHandlerRootView>
  )
}
```

### sonner-native — calling toasts

```ts
import { toast } from 'sonner-native'

// basic
toast('Profile saved')

// variants
toast.success('Payment complete')
toast.error('Something went wrong')
toast.warning('Low storage')

// promise — shows loading then resolves to success/error
toast.promise(uploadFile(), {
  loading: 'Uploading...',
  success: 'File uploaded',
  error: 'Upload failed',
})
```

---

## 🖼️ Images

### expo-image — drop-in replacement with caching
> Supports WebP, AVIF, blurhash placeholders, and aggressive disk/memory caching.

```tsx
import { Image } from 'expo-image'

<Image
  source={{ uri: 'https://cdn.example.com/photo.webp' }}
  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
  contentFit="cover"
  transition={300}
  style={{ width: 200, height: 200, borderRadius: 8 }}
/>
```

### Preload critical images at app start

```ts
import { Image } from 'expo-image'

Image.prefetch([
  'https://cdn.example.com/hero.webp',
  'https://cdn.example.com/avatar-default.webp',
])
```

---

## 📋 Lists

### FlashList — drop-in FlatList replacement
> `estimatedItemSize` is required. Use the same value for fixed-height items.

```tsx
import { FlashList } from '@shopify/flash-list'

<FlashList
  data={posts}
  estimatedItemSize={80}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <PostCard post={item} />}
  onEndReached={fetchNextPage}
  onEndReachedThreshold={0.3}
/>
```

### Avoid ScrollView + map for long lists

```tsx
// ❌ bad — renders ALL items at once, no recycling
<ScrollView>
  {posts.map((p) => <PostCard key={p.id} post={p} />)}
</ScrollView>

// ✅ good — only renders visible items
<FlashList
  data={posts}
  estimatedItemSize={80}
  renderItem={({ item }) => <PostCard post={item} />}
/>
```

---

## 🗂️ State Management

### Zustand store — tiny global state
> ~1KB. No context, no provider, no boilerplate.

```ts
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}))

// usage anywhere in app — no provider needed
const { user, login, logout } = useAuthStore()
```

### Zustand with AsyncStorage persistence

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

---

## ⚡ Performance

### useCallback + useMemo — stable references

```tsx
import { useCallback, useMemo } from 'react'

// ❌ bad — new function + object reference on every render
<Button
  onPress={() => handleSubmit(item.id)}
  style={{ marginTop: 8 }}
/>

// ✅ good — stable references, prevents child re-renders
const handleSubmit = useCallback(() => {
  submitForm(item.id)
}, [item.id])

const btnStyle = useMemo(() => ({ marginTop: 8 }), [])

<Button onPress={handleSubmit} style={btnStyle} />
```

### React.memo — skip unchanged components

```tsx
import { memo } from 'react'

const PostCard = memo(function PostCard({ post }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
    </View>
  )
})

// custom comparator for complex props
const Avatar = memo(
  ({ user }) => <Image source={{ uri: user.avatar }} />,
  (prev, next) => prev.user.id === next.user.id
)
```

### InteractionManager — defer heavy work

```ts
import { InteractionManager } from 'react-native'
import { useEffect } from 'react'

export function HomeScreen() {
  useEffect(() => {
    // runs AFTER navigation animation completes
    const task = InteractionManager.runAfterInteractions(() => {
      initAnalytics()
      prefetchNextScreen()
      syncOfflineQueue()
    })
    return () => task.cancel()
  }, [])
}
```

---

## 📦 Bundle

### Bare imports — don't pull in the whole library

```ts
// ❌ imports entire lodash (~70KB)
import _ from 'lodash'
const result = _.debounce(fn, 300)

// ✅ imports only debounce (~2KB)
import debounce from 'lodash/debounce'
const result = debounce(fn, 300)

// ✅ same applies to date-fns
import { format, parseISO } from 'date-fns'
```

### app.json — enable Hermes + new architecture
> Hermes compiles JS to bytecode at build time. Significantly faster cold start.

```json
{
  "expo": {
    "jsEngine": "hermes",
    "newArchEnabled": true,
    "ios": { "jsEngine": "hermes" },
    "android": { "jsEngine": "hermes" }
  }
}
```

### metro.config.js — only needed on SDK 52 or lower
> `unstable_enablePackageExports` is **on by default in SDK 53+**. Only set this manually if you are on an older SDK.

```js
// metro.config.js — only needed for SDK 52 and below
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// ⚠️ SDK 53+ already enables this by default — skip if on latest
config.resolver.unstable_enablePackageExports = true

module.exports = config
```

---

## 🚀 Startup

### Lazy load heavy screens with React.lazy

```tsx
import { lazy, Suspense } from 'react'

// ❌ eager — loaded before user ever visits the screen
import HeavyChartScreen from './screens/HeavyChartScreen'

// ✅ lazy — loaded only when navigated to
const HeavyChartScreen = lazy(() =>
  import('./screens/HeavyChartScreen')
)

<Suspense fallback={<LoadingSpinner />}>
  <HeavyChartScreen />
</Suspense>
```

### Load only the fonts you actually use

```tsx
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    // ✅ only load weights you actually use
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    // ❌ don't load weights you never reference
    // 'Inter-Black': require('./assets/fonts/Inter-Black.ttf'),
  })

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync()
  }, [loaded])
}
```

---

## 🏗️ EAS Build (Production)

> Source: [docs.expo.dev/build/eas-json](https://docs.expo.dev/build/eas-json) and [docs.expo.dev/guides/tree-shaking](https://docs.expo.dev/guides/tree-shaking)

### Step 1 — Install EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

### Step 2 — Initialize and configure your project

```bash
eas build:configure
```

This generates an `eas.json` at the root of your project with three default profiles.

### Step 3 — eas.json — full recommended config

```json
{
  "cli": {
    "version": ">= 16.18.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "extends": "production",
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "android": { "track": "internal" },
      "ios": { "ascAppId": "your-app-store-connect-app-id" }
    }
  }
}
```

> `preview` extends `production` so it inherits all production settings but distributes internally (no app store required). `autoIncrement` bumps the build number automatically on each EAS build.

### Step 4 — Run builds per profile

```bash
# development build (for your dev client / Expo Go replacement)
eas build --profile development --platform all

# preview build (share with testers, no store needed)
eas build --profile preview --platform all

# production build (submit to stores)
eas build --platform all
# --profile production is the default, no need to specify it
```

### Step 5 — Submit to stores

```bash
# submit the latest production build
eas submit --platform ios --profile production --latest
eas submit --platform android --profile production --latest

# or combine build + submit in one command
eas build --platform all --auto-submit
```

### Tree shaking — SDK version guide

| SDK | Status | What to do |
|---|---|---|
| **SDK 54+** | `experimentalImportSupport` on by default | Nothing — works out of the box |
| **SDK 53** | `unstable_enablePackageExports` on by default | Nothing — works out of the box |
| **SDK 52 and below** | Manual opt-in required | Add `EXPO_UNSTABLE_TREE_SHAKING=1` env var |

For SDK 52 and below, enable tree shaking via environment variable in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "NODE_ENV": "production",
        "EXPO_UNSTABLE_TREE_SHAKING": "1",
        "EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH": "1"
      }
    }
  }
}
```

> ⚠️ Tree shaking is experimental on SDK 52. Test your production build thoroughly before shipping — some libraries with internal Metro imports can break when it's enabled.

### Analyze your bundle size

```bash
# visualize what's in your JS bundle
npx expo-bundle-visualizer

# or export and inspect locally
npx expo export --platform android
```

---

## 📚 Reference Docs

### Expo Official Docs
| Topic | URL |
|---|---|
| EAS Build — Introduction | https://docs.expo.dev/build/introduction |
| EAS Build — Configure with eas.json | https://docs.expo.dev/build/eas-json |
| EAS Build — Build configuration process | https://docs.expo.dev/build-reference/build-configuration |
| EAS Build — Create your first build | https://docs.expo.dev/build/setup |
| EAS Build — Internal distribution | https://docs.expo.dev/build/internal-distribution |
| EAS Build — Trigger builds from CI | https://docs.expo.dev/build/building-on-ci |
| EAS Submit — Android | https://docs.expo.dev/submit/android |
| EAS Submit — iOS | https://docs.expo.dev/submit/ios |
| EAS Submit — Configure with eas.json | https://docs.expo.dev/submit/eas-json |
| EAS Update — Get started | https://docs.expo.dev/eas-update/getting-started |
| Tree shaking & code removal | https://docs.expo.dev/guides/tree-shaking |
| Metro config reference | https://docs.expo.dev/versions/latest/config/metro |
| Hermes engine | https://docs.expo.dev/guides/using-hermes |
| New Architecture | https://docs.expo.dev/guides/new-architecture |
| expo-image | https://docs.expo.dev/versions/latest/sdk/image |
| expo-font / useFonts | https://docs.expo.dev/versions/latest/sdk/font |
| expo-splash-screen | https://docs.expo.dev/versions/latest/sdk/splash-screen |
| Understanding app size | https://docs.expo.dev/distribution/app-size |
| App stores best practices | https://docs.expo.dev/distribution/app-stores |

### Third-party Libraries
| Library | URL |
|---|---|
| moti — animations & skeleton | https://moti.fern.app/skeleton |
| sonner-native — toast for RN | https://github.com/gunnartorfis/sonner-native-toasts |
| @shopify/flash-list | https://shopify.github.io/flash-list |
| zustand — state management | https://zustand.docs.pmnd.rs |
| react-native-reanimated | https://docs.swmansion.com/react-native-reanimated |
| react-native-gesture-handler | https://docs.swmansion.com/react-native-gesture-handler |
| @react-native-async-storage/async-storage | https://react-native-async-storage.github.io/async-storage |

### SDK Changelogs
| Release | URL |
|---|---|
| Expo SDK 54 changelog | https://expo.dev/changelog/sdk-54 |
| Expo SDK 53 changelog | https://expo.dev/changelog/sdk-53 |
| Expo SDK 52 changelog | https://expo.dev/changelog/sdk-52 |
