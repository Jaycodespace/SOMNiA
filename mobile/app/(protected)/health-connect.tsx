import OverlayWrapper from '@/components/theme/OverlayWrapper';
import { useThemeStore } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function HealthConnectScreen() {
  const { colors } = useThemeStore();

  const [enabled, setEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleToggle = () => {
    setEnabled(!enabled);
    Alert.alert(
      enabled ? "Health Connect Disabled" : "Health Connect Enabled",
      enabled
        ? "Your Health Connect integration has been turned off."
        : "Your app is now connected to Health Connect."
    );
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      // simulate sync
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Synced", "Your health data has been synced successfully.");
    } catch (e) {
      Alert.alert("Error", "Failed to sync health data.");
    } finally {
      setSyncing(false);
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
          borderWidth: 5,
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
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        {/* Back Button */}
        <Pressable
            onPress={() => router.replace("/(protected)/settings")}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
        >
            <Feather name="chevron-left" size={26} color={colors.text} />
            <Text
            style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "600",
                marginLeft: 2,
            }}
            >
            Back
            </Text>
        </Pressable>

        {/* CONNECTION */}
        <SectionTitle title="HEALTH CONNECT" />

        {/* Toggle */}
        <Pressable
          onPress={handleToggle}
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
            <Feather
              name="heart"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.itemLabel, { color: colors.text }]}>
              {enabled ? "Disable Health Connect" : "Enable Health Connect"}
            </Text>
          </View>

          <Feather
            name={enabled ? "toggle-right" : "toggle-left"}
            size={28}
            color={colors.primary}
          />
        </Pressable>

        {/* SYNC */}
        <SectionTitle title="DATA" />

        <Pressable
          onPress={handleSync}
          disabled={!enabled || syncing}
          style={({ pressed }) => [
            styles.item,
            {
              backgroundColor: colors.cardDarker,
              borderColor: colors.card,
              opacity: pressed ? 0.6 : !enabled ? 0.4 : 1,
              borderWidth: 5,
            },
          ]}
        >
          <View style={styles.itemLeft}>
            <Feather name="refresh-cw" size={20} color={colors.text} />
            <Text style={[styles.itemLabel, { color: colors.text }]}>
              {syncing ? "Syncing..." : "Sync Health Data"}
            </Text>
          </View>
        </Pressable>

        {syncing && (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 6 }} />
        )}

        {/* PERMISSIONS */}
        <SectionTitle title="PERMISSIONS" />

        <MenuItem
          label="Manage Permissions"
          icon="lock"
          onPress={() => {
            Alert.alert(
              "Permissions",
              "Redirecting to Health Connect settings (you'll implement this)."
            );
          }}
        />

        {/* INFO */}
        <SectionTitle title="ABOUT" />
        <MenuItem
          label="What Data We Access"
          icon="info"
          onPress={() => {
            Alert.alert(
              "Data Access",
              "We only read steps, calories, and activity time to improve your insights."
            );
          }}
        />
      </View>
    </OverlayWrapper>
  );
}

const styles = StyleSheet.create({
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
});
