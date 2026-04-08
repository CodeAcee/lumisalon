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
  const themeMode = useSettingsStore((s) => s.themeMode);
  const palette = useSettingsStore((s) => s.palette);
  const systemScheme = useColorScheme();

  const isDark =
    themeMode === "dark" || (themeMode === "system" && systemScheme === "dark");

  const base = isDark ? darkColors : lightColors;

  // Resolve overrides: use dark-specific overrides when dark mode is active,
  // falling back to the light overrides (which carry the accent colors)
  const theme = themes[palette ?? "cream"] ?? themes.cream;
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
