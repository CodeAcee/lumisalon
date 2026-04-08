import { Tabs } from "expo-router";
import { StyleSheet, Platform } from "react-native";
import {
  Home,
  Users,
  Scissors,
  Settings as SettingsIcon,
} from "lucide-react-native";
import { useColors } from "../../src/theme/ThemeContext";

export default function TabLayout() {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navActive,
        tabBarInactiveTintColor: colors.navInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="masters"
        options={{
          title: "Masters",
          tabBarIcon: ({ color }) => <Scissors size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <SettingsIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen name="NotificationsScreen" options={{ href: null }} />
    </Tabs>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    tabBar: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 28 : 16,
      marginHorizontal: 24,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.white,
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: "#2D2321",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      paddingBottom: 0,
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: "500",
      marginTop: -2,
    },
    tabItem: {
      paddingTop: 8,
    },
  });
}
