import { StyleSheet, Text, View } from "react-native";
import { FontSize } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

interface PositionBadgeProps {
  position: string;
  small?: boolean;
}

const POSITION_BG: Record<string, string> = {
  Hair: "#F5E6D8",
  Nails: "#E8DAF5",
  Skin: "#DAF5E8",
  Lashes: "#F0DAE4",
  Lashmaker: "#F0DAE4",
  Colorist: "#F5E6D8",
};

const POSITION_TEXT: Record<string, string> = {
  Hair: "#8C6B53",
  Nails: "#6B538C",
  Skin: "#538C6B",
  Lashes: "#8C5373",
  Lashmaker: "#8C5373",
  Colorist: "#8C6B53",
};

export function PositionBadge({ position, small }: PositionBadgeProps) {
  const colors = useColors();
  const bg = POSITION_BG[position] ?? colors.bgChip;
  const text = POSITION_TEXT[position] ?? colors.textSecondary;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        small && styles.small,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          small && styles.smallText,
        ]}
      >
        {position}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  smallText: {
    fontSize: FontSize.xs,
  },
});
