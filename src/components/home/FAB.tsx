import { StyleSheet, Pressable } from "react-native";
import Animated, {
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { useColors } from "../../theme/ThemeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const isGlassAvailable = isGlassEffectAPIAvailable();

interface FABProps {
  onPress: () => void;
  style?: object;
}

export function FAB({ onPress, style }: FABProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={ZoomIn.delay(300).duration(400)}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.9, { damping: 12 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12 });
        }}
        style={[style, animStyle, isGlassAvailable && styles.fabGlass]}
        accessibilityRole="button"
        accessibilityLabel="New procedure"
      >
        {isGlassAvailable ? (
          <GlassView
            style={styles.fabGlassInner}
            glassEffectStyle="clear"
            isInteractive
          >
            <Plus size={24} color={colors.white} />
          </GlassView>
        ) : (
          <Plus size={24} color={colors.textOnAccent} />
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabGlass: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  fabGlassInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
});
