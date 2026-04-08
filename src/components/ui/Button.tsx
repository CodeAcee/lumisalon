import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { BorderRadius, FontSize, Spacing } from "../../constants/theme";
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
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
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
