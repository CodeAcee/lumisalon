import React from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

interface GlassViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  topHighlight?: boolean;
}

export function GlassView({
  children,
  style,
  topHighlight = false,
}: GlassViewProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        { overflow: "hidden" },
        {
          backgroundColor: isDark ? "rgb(28,22,20)" : "rgb(255,251,249)",
        },
        topHighlight && {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: isDark
            ? "rgba(255,255,255,0.15)"
            : "rgba(200,195,190,0.5)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
