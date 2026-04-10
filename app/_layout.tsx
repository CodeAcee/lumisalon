import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { queryClient } from "../src/lib/react-query";
import { ImageViewer } from "../src/components/ui/ImageViewer";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { PaperProvider } from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { scheduleWorkingHourNotifications } from "../src/lib/workingHoursNotifications";
import { useSettingsStore } from "../src/store/settings";
import "../src/i18n";
import i18n from "../src/i18n";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function AppShell() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ImageViewer />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="client/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="client/create"
          options={{
            animation: "slide_from_bottom",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="master/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="master/create"
          options={{
            animation: "slide_from_bottom",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="procedure/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="procedure/create"
          options={{
            animation: "slide_from_bottom",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{
            animation: "slide_from_bottom",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="settings/appearance"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="settings/app-icon"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="settings/working-hours"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="settings/notifications"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="settings/language"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="client/edit"
          options={{
            animation: "slide_from_bottom",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="master/edit"
          options={{
            animation: "slide_from_bottom",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="location/create"
          options={{
            animation: "slide_from_bottom",
            presentation: "fullScreenModal",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    // Restore scheduled working-hours notifications on each app launch
    const { workingHours, notifications, language } =
      useSettingsStore.getState();
    const enabled =
      notifications.allowNotifications && notifications.appointmentReminders;
    scheduleWorkingHourNotifications(workingHours, enabled);
    // Apply persisted language
    i18n.changeLanguage(language ?? "en");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <KeyboardProvider>
          <GestureHandlerRootView style={styles.root}>
            <PaperProvider>
              <BottomSheetModalProvider>
                <AppShell />
              </BottomSheetModalProvider>
            </PaperProvider>
          </GestureHandlerRootView>
        </KeyboardProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
