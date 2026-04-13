import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { Chip } from "../ui/Chip";

interface Props {
  availablePositions: string[];
  selectedPositions: string[];
  masterName?: string;
  onToggle: (pos: string) => void;
  error?: string;
}

export function PositionPicker({
  availablePositions,
  selectedPositions,
  masterName,
  onToggle,
  error,
}: Props) {
  const colors = useColors();
  const s = makeStyles(colors);
  const { t } = useTranslation();

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Positions / Services</Text>

      {masterName && availablePositions.length === 0 && (
        <Text style={s.warning}>
          This master has no matching services for this screen.
        </Text>
      )}

      {masterName && (
        <Text style={s.hint}>
          Showing services for {masterName} (
          {availablePositions.join(", ")})
        </Text>
      )}

      <View style={s.chipsRow}>
        {availablePositions.map((pos) => (
          <Chip
            key={pos}
            label={pos}
            active={selectedPositions.includes(pos)}
            onPress={() => onToggle(pos)}
          />
        ))}
      </View>

      {selectedPositions.length > 0 && (
        <Text style={s.selection}>
          Selected: {selectedPositions.join(", ")}
        </Text>
      )}

      {error && <Text style={s.error}>{error}</Text>}
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
      padding: 16,
      gap: 12,
    },
    cardTitle: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.textSecondary,
    },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    selection: {
      fontSize: FontSize.caption,
      color: c.accent,
      fontWeight: "500",
    },
    hint: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      fontStyle: "italic",
    },
    warning: {
      fontSize: FontSize.caption,
      color: c.danger,
    },
    error: {
      fontSize: FontSize.sm,
      color: c.danger,
      marginLeft: 4,
    },
  });
}
