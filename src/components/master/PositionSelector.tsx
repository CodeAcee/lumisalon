import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Plus, Briefcase } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { Chip } from "../ui/Chip";
import type { Position } from "../../types";

const STANDARD_POSITIONS: Position[] = [
  "Nails",
  "Hair",
  "Lashmaker",
  "Skin",
  "Lashes",
  "Colorist",
];

const MAX_POSITIONS = 3;

interface Props {
  selectedPositions: string[];
  onToggle: (pos: string) => void;
  onAddCustom: () => void;
  onEditCustom: (pos: string) => void;
  onRemoveCustom: (pos: string) => void;
}

export function PositionSelector({
  selectedPositions,
  onToggle,
  onAddCustom,
  onEditCustom,
  onRemoveCustom,
}: Props) {
  const colors = useColors();
  const s = makeStyles(colors);
  const { t } = useTranslation();

  const customPositions = selectedPositions.filter(
    (p) => !STANDARD_POSITIONS.includes(p as Position),
  );

  const handlePress = (pos: string) => {
    const isCustom = !STANDARD_POSITIONS.includes(pos as Position);
    if (isCustom) {
      Alert.alert(pos, "What would you like to do?", [
        { text: "Edit", onPress: () => onEditCustom(pos) },
        { text: "Remove", style: "destructive", onPress: () => onRemoveCustom(pos) },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      if (!selectedPositions.includes(pos) && selectedPositions.length >= MAX_POSITIONS) return;
      onToggle(pos);
    }
  };

  const handleAddCustom = () => {
    if (selectedPositions.length >= MAX_POSITIONS) {
      Alert.alert("Limit reached", "A master can have no more than 3 positions.");
      return;
    }
    onAddCustom();
  };

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Briefcase size={18} color={colors.textTertiary} />
        <Text style={s.label}>{t("masterForm.positions")} *</Text>
      </View>
      <View style={s.chipsWrap}>
        {[...STANDARD_POSITIONS, ...customPositions].map((pos) => (
          <Chip
            key={pos}
            label={pos}
            active={selectedPositions.includes(pos)}
            onPress={() => handlePress(pos)}
          />
        ))}
        <Pressable style={s.addBtn} onPress={handleAddCustom}>
          <Plus size={14} color={colors.accent} />
          <Text style={s.addBtnText}>{t("common.add")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    label: {
      fontSize: FontSize.md,
      color: c.textTertiary,
    },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: c.accent,
      borderStyle: "dashed",
      borderRadius: 16,
      paddingHorizontal: 12,
      height: 32,
    },
    addBtnText: {
      fontSize: FontSize.body,
      color: c.accent,
      fontWeight: "500",
    },
  });
}
