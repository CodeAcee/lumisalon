// react-native-unistyles has been removed from the project.
// All theming is done via src/constants/theme.ts using plain React Native StyleSheet.
// This file is kept as a stub so any stale imports don't hard-crash.

export const lightTheme = {
  colors: {
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
  },
} as const;

export const darkTheme = {
  colors: {
    // Accents stay similar but often need a slight boost in saturation/brightness
    // to pop against dark backgrounds.
    accent: "#D4A88C",
    accentDark: "#B8896E",
    accentLight: "#E8C8B4",

    // Backgrounds: Deep charcoal with a hint of warm brown/mauve
    bgPrimary: "#1A1614", // Main screen background
    bgCard: "#241E1C", // Elevated surfaces
    bgChip: "#332B28", // Secondary surfaces
    bgChipActive: "#D4A88C",
    bgFab: "#D4A88C",
    bgNav: "#241E1C",
    bgSearch: "#332B28",
    bgSecondary: "#241E1C",

    // Borders & Dividers
    border: "#3D3430",

    // Navigation
    navActive: "#D4A88C",
    navInactive: "#7A6D66",

    // Shadows: Darker and more opaque for dark mode
    shadow: "#00000040",

    // Tags: Desaturated versions of the light theme tags to prevent eye strain
    tagHair: "#3D3430",
    tagNails: "#362E3D",
    tagSkin: "#2E3D35",
    tagLashes: "#3D2E35",

    // Text
    textOnAccent: "#1A1614", // Dark text on light accent buttons
    textPrimary: "#F5F0ED", // Near-white with warm tint
    textSecondary: "#B5A49C", // Muted brown-grey
    textTertiary: "#7A6D66", // Low emphasis
    white: "#FFFFFF",

    // Semantic Colors
    danger: "#FF6B6B",
    dangerBg: "#3D1A1A",
    success: "#66BB6A",

    // Skeleton loaders
    skeleton: "#2D2321",
    skeletonHighlight: "#3D3430",
    overlay: "rgba(0,0,0,0.6)",
  },
} as const;
