import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useThemeStore } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function SuggestionsScreen() {
  const { colors } = useThemeStore();
  const [text, setText] = useState("");

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {title}
    </Text>
  );

  return (
    <OverlayWrapper
      colors={[colors.gradientTop, colors.gradientBottom]}
      overlayImage={require("@/assets/images/crayon_overlay.png")}
      overlayOpacity={0.02}
    >
      <View style={{ padding: 20 }}>
        
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

        {/* Title */}
        <SectionTitle title="SUGGESTIONS" />

        {/* Input Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardDarker, borderColor: colors.card },
          ]}
        >
          <Text style={[styles.cardLabel, { color: colors.subtleText }]}>
            Your Feedback
          </Text>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Tell us what we can improve..."
            placeholderTextColor={colors.subtleText}
            multiline
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
          ]}
        >
          <Feather name="send" size={18} color="white" />
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>

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
    opacity: 0.7,
    letterSpacing: 0.6,
  },

  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 5,
    marginBottom: 18,
    gap: 12,
  },

  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },

  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    gap: 8,
  },

  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
