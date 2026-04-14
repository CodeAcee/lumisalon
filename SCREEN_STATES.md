# LumiSalon — Screen State Coverage

Each screen must handle every state below. Missing states are noted.

---

## (tabs)/index — Home

| State | Coverage | Notes |
|---|---|---|
| Loading (data not yet fetched) | ✅ | `ProcedureSkeleton` shown while `!dataLoaded` |
| Empty (no procedures) | ✅ | Empty state with icon, title, hint, CTA button |
| Populated — few (≤4) | ✅ | All cards shown, no "See all" link |
| Populated — many (>4) | ✅ | First 4 shown, "See all" / "Show less" toggle |
| Search active, no match | ✅ | Empty state from `getFilteredProcedures()` returns `[]` |
| Filter active | ✅ | Filter chip count shown on search bar |
| Error loading data | ❌ | No error boundary or retry UI |

---

## (tabs)/masters — Masters

| State | Coverage | Notes |
|---|---|---|
| Loading | ✅ | Skeleton cards |
| Empty | ✅ | Empty state with "Add Master" CTA |
| Populated | ✅ | Master cards list |
| Search — no match | ✅ | "No results" text |
| Error | ❌ | No error state |

---

## (tabs)/clients — Clients

| State | Coverage | Notes |
|---|---|---|
| Loading | ✅ | Skeleton cards |
| Empty | ✅ | Empty state |
| Populated | ✅ | Client cards list |
| Search — no match | ✅ | "No results" text |
| Error | ❌ | No error state |

---

## (tabs)/settings — Settings

| State | Coverage | Notes |
|---|---|---|
| Authenticated user info | ✅ | Avatar, name, email |
| Unauthenticated | ✅ | Redirected to auth by `_layout` |

---

## procedure/[id] — Procedure Detail

| State | Coverage | Notes |
|---|---|---|
| Loading | ❌ | No skeleton; direct render from store |
| Not found | ❌ | No 404 / fallback if `id` is invalid |
| Populated | ✅ | Photos, details, client/master info |
| Delete confirmation | ✅ | Modal dialog |

---

## procedure/create — New Procedure

| State | Coverage | Notes |
|---|---|---|
| Initial / blank | ✅ | |
| Validation errors | ✅ | Field-level error messages |
| Submitting | ✅ | Loading indicator on Save button |
| Submit error | ✅ | Toast/alert on failure |
| Success | ✅ | Dismisses modal, list refreshes |

---

## client/[id] — Client Detail

| State | Coverage | Notes |
|---|---|---|
| Loading | ❌ | No skeleton |
| Not found | ❌ | No fallback |
| Populated | ✅ | |
| Delete | ✅ | Confirmation dialog |

---

## client/create & client/edit

| State | Coverage | Notes |
|---|---|---|
| Blank / pre-filled | ✅ | |
| Validation | ✅ | |
| Saving | ✅ | |
| Error | ✅ | |

---

## master/[id] — Master Detail

| State | Coverage | Notes |
|---|---|---|
| Loading | ❌ | No skeleton |
| Not found | ❌ | No fallback |
| Populated | ✅ | |
| Delete | ✅ | |

---

## (auth)/index — Login

| State | Coverage | Notes |
|---|---|---|
| Idle | ✅ | |
| Loading | ✅ | Button disabled, spinner |
| Invalid credentials | ✅ | Inline error message |
| Network error | ✅ | Alert |

---

## (auth)/signup — Sign Up

| State | Coverage | Notes |
|---|---|---|
| Idle | ✅ | |
| Validation | ✅ | |
| Submitting | ✅ | |
| Success (email confirm) | ✅ | Confirmation screen |
| Error | ✅ | |

---

## (auth)/forgot-password — Forgot Password

| State | Coverage | Notes |
|---|---|---|
| Idle | ✅ | |
| Submitted | ✅ | Email sent confirmation |
| Error | ✅ | |

---

## Global

| State | Coverage | Notes |
|---|---|---|
| Font loading (splash held) | ✅ | `useFonts` in `_layout.tsx`, null render until ready |
| Auth session restore | ✅ | `supabase.auth.getSession()` on mount |
| Token refresh | ✅ | `onAuthStateChange` listener |
| Working-hours notifications | ✅ | Scheduled on app start |
| Image viewer overlay | ✅ | `ImageViewer` mounted at root |

---

## Open Gaps (priority order)

1. **Error states on list screens** — home, masters, clients need a retry banner when Supabase calls fail.
2. **Detail screen loading/not-found** — `procedure/[id]`, `client/[id]`, `master/[id]` should show skeletons and handle missing records.
3. **Offline / no network** — no offline indicator or stale-data message anywhere.
