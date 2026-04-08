import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ChevronRight } from "lucide-react-native";
import { BorderRadius, FontSize, Spacing } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { Avatar } from "./Avatar";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ListCardProps {
  name: string;
  subtitle?: string;
  rightLabel?: string;
  rightLabelColor?: string;
  badge?: React.ReactNode;
  onPress?: () => void;
  avatarColor?: string;
  /** When provided, shows the photo instead of initials */
  avatarUri?: string;
}

export function ListCard({
  name,
  subtitle,
  rightLabel,
  rightLabelColor,
  badge,
  onPress,
  avatarColor,
  avatarUri,
}: ListCardProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      style={[styles.card, animStyle]}
    >
      <Avatar name={name} size={44} color={avatarColor} uri={avatarUri} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {badge}
      </View>
      <View style={styles.right}>
        {rightLabel && (
          <Text
            style={[
              styles.rightLabel,
              rightLabelColor
                ? { backgroundColor: rightLabelColor }
                : undefined,
            ]}
          >
            {rightLabel}
          </Text>
        )}
        <ChevronRight size={18} color={colors.textTertiary} />
      </View>
    </AnimatedPressable>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    content: {
      flex: 1,
      gap: 2,
    },
    name: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    subtitle: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rightLabel: {
      fontSize: FontSize.sm,
      fontWeight: "600",
      color: c.textSecondary,
      backgroundColor: c.tagHair,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
      overflow: "hidden",
    },
  });
}
