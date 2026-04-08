import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  UserPlus,
  BarChart3,
  Megaphone,
} from "lucide-react-native";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { AppSwitch } from "../../src/components/ui/AppSwitch";
import {
  useSettingsStore,
  type NotificationPrefs,
} from "../../src/store/settings";
import { scheduleWorkingHourNotifications } from "../../src/lib/workingHoursNotifications";

type NotifItem = {
  key: keyof NotificationPrefs;
  label: string;
  description: string;
  icon: typeof Bell;
};

const NOTIFICATION_ITEMS: NotifItem[] = [
  {
    key: "allowNotifications",
    label: "Allow Notifications",
    description: "Master toggle for all notifications",
    icon: Bell,
  },
  {
    key: "appointmentReminders",
    label: "Appointment Reminders",
    description: "Get reminded before upcoming appointments",
    icon: CalendarCheck,
  },
  {
    key: "newClientAlerts",
    label: "New Client Alerts",
    description: "When a new client is added",
    icon: UserPlus,
  },
  {
    key: "dailySummary",
    label: "Daily Summary",
    description: "End-of-day recap of procedures",
    icon: BarChart3,
  },
  {
    key: "marketingUpdates",
    label: "Marketing Updates",
    description: "Promotions and feature announcements",
    icon: Megaphone,
  },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const notifications = useSettingsStore((s) => s.notifications);
  const toggleNotification = useSettingsStore((s) => s.toggleNotification);
  const workingHours = useSettingsStore((s) => s.workingHours);
  const mainEnabled = notifications.allowNotifications;

  const handleToggle = async (key: keyof NotificationPrefs) => {
    toggleNotification(key);
    // Recalculate enabled state after toggle
    const current = useSettingsStore.getState().notifications;
    const allow =
      key === "allowNotifications" ? !current.allowNotifications : current.allowNotifications;
    const appt =
      key === "appointmentReminders" ? !current.appointmentReminders : current.appointmentReminders;
    await scheduleWorkingHourNotifications(workingHours, allow && appt);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.bgPrimary },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.bgChip }]}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main toggle card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
              <Bell size={20} color={colors.textOnAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Allow Notifications</Text>
              <Text style={styles.rowDesc}>
                Master toggle for all notifications
              </Text>
            </View>
            <AppSwitch
              value={notifications.allowNotifications}
              onChange={() => handleToggle("allowNotifications")}
            />
          </View>
        </View>

        {/* Individual notification preferences */}
        <Text style={styles.sectionLabel}>NOTIFICATION TYPES</Text>
        <View style={[styles.card, !mainEnabled && styles.cardDisabled]}>
          {NOTIFICATION_ITEMS.slice(1).map((item, i) => {
            const Icon = item.icon;
            return (
              <View key={item.key}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.row}>
                  <View style={styles.iconBox}>
                    <Icon size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowDesc}>{item.description}</Text>
                  </View>
                  <AppSwitch
                    value={notifications[item.key]}
                    onChange={() => handleToggle(item.key)}
                    disabled={!mainEnabled}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.hint}>
          Notification preferences are synced with your account.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
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
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 24,
      gap: 16,
      paddingBottom: 40,
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
    cardDisabled: { opacity: 0.5 },
    divider: { height: 1, backgroundColor: c.border, marginLeft: 66 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: c.bgChip,
      alignItems: "center",
      justifyContent: "center",
    },
    rowLabel: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    rowDesc: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      marginTop: 1,
    },
    hint: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      lineHeight: 20,
    },
  });
}
