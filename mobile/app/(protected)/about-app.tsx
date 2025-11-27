import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useThemeStore } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function AboutAppScreen() {
  const { colors } = useThemeStore();

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {title}
    </Text>
  );

  const appVersion = process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0";
  const buildNumber = process.env.EXPO_PUBLIC_BUILD_NUMBER || "1";

  return (
    <OverlayWrapper
      colors={[colors.gradientTop, colors.gradientBottom]}
      overlayImage={require("@/assets/images/crayon_overlay.png")}
      overlayOpacity={0.02}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.replace("/(protected)/settings")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
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

        {/* ABOUT APP */}
        <SectionTitle title="ABOUT SOMNIA" />

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.cardDarker,
              borderColor: colors.card,
            },
          ]}
        >
          {/* App Name */}
          <View style={styles.infoRow}>
            <Feather name="smartphone" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              SOMNiA
            </Text>
          </View>

          {/* Version */}
          <View style={styles.infoRow}>
            <Feather name="hash" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Version {appVersion}
            </Text>
          </View>

          {/* Build Number */}
          <View style={styles.infoRow}>
            <Feather name="layers" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Build {buildNumber}
            </Text>
          </View>

          {/* Developer */}
          <View style={styles.infoRow}>
            <Feather name="user-check" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Developed by SOMNiA Dev Team
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <SectionTitle title="DESCRIPTION" />

        <View
          style={[
            styles.descriptionCard,
            {
              backgroundColor: colors.cardDarker,
              borderColor: colors.card,
            },
          ]}
        >
          <Text style={[styles.description, { color: colors.text }]}>
            SOMNiA is an AI-driven system designed to estimate the probability 
            of developing insomnia using physiological and lifestyle data collected 
            from wearable devices. The app analyzes heart rate variability (HRV), 
            sleep duration, sleep quality, physical activity, stress markers, and 
            other time-series data to identify early warning signs before chronic
            insomnia develops.
          </Text>

          <Text style={[styles.description, { color: colors.text, marginTop: 12 }]}>
            The system supports the broader goal of making sleep health monitoring 
            more accessible, leveraging wearable technology as a non-invasive, 
            cost-effective alternative to traditional sleep diagnostics. SOMNiA 
            empowers individuals to understand their sleep-related risks and take 
            informed steps toward improving their overall well-being.
          </Text>
        </View>
      </ScrollView>
    </OverlayWrapper>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.7,
    letterSpacing: 0.6,
  },

  infoCard: {
    padding: 16,
    borderWidth: 5,
    borderRadius: 16,
    marginBottom: 14,
    gap: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  infoText: {
    fontSize: 16,
    fontWeight: "600",
  },

  descriptionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 5,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
});
