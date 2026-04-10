import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Check } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { useSettingsStore } from "../../src/store/settings";
import { LANGUAGES, type LanguageCode } from "../../src/i18n";
import i18n from "../../src/i18n";

export default function LanguageScreen() {
  const colors = useColors();
  const s = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>{t("language.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text
          entering={FadeInDown.duration(350)}
          style={s.sectionLabel}
        >
          {t("language.selectLanguage")}
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(80).duration(350)}
          style={s.card}
        >
          {LANGUAGES.map((lang, i) => (
            <View key={lang.code}>
              {i > 0 && <View style={s.divider} />}
              <Pressable style={s.row} onPress={() => handleSelect(lang.code)}>
                <View style={s.flagWrap}>
                  <Text style={s.flag}>{lang.code === "en" ? "🇬🇧" : "🇺🇦"}</Text>
                </View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabel}>{lang.nativeLabel}</Text>
                  {lang.nativeLabel !== lang.label && (
                    <Text style={s.rowSub}>{lang.label}</Text>
                  )}
                </View>
                {language === lang.code && (
                  <Check size={18} color={colors.accent} strokeWidth={2.5} />
                )}
              </Pressable>
            </View>
          ))}
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(160).duration(350)}
          style={s.hint}
        >
          {t("language.hint")}
        </Animated.Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgPrimary },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
      paddingHorizontal: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    content: { paddingHorizontal: 16, paddingTop: 24, gap: 16 },
    sectionLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1.2,
    },
    card: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    divider: { height: 1, backgroundColor: c.border, marginLeft: 66 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    flagWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    flag: { fontSize: 20 },
    rowInfo: { flex: 1, gap: 2 },
    rowLabel: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    rowSub: { fontSize: FontSize.caption, color: c.textSecondary },
    hint: {
      fontSize: FontSize.caption,
      color: c.textTertiary,
      textAlign: "center",
      lineHeight: 18,
    },
  });
}
