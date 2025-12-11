import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import styles from './styles';

interface HelpFAQProps {
  onBack: () => void;
}

const faqs = [
  {
    question: 'How do I connect my health device?',
    answer: 'Go to Health Data Settings and tap "Manage Permissions" to connect Health Connect. Then grant permissions for the health data types you want to track.',
  },
  {
    question: 'How often does my data sync?',
    answer: 'Your health data syncs automatically when you open the app. You can also manually sync by tapping the sync button on the home screen.',
  },
  {
    question: 'Can I export my health data?',
    answer: 'Yes, you can export your health data from Privacy & Security settings. This will download all your health records in a standard format.',
  },
  {
    question: 'How do I change my sleep goals?',
    answer: 'Sleep goals can be adjusted in the Sleep Analysis screen. Tap on your current goal to modify it.',
  },
  {
    question: 'What health data is tracked?',
    answer: 'We track sleep sessions, heart rate, steps, oxygen saturation, exercise sessions, and blood pressure (if available).',
  },
];

export default function HelpFAQ({ onBack }: HelpFAQProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Help & FAQ</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.screenContent} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingItem,
                index === faqs.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.settingText}>{faq.question}</Text>
                {expandedIndex === index && (
                  <Text style={{ color: '#aaa', fontSize: 14, marginTop: 8, lineHeight: 20 }}>
                    {faq.answer}
                  </Text>
                )}
              </View>
              <Ionicons
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

