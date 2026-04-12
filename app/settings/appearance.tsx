import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import type { PaletteKey } from "../../src/constants/theme";
import { useSettingsStore } from "../../src/store/settings";
import { useTheme, useColors } from "../../src/theme/ThemeContext";

const { width: W } = Dimensions.get("window");
const SQUARE = Math.floor((W - 16 * 2 - 30) / 2);
const BLOB = Math.floor(SQUARE * 0.72);

type PaletteDef = {
  key: PaletteKey;
  name: string;
  colors: [string, string, string];
  textColor: string;
};

const PALETTE_DEFS: PaletteDef[] = [
  {
    key: "cream",
    name: "Cream",
    colors: ["#F5E8DC", "#D4A88C", "#B8896E"],
    textColor: "#5C3D2E",
  },
  {
    key: "noir",
    name: "Noir",
    colors: ["#1A1614", "#332B28", "#D4A88C"],
    textColor: "#F5F0ED",
  },
  {
    key: "system",
    name: "System",
    colors: ["#F5E8DC", "#1A1614", "#D4A88C"],
    textColor: "#5C3D2E",
  },
  {
    key: "sky",
    name: "Wave",
    colors: ["#D8EAFA", "#C8DEEF", "#5B9BD9"],
    textColor: "#0C1E3A",
  },
  {
    key: "fucsia",
    name: "Fucsía",
    colors: ["#FADDEE", "#F5CCE4", "#D946A0"],
    textColor: "#3A0828",
  },
  {
    key: "matcha",
    name: "Matcha",
    colors: ["#F4F7EC", "#AECA80", "#6B8F3E"],
    textColor: "#1E2E0E",
  },
];

// Static styles for palette squares (size-based, theme-independent)
const sqStyles = StyleSheet.create({
  square: {
    width: SQUARE,
    height: SQUARE,
    borderRadius: 16,
    overflow: "hidden",
  },
  blobTopRight: {
    position: "absolute",
    top: -(BLOB * 0.3),
    right: -(BLOB * 0.25),
    width: BLOB,
    height: BLOB,
    borderRadius: BLOB / 2,
    opacity: 0.72,
  },
  blobBottomLeft: {
    position: "absolute",
    bottom: -(BLOB * 0.18),
    left: -(BLOB * 0.18),
    width: BLOB * 0.72,
    height: BLOB * 0.72,
    borderRadius: (BLOB * 0.72) / 2,
    opacity: 0.62,
  },
  labelRow: {
    position: "absolute",
    bottom: 12,
    left: 14,
  },
  paletteName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});

function PaletteSquare({
  def,
  isSelected,
  onPress,
}: {
  def: PaletteDef;
  isSelected: boolean;
  onPress: () => void;
}) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        sqStyles.square,
        isSelected && { borderWidth: 3, borderColor: def.colors[1] },
      ]}
    >
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: def.colors[0] }]}
      />
      <View
        style={[sqStyles.blobTopRight, { backgroundColor: def.colors[1] }]}
      />
      <View
        style={[sqStyles.blobBottomLeft, { backgroundColor: def.colors[2] }]}
      />
      <View style={sqStyles.labelRow}>
        <Text style={[sqStyles.paletteName, { color: def.textColor }]}>
          {def.name}
        </Text>
      </View>
      {isSelected && (
        <View style={[sqStyles.checkBadge, { backgroundColor: def.colors[1] }]}>
          <Check size={10} color="#FFF" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}

export default function AppearanceScreen() {
  const insets = useSafeAreaInsets();
  const palette = useSettingsStore((s) => s.palette);
  const setPalette = useSettingsStore((s) => s.setPalette);
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("appearance.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Palette section */}
        <Animated.View
          entering={FadeInDown.duration(350)}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>{t("appearance.palette")}</Text>
          <View style={styles.palettesGrid}>
            {[0, 2, 4].map((start) => (
              <View key={start} style={styles.paletteRow}>
                {PALETTE_DEFS.slice(start, start + 2).map((def) => (
                  <PaletteSquare
                    key={def.key}
                    def={def}
                    isSelected={palette === def.key}
                    onPress={() => setPalette(def.key)}
                  />
                ))}
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgPrimary },
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
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    content: { paddingHorizontal: 16, paddingTop: 20, gap: 28 },
    section: { gap: 12 },
    sectionLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1.2,
    },
    palettesGrid: { gap: 12, justifyContent: "center", alignItems: "center" },
    paletteRow: { flexDirection: "row", gap: 12 },
  });
}
