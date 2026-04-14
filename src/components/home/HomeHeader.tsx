import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { MapPin, ChevronDown, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { BorderRadius, FontSize, Spacing } from "../../constants/theme";
import { useColors } from "../../theme/ThemeContext";

interface HomeHeaderProps {
  activeLocationName: string | null;
  userAvatar?: string | null;
  onLocationPress: () => void;
  onAvatarPress: () => void;
}

export function HomeHeader({
  activeLocationName,
  userAvatar,
  onLocationPress,
  onAvatarPress,
}: HomeHeaderProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const s = makeStyles(colors);

  return (
    <View style={s.header}>
      <Pressable style={s.locationBtn} onPress={onLocationPress}>
        <MapPin size={14} color={colors.accent} />
        <Text style={s.locationBtnText} numberOfLines={1}>
          {activeLocationName ?? t("home.allLocations")}
        </Text>
        <ChevronDown size={14} color={colors.textSecondary} />
      </Pressable>

      <Pressable onPress={onAvatarPress} style={s.avatarBtn}>
        {userAvatar ? (
          <Image
            source={{ uri: userAvatar }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
        ) : (
          <User size={18} color={colors.textSecondary} />
        )}
      </Pressable>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.xl,
      paddingVertical: 10,
    },
    locationBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.pill,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flex: 1,
      marginRight: 10,
    },
    locationBtnText: {
      flex: 1,
      fontSize: FontSize.body,
      fontWeight: "600",
      color: c.textPrimary,
    },
    avatarBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: c.border,
    },
  });
}
