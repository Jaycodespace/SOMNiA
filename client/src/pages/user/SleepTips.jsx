import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MoonIcon,
  SunIcon,
  BeakerIcon,
  HeartIcon,
  BookOpenIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

import Sidebar from '../../components/sidebar.jsx'; // adjust path if needed

const SleepTips = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Tips', icon: LightBulbIcon },
    { id: 'routine', name: 'Bedtime Routine', icon: MoonIcon },
    { id: 'environment', name: 'Sleep Environment', icon: SunIcon },
    { id: 'habits', name: 'Healthy Habits', icon: HeartIcon },
    { id: 'science', name: 'Sleep Science', icon: BeakerIcon },
  ];

  const tips = [
    // Bedtime Routine Tips
    {
      id: 1,
      category: 'routine',
      title: 'Consistent Sleep Schedule',
      description:
        "Go to bed and wake up at the same time every day, even on weekends. This helps regulate your body's internal clock.",
      icon: MoonIcon,
    },
    {
      id: 2,
      category: 'routine',
      title: 'Wind-Down Routine',
      description:
        "Create a relaxing 30-60 minute routine before bed. Try reading, gentle stretching, or meditation to signal your body it's time to sleep.",
      icon: MoonIcon,
    },
    {
      id: 3,
      category: 'routine',
      title: 'Avoid Late Naps',
      description:
        'If you must nap, keep it under 20 minutes and before 3 PM. Late or long naps can interfere with nighttime sleep.',
      icon: MoonIcon,
    },
    {
      id: 4,
      category: 'routine',
      title: 'Progressive Muscle Relaxation',
      description:
        'Practice tensing and relaxing each muscle group from your toes to your head. This technique helps release physical tension before sleep.',
      icon: MoonIcon,
    },
    // Sleep Environment Tips
    {
      id: 5,
      category: 'environment',
      title: 'Optimal Room Temperature',
      description:
        'Keep your bedroom temperature between 60-67°F (15-19°C) for optimal sleep conditions.',
      icon: SunIcon,
    },
    {
      id: 6,
      category: 'environment',
      title: 'Dark Sleep Environment',
      description:
        'Use blackout curtains or an eye mask to block out light. Even small amounts of light can disrupt your sleep cycle.',
      icon: SunIcon,
    },
    {
      id: 7,
      category: 'environment',
      title: 'Comfortable Mattress & Pillows',
      description:
        'Invest in a supportive mattress and comfortable pillows. Replace your mattress every 7-10 years and pillows every 1-2 years.',
      icon: SunIcon,
    },
    {
      id: 8,
      category: 'environment',
      title: 'Minimize Noise',
      description:
        'Use earplugs, a white noise machine, or a fan to mask disruptive sounds. Consistent, gentle sounds can actually promote better sleep.',
      icon: SunIcon,
    },
    // Healthy Habits Tips
    {
      id: 9,
      category: 'habits',
      title: 'Avoid Screen Time',
      description:
        'Stop using electronic devices at least 1 hour before bedtime to reduce blue light exposure.',
      icon: HeartIcon,
    },
    {
      id: 10,
      category: 'habits',
      title: 'Watch Your Diet',
      description:
        'Avoid large meals, caffeine, and alcohol close to bedtime. Stop eating 2-3 hours before sleep and limit caffeine after 2 PM.',
      icon: HeartIcon,
    },
    {
      id: 11,
      category: 'habits',
      title: 'Regular Exercise',
      description:
        'Exercise regularly, but not within 3-4 hours of bedtime. Physical activity can improve sleep quality and help you fall asleep faster.',
      icon: HeartIcon,
    },
    {
      id: 12,
      category: 'habits',
      title: 'Morning Sunlight',
      description:
        'Get 15-30 minutes of natural sunlight within the first hour of waking. This helps regulate your circadian rhythm and improve nighttime sleep.',
      icon: HeartIcon,
    },
    // Sleep Science Tips
    {
      id: 13,
      category: 'science',
      title: 'Sleep Cycles',
      description:
        'Understanding your sleep cycles can help you wake up feeling more refreshed. Each cycle lasts about 90 minutes.',
      icon: BeakerIcon,
    },
    {
      id: 14,
      category: 'science',
      title: 'Circadian Rhythm',
      description:
        "Your body's internal clock regulates sleep-wake cycles. Consistent light exposure and timing help maintain this natural rhythm.",
      icon: BeakerIcon,
    },
    {
      id: 15,
      category: 'science',
      title: 'Sleep Debt',
      description:
        'Lost sleep accumulates as "sleep debt." While you can\'t fully make up lost sleep, consistent good sleep habits help your body recover.',
      icon: BeakerIcon,
    },
    {
      id: 16,
      category: 'science',
      title: 'REM and Deep Sleep',
      description:
        'Both REM and deep sleep stages are crucial. Deep sleep restores your body, while REM sleep consolidates memories and emotions.',
      icon: BeakerIcon,
    },
  ];

  const filteredTips =
    selectedCategory === 'all'
      ? tips
      : tips.filter((tip) => tip.category === selectedCategory);

  const TipCard = ({ tip }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 rounded-xl p-5 sm:p-6 border border-gray-800/50"
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <tip.icon className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg text-white font-light mb-2">
            {tip.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {tip.description}
          </p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0A1628] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content: padded away from sidebar, scrollable */}
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
        {/* Background gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />

        <div className="relative max-w-5xl w-full mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 bg-blue-500/10 rounded-full mb-4"
            >
              <BookOpenIcon className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-blue-400 text-sm">
                Sleep Better Tonight
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl sm:text-3xl font-light text-white mb-3 sm:mb-4"
            >
              Personalized Sleep Tips
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto"
            >
              Discover science-backed recommendations to improve your sleep
              quality and wake up feeling refreshed.
            </motion.p>
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

          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-4">
            {filteredTips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepTips;
