# Auth Test App

React Native Expo login flow: **Home > Login > Profile** with full auth lifecycle.

## Quick Start

```bash
cp .env.example .env
npm install
npx expo start --ios
```

Test credentials: `emilys` / `emilyspass`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 54, Router v6 |
| Language | TypeScript (strict mode) |
| Server state | TanStack React Query v5 |
| Auth state | React Context (discriminated union) |
| Forms | React Hook Form + Zod v4 |
| HTTP | Axios with refresh interceptor |
| Token storage | expo-secure-store |
| Animation | react-native-reanimated |
| Linting | ESLint (expo flat config) |
| Pre-commit | husky + lint-staged |
| Testing | Jest + ts-jest + @testing-library/react |
| API | https://dummyjson.com/docs/auth |

## Architecture: Feature-Sliced Design

The project follows [FSD](https://feature-sliced.design/) — a layered architecture where each layer can only import from layers below it.

```
app/                          Expo Router screens & layouts
src/
  features/auth/              Auth business logic (single feature slice)
    api/                        API calls with Zod response validation
    lib/                        Token storage, form validation schemas
    model/                      AuthProvider, hooks, React Query config
    ui/                         LoginForm component
  entities/user/              User types (no logic, types only)
  shared/                     Zero business logic
    api/                        Axios instance, interceptors, QueryClient
    lib/                        Config, theme, routes, i18n, providers
    ui/                         AppText, AppButton, FloatingLabelInput, etc.
```

**Import rules enforced:**
- `features/` imports from `entities/` and `shared/` only
- `entities/` imports from `shared/` only
- `shared/` has zero imports from upper layers
- Cross-slice imports go through barrel `index.ts` files, never internal paths

### Why FSD over flat/screens-based structure

A flat structure (screens + components + hooks) doesn't scale. With FSD, adding a new feature (e.g. registration) means creating `features/registration/` without touching existing auth code. Each slice is self-contained with its own API, model, and UI layers.

## Code Quality

### Pre-commit hooks

Every commit runs three sequential checks via **husky**:

1. **lint-staged** — ESLint with auto-fix on staged `.ts`/`.tsx` files
2. **tsc --noEmit** — full TypeScript type check (entire project)
3. **jest** — all unit tests

If any step fails, the commit is blocked.

### Testing

```bash
npm test                      # run all tests
```

72 tests across 12 suites. UI component tests use `react-native-web` + `@testing-library/react` with `jsdom`, native modules mocked per-file.

Tests cover:
- **UI components** — AppButton (variants, press, disabled, loading), FloatingLabelInput (label, input, error, clear), ErrorBanner (render, accessibility), ErrorBoundary (catch, fallback, custom fallback, retry recovery), LoginForm (render, disabled state)
- **Auth provider** — Bootstrap flow, login/logout, interceptor setup/teardown, token save failure
- **Auth API** — Login/getMe/refresh response parsing, Zod validation on malformed responses, empty token rejection, config injection
- **Token storage** — SecureStore CRUD, error handling, edge cases
- **Validation** — Zod schema boundary values, error messages, type inference
- **HTTP interceptor** — 401 handling, refresh queue, race conditions

## Navigation

### Declarative redirects, not imperative navigation

Auth-dependent routing uses `<Redirect>` in layout components, not `router.replace()` in effects:

```
app/_layout.tsx       Providers + splash screen (waits for fonts AND auth check)
app/index.tsx         Redirect: authenticated -> profile, otherwise -> home
app/(public)/         Layout redirects authenticated users OUT to profile
app/(protected)/      Layout redirects unauthenticated users OUT to home
```

This is the Expo Router recommended pattern. Navigation reacts to auth state changes automatically — login, logout, and token expiry all trigger redirects through the same declarative mechanism.

### Splash screen strategy

The native splash screen stays visible until **both** conditions are met:
1. Fonts loaded (`useFonts` hook)
2. Auth state resolved (not `'loading'`)

This prevents the "flash of wrong screen" — the user never sees Home before being redirected to Profile.

## Auth Flow

### Login
1. Client-side validation (Zod) with inline errors on blur
2. `POST /auth/login` with `expiresInMins: 1` (short-lived for demo)
3. Tokens saved to SecureStore, auth state updated
4. Automatic redirect via `<Redirect>` in public layout

### Token refresh (interceptor with queue)
All 401 responses trigger automatic token refresh:

```
Request fails with 401
  -> Is refresh already in progress?
     YES -> Queue this request, wait for refresh result
     NO  -> Start refresh, set isRefreshing flag
       -> Refresh succeeds -> Process queue (retry all), return new token
       -> Refresh fails -> Process queue (reject all), trigger logout
```

This handles the race condition where multiple requests fail simultaneously — only one refresh call is made, all others wait.

### Auto-logout
`useProfileQuery` polls `GET /auth/me` every 30 seconds. When the token expires (1 min) and refresh fails, the auth state flips to `'unauthenticated'` and the protected layout's `<Redirect>` sends the user to Home.

### Bootstrap (app startup)
```
Check SecureStore for tokens
  -> No tokens -> unauthenticated
  -> Has tokens -> GET /auth/me
    -> Success -> authenticated (re-reads tokens — may have been refreshed by interceptor)
    -> Fail (interceptor retries with refresh automatically) -> unauthenticated
```

No duplicate refresh logic — the interceptor handles 401 → refresh → retry for all requests, including bootstrap's `getMe()`.

## Security

| Measure | Implementation |
|---------|---------------|
| Token storage | `expo-secure-store` (Keychain on iOS, KeyStore on Android), not AsyncStorage |
| Request timeout | 10s timeout on all HTTP requests via Axios config |
| Response validation | Zod schemas validate every API response before use |
| No user enumeration | Login errors show generic "Invalid username or password", never reveal if user exists |
| Token isolation | Access and refresh tokens stored separately, refresh token never sent in headers |
| Error boundary | React ErrorBoundary catches render crashes, shows retry UI, logs only in `__DEV__` |
| Token cleanup | `clear()` is best-effort with try/catch — partial state won't block logout |
| Refresh protection | Interceptor skips `/auth/refresh` endpoint to prevent infinite retry loops |
| Accessibility | All interactive elements have `accessibilityRole`, `accessibilityLabel`, and `accessibilityState`; error banners use `accessibilityRole="alert"` + `accessibilityLiveRegion="assertive"` |

## Error Handling

### Layers of defense

**Input validation** — Zod schemas in `validation.ts` with localized error messages. Validated on blur (`mode: 'onTouched'`).

**API response validation** — Every response passes through Zod `.parse()`. Malformed responses throw before reaching business logic.

**HTTP errors** — Categorized by type in `useLoginForm`:
- No response -> "Network error. Check your connection."
- 400/401 -> "Invalid username or password"
- Other -> "Something went wrong. Please try again."

**Token storage errors** — `getAccessToken`/`getRefreshToken` return `null` on SecureStore failure (graceful degradation to unauthenticated). `login` checks `save` result and throws on failure — user is never shown as authenticated without persisted tokens.

**Render errors** — `ErrorBoundary` wraps the entire app. Catches unhandled exceptions, shows a retry button, prevents white screen of death.

## Design System

### AppText with variants

`AppText` maps directly to Figma typography tokens:

```tsx
<AppText variant="profileHeading">Hi, Emily Johnson!</AppText>
<AppText variant="errorText">Username is invalid</AppText>
<AppText variant="buttonLabel">Login</AppText>
<AppText color={COLORS.textBody} align="center">Custom</AppText>
```

Available variants: `buttonLabel`, `secondaryButtonLabel`, `inputPlaceholder`, `inputValue`, `inputFloatingLabel`, `errorText`, `errorBannerText`, `profileHeading`.

### Unified AppButton

Single component with `variant` prop instead of separate PrimaryButton/SecondaryButton:

```tsx
<AppButton variant="primary" label="Login" onPress={submit} loading={isPending} />
<AppButton variant="secondary" label="Logout" onPress={logout} />
```

Primary renders with `LinearGradient` + shadow. Secondary renders with white background. Uses `Pressable` with full accessibility props (`accessibilityRole`, `accessibilityLabel`, `accessibilityState`).

### FloatingLabelInput

Five visual states matching Figma pixel-perfect, animated with `react-native-reanimated`:

| State | Border | Label |
|-------|--------|-------|
| Unfocused + empty | Grey | Hidden (acts as placeholder) |
| Focused + empty | Blue | Animated to top, blue |
| Focused + value | Blue | At top, blue, clear button visible |
| Unfocused + value | Blue | At top, blue, clear button visible |
| Error | Red | Red (or placeholder turns red if empty) |

Label color transitions use `interpolateColor` for smooth animation between grey/blue/red. Includes `accessibilityLabel` on input and clear button.

### Theme tokens

All visual values come from `theme.ts` — `COLORS`, `TYPOGRAPHY`, `DIMENSIONS`, `SPACING`, `SHADOWS`. Zero hardcoded hex values in components.

## Key Decisions

| Decision | Why |
|----------|-----|
| FSD over flat structure | Scales to real projects, demonstrates systems thinking |
| Discriminated union for AuthState | `{ status: 'loading' } \| { status: 'authenticated', user }` — type-safe, no impossible states |
| `setupInterceptors` via dependency injection | `shared/` layer cannot import from `features/` — interceptor receives callbacks; state encapsulated in closure, cleaned up on eject |
| `useWatch` (array form) over `form.watch()` | `watch()` doesn't trigger re-renders reliably with zodResolver v5 + Zod v4; single `useWatch({ name: ['username', 'password'] })` replaces multiple calls |
| `expiresInMins: 1` | Short token lifetime demonstrates auto-logout works in real-time |
| Zod on responses, not just inputs | API responses are an untrusted boundary — validate before trusting |
| `ComposeProviders` utility | Providers scale without nesting hell — add a new provider to the array |
| Routes as typed constants | `ROUTES.public.login` instead of string literals — refactor-safe, IDE-navigable |
| `Pressable` over `TouchableOpacity` | Modern RN API with `style` callback for pressed states; better accessibility support |
| Reanimated `entering`/`exiting` over manual animation | `FadeIn`/`FadeOut` layout animations are declarative and handle mount/unmount automatically |
| Centralized i18n strings | All UI text in one place — ready for multi-language support |

## Project Structure

```
app/
  _layout.tsx                  Root: fonts, providers, splash
  index.tsx                    Entry redirect based on auth state
  (public)/
    _layout.tsx                Redirects authenticated users to profile
    home.tsx                   "Go to login" button
    login.tsx                  Login form
  (protected)/
    _layout.tsx                Redirects unauthenticated users to home
    profile.tsx                Greeting + logout

src/
  entities/user/
    types.ts                   User, AuthTokens, AuthState, LoginRequest/Response
    index.ts

  features/auth/
    api/authApi.ts             login(), getMe(), refreshToken() + Zod validation
    lib/tokenStorage.ts        SecureStore wrapper with error handling
    lib/validation.ts          Zod login schema
    model/AuthProvider.tsx     Context + bootstrap + interceptor setup
    model/useAuth.ts           useContext hook
    model/useLoginForm.ts      React Hook Form + mutation
    model/useProfileQuery.ts   Polling query for auto-logout
    model/authKeys.ts          React Query key factory
    ui/LoginForm.tsx           Form UI with Controllers
    index.ts

  shared/
    api/http.ts                Axios + refresh interceptor with queue
    api/queryClient.ts         QueryClient singleton
    api/index.ts
    lib/config.ts              Zod-validated app config
    lib/constants.ts           API URL, SecureStore keys
    lib/theme.ts               COLORS, TYPOGRAPHY, DIMENSIONS, SPACING, SHADOWS
    lib/routes.ts              Typed route constants
    lib/providers.tsx           ComposeProviders utility
    lib/i18n/                  i18next setup + locale files (en, uk)
    lib/index.ts
    ui/AppText.tsx             Text with typography variants
    ui/AppButton.tsx           Gradient/white button
    ui/FloatingLabelInput.tsx  Animated floating label input
    ui/ErrorBanner.tsx         Red error banner
    ui/ErrorBoundary.tsx       React error boundary
    ui/ScreenContainer.tsx     SafeArea + keyboard handling
    ui/index.ts
```
