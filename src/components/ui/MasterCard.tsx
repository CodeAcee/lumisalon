import { memo, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { MapPin, Users, ChevronRight } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { PositionBadge } from "./PositionBadge";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import type { Master } from "../../types";

interface Props {
  master: Master;
  locationNames: string[];
  onPress: () => void;
}

export const MasterCard = memo(function MasterCard({
  master,
  locationNames,
  onPress,
}: Props) {
  const colors = useColors();
  const s = useMemo(() => styles(colors), [colors]);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const initials = useMemo(
    () =>
      master.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    [master.name],
  );

  const locationText = useMemo(
    () => locationNames.join(" · "),
    [locationNames],
  );

  return (
    <AnimatedPressable
      style={[s.card, animStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
    >
      <View style={s.avatarWrap}>
        {master.avatar ? (
          <Image
            source={{ uri: master.avatar }}
            style={s.avatarImg}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={s.avatarFallback}>
            <Text style={s.avatarInitials}>{initials}</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1}>
            {master.name}
          </Text>
          <ChevronRight size={16} color={colors.textTertiary} />
        </View>

        <View style={s.badgeRow}>
          {master.positions.map((p) => (
            <PositionBadge key={p} position={p} small />
          ))}
        </View>

        {locationNames.length > 0 && (
          <View style={s.metaRow}>
            <MapPin size={12} color={colors.textTertiary} />
            <Text style={s.metaText} numberOfLines={2}>
              {locationText}
            </Text>
          </View>
        )}

        <View style={s.metaRow}>
          <Users size={12} color={colors.textTertiary} />
          <Text style={s.metaText}>{master.clientsServed} clients served</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      gap: 14,
    },
    avatarWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      overflow: "hidden",
      flexShrink: 0,
    },
    avatarImg: { width: 52, height: 52 },
    avatarFallback: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.accentLight,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitials: {
      fontSize: FontSize.md,
      fontWeight: "700",
      color: c.accent,
    },
    body: { flex: 1, gap: 5 },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    name: {
      fontSize: FontSize.md,
      fontWeight: "700",
      color: c.textPrimary,
      flex: 1,
      marginRight: 6,
    },
    badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
    metaRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 5,
      marginTop: 1,
    },
    metaText: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      flex: 1,
      lineHeight: 17,
    },
  });
