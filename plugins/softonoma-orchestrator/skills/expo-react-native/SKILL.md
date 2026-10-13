---
name: expo-react-native
description: Build React Native apps with Expo the Softonoma way — Expo Router navigation, EAS Build/Update delivery, TanStack Query + Zustand data layer, react-hook-form/zod forms, react-native-maps, push tokens, i18n/RTL, offline patterns. Use for any task in an Expo/React Native codebase. Triggers on "Expo", "React Native", "EAS", "expo-router", "mobile app", "iOS/Android app", "push token", "OTA update".
metadata:
  version: "1.0.0"
---

# Expo / React Native (Softonoma stack)

Conventions for production Expo apps. The app is a thin, resilient client: the backend API owns
every business rule; the app renders state, calls endpoints, and degrades gracefully offline.

## Project shape

```
app/                    # Expo Router file-based routes
  (auth)/               # unauthenticated group: onboarding, phone entry, OTP
  (tabs)/               # main tab navigator, one file per tab
  _layout.tsx           # root providers: QueryClient, theme, i18n, auth gate
src/
  api/                  # generated/typed API client + query/mutation hooks per domain
  components/           # shared UI (dumb, typed props)
  features/<domain>/    # screen-specific components + hooks per domain
  stores/               # zustand slices (client state only)
  lib/                  # i18n, analytics facade, storage, constants
```

Rules of thumb:
- **Server state in TanStack Query, client state in Zustand** — never mirror API data into a store.
- Query keys are arrays by domain: `['listings', { filters }]`, `['listings', id]`. Mutations
  invalidate or optimistically update the exact keys they affect.
- Forms: react-hook-form + `zodResolver`, with the zod schema imported from the shared
  schemas package when one exists — the same schema the API validates with.
- supabase-js (when used) is for **login, realtime subscribe and file upload only**; all reads and
  writes go through the API client.

## Navigation (Expo Router)

- Auth gating in the root layout: redirect by session state, not per-screen checks.
- Deep links: configure the scheme + associated domains in `app.json`; every push notification
  payload carries a route the app can open. Test cold-start deep links, not just warm ones.
- Modals as route groups; keep navigation params primitive (ids, not objects) — fetch by id on
  the target screen.

## Delivery (EAS)

- Three build profiles in `eas.json`: `development` (dev client), `preview` (internal), `production`.
- Environment per profile via EAS env vars — the app bundle never contains secrets; it holds only
  publishable keys (API URL, Supabase anon key, Google Maps key restricted by app id).
- JS-only fixes ship with **EAS Update** on a channel per environment; anything native (new
  module, permission, config plugin) requires a new **EAS Build** + store release. Say which one a
  change needs when you finish it.
- Pin native-sensitive packages exactly (e.g. react-native-maps) and upgrade them only with a
  dedicated build + device test pass.

## Platform essentials

- **Permissions:** always a custom pre-prompt screen explaining why, then the OS dialog.
  Handle "denied" with a usable fallback (manual location entry, silent no-push mode).
- **Push:** register the native device token (FCM; APNs via FCM), store it server-side keyed by
  device, remove invalid tokens on send failure, and respect per-user notification preferences.
- **Media:** compress/resize on-device (expo-image-manipulator, ~1600px JPEG) before upload;
  upload with signed URLs directly to storage, never through the API process.
- **Lists:** FlashList with estimated item size; thumbnails in lists, full images on detail.
- **Maps:** react-native-maps with the Google provider on both platforms; cluster with
  supercluster; debounce region changes before refetching; never render exact coordinates the
  product's privacy rules reserve for a later state.
- **i18n:** i18next + expo-localization; all strings through `t()` from day one — retrofitting is
  expensive. For RTL scripts (Urdu, Arabic) verify layout with `I18nManager` early.
- **Offline:** TanStack Query retry/backoff; mutating calls carry an idempotency key; queue
  non-critical writes; every screen has loading/empty/error/offline states.

## Quality gate

- TypeScript strict, no `any` at module boundaries.
- Jest + React Native Testing Library for logic/components; Maestro flows for the critical paths,
  run on a low-end Android profile.
- Sentry wired through EAS (release + sourcemaps) before the first preview build.
- Before "done": typecheck + lint green, the flow exercised in a dev build or simulator, and both
  platforms considered where they differ (keyboard, back gesture, shadows, safe areas).
