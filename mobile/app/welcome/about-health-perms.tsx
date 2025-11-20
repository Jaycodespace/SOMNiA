import { useThemeStore } from "@/store/themeStore";
import { router } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";


export default function AboutHealthPermissionsScreen() {
  const { colors } = useThemeStore();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: colors.background,
      }}
    >
      {/* Title */}
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 16,
          color: colors.text,
          textAlign: "left",
        }}
      >
        Why We Need Your Health Data
      </Text>

      {/* Main Explanation */}
      <Text
        style={{
          fontSize: 16,
          color: colors.subtleText,
          marginBottom: 20,
          lineHeight: 22,
        }}
      >
        SOMNiA is an AI-driven research project designed to identify early
        signs of insomnia. According to our research, insomnia often develops
        gradually and is preceded by subtle changes in your body — such as 
        elevated stress, irregular sleep cycles, reduced activity, and changes 
        in physiological patterns. Detecting these early indicators can help
        prevent insomnia from becoming chronic.
      </Text>

      {/* <Text
        style={{
          fontSize: 16,
          color: colors.subtleText,
          marginBottom: 20,
          lineHeight: 22,
        }}
      >
        To analyze these patterns, SOMNiA uses a hybrid CNN-LSTM model that
        evaluates both short-term fluctuations and long-term trends in health 
        metrics. These indicators help the system understand how your sleep, 
        physical activity, heart metrics, and stress responses change over time.
      </Text> */}

      {/* What We Collect */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 12,
          color: colors.text,
        }}
      >
        Data We Use for Insomnia Prediction
      </Text>

      <Text style={{ color: colors.subtleText, marginBottom: 8 }}>
        • Heart rate & heart rate variability  
      </Text>
      <Text style={{ color: colors.subtleText, marginBottom: 8 }}>
        • Sleep duration & sleep quality
      </Text>
      <Text style={{ color: colors.subtleText, marginBottom: 8 }}>
        • Physical activity & steps
      </Text>
      <Text style={{ color: colors.subtleText, marginBottom: 8 }}>
        • Stress-related physiological indicators
      </Text>
      <Text style={{ color: colors.subtleText, marginBottom: 20 }}>
        • Basic exercise and movement patterns
      </Text>

      {/* Why Needed */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 12,
          color: colors.text,
        }}
      >
        Why These Permissions Matter
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: colors.subtleText,
          marginBottom: 30,
          lineHeight: 22,
        }}
      >
        These physiological signals allow SOMNiA to detect patterns associated
        with insomnia before the condition worsens. This supports our goal of
        enabling early awareness, prevention, and informed lifestyle 
        recommendations — all backed by scientific literature and wearable-
        based sleep research.
      </Text>

      {/* Done Button */}
      <Pressable
        onPress={() => router.back()}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          Back to Setup
        </Text>
      </Pressable>
    </ScrollView>
  );
}
