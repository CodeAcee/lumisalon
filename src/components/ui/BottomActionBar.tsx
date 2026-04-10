import React from "react";
import { StyleSheet, View } from "react-native";
import { GlassView } from "./GlassView";

interface BottomActionBarProps {
  children: React.ReactNode;
  paddingBottom?: number;
}

export function BottomActionBar({
  children,
  paddingBottom = 16,
}: BottomActionBarProps) {
  return (
    <GlassView topHighlight intensity={85}>
      <View style={[styles.inner, { paddingBottom }]}>{children}</View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
