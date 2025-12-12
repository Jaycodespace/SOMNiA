import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

import {
  HeartIcon,
  ClockIcon,
  ChartBarIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const QuickAction = ({ icon: Icon, label, value, onClick, isActive = false }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full rounded-2xl border transition-all duration-200
      ${
        isActive
          ? 'bg-blue-500/20 border-blue-500/40'
          : 'bg-gray-900/70 border-gray-800 hover:bg-gray-900/90 hover:border-blue-500/30'
      }
      flex items-center sm:items-start gap-4 px-4 py-3 sm:px-5 sm:py-4
    `}
  >
    <div
      className={`flex items-center justify-center rounded-xl
        ${isActive ? 'bg-blue-500/20' : 'bg-blue-500/10'}
        w-10 h-10 sm:w-12 sm:h-12
      `}
    >
      <Icon
        className={`w-5 h-5 sm:w-6 sm:h-6 ${
          isActive ? 'text-blue-400' : 'text-blue-300'
        }`}
      />
    </div>

    <div className="flex-1 text-left">
      <p className="text-[11px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
        {label}
      </p>
      <p className="text-sm sm:text-base font-medium text-white leading-snug">
        {value}
      </p>
    </div>
  </motion.button>
);

const DashboardCard = ({ onActionClick, activeView = 'health' }) => {
  const { userData } = useContext(AppContext);

  const quickActions = [
    {
      icon: HeartIcon,
      label: 'Health Overview',
      value: 'View Patient Vitals',
      onClick: () => onActionClick('health'),
      id: 'health',
    },
    {
      icon: ClockIcon,
      label: 'Sleep History',
      value: 'Sleep Pattern Analysis',
      onClick: () => onActionClick('sleep'),
      id: 'sleep',
    },
    {
      icon: ChartBarIcon,
      label: 'Statistics',
      value: 'View Sleep Metrics',
      onClick: () => onActionClick('statistics'),
      id: 'statistics',
    },
    {
      icon: BeakerIcon,
      label: 'AI Prediction',
      value: 'Sleep Insomnia Prediction',
      onClick: () => onActionClick('prediction'),
      id: 'prediction',
    },
  ];

  return (
    <div className="w-full">
      {/* card stretches nicely, but is centered and has a max width on big screens */}
      <div className="w-full max-w-7xl mx-auto bg-gray-900/95 rounded-2xl border border-gray-800/60 backdrop-blur-xl shadow-lg">
        {/* Greeting */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-gray-800/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="text-left">
              <h2 className="text-lg sm:text-2xl text-white font-light mb-1 sm:mb-2">
                {getGreeting()}, {userData.name}
              </h2>
              <p className="text-[12px] sm:text-sm text-gray-400 leading-relaxed">
                Your daily health insights are ready. Let&apos;s take a moment to
                see how you&apos;re progressing today.
              </p>
            </div>

            <div className="inline-flex items-center self-start md:self-auto gap-2 bg-green-500/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[11px] sm:text-xs font-medium text-green-400">
                System Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <QuickAction
                key={action.id}
                icon={action.icon}
                label={action.label}
                value={action.value}
                onClick={action.onClick}
                isActive={activeView === action.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
