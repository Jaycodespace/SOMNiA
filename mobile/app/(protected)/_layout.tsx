import { Feather } from "@expo/vector-icons";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute, RouteProp } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getTabVisibilityOptions = (
  route: RouteProp<Record<string, object | undefined>, string>,
  hiddenScreens: string[],
  bottomInset: number // 👈 add inset as a parameter
): BottomTabNavigationOptions => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "";
  const isHidden = hiddenScreens.includes(routeName);

  return {
    tabBarStyle: {
      display: isHidden ? "none" : "flex",
      position: "absolute",
      bottom: bottomInset + 10, // 👈 use the inset here
      left: 20,
      right: 20,
      elevation: 5,
      backgroundColor: "#ffffff",
      borderRadius: 20,
      height: 70,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      paddingBottom: 10,
      paddingTop: 10,
    },
  };
};

export default function ProtectedLayout() {
  const insets = useSafeAreaInsets(); // ✅ safe to use here

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#999",
      }}
    >
      {/* 🏠 Home Tab */}
      <Tabs.Screen
        name="index"
        options={({ route }) => ({
          ...getTabVisibilityOptions(route, [
            "show-exercise",
            "show-heart-rate",
            "show-sleep",
            "show-steps",
          ], insets.bottom),
          title: "Home",
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="home"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        })}
      />

      {/* 👤 Profile/Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={({ route }) => ({
          ...getTabVisibilityOptions(route, [
            "about-us",
            "setup-health-perm",
          ], insets.bottom),
          title: "Profile",
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="user"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        })}
      />
    </Tabs>
  );
}
