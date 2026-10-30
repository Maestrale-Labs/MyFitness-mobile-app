This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## This project

Fitness app, iOS first, Android later from the same code. Start from `docs/memoria-progetto.md` (Italian): product brief, decisions so far, open questions and the next step. Keep it updated when a decision changes. See also `README.md` and `docs/exercise-data.md`.

- Screens live in `src/app/`; feature code (types, data, hooks, feature components) in `src/features/<feature>/`; shared UI in `src/components/`.
- Colors only from `useTheme()` (`src/constants/theme.ts`). Use `tint` for accent text, icons and selected fills (with `onTint` on top); `brand` is decorative. Keep new color pairs at WCAG AA contrast in both schemes.
- Every user-facing string goes through i18next (`useTranslation`). Add keys to `src/i18n/locales/it.ts` first; `en.ts` is typed against it. Localized content (exercise names, steps, legal texts) uses `Localized<T>` and `useLocale()`.
- Icons: Hugeicons, as in Paniere. Pick them in `src/constants/icons.ts` and render them with `Icon` from `@/components/icon`.
- UI follows Paniere (`../paniere-mobile-app`): no native headers, the floating pill tab bar (`floating-tab-bar.tsx`), `Screen`, `Card`, `SettingsRow`, `SectionLabel`, `SubScreenHeader`. Write theme-dependent styles with `makeStyles()` (`src/hooks/use-styles.ts`); tab screens pad their scroll content with `useTabBarInset()`.
- Exercises are read through `ExerciseRepository` + React Query (`src/features/exercises/queries.ts`), never from the seed file directly, so the Supabase switch stays local to the repository.
- Inside `<Link asChild>`, don't pass a style function to `Pressable` (it is dropped on web); style an inner `View` from the `pressed` render prop instead.
- Before declaring work done: `npm run lint`, `npm run typecheck`, `npm run format`.
