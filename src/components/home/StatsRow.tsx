import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, Users } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { BorderRadius, FontSize } from "../../constants/theme";
import { useColors, useTheme } from "../../theme/ThemeContext";

interface StatsRowProps {
  todayCount: number;
  mastersCount: number;
}

export function StatsRow({ todayCount, mastersCount }: StatsRowProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const s = makeStyles(colors, isDark);

  return (
    <View style={s.statsRow}>
      <Animated.View
        entering={FadeInDown.delay(50).duration(400)}
        style={s.statCard}
      >
        <Calendar size={18} color={colors.accent} />
        <Text style={s.statValue}>{todayCount}</Text>
        <Text style={s.statLabel}>{t("home.today")}</Text>
      </Animated.View>
      <Animated.View
        entering={FadeInDown.delay(150).duration(400)}
        style={s.statCard}
      >
        <Users size={18} color={colors.accent} />
        <Text style={s.statValue}>{mastersCount}</Text>
        <Text style={s.statLabel}>{t("tabs.masters")}</Text>
      </Animated.View>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, isDark: boolean) {
  return StyleSheet.create({
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 24, marginTop: 4 },
    statCard: {
      flex: 1,
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      padding: 16,
      alignItems: "center",
      gap: 6,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.8)",
      shadowColor: c.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.13,
      shadowRadius: 18,
      elevation: 4,
    },
    statValue: {
      fontSize: FontSize.title,
      fontWeight: "700",
      color: c.textPrimary,
    },
    statLabel: { fontSize: FontSize.sm, color: c.textSecondary },
  });
}
