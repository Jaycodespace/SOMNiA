import OverlayWrapper from '@/components/theme/OverlayWrapper';
import { useThemeStore } from "@/store/themeStore";
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInUp,
} from 'react-native-reanimated';

export default function DiaryScreen() {
  const { colors } = useThemeStore();

  return (
    <OverlayWrapper
      colors={[colors.gradientTop, colors.gradientBottom]}
      overlayImage={require("@/assets/images/crayon_overlay.png")}
      overlayOpacity={0.02}
    >
      <View style={styles.centerContainer}>
        
        {/* Stylized Card */}
        <Animated.View
          entering={FadeInUp.springify().mass(0.4)}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Bear Image Animation */}
        <Animated.View entering={FadeIn.duration(600)}>
          <Image
            source={require("@/assets/images/bear_build.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>
        
          <Text
            style={[styles.cardText, { color: colors.text }]}
          >
            🚧 This feature is still under development.
          </Text>

          <Text
            style={[
              styles.cardSubText,
              { color: colors.subtleText },
            ]}
          >
            We&apos;re working hard to bring Sleep Diary to life.  
            Stay tuned for updates!
          </Text>
        </Animated.View>

      </View>
    </OverlayWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },

  card: {
    width: "90%",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",

    // Soft shadow (iOS + Android)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  cardText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },

  cardSubText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
