import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import styles from './styles';

interface ContactSupportProps {
  onBack: () => void;
}

export default function ContactSupport({ onBack }: ContactSupportProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all fields',
      });
      return;
    }

    const email = 'somniaateam1@gmail.com';
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoLink);
      if (canOpen) {
        await Linking.openURL(mailtoLink);
      } else {
        Alert.alert(
          'Email',
          `Please send an email to ${email} with:\n\nSubject: ${subject}\n\nMessage: ${message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email client.');
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Contact Support</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.screenContent} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={{ color: '#aaa', fontSize: 14, marginBottom: 8 }}>Subject</Text>
          <TextInput
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 12,
              color: '#fff',
              fontSize: 16,
              marginBottom: 16,
            }}
            value={subject}
            onChangeText={setSubject}
            placeholder="What can we help you with?"
            placeholderTextColor="#666"
          />

          <Text style={{ color: '#aaa', fontSize: 14, marginBottom: 8 }}>Message</Text>
          <TextInput
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: 12,
              color: '#fff',
              fontSize: 16,
              minHeight: 120,
              textAlignVertical: 'top',
            }}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue or question..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
          />

          <TouchableOpacity
            style={{
              backgroundColor: '#a259ff',
              borderRadius: 8,
              padding: 16,
              alignItems: 'center',
              marginTop: 20,
            }}
            onPress={handleSendEmail}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Send Message
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Other Ways to Reach Us
          </Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="mail-outline" size={22} color="#a259ff" />
            </View>
            <Text style={styles.settingText}>somniateam1@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="call-outline" size={22} color="#a259ff" />
            </View>
            <Text style={styles.settingText}>+63 994 790 9670</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

