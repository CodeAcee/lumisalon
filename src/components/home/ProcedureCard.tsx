import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { PositionBadge } from "../ui/PositionBadge";
import { format } from "date-fns";
import type { Position } from "../../types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const POSITION_FALLBACKS: Record<string, string> = {
  Hair: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
  Nails:
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
  Skin: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
  Lashes:
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
  default:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
};

interface Props {
  proc: {
    id: string;
    date: string;
    positions: Position[];
    services: string[];
    photos?: string[];
  };
  clientName: string;
  masterName: string;
  onPress: () => void;
}

export function ProcedureCard({
  proc,
  clientName,
  masterName,
  onPress,
}: Props) {
  const colors = useColors();
  const s = styles(colors);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageUri =
    proc.photos && proc.photos.length > 0
      ? proc.photos[0]
      : (POSITION_FALLBACKS[proc.positions[0]] ?? POSITION_FALLBACKS.default);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[s.card, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${clientName} — ${masterName}`}
    >
      <View style={s.imgWrap}>
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
      </View>
      <View style={s.body}>
        <View style={s.topRow}>
          <Text style={s.client} numberOfLines={1}>
            {clientName}
          </Text>
          {proc.positions[0] && (
            <PositionBadge position={proc.positions[0]} small />
          )}
        </View>
        <View style={s.bottomRow}>
          <Text style={s.master}>by {masterName}</Text>
          <Text style={s.date}>
            {format(new Date(proc.date), "MMM d, yyyy")}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      overflow: "hidden",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: c.textPrimary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 2,
    },
    imgWrap: { height: 160, backgroundColor: c.accentLight },
    body: { padding: 14, gap: 8 },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    client: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
      flex: 1,
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    master: { fontSize: FontSize.caption, color: c.textSecondary },
    date: { fontSize: FontSize.caption, color: c.textSecondary },
  });
