import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { useSettingsStore } from "../store/settings";
import { lightColors, darkColors, themes } from "../constants/theme";

export type ThemeColors = typeof lightColors;

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const palette = useSettingsStore((s) => s.palette);
  const systemScheme = useColorScheme();

  const theme = themes[palette ?? "cream"] ?? themes.cream;

  // Derive isDark purely from the selected palette:
  // - forceDark (noir) → always dark
  // - followSystem (system) → follows device appearance
  // - everything else → light
  const isDark = theme.forceDark
    ? true
    : theme.followSystem
      ? systemScheme === "dark"
      : false;

  const base = isDark ? darkColors : lightColors;
  const overrides = isDark ? { ...theme.light, ...theme.dark } : theme.light;

  const colors: ThemeColors = { ...base, ...overrides } as ThemeColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** Convenience shorthand – equivalent to useTheme().colors */
export function useColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}
