import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';

interface AppSettingsProps {
  onBack: () => void;
}

export default function AppSettings({ onBack }: AppSettingsProps) {
  const { isDarkMode, setDarkMode } = useThemeStore();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    // Load notification preference
    AsyncStorage.getItem('notifications_enabled').then((value) => {
      if (value !== null) {
        setNotifications(value === 'true');
      }
    });
  }, []);

  const handleNotificationsChange = async (value: boolean) => {
    setNotifications(value);
    await AsyncStorage.setItem('notifications_enabled', value.toString());
  };

  const handleDarkModeChange = (value: boolean) => {
    setDarkMode(value);
    // Theme will be applied globally through the store
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>App Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.screenContent} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications-outline" size={22} color="#a259ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>Push Notifications</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                Receive notifications about your health data
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: '#767577', true: '#a259ff' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="moon-outline" size={22} color="#a259ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>Dark Mode</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                Use dark theme throughout the app
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeChange}
              trackColor={{ false: '#767577', true: '#a259ff' }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

