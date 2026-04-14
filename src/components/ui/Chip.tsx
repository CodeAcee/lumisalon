import { Pressable, StyleSheet, Text } from "react-native";
import { BorderRadius, FontSize } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}

export function Chip({ label, active, onPress, color }: ChipProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      style={[
        styles.chip,
        active && styles.active,
        color ? { backgroundColor: color } : undefined,
      ]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    chip: {
      height: 32,
      paddingHorizontal: 16,
      borderRadius: BorderRadius.xl,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    active: {
      backgroundColor: c.bgChipActive,
    },
    label: {
      fontSize: FontSize.body,
      fontWeight: "500",
      color: c.textSecondary,
    },
    activeLabel: {
      color: c.white,
    },
  });
}
