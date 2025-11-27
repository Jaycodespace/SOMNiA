import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute, RouteProp } from "@react-navigation/native";
import { Tabs } from "expo-router";

const getTabVisibilityOptions = (
  route: RouteProp<Record<string, object | undefined>, string>,
  hiddenScreens: string[],
  themedTabStyle: any
): BottomTabNavigationOptions => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "";
  const isHidden = hiddenScreens.includes(routeName);

  return {
    tabBarStyle: {
      ...themedTabStyle,
      display: isHidden ? "none" : "flex",
    },
  };
};

export default function ProtectedLayout() {
  const { colors } = useThemeStore();

  const themedTabStyle = {
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 3,          // 👈 top border for tab bar
    borderTopColor: colors.border,
  };

  return (
    <Tabs
      screenOptions={{
        headerTitle: "",               // hide text
        headerShadowVisible: false,    // remove default shadow
        headerStyle: {
          backgroundColor: colors.card,
          height: 50,
          borderBottomWidth: 3,        // 👈 add bottom border for header
          borderBottomColor: colors.border,
        },

        tabBarActiveTintColor: colors.tabBarActiveTint,
        tabBarInactiveTintColor: colors.tabBarInactiveTint,
        tabBarStyle: themedTabStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={({ route }) => ({
          ...getTabVisibilityOptions(route, ["sleep-records"], themedTabStyle),
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        })}
      />

      <Tabs.Screen
        name="ai-assist"
        options={({ route }) => ({
          ...getTabVisibilityOptions(route, ["info"], themedTabStyle),
          title: "Sleep Help",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        })}
      />

      <Tabs.Screen
        name="diary"
        options={({ route }) => ({
          ...getTabVisibilityOptions(route, ["info"], themedTabStyle),
          title: "Diary",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        })}
      />


      <Tabs.Screen
        name="settings"
        options={({ route }) => ({
          ...getTabVisibilityOptions(route, ["account"], themedTabStyle),
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        })}
      />

      <Tabs.Screen
        name="account"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="health-connect"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="data-privacy"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="about-app"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="suggestions"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="sleep-records"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="steps-records"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="exercise-records"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="heart-rate-records"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="spo2-records"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
