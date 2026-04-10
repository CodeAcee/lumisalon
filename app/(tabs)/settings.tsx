import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Palette,
  LayoutGrid,
  LogOut,
  Trash2,
  Pencil,
  Clock,
  Bell,
  Globe,
} from "lucide-react-native";
import { Colors, FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { Avatar } from "../../src/components/ui/Avatar";
import { Image } from "expo-image";
import { useAuthStore, useSettingsStore } from "../../src/store";

export default function SettingsScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const language = useSettingsStore((s) => s.language);

  const handleLogout = () => {
    Alert.alert(
      t("settings.logOutConfirmTitle"),
      t("settings.logOutConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.logOut"),
          style: "destructive",
          onPress: () => {
            signOut();
            router.replace("/(auth)");
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      t("settings.deleteConfirmTitle"),
      t("settings.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.delete"), style: "destructive" },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("settings.title")}</Text>
      </View>

      <View style={styles.divider} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Pressable
          style={styles.profileCard}
          onPress={() => router.push("/profile/edit")}
        >
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              contentFit="cover"
            />
          ) : (
            <Avatar
              name={user?.name || "User"}
              size={56}
              color={colors.accent}
            />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Admin User"}</Text>
            <Text style={styles.profileEmail}>
              {user?.email || "admin@lumisalon.com"}
            </Text>
          </View>
          <View style={styles.editBadge}>
            <Pencil size={14} color={colors.accent} />
            <Text style={styles.editText}>{t("settings.editProfile")}</Text>
          </View>
        </Pressable>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>
          {t("settings.preferencesSection")}
        </Text>
        <View style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={() => router.push("/settings/appearance")}
          >
            <Palette size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>{t("settings.appearance")}</Text>
            <Text style={styles.rowValue}>{t(`appearance.${themeMode}`)}</Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable
            style={styles.row}
            onPress={() => router.push("/settings/app-icon")}
          >
            <LayoutGrid size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>{t("settings.appIcon")}</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable
            style={styles.row}
            onPress={() => router.push("/settings/working-hours")}
          >
            <Clock size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>{t("settings.workingHours")}</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable
            style={styles.row}
            onPress={() => router.push("/settings/notifications")}
          >
            <Bell size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>{t("settings.notifications")}</Text>
            <View style={{ flex: 1 }} />
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable
            style={styles.row}
            onPress={() => router.push("/settings/language")}
          >
            <Globe size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>{t("settings.language")}</Text>
            <Text style={styles.rowValue}>
              {language === "uk" ? "Українська" : "English"}
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>{t("settings.accountSection")}</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={handleLogout}>
            <LogOut size={20} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>{t("settings.logOut")}</Text>
          </Pressable>
          <View style={styles.rowDivider} />
          <Pressable style={styles.row} onPress={handleDelete}>
            <Trash2 size={20} color={colors.danger} />
            <Text style={[styles.rowLabel, { color: colors.danger }]}>
              {t("settings.deleteAccount")}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgPrimary },
    header: { paddingHorizontal: 20, height: 64, justifyContent: "center" },
    title: {
      fontSize: FontSize.heading,
      fontWeight: "700",
      color: c.textPrimary,
    },
    divider: { height: 1, backgroundColor: c.border },
    content: { paddingHorizontal: 16, paddingTop: 24, gap: 24 },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.xl,
      padding: 20,
      gap: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    profileInfo: { flex: 1, gap: 2 },
    profileName: {
      fontSize: FontSize.lg,
      fontWeight: "600",
      color: c.textPrimary,
    },
    profileEmail: { fontSize: FontSize.body, color: c.textSecondary },
    editBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: c.bgChip,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    editText: {
      fontSize: FontSize.caption,
      fontWeight: "500",
      color: c.accent,
    },
    sectionLabel: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      color: c.textTertiary,
      letterSpacing: 1,
    },
    card: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    rowLabel: { flex: 1, fontSize: FontSize.md, color: c.textPrimary },
    rowValue: { fontSize: FontSize.body, color: c.textSecondary },
    rowDivider: { height: 1, backgroundColor: c.border, marginLeft: 48 },
  });
}
