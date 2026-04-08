import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "../../theme/ThemeContext";

interface AppSwitchProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  size?: number;
}

const horizontalPadding = 2;

export function AppSwitch({
  value,
  onChange,
  disabled,
  height = 28,
  width = 46,
  size = 24,
}: AppSwitchProps) {
  const { border, accent } = useColors();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [border, accent]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [horizontalPadding, width - size - horizontalPadding],
        ),
      },
    ],
  }));

  const handlePress = () => {
    if (!disabled && onChange) onChange(!value);
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          { justifyContent: "center", width, height, borderRadius: height / 2 },
          containerStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: "#FFFFFF",
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
