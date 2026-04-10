import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PaletteKey } from "../constants/theme";
import type { LanguageCode } from "../i18n";

export type ThemeMode = "light" | "dark" | "system";
export type AppIconVariant = "default" | "dark" | "gold" | "minimal";
export type { PaletteKey };

export interface WorkingHours {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
}

export interface NotificationPrefs {
  allowNotifications: boolean;
  appointmentReminders: boolean;
  newClientAlerts: boolean;
  dailySummary: boolean;
  marketingUpdates: boolean;
}

interface SettingsState {
  // Appearance
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  palette: PaletteKey;
  setPalette: (key: PaletteKey) => void;

  // App Icon
  appIcon: AppIconVariant;
  setAppIcon: (icon: AppIconVariant) => void;

  // Language
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  // Working hours
  workingHours: WorkingHours[];
  setWorkingHours: (hours: WorkingHours[]) => void;
  updateDayHours: (day: string, data: Partial<WorkingHours>) => void;

  // Notifications
  notifications: NotificationPrefs;
  setNotifications: (prefs: NotificationPrefs) => void;
  toggleNotification: (key: keyof NotificationPrefs) => void;
}

const DEFAULT_WORKING_HOURS: WorkingHours[] = [
  { day: "Monday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Tuesday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Wednesday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Thursday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Friday", enabled: true, start: "09:00", end: "18:00" },
  { day: "Saturday", enabled: true, start: "10:00", end: "16:00" },
  { day: "Sunday", enabled: false, start: "10:00", end: "16:00" },
];

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  allowNotifications: true,
  appointmentReminders: true,
  newClientAlerts: true,
  dailySummary: false,
  marketingUpdates: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "light",
      palette: "cream",
      appIcon: "default",
      language: "en" as LanguageCode,
      workingHours: DEFAULT_WORKING_HOURS,
      notifications: DEFAULT_NOTIFICATIONS,

      setThemeMode: (themeMode) => set({ themeMode }),
      setPalette: (palette) => set({ palette }),
      setAppIcon: (appIcon) => set({ appIcon }),
      setLanguage: (language) => set({ language }),
      setWorkingHours: (workingHours) => set({ workingHours }),
      updateDayHours: (day, data) =>
        set((s) => ({
          workingHours: s.workingHours.map((h) =>
            h.day === day ? { ...h, ...data } : h,
          ),
        })),
      setNotifications: (notifications) => set({ notifications }),
      toggleNotification: (key) =>
        set((s) => ({
          notifications: {
            ...s.notifications,
            [key]: !s.notifications[key],
          },
        })),
    }),
    {
      name: "lumisalon-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
