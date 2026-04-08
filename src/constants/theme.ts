export const lightColors = {
  accent: "#D4A88C",
  accentDark: "#B8896E",
  accentLight: "#E8C8B4",
  bgPrimary: "#FFF8F5",
  bgCard: "#FFFFFF",
  bgChip: "#F5F0ED",
  bgChipActive: "#D4A88C",
  bgFab: "#D4A88C",
  bgNav: "#FFFFFF",
  bgSearch: "#F5F0ED",
  bgSecondary: "#FFFFFF",
  border: "#EDE5E0",
  navActive: "#D4A88C",
  navInactive: "#B5A49C",
  shadow: "#2D232110",
  tagHair: "#F0E4DA",
  tagNails: "#E4DAF0",
  tagSkin: "#DAF0E4",
  tagLashes: "#F0DAE4",
  textOnAccent: "#FFFFFF",
  textPrimary: "#2D2321",
  textSecondary: "#8C7B73",
  textTertiary: "#B5A49C",
  white: "#FFFFFF",
  danger: "#E25C5C",
  dangerBg: "#FEF2F2",
  success: "#4CAF50",
  skeleton: "#F0E8E4",
  skeletonHighlight: "#F8F2EF",
  overlay: "rgba(0,0,0,0.4)",
} as const;

export const darkColors = {
  accent: "#D4A88C",
  accentDark: "#B8896E",
  accentLight: "#E8C8B4",
  bgPrimary: "#1A1614",
  bgCard: "#241E1C",
  bgChip: "#332B28",
  bgChipActive: "#D4A88C",
  bgFab: "#D4A88C",
  bgNav: "#241E1C",
  bgSearch: "#332B28",
  bgSecondary: "#241E1C",
  border: "#3D3430",
  navActive: "#D4A88C",
  navInactive: "#7A6D66",
  shadow: "#00000040",
  tagHair: "#3D3430",
  tagNails: "#362E3D",
  tagSkin: "#2E3D35",
  tagLashes: "#3D2E35",
  textOnAccent: "#1A1614",
  textPrimary: "#F5F0ED",
  textSecondary: "#B5A49C",
  textTertiary: "#7A6D66",
  white: "#FFFFFF",
  danger: "#FF6B6B",
  dangerBg: "#3D1A1A",
  success: "#66BB6A",
  skeleton: "#2D2321",
  skeletonHighlight: "#3D3430",
  overlay: "rgba(0,0,0,0.6)",
} as const;

// Backward-compatible alias
export const Colors = lightColors;

export const Fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  caption: 13,
  body: 14,
  md: 16,
  lg: 17,
  title: 20,
  heading: 28,
  hero: 30,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  pill: 28,
  full: 9999,
} as const;

// ─── Extensible palette/theme system ─────────────────────────────────────────
// PaletteKey is a plain string so new themes can be added at runtime
// without touching type definitions — just add an entry to `themes`.
export type PaletteKey = string;

type ColorOverrides = { [K in keyof typeof lightColors]?: string };

/** Full definition of a named theme palette. */
export interface ThemeDefinition {
  /** Human-readable label shown in the UI */
  label: string;
  /** Single-character emoji or icon used in palette pickers */
  emoji: string;
  /** Hex preview color (usually the accent) */
  previewColor: string;
  /** Overrides applied on top of the base light colors */
  light: ColorOverrides;
  /** Optional extra overrides applied on top of dark colors.
   *  If omitted, `light` overrides are also used for dark mode. */
  dark?: ColorOverrides;
}

/**
 * Master theme registry.
 * To add a new theme, just add an entry here — no type changes needed.
 */
export const themes: Record<string, ThemeDefinition> = {
  cream: {
    label: "Cream",
    emoji: "🍦",
    previewColor: "#D4A88C",
    light: {
      accent: "#D4A88C",
      accentDark: "#B8896E",
      accentLight: "#E8C8B4",
      bgChipActive: "#D4A88C",
      bgFab: "#D4A88C",
      navActive: "#D4A88C",
    },
  },
  fucsia: {
    label: "Fuchsia",
    emoji: "🌸",
    previewColor: "#D946A0",
    light: {
      accent: "#D946A0",
      accentDark: "#B0377E",
      accentLight: "#F4B8E0",
      bgChipActive: "#D946A0",
      bgFab: "#D946A0",
      navActive: "#D946A0",
    },
  },
  sky: {
    label: "Sky",
    emoji: "🫐",
    previewColor: "#5B9BD9",
    light: {
      accent: "#5B9BD9",
      accentDark: "#3A78B5",
      accentLight: "#A8CCEE",
      bgChipActive: "#5B9BD9",
      bgFab: "#5B9BD9",
      navActive: "#5B9BD9",
    },
  },
  mocha: {
    label: "Mocha",
    emoji: "☕",
    previewColor: "#C49A7E",
    light: {
      accent: "#C49A7E",
      accentDark: "#A07558",
      accentLight: "#DBBDA8",
      bgChipActive: "#C49A7E",
      bgFab: "#C49A7E",
      navActive: "#C49A7E",
    },
  },
  sage: {
    label: "Sage",
    emoji: "🌿",
    previewColor: "#5BA87A",
    light: {
      accent: "#5BA87A",
      accentDark: "#3D7A57",
      accentLight: "#A8D4BA",
      bgChipActive: "#5BA87A",
      bgFab: "#5BA87A",
      navActive: "#5BA87A",
    },
  },
  lavender: {
    label: "Lavender",
    emoji: "💜",
    previewColor: "#9B7ED9",
    light: {
      accent: "#9B7ED9",
      accentDark: "#7455B8",
      accentLight: "#D4C4F0",
      bgChipActive: "#9B7ED9",
      bgFab: "#9B7ED9",
      navActive: "#9B7ED9",
    },
  },
  rose: {
    label: "Rose",
    emoji: "🌹",
    previewColor: "#D97E8A",
    light: {
      accent: "#D97E8A",
      accentDark: "#B85A67",
      accentLight: "#F0C4CB",
      bgChipActive: "#D97E8A",
      bgFab: "#D97E8A",
      navActive: "#D97E8A",
    },
  },
  midnight: {
    label: "Midnight",
    emoji: "🌙",
    previewColor: "#5B7DD9",
    light: {
      accent: "#5B7DD9",
      accentDark: "#3A5AB5",
      accentLight: "#A8B8EE",
      bgPrimary: "#F0F2FA",
      bgChipActive: "#5B7DD9",
      bgFab: "#5B7DD9",
      navActive: "#5B7DD9",
    },
    dark: {
      accent: "#7B9BF0",
      accentDark: "#5B7DD9",
      accentLight: "#3A5AB5",
      bgChipActive: "#7B9BF0",
      bgFab: "#7B9BF0",
      navActive: "#7B9BF0",
    },
  },
};

/** Backward-compatible map of palette overrides (light only) */
export const paletteAccents: Record<string, ColorOverrides> = Object.fromEntries(
  Object.entries(themes).map(([k, v]) => [k, v.light]),
);
