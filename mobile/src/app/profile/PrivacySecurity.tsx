import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import styles from './styles';

interface PrivacySecurityProps {
  onBack: () => void;
}

export default function PrivacySecurity({ onBack }: PrivacySecurityProps) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleViewPrivacyPolicy = () => {
    setShowPrivacyModal(true);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support to delete your account.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Privacy & Security</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.screenContent} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingItem} onPress={handleViewPrivacyPolicy}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="document-text-outline" size={22} color="#a259ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>Privacy Policy</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                Read our privacy policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="shield-outline" size={22} color="#a259ff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingText}>Data Export</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                Download your health data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { borderColor: '#ff4444', borderWidth: 1 }]}>
          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="trash-outline" size={22} color="#ff4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingText, { color: '#ff4444' }]}>Delete Account</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                Permanently delete your account and all data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <View style={{ flex: 1, backgroundColor: '#1a1a2e', marginTop: 60, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', flex: 1 }}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              <Text style={{ color: '#fff', fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
                Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal data when you use our app.
              </Text>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
                1. Information We Collect
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginBottom: 8 }}>
                We may collect:
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Health Data: sleep patterns, heart rate, activity levels
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Personal Info: name, age, email (if you register)
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 16 }}>
                • Device Data: app usage, device type, app version
              </Text>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
                2. How We Use Your Data
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginBottom: 8 }}>
                We use your data to:
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Provide personalized insights and trends
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Predict sleep patterns and track health improvements
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Improve app performance and features
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 16 }}>
                • Send important notifications (optional)
              </Text>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
                3. Data Sharing
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginBottom: 8 }}>
                We do not sell your data. Your data may be shared only:
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Anonymized for analytics to improve our services
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 16 }}>
                • If legally required
              </Text>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
                4. Your Rights
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginBottom: 8 }}>
                You can:
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Access your data anytime
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Download or export your data
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 4 }}>
                • Delete your account and all associated data
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginLeft: 16, marginBottom: 16 }}>
                • Adjust privacy settings in the app
              </Text>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
                5. Security
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginBottom: 16 }}>
                We use industry-standard security measures to protect your data. Sensitive information is encrypted and stored securely.
              </Text>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
                6. Changes to This Policy
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginBottom: 16 }}>
                We may update this policy occasionally. You will be notified of significant changes through the app.
              </Text>

              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
                7. Contact Us
              </Text>
              <Text style={{ color: '#aaa', fontSize: 16, lineHeight: 24, marginBottom: 8 }}>
                For questions about your privacy or data, contact us at:
              </Text>
              <Text style={{ color: '#a259ff', fontSize: 16, lineHeight: 24, marginBottom: 40 }}>
                Email: somniateam1@gmail.com
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

