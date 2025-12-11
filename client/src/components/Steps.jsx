import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { Footprints } from "lucide-react";

import {
  ArrowPathIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';

const Step = () => {
  const { backendUrl } = useContext(AppContext);
  const [stepData, setStepData] = useState({
    totalSteps: 0,
    averageSteps: 0,
    trend: 'neutral',
    trendValue: '0 steps',
    trendLabel: 'No data available',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStepData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching sleep data from:', `${backendUrl}/api/sleepSession/stats`);
      const response = await axios.get(`${backendUrl}/api/step/stats`, {
        withCredentials: true,
        timeout: 10000,
      });

      if (response.data.success) {
        const data = response.data.data;

        let trend = 'neutral';
        let trendValue = '0 steps';
        let trendLabel = 'No trend data';

        if (data.recordCount > 1) {
          const todaySteps = data.totalSteps;
          const yesterdaySteps = data.previousAverageSteps || 0;

          const difference = todaySteps - yesterdaySteps;
          if (difference > 0) {
            trend = 'up';
            trendValue = `+${difference} steps`;
            trendLabel = 'More active than yesterday';
          } else if (difference < 0) {
            trend = 'down';
            trendValue = `${Math.abs(difference)} steps`;
            trendLabel = 'Less active than yesterday';
          } else {
            trendLabel = 'Same as yesterday';
          }
        }

        setStepData({
          ...data,
          trend,
          trendValue,
          trendLabel,
        });

        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch step data');
      }
    } catch (err) {
      console.error('Step fetch error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out');
      } else if (err.response?.status === 401) {
        setError('Authentication required');
      } else if (err.response?.status === 404) {
        setError('Step data not found');
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStepData();
    const interval = setInterval(fetchStepData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const handleRefresh = () => {
    fetchStepData();
  };

  if (loading && !stepData.totalSteps) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mx-auto bg-gray-900/95 rounded-2xl p-4 sm:p-6 border border-gray-800/50 backdrop-blur-xl animate-pulse"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="w-12 h-12 bg-gray-700/50 rounded-xl"></div>
          <div className="w-20 h-8 bg-gray-700/50 rounded-full self-end sm:self-auto"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
          <div className="w-16 h-8 bg-gray-700/50 rounded"></div>
          <div className="w-32 h-3 bg-gray-700/50 rounded"></div>
        </div>
      </motion.div>
    );
  }

  if (error && !stepData.totalSteps) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mx-auto bg-gray-900/95 rounded-2xl p-4 sm:p-6 border border-red-800/50 backdrop-blur-xl"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <CursorArrowRaysIcon className="w-6 h-6 text-red-400" />
            <div>
              <div className="text-red-400 text-sm font-medium">Step Data</div>
              <div className="text-red-300 text-xs">{error}</div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50 self-end sm:self-auto"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto bg-gray-900/95 rounded-2xl p-4 sm:p-6 border border-gray-800/50 backdrop-blur-xl"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
          <Footprints className="w-6 h-6 text-blue-400" />
        </div>

        {/* Trend pill aligned with SleepSession style */}
        <div className="flex items-center sm:justify-end w-full">
          {stepData.trend !== 'neutral' && (
            <div
              className={`inline-flex items-center ${
                stepData.trend === 'up' ? 'text-green-500' : 'text-red-500'
              } bg-gray-900/50 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm`}
            >
              <span className="font-medium">{stepData.trendValue}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-gray-400 text-xs sm:text-sm mb-1">Total Steps</div>
        <div className="text-2xl sm:text-3xl text-white font-light">
          {stepData.totalSteps} steps
        </div>
        <div className="text-xs sm:text-sm text-gray-400 mt-1">
          Average: {stepData.averageSteps} steps
        </div>
        {stepData.trendLabel && (
          <div className="text-xs sm:text-sm text-gray-400 mt-1">
            {stepData.trendLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Step;
