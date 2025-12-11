import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './styles';

interface HealthDataSettingsProps {
  onBack: () => void;
}

export default function HealthDataSettings({ onBack }: HealthDataSettingsProps) {
  const router = useRouter();

  const handleOpenHealthConnect = async () => {
    try {
      // Try to open Health Connect app
      const url = 'content://com.google.android.apps.healthdata';
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Health Connect',
          'Please install Health Connect from the Play Store to manage health data permissions.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open Health Connect settings.');
    }
  };

  const handleSyncSettings = () => {
    Alert.alert(
      'Sync Settings',
      'Configure how often your health data syncs with the server.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Health Data Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.screenContent} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingItem} onPress={handleOpenHealthConnect}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="fitness-outline" size={22} color="#a259ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>Manage Permissions</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                Open Health Connect to manage data permissions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleSyncSettings}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="sync-outline" size={22} color="#a259ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>Sync Settings</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                Configure data synchronization frequency
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => router.push('/setupHealthPerm')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="settings-outline" size={22} color="#a259ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>Setup Health Connect</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                Initial setup and permission configuration
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

