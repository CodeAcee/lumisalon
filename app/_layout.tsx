import { Stack, router } from "expo-router";
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
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from "@expo-google-fonts/dm-sans";
import { scheduleWorkingHourNotifications } from "../src/lib/workingHoursNotifications";
import { useSettingsStore } from "../src/store/settings";
import { useAuthStore } from "../src/store/auth";
import { useAppStore } from "../src/store/app";
import { supabase } from "../src/lib/supabase";
import { supabaseAuth } from "../src/services/supabase/auth.service";
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
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const loadAllData = useAppStore((s) => s.loadAllData);

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    SplashScreen.hideAsync();

    const { workingHours, notifications, language } =
      useSettingsStore.getState();
    const enabled =
      notifications.allowNotifications && notifications.appointmentReminders;
    scheduleWorkingHourNotifications(workingHours, enabled);
    i18n.changeLanguage(language ?? "en");

    // Restore existing Supabase session on app start
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await supabaseAuth.getProfile(
          session.user.id,
          session.user.email ?? "",
        );
        signIn(profile);
        await loadAllData();
      } else {
        // No real Supabase session — clear any stale Zustand auth state
        signOut();
      }
    });

    // Listen to auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await supabaseAuth.getProfile(
            session.user.id,
            session.user.email ?? "",
          );
          signIn(profile);
          await loadAllData();
          router.replace("/(tabs)");
        } else if (event === "SIGNED_OUT") {
          signOut();
          router.replace("/(auth)");
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
