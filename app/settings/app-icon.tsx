import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Moon,
  CircleDot,
  Minimize2,
} from "lucide-react-native";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import {
  useSettingsStore,
  type AppIconVariant,
} from "../../src/store/settings";
let AlternateAppIcons: typeof import("expo-alternate-app-icons") | null = null;
try {
  AlternateAppIcons = require("expo-alternate-app-icons");
} catch {
  // Native module not available in this build
}

const ICONS: Array<{
  id: AppIconVariant;
  label: string;
  bg: string;
  icon: typeof Sparkles;
}> = [
  { id: "default", label: "Default", bg: "#D4A88C", icon: Sparkles },
  { id: "dark", label: "Dark", bg: "#2D2321", icon: Moon },
  { id: "gold", label: "Gold", bg: "#C8A76C", icon: CircleDot },
  { id: "minimal", label: "Minimal", bg: "#F5F0ED", icon: Minimize2 },
];

export default function AppIconScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const appIcon = useSettingsStore((s) => s.appIcon);
  const setAppIcon = useSettingsStore((s) => s.setAppIcon);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.bgPrimary },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.bgChip }]}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>App Icon</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>CHOOSE APP ICON</Text>
        <View style={styles.grid}>
          {ICONS.map((item, index) => {
            const Icon = item.icon;
            const isActive = appIcon === item.id;
            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 80).duration(350)}
                style={{ width: "47%" as any }}
              >
              <Pressable
                style={[styles.iconCard, isActive && styles.iconCardActive]}
                onPress={async () => {
                  setAppIcon(item.id);
                  try {
                    await AlternateAppIcons?.setAlternateAppIcon(
                      item.id === "default" ? null : item.id,
                    );
                  } catch {
                    // Alternate icons not supported on this device/build
                  }
                }}
              >
                <View
                  style={[styles.iconPreview, { backgroundColor: item.bg }]}
                >
                  <Icon
                    size={28}
                    color={
                      item.id === "minimal" ? colors.textPrimary : "#FFFFFF"
                    }
                  />
                </View>
                <Text style={styles.iconLabel}>{item.label}</Text>
                {isActive && (
                  <View style={styles.checkBadge}>
                    <Check size={12} color={colors.textOnAccent} />
                  </View>
                )}
              </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Text style={styles.hint}>
          Change requires app restart on some devices.
        </Text>
      </View>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
      paddingHorizontal: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    content: { paddingHorizontal: 16, paddingTop: 24, gap: 16 },
    sectionLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    iconCard: {
      width: "100%",
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      borderWidth: 1.5,
      borderColor: c.border,
      padding: 16,
      alignItems: "center",
      gap: 10,
      position: "relative",
    },
    iconCardActive: { borderColor: c.accent },
    iconPreview: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    iconLabel: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.textPrimary,
    },
    checkBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    hint: { fontSize: FontSize.caption, color: c.textSecondary },
  });
}
