import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { BorderRadius, FontSize, Spacing, PressSpring, PRESS_SCALE } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  style,
}: ButtonProps) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withSpring(PRESS_SCALE, PressSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, PressSpring);
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {/* Glossy shimmer for primary variant */}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.textOnAccent : colors.accent}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              styles[`${variant}Text` as keyof typeof styles],
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    base: {
      height: 54,
      borderRadius: BorderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: Spacing.sm,
    },
    primary: {
      backgroundColor: c.accent,
      overflow: "hidden",
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 5,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.25)",
    },
    outline: {
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.border,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    danger: {
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.danger,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: FontSize.md,
      fontWeight: "600",
    },
    primaryText: {
      color: c.textOnAccent,
    },
    outlineText: {
      color: c.textPrimary,
    },
    ghostText: {
      color: c.accent,
    },
    dangerText: {
      color: c.danger,
    },
  });
}
