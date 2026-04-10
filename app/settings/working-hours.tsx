import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, ChevronRight } from "lucide-react-native";
import { FontSize, BorderRadius } from "../../src/constants/theme";
import { useColors } from "../../src/theme/ThemeContext";
import { AppSwitch } from "../../src/components/ui/AppSwitch";
import { useSettingsStore } from "../../src/store/settings";
import { scheduleWorkingHourNotifications } from "../../src/lib/workingHoursNotifications";

type EditingField = { day: string; field: "start" | "end" };

function timeStringToDate(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default function WorkingHoursScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const workingHours = useSettingsStore((s) => s.workingHours);
  const updateDayHours = useSettingsStore((s) => s.updateDayHours);
  const notifications = useSettingsStore((s) => s.notifications);

  const [editing, setEditing] = useState<EditingField | null>(null);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());

  const openPicker = useCallback(
    (day: string, field: "start" | "end") => {
      const dayData = workingHours.find((d) => d.day === day);
      if (!dayData) return;
      const timeStr = field === "start" ? dayData.start : dayData.end;
      setPickerDate(timeStringToDate(timeStr));
      setEditing({ day, field });
    },
    [workingHours],
  );

  const confirmTime = useCallback(
    async (date: Date) => {
      if (!editing) return;
      const newTime = dateToTimeString(date);
      updateDayHours(editing.day, { [editing.field]: newTime });
      setEditing(null);
      const updated = workingHours.map((d) =>
        d.day === editing.day ? { ...d, [editing.field]: newTime } : d,
      );
      const notifEnabled =
        notifications.allowNotifications && notifications.appointmentReminders;
      await scheduleWorkingHourNotifications(updated, notifEnabled);
    },
    [editing, workingHours, updateDayHours, notifications],
  );

  const handleToggle = useCallback(
    async (dayName: string, val: boolean) => {
      updateDayHours(dayName, { enabled: val });
      const updated = workingHours.map((d) =>
        d.day === dayName ? { ...d, enabled: val } : d,
      );
      const notifEnabled =
        notifications.allowNotifications && notifications.appointmentReminders;
      await scheduleWorkingHourNotifications(updated, notifEnabled);
    },
    [workingHours, updateDayHours, notifications],
  );

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
        <Text style={styles.headerTitle}>{t("workingHours.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View
          entering={FadeInDown.duration(350)}
          style={[styles.headerCard, { backgroundColor: colors.accentLight }]}
        >
          <View style={styles.clockIcon}>
            <Clock size={24} color={colors.accent} />
          </View>
          <Text style={styles.headerCardTitle}>
            {t("workingHours.cardTitle")}
          </Text>
          <Text style={styles.headerCardSub}>
            {t("workingHours.cardSubtitle")}
          </Text>
        </Animated.View>

        <View style={styles.card}>
          {workingHours.map((day, i) => (
            <Animated.View
              key={day.day}
              entering={FadeInDown.delay(i * 40).duration(350)}
            >
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.dayLabel,
                      !day.enabled && styles.dayDisabled,
                    ]}
                  >
                    {t(`workingHours.days.${day.day}`)}
                  </Text>

                  {day.enabled ? (
                    <View style={styles.timesRow}>
                      <Pressable
                        style={styles.timeChip}
                        onPress={() => openPicker(day.day, "start")}
                      >
                        <Text style={styles.timeChipText}>{day.start}</Text>
                        <ChevronRight size={11} color={colors.accent} />
                      </Pressable>
                      <Text style={styles.timeSeparator}>—</Text>
                      <Pressable
                        style={styles.timeChip}
                        onPress={() => openPicker(day.day, "end")}
                      >
                        <Text style={styles.timeChipText}>{day.end}</Text>
                        <ChevronRight size={11} color={colors.accent} />
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={styles.closedText}>
                      {t("workingHours.closed")}
                    </Text>
                  )}
                </View>
                <AppSwitch
                  value={day.enabled}
                  onChange={(val) => handleToggle(day.day, val)}
                />
              </View>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.hint}>{t("workingHours.hint")}</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* iOS: bottom sheet modal */}
      {Platform.OS === "ios" && editing && (
        <Modal transparent animationType="slide" visible>
          <View style={styles.modalOverlay}>
            <View
              style={[styles.pickerSheet, { backgroundColor: colors.bgCard }]}
            >
              <View style={styles.pickerHeader}>
                <Pressable onPress={() => setEditing(null)}>
                  <Text
                    style={[styles.pickerBtn, { color: colors.textSecondary }]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Text style={styles.pickerTitle}>
                  {editing.field === "start" ? "Start Time" : "End Time"} —{" "}
                  {editing.day}
                </Text>
                <Pressable onPress={() => confirmTime(pickerDate)}>
                  <Text style={[styles.pickerBtn, { color: colors.accent }]}>
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerDate}
                mode="time"
                display="spinner"
                onChange={(_, date) => date && setPickerDate(date)}
                minuteInterval={5}
                textColor={colors.textPrimary}
                style={{ width: "100%" }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android: native dialog */}
      {Platform.OS === "android" && editing && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
          onChange={(_, date) => {
            if (date) confirmTime(date);
            else setEditing(null);
          }}
          minuteInterval={5}
        />
      )}
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
    headerCard: {
      borderRadius: BorderRadius.xl,
      padding: 24,
      alignItems: "center",
      gap: 8,
    },
    clockIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerCardTitle: {
      fontSize: FontSize.lg,
      fontWeight: "700",
      color: c.textPrimary,
    },
    headerCardSub: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
    card: {
      backgroundColor: c.bgCard,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    divider: { height: 1, backgroundColor: c.border, marginLeft: 16 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    dayLabel: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
      marginBottom: 4,
    },
    dayDisabled: { color: c.textTertiary },
    timesRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    timeChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: c.bgChip,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    timeChipText: {
      fontSize: FontSize.caption,
      fontWeight: "600",
      color: c.accent,
    },
    timeSeparator: {
      fontSize: FontSize.caption,
      color: c.textTertiary,
    },
    closedText: {
      fontSize: FontSize.caption,
      color: c.textTertiary,
    },
    hint: {
      fontSize: FontSize.caption,
      color: c.textSecondary,
      lineHeight: 20,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    pickerSheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 34,
    },
    pickerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    pickerTitle: {
      fontSize: FontSize.md,
      fontWeight: "600",
      color: c.textPrimary,
    },
    pickerBtn: {
      fontSize: FontSize.md,
      fontWeight: "600",
    },
  });
}
