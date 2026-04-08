import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Sun, Moon, Smartphone, Check } from "lucide-react-native";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import type { PaletteKey } from "../../src/constants/theme";
import { useSettingsStore } from "../../src/store/settings";
import type { ThemeMode } from "../../src/store/settings";
import { useTheme, useColors } from "../../src/theme/ThemeContext";

const { width: W } = Dimensions.get("window");
const SQUARE = Math.floor((W - 16 * 2 - 12) / 2);
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
    key: "fucsia",
    name: "Fucsía",
    colors: ["#F9E0F5", "#E040B0", "#9C27B0"],
    textColor: "#5D0A4F",
  },
  {
    key: "light",
    name: "Light",
    colors: ["#EFF5FF", "#7EB8E8", "#3A7DC4"],
    textColor: "#1A3F6F",
  },
  {
    key: "dark",
    name: "Dark",
    colors: ["#1E1A18", "#4A3832", "#C49A7E"],
    textColor: "#D4A88C",
  },
  {
    key: "sage",
    name: "Sage",
    colors: ["#E5F2EA", "#5BA87A", "#2D6B4F"],
    textColor: "#1A4030",
  },
];

const THEME_MODES: Array<{ mode: ThemeMode; label: string; Icon: typeof Sun }> =
  [
    { mode: "light", label: "Light", Icon: Sun },
    { mode: "dark", label: "Dark", Icon: Moon },
    { mode: "system", label: "System", Icon: Smartphone },
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
  return (
    <Pressable
      onPress={onPress}
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
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const palette = useSettingsStore((s) => s.palette);
  const setPalette = useSettingsStore((s) => s.setPalette);
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Palette section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PALETTE</Text>
          <View style={styles.palettesGrid}>
            <View style={styles.paletteRow}>
              {PALETTE_DEFS.slice(0, 2).map((def) => (
                <PaletteSquare
                  key={def.key}
                  def={def}
                  isSelected={palette === def.key}
                  onPress={() => setPalette(def.key)}
                />
              ))}
            </View>
            <View style={styles.paletteRow}>
              {PALETTE_DEFS.slice(2, 4).map((def) => (
                <PaletteSquare
                  key={def.key}
                  def={def}
                  isSelected={palette === def.key}
                  onPress={() => setPalette(def.key)}
                />
              ))}
            </View>
            <View style={[styles.paletteRow, { justifyContent: "center" }]}>
              <PaletteSquare
                def={PALETTE_DEFS[4]}
                isSelected={palette === PALETTE_DEFS[4].key}
                onPress={() => setPalette(PALETTE_DEFS[4].key)}
              />
            </View>
          </View>
        </View>

        {/* Theme mode section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MODE</Text>
          <View style={styles.modeRow}>
            {THEME_MODES.map(({ mode, label, Icon }) => {
              const isActive = themeMode === mode;
              return (
                <Pressable
                  key={mode}
                  style={[styles.modePill, isActive && styles.modePillActive]}
                  onPress={() => setThemeMode(mode)}
                >
                  <Icon
                    size={14}
                    color={
                      isActive ? colors.textOnAccent : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.modePillText,
                      isActive && styles.modePillTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>
            Choose "System" to automatically match your device appearance.
          </Text>
        </View>

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
    palettesGrid: { gap: 12 },
    paletteRow: { flexDirection: "row", gap: 12 },
    modeRow: { flexDirection: "row", gap: 8 },
    modePill: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 44,
      borderRadius: BorderRadius.xl,
      backgroundColor: c.bgChip,
      borderWidth: 1,
      borderColor: c.border,
    },
    modePillActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    modePillText: {
      fontSize: FontSize.sm,
      fontWeight: "600",
      color: c.textSecondary,
    },
    modePillTextActive: { color: c.textOnAccent },
    hint: {
      fontSize: FontSize.caption,
      lineHeight: 20,
      color: c.textSecondary,
    },
  });
}
