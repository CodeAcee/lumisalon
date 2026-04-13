export const lightColors = {
  accent: "#D4A88C",
  accentDark: "#B8896E",
  accentLight: "#E8C8B4",
  bgPrimary: "#F0E4DA",
  bgCard: "#FAF4F0",
  bgChip: "#EDE0D8",
  bgChipActive: "#D4A88C",
  bgFab: "#D4A88C",
  bgNav: "#FAF4F0",
  bgSearch: "#EDE0D8",
  bgSecondary: "#FAF4F0",
  border: "#D9CCCA",
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
  accentLight: "#3D2B22",
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
  /** Force dark base colors regardless of the user's theme mode setting */
  forceDark?: boolean;
  /** Follow system appearance (light/dark) */
  followSystem?: boolean;
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
    label: "Fucsía",
    emoji: "🌸",
    previewColor: "#D946A0",
    light: {
      accent: "#D946A0",
      accentDark: "#B0377E",
      accentLight: "#F4B8E0",
      bgPrimary: "#FADDEE",
      bgCard: "#F5CCE4",
      bgChip: "#EFBBD9",
      bgSearch: "#EFBBD9",
      bgSecondary: "#F5CCE4",
      bgNav: "#F5CCE4",
      border: "#E898C8",
      bgChipActive: "#D946A0",
      bgFab: "#D946A0",
      navActive: "#D946A0",
      navInactive: "#B878A8",
      textPrimary: "#3A0828",
      textSecondary: "#8A3070",
      textTertiary: "#C070A8",
      skeleton: "#F0C0DC",
      skeletonHighlight: "#F8D8EC",
    },
  },
  sky: {
    label: "Wave",
    emoji: "🌊",
    previewColor: "#5B9BD9",
    light: {
      accent: "#5B9BD9",
      accentDark: "#3A78B5",
      accentLight: "#A8CCEE",
      bgPrimary: "#D8EAFA",
      bgCard: "#C8DEEF",
      bgChip: "#B8D2E8",
      bgSearch: "#B8D2E8",
      bgSecondary: "#C8DEEF",
      bgNav: "#C8DEEF",
      border: "#98BCD8",
      bgChipActive: "#5B9BD9",
      bgFab: "#5B9BD9",
      navActive: "#5B9BD9",
      navInactive: "#6A90B8",
      textPrimary: "#0C1E3A",
      textSecondary: "#2A5080",
      textTertiary: "#5880A8",
      skeleton: "#AACCE8",
      skeletonHighlight: "#BCDAF4",
    },
  },
  noir: {
    label: "Noir",
    emoji: "🌑",
    previewColor: "#D4A88C",
    forceDark: true,
    light: {
      accent: "#D4A88C",
      accentDark: "#B8896E",
      accentLight: "#E8C8B4",
      bgPrimary: "#1A1614",
      bgCard: "#241E1C",
      bgChip: "#332B28",
      bgSearch: "#332B28",
      bgSecondary: "#241E1C",
      bgNav: "#241E1C",
      border: "#3D3430",
      bgChipActive: "#D4A88C",
      bgFab: "#D4A88C",
      navActive: "#D4A88C",
      navInactive: "#7A6D66",
      textOnAccent: "#1A1614",
      textPrimary: "#F5F0ED",
      textSecondary: "#B5A49C",
      textTertiary: "#7A6D66",
      skeleton: "#2D2321",
      skeletonHighlight: "#3D3430",
      tagHair: "#3D3430",
      tagNails: "#362E3D",
      tagSkin: "#2E3D35",
      tagLashes: "#3D2E35",
      shadow: "#00000040",
      overlay: "rgba(0,0,0,0.6)",
    },
  },
  matcha: {
    label: "Matcha",
    emoji: "🍵",
    previewColor: "#6B8F3E",
    light: {
      accent: "#6B8F3E",
      accentDark: "#4E6E28",
      accentLight: "#AECA80",
      bgPrimary: "#F4F7EC",
      bgCard: "#EBF0DC",
      bgChip: "#DFE8CC",
      bgSearch: "#DFE8CC",
      bgSecondary: "#EBF0DC",
      bgNav: "#EBF0DC",
      border: "#C8D8A8",
      bgChipActive: "#6B8F3E",
      bgFab: "#6B8F3E",
      navActive: "#6B8F3E",
      navInactive: "#8CA870",
      textPrimary: "#1E2E0E",
      textSecondary: "#4A6030",
      textTertiary: "#7A9858",
      skeleton: "#D4E0B8",
      skeletonHighlight: "#E4ECC8",
    },
  },
  system: {
    label: "System",
    emoji: "📱",
    previewColor: "#D4A88C",
    followSystem: true,
    light: {
      accent: "#D4A88C",
      accentDark: "#B8896E",
      accentLight: "#E8C8B4",
      bgChipActive: "#D4A88C",
      bgFab: "#D4A88C",
      navActive: "#D4A88C",
    },
  },
};

/** Backward-compatible map of palette overrides (light only) */
export const paletteAccents: Record<string, ColorOverrides> =
  Object.fromEntries(Object.entries(themes).map(([k, v]) => [k, v.light]));
