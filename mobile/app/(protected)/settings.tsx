import OverlayWrapper from '@/components/theme/OverlayWrapper';
import { useStoreAuth } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useThemeStore();
  const { logout } = useStoreAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        await logout();
        router.replace("/sign-in");
        return;
      }

      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      await logout();
      router.replace("/sign-in");
      Alert.alert("Signed out", "You’ve been logged out successfully.");
    } catch (error) {
      Alert.alert("Error", "Something went wrong during logout.");
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {title}
    </Text>
  );

  const MenuItem = ({
    label,
    icon,
    onPress,
  }: {
    label: string;
    icon: keyof typeof Feather.glyphMap;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: colors.cardDarker,
          borderColor: colors.card,
          opacity: pressed ? 0.6 : 1,
          borderWidth: 5
        },
      ]}
    >
      <View style={styles.itemLeft}>
        <Feather name={icon} size={20} color={colors.text} />
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.subtleText} />
    </Pressable>
  );

  return (
    <OverlayWrapper
      colors={[colors.gradientTop, colors.gradientBottom]}
      overlayImage={require("@/assets/images/crayon_overlay.png")}
      overlayOpacity={0.02}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 40, // give breathing room
        }}
      >

        {/* APPEARANCE */}
        <SectionTitle title="APPEARANCE" />

        {/* Theme Toggle */}
        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.item,
            {
              backgroundColor: colors.cardDarker,
              borderColor: colors.card,
              opacity: pressed ? 0.6 : 1,
              borderWidth: 5,
            },
          ]}
        >
          <View style={styles.itemLeft}>
            <Feather
              name={theme === "light" ? "sun" : "moon"}
              size={20}
              color={colors.text}
            />
            <Text style={[styles.itemLabel, { color: colors.text }]}>
              {theme === "light" ? "Light Mode" : "Dark Mode"}
            </Text>
          </View>

          <Feather
            name={theme === "light" ? "toggle-left" : "toggle-right"}
            size={28}
            color={colors.primary}
          />
        </Pressable>

        {/* GENERAL */}
        <SectionTitle title="GENERAL" />
        <MenuItem
          label="Account"
          icon="user"
          onPress={() => router.push("/(protected)/account")}
        />
        <MenuItem 
          label="Health Connect" 
          icon="heart" 
          // onPress={() => router.push("/(protected)/health-connect")}
          onPress={() => {}}
        />

        {/* SECURITY */}
        <SectionTitle title="SECURITY & PRIVACY" />
        <MenuItem 
          label="Data Privacy" 
          icon="shield" 
          onPress={() => router.push("/(protected)/data-privacy")}
        />

        {/* ABOUT */}
        <SectionTitle title="ABOUT" />
        <MenuItem 
          label="About App" 
          icon="info" 
          onPress={() => router.push("/(protected)/about-app")}
        />
        <MenuItem 
          label="Suggestions" 
          icon="message-square" 
          onPress={() => router.push("/(protected)/suggestions")}
        />

        {/* SIGN OUT */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: colors.cardDarker,
              borderColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Feather name="log-out" size={18} color={colors.primary} />
          <Text style={[styles.signOutText, { color: colors.primary }]}>
            {loading ? "Signing Out..." : "Sign Out"}
          </Text>
        </Pressable>

        {loading && (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 8 }}
          />
        )}

      </ScrollView>
    </OverlayWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    opacity: 0.7,
  },

  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  signOutButton: {
    marginTop: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
