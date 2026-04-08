import { memo, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Phone, MapPin, Calendar, ChevronRight } from "lucide-react-native";
import { FontSize, BorderRadius } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";
import { format } from "date-fns";
import type { Client } from "../../types";

interface Props {
  client: Client;
  locationName?: string;
  onPress: () => void;
}

export const ClientCard = memo(function ClientCard({
  client,
  locationName,
  onPress,
}: Props) {
  const colors = useColors();
  const s = useMemo(() => styles(colors), [colors]);

  const initials = useMemo(
    () =>
      client.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    [client.name],
  );

  const lastVisitFormatted = useMemo(
    () =>
      client.lastVisit
        ? format(new Date(client.lastVisit), "MMM d, yyyy")
        : null,
    [client.lastVisit],
  );

  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.avatarWrap}>
        {client.avatar ? (
          <Image
            source={{ uri: client.avatar }}
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
            {client.name}
          </Text>
          <ChevronRight size={16} color={colors.textTertiary} />
        </View>

        <View style={s.metaRow}>
          <Phone size={12} color={colors.textTertiary} />
          <Text style={s.metaText}>{client.phone}</Text>
        </View>

        {locationName && (
          <View style={s.metaRow}>
            <MapPin size={12} color={colors.textTertiary} />
            <Text style={s.metaText}>{locationName}</Text>
          </View>
        )}

        {lastVisitFormatted && (
          <View style={s.metaRow}>
            <Calendar size={12} color={colors.textTertiary} />
            <Text style={s.metaText}>Last visit: {lastVisitFormatted}</Text>
          </View>
        )}
      </View>
    </Pressable>
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
      gap: 6,
    },
    name: {
      fontSize: FontSize.md,
      fontWeight: "700",
      color: c.textPrimary,
      flex: 1,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    metaText: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      flex: 1,
    },
  });
