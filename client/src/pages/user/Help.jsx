import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

import Sidebar from '../../components/sidebar.jsx'; // Adjust path if needed

const Help = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'general', name: 'General', icon: QuestionMarkCircleIcon },
    { id: 'tracking', name: 'Sleep Tracking', icon: DocumentTextIcon },
    { id: 'technical', name: 'Technical', icon: VideoCameraIcon },
    { id: 'account', name: 'Account', icon: ChatBubbleLeftRightIcon },
  ];

  const faqs = {
    general: [
      {
        id: 1,
        question: 'How does SOMNiA track my sleep?',
        answer:
          'SOMNiA uses data from your connected devices to monitor your sleep patterns, including duration, quality, and cycles. We analyze metrics like heart rate, movement, and breathing patterns to provide comprehensive sleep insights.',
      },
      {
        id: 2,
        question: 'What devices are compatible with SOMNiA?',
        answer:
          'SOMNiA is compatible with most major smartwatches and fitness trackers, including Apple Watch, Fitbit, and Garmin devices.',
      },
      {
        id: 3,
        question: 'Is SOMNiA free to use?',
        answer:
          'SOMNiA offers both free and premium tiers. The free version includes basic sleep tracking and insights. Premium features include advanced analytics, personalized coaching, and detailed sleep reports.',
      },
      {
        id: 4,
        question: 'How do I get started with SOMNiA?',
        answer:
          'After creating your account, complete your sleep profile with your goals and preferences. Connect your device through Settings > Connected Devices, and wear it while sleeping to start tracking.',
      },
      {
        id: 6,
        question: 'Can I use SOMNiA without a wearable device?',
        answer:
          'While wearable devices provide the most accurate data, you can still use SOMNiA to log sleep manually, access our library of sleep tips, and track your sleep goals and habits.',
      },
    ],

    tracking: [
      {
        id: 7,
        question: 'How accurate is the sleep tracking?',
        answer:
          'Our sleep tracking accuracy is typically above 90% when compared to clinical sleep studies. The accuracy depends on wearing your device properly and maintaining good contact with your skin.',
      },
      {
        id: 8,
        question: 'What metrics are tracked during sleep?',
        answer:
          'We track multiple metrics including sleep duration, sleep stages (light, deep, REM), heart rate variability, breathing rate, movement patterns, and environmental factors like room temperature.',
      },
      {
        id: 9,
        question: 'Why does my sleep data sometimes seem inaccurate?',
        answer:
          'Inaccuracies can occur due to loose device fit, low battery, movement during awake periods, or sleeping with pets/partners. Ensure your device is snug but comfortable and has adequate battery.',
      },
      {
        id: 10,
        question: 'How long does it take to see sleep patterns?',
        answer:
          "You'll start seeing basic insights after your first night, but meaningful patterns and trends typically emerge after 7-14 days of consistent tracking.",
      },
      {
        id: 11,
        question: 'Can I edit or delete incorrect sleep data?',
        answer:
          'Yes, you can manually edit sleep times or delete incorrect entries in your sleep history. Go to Sleep History > Select Date > Edit Entry to make corrections.',
      },
      {
        id: 12,
        question: 'What if I forget to wear my device?',
        answer:
          'You can manually log your sleep by going to Sleep Log > Add Manual Entry. While not as detailed as device data, it helps maintain your sleep tracking consistency.',
      },
    ],

    technical: [
      {
        id: 13,
        question: 'How do I sync my device with SOMNiA?',
        answer:
          'Go to Settings > Connected Devices and follow the on-screen instructions to pair your device. Make sure Bluetooth is enabled on both your phone and tracking device.',
      },
      {
        id: 14,
        question: "My device won't sync. What should I do?",
        answer:
          'First, check that Bluetooth is enabled and your device is charged. Try restarting both devices, ensure you’re within Bluetooth range, and check if your device needs a firmware update.',
      },
      {
        id: 15,
        question: 'How often does data sync?',
        answer:
          'Data typically syncs automatically when you open the app, or you can manually sync by pulling down on the dashboard. Most devices sync data every 15-30 minutes when connected.',
      },
      {
        id: 16,
        question: 'Can I export my sleep data?',
        answer:
          'Premium users can export their data in CSV or PDF format. Go to Settings > Data Export to download your sleep history, trends, and insights.',
      },
      {
        id: 17,
        question: 'Is my data secure and private?',
        answer:
          'Yes, all data is encrypted in transit and at rest. You can review our privacy policy for more details.',
      },
    ],

    account: [
      {
        id: 19,
        question: 'How do I change my sleep goals?',
        answer:
          'You can adjust your sleep goals in the Profile section. Navigate to Profile > Sleep Preferences to customize your target sleep duration and schedule.',
      },
      {
        id: 20,
        question: 'How do I reset my password?',
        answer:
          'On the login screen, tap "Forgot Password" and enter your email. A reset link will be sent. You can also change your password under Profile > Account Settings.',
      },
      {
        id: 24,
        question: 'What happens to my data if I delete my account?',
        answer:
          'All your personal data and sleep history will be permanently deleted within 30 days. You can export your data beforehand if needed.',
      },
      {
        id: 25,
        question: 'Can I use the same account on multiple devices?',
        answer:
          'Yes, SOMNiA syncs your data across all devices where you are signed in.',
      },
    ],
  };

  const ContactCard = ({ icon: Icon, title, value, action, actionLabel }) => (
    <div className="bg-gray-900/50 rounded-xl p-5 sm:p-6 border border-gray-800/50">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg text-white font-light">
            {title}
          </h3>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">{value}</p>
          <button
            onClick={action}
            className="mt-3 sm:mt-4 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-xs sm:text-sm"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A1628] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content: padded from sidebar, scrollable */}
      <div
        className="
          flex-1 relative
          pl-20 pr-3           /* mobile: room for sidebar */
          sm:pl-24 sm:pr-6     /* tablet */
          lg:pl-28 lg:pr-10    /* desktop */
          py-4 sm:py-8
          overflow-y-auto
        "
      >
        {/* Background effect */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />

        <div className="relative max-w-5xl w-full mx-auto space-y-8 sm:space-y-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-light text-white mb-2">
              Help &amp; Support
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Find answers to common questions and get support anytime.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 border text-xs sm:text-sm ${
                  selectedCategory === category.id
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-gray-900/50 text-gray-400 hover:bg-gray-900/70 border-gray-800/50'
                }`}
              >
                <category.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            {faqs[selectedCategory].map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                  }
                  className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 text-left hover:bg-gray-900/70 transition-colors"
                >
                  <span className="text-white font-light text-sm sm:text-base">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      expandedFaq === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedFaq === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-400 text-xs sm:text-sm leading-relaxed border-t border-gray-800/30"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-10 pb-4">
            <ContactCard
              icon={EnvelopeIcon}
              title="Email Support"
              value="Get help via email with our support team"
              action={() => (window.location.href = 'mailto:support@somnia.com')}
              actionLabel="Send Email"
            />
            <ContactCard
              icon={PhoneIcon}
              title="Phone Support"
              value="Speak directly with our support team"
              action={() => (window.location.href = 'tel:+1234567890')}
              actionLabel="Call Now"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
  