# LumiSalon — Design System

## Product Context

- **What this is:** A beauty salon management app for tracking procedures, clients, and masters across multiple locations.
- **Who it's for:** Salon owners and staff (receptionists, masters). Used daily for data entry and quick lookups — not for long reading sessions.
- **Space/industry:** Beauty / wellness / salon management. Peers: Fresha, Vagaro, Booksy (all feel generic and enterprise-cold).
- **Project type:** Mobile app (React Native / Expo). Data-entry-heavy, not editorial.

## Aesthetic Direction

- **Direction:** Organic/Refined — warm, tactile, premium. A salon tool that feels like the salon itself.
- **Decoration level:** Intentional — the warm cream palette does the decorating. No gradients, no decorative blobs. Subtle shadows on cards.
- **Mood:** Warm and confident. Professional without feeling like HR software. The kind of app that fits next to a marble countertop.
- **What we're deliberately avoiding:** The Fresha/Vagaro blue-and-white enterprise aesthetic. The purple-gradient "modern SaaS" look. Generic management tool sterility.

## Typography

- **Display/UI (active):** `DM Sans` — clean geometric grotesque with more character than Inter. Loaded via `@expo-google-fonts/dm-sans`. Used for all text currently.
- **Display upgrade path:** `Satoshi` (Fontshare, free) — geometric grotesque with subtle quirks in `a`, `g`, and terminal strokes at heavy weights. To add: download `.ttf` files from [fontshare.com/fonts/satoshi](https://www.fontshare.com/fonts/satoshi), add to `assets/fonts/`, register in `app.json` under `expo.fonts`. Then update `Fonts.bold` and `Fonts.semiBold` in `theme.ts`.
- **Body/UI:** DM Sans (all weights) — same as display until Satoshi is added.
- **Data/Tables:** DM Sans with `fontVariant: ['tabular-nums']` — apply wherever dates, prices, or counts appear side-by-side.
- **Loading:** `@expo-google-fonts/dm-sans` in `app/_layout.tsx`. Splash screen hides only after `fontsLoaded` is true.

### Font constants (`src/constants/theme.ts`)

```ts
Fonts.regular  → "DMSans_400Regular"
Fonts.medium   → "DMSans_500Medium"
Fonts.semiBold → "DMSans_600SemiBold"
Fonts.bold     → "DMSans_700Bold"
```

Pattern — always pair `fontFamily` with `fontWeight` for consistent fallback before fonts load:

```ts
heading: { fontFamily: Fonts.bold,    fontWeight: "700", fontSize: FontSize.title }
body:    { fontFamily: Fonts.regular,  fontWeight: "400", fontSize: FontSize.body  }
```

### Font size scale (`FontSize`)

`xs 11` · `sm 12` · `caption 13` · `body 14` · `md 16` · `lg 17` · `title 20` · `heading 28` · `hero 30`

## Color

All colors live in `src/constants/theme.ts` as `lightColors` and `darkColors`, with named theme overrides in `themes`. The active palette is resolved at runtime by `ThemeContext` and accessed via `useColors()` / `useTheme()`.

- **Approach:** Restrained — `accent` is rare and meaningful. Color mostly comes from warm neutrals; the accent signals action.
- **Primary accent:** `#D4A88C` — warm terracotta. Buttons, FAB, active nav, chips.
- **Dark mode:** Surfaces shift to `#1A1614` / `#241E1C` / `#332B28`. Accent stays the same. Text-on-accent inverts to `#1A1614` in dark.

### Semantic tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `accent` | `#D4A88C` | `#D4A88C` | Primary action (buttons, FAB, active nav) |
| `bgPrimary` | `#F0E4DA` | `#1A1614` | Screen background |
| `bgCard` | `#FAF4F0` | `#241E1C` | Card and sheet surface |
| `bgChip` | `#EDE0D8` | `#332B28` | Chips, search bar, secondary surfaces |
| `textPrimary` | `#2D2321` | `#F5F0ED` | Body and heading text |
| `textSecondary` | `#8C7B73` | `#B5A49C` | Metadata, captions |
| `textTertiary` | `#B5A49C` | `#7A6D66` | Placeholder, disabled |
| `border` | `#D9CCCA` | `#3D3430` | Dividers and card borders |
| `success` | `#4CAF50` | `#66BB6A` | Confirmations |
| `warning` | `#F5A623` | `#FFB74D` | Non-critical alerts (unpaid balance, schedule conflict) |
| `danger` | `#E25C5C` | `#FF6B6B` | Destructive actions, errors |

### Position tag colors

Hair `#F0E4DA` · Nails `#E4DAF0` · Skin `#DAF0E4` · Lashes `#F0DAE4`

### Available themes

`cream` (default) · `fucsia` · `sky` · `matcha` · `noir` (force-dark) · `system` (follow device)

All themes override the accent and background tokens only. The semantic tokens (success, warning, danger) are inherited from the base palette.

## Spacing

- **Base unit:** 4px
- **Density:** Comfortable — generous enough to feel premium, tight enough for data-entry efficiency.
- **Scale (`Spacing`):** `xs 4` · `sm 8` · `md 12` · `lg 16` · `xl 20` · `xxl 24` · `xxxl 32`
- **Screen edge:** `paddingHorizontal: Spacing.xl` (20px) everywhere. This is the canonical screen padding — do not use other values.

## Layout

- **Approach:** Grid-disciplined. Strict columns, predictable alignment. Users are doing data entry, not reading an editorial.
- **Border radius (`BorderRadius`):** `sm 8` · `md 12` · `lg 14` · `xl 16` · `xxl 20` · `pill 28` · `full 9999`
- **Cards:** `borderRadius: BorderRadius.xl` (16px), `borderWidth: 1`, `borderColor: colors.border`, subtle shadow.
- **Chips:** `borderRadius: BorderRadius.pill` (28px), `backgroundColor: colors.bgChip`.
- **FAB:** 58×58, `borderRadius: 29`, positioned at `insets.bottom + 70` to clear the native tab bar.
- **Bottom sheets:** `@gorhom/bottom-sheet`, always wrapped in `BottomSheetModalProvider`.

## Motion

- **Approach:** Intentional — transitions aid comprehension, they don't decorate. No scroll-driven choreography. No expressive entrance animations on list items.
- **Library:** `react-native-reanimated` (already in stack).

### Easing

```
enter  → Easing.out(Easing.ease)    — things arriving
exit   → Easing.in(Easing.ease)     — things leaving
move   → Easing.inOut(Easing.ease)  — things repositioning
```

### Duration

| Name | Range | Use |
|---|---|---|
| micro | 80ms | Press feedback, opacity flips |
| short | 150–220ms | Chevron rotations, state changes |
| medium | 220–300ms | Sheet open/close, screen transitions |
| long | 400–700ms | Skeleton fade |

### Patterns

**Card entrance** — fade + slide up 8px on mount:
```ts
opacity: withTiming(1, { duration: 220, easing: Easing.out(Easing.ease) })
translateY: withTiming(0, { duration: 220, easing: Easing.out(Easing.ease) })
```

**Pressable feedback** — scale to 0.97 on press-in, back on release:
```ts
scale: withTiming(pressed ? 0.97 : 1, { duration: 80 })
```

**Chevron toggle** — rotate 180° on expand/collapse:
```ts
rotation: withTiming(expanded ? 180 : 0, { duration: 220 })
```

**Bottom sheet** — spring on open (handled by @gorhom, but match this config):
```ts
withSpring(0, { damping: 20, stiffness: 200 })
```

**Skeleton pulse** — opacity oscillates between `colors.skeleton` and `colors.skeletonHighlight`:
```ts
withRepeat(withTiming(1, { duration: 750 }), -1, true)
```

**Tab icon active** — scale up on activate:
```ts
withSpring(1.08, { damping: 15, stiffness: 300 })
```

## Accessibility

- All interactive elements must include `accessibilityRole` and `accessibilityLabel`.
- `Pressable` / `AnimatedPressable` → `accessibilityRole="button"`, label describes the action.
- Navigation icons → `accessibilityRole="tab"` or `"link"`.
- Images that convey content → `accessibilityLabel` on the `Image` component.
- Do not use color as the only feedback signal — pair with text or icon.
- `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` on small tap targets (<44px).

## Skeletons

Pulse animation between `colors.skeleton` → `colors.skeletonHighlight` using `withRepeat`. Component: `src/components/ui/SkeletonCard.tsx`.

## Component Conventions

- **Cards** — `borderRadius: BorderRadius.xl`, `borderWidth: 1`, `borderColor: colors.border`, subtle shadow.
- **Chips** — `borderRadius: BorderRadius.pill`, `backgroundColor: colors.bgChip`. Active state uses `bgChipActive`.
- **FAB** — 58×58, `borderRadius: 29`, shadow color matches `colors.accent` at 45% opacity.
- **Bottom sheets** — `@gorhom/bottom-sheet`, always inside `BottomSheetModalProvider`.
- **Skeletons** — pulse animation between `colors.skeleton` → `colors.skeletonHighlight`.
- **Alerts / toasts** — use `warning`, `success`, `danger` tokens. Always pair color with descriptive text.

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-14 | Migrated font from Inter → DM Sans | Inter is overused and generic. DM Sans has comparable legibility with more geometric character. Drop-in replacement via `@expo-google-fonts/dm-sans`. |
| 2026-04-14 | Documented Satoshi as display upgrade target | Satoshi (Fontshare) gives strong display personality at bold weights without Inter's ubiquity. Requires manual .ttf bundling — documented above. |
| 2026-04-14 | Added `warning` + `warningBg` tokens | Missing from original system. Needed for unpaid balance alerts, schedule conflicts. Light: `#F5A623` / `#FFF8EC`. Dark: `#FFB74D` / `#2E2010`. |
| 2026-04-14 | Added motion guidelines section | App uses Reanimated throughout but had no documented conventions — caused inconsistent durations and easing across components. |
| 2026-04-14 | Confirmed grid-disciplined layout + `paddingHorizontal: 20` as canonical screen edge | Already consistent in code, now explicit in docs so it doesn't drift. |
| 2026-04-14 | Kept existing cream color system | `#D4A88C` accent + warm neutral backgrounds are well-considered and appropriate for the salon context. No change needed. |
