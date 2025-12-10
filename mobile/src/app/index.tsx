import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StatusBar, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../assets/styles/index.styles';
import FeatureList from '../components/FeatureList';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent />
      <LinearGradient colors={['#1a1a2e', '#23234b']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            <Image source={require('../assets/images/somnia.png')} style={styles.logoOnly} resizeMode="contain" />
            <Text style={styles.subtitle}>
              Your personal sleep tracking and analysis companion. 
              Discover better sleep patterns and improve your overall well-being.
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureList icon="moon" title="Sleep Tracking" text="Monitor your sleep patterns and get detailed insights" />
            <FeatureList icon="analytics" title="Smart Analysis" text="Get personalized recommendations for better sleep" />
            <FeatureList icon="trending-up" title="Progress Tracking" text="Track your sleep improvement journey" />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => router.push('/setupHealthPerm')}

              style={({ pressed }) => [styles.getStartedButton, pressed && styles.getStartedButtonPressed]}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
