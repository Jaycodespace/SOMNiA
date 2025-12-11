import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import AppSettings from './AppSettings';
import HealthDataSettings from './HealthDataSettings';
import PrivacySecurity from './PrivacySecurity';
import HelpFAQ from './HelpFAQ';
import ContactSupport from './ContactSupport';
import styles from './styles';

export default function Profile() {
  const router = useRouter();
  const { name, email, clearAuth } = useAuthStore();
  const [userData, setUserData] = useState({
    name: name || '',
    email: email || '',
    age: null as number | null,
    gender: null as string | null,
  });
  const [activeScreen, setActiveScreen] = useState<'main' | 'app' | 'health' | 'privacy' | 'help' | 'contact'>('main');

  useEffect(() => {
    const authStore = useAuthStore.getState();
    if (authStore.name || authStore.email) {
      setUserData({
        name: authStore.name || 'User',
        email: authStore.email || '',
        age: null, // TODO: Fetch from backend
        gender: null, // TODO: Fetch from backend
      });
    }
  }, [name, email]);

  const handleLogout = () => {
    try {
      clearAuth();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  // Render different screens based on activeScreen
  if (activeScreen === 'app') {
    return <AppSettings onBack={() => setActiveScreen('main')} />;
  }
  if (activeScreen === 'health') {
    return <HealthDataSettings onBack={() => setActiveScreen('main')} />;
  }
  if (activeScreen === 'privacy') {
    return <PrivacySecurity onBack={() => setActiveScreen('main')} />;
  }
  if (activeScreen === 'help') {
    return <HelpFAQ onBack={() => setActiveScreen('main')} />;
  }
  if (activeScreen === 'contact') {
    return <ContactSupport onBack={() => setActiveScreen('main')} />;
  }

  // Main profile screen
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <Image 
            source={require('../../assets/images/default-avatar.png')}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{userData.name || userData.email || 'User'}</Text>
          {userData.email && <Text style={styles.profileEmail}>{userData.email}</Text>}
          {(userData.age || userData.gender) && (
            <View style={styles.userInfoRow}>
              {userData.age && <Text style={styles.userInfoText}>{userData.age} years old</Text>}
              {userData.age && userData.gender && <Text style={styles.userInfoSeparator}>•</Text>}
              {userData.gender && (
                <Text style={styles.userInfoText}>
                  {userData.gender === 'male' ? 'Male' : userData.gender === 'female' ? 'Female' : 'Prefer not to say'}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Settings & Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings & Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingItem} onPress={() => setActiveScreen('app')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="settings-outline" size={22} color="#a259ff" />
            </View>
            <Text style={styles.settingText}>App Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setActiveScreen('health')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="fitness-outline" size={22} color="#a259ff" />
            </View>
            <Text style={styles.settingText}>Health Data Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setActiveScreen('privacy')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#a259ff" />
            </View>
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Support / About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & About</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingItem} onPress={() => setActiveScreen('help')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={22} color="#a259ff" />
            </View>
            <Text style={styles.settingText}>Help & FAQ</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setActiveScreen('contact')}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="mail-outline" size={22} color="#a259ff" />
            </View>
            <Text style={styles.settingText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={confirmLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ff4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

