import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import {
  HeartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const HeartRate = () => {
  const { backendUrl } = useContext(AppContext);
  const [heartRateData, setHeartRateData] = useState({
    latestHeartRate: 0,
    latestTimestamp: null,
    trend: 'neutral',
    trendValue: '0 bpm',
    trendLabel: 'No data available'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHeartRateData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendUrl}/api/heartrate/stats`, {
        withCredentials: true,
        timeout: 10000,
      });

      if (response.data.success) {
        setHeartRateData(response.data.data);
      } else {
        setError('Failed to fetch heart rate data');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out');
      } else if (err.response?.status === 401) {
        setError('Authentication required');
      } else if (err.response?.status === 404) {
        setError('Heart rate data not found');
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeartRateData();
    const interval = setInterval(fetchHeartRateData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // ------------------ LOADING ------------------
  if (loading && !heartRateData.latestHeartRate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mx-auto bg-gray-900/95 rounded-2xl 
                   p-4 sm:p-6 border border-gray-800/50 backdrop-blur-xl animate-pulse"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="w-12 h-12 bg-gray-700/50 rounded-xl"></div>
          <div className="w-20 h-8 bg-gray-700/50 rounded-full"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
          <div className="w-16 h-8 bg-gray-700/50 rounded"></div>
          <div className="w-32 h-3 bg-gray-700/50 rounded"></div>
        </div>
      </motion.div>
    );
  }

  // ------------------ ERROR ------------------
  if (error && !heartRateData.latestHeartRate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mx-auto bg-gray-900/95 rounded-2xl 
                   p-4 sm:p-6 border border-red-800/50 backdrop-blur-xl"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <HeartIcon className="w-6 h-6 text-red-400" />
            <div>
              <div className="text-red-400 text-sm font-medium">Heart Rate Data</div>
              <div className="text-red-300 text-xs">{error}</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ------------------ MAIN CARD ------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto bg-gray-900/95 rounded-2xl 
                 p-4 sm:p-6 border border-gray-800/50 backdrop-blur-xl"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
          <HeartIcon className="w-6 h-6 text-blue-400" />
        </div>

        {heartRateData.trend !== 'neutral' && (
          <div
            className={`inline-flex items-center ${
              heartRateData.trend === 'up' ? 'text-green-500' : 'text-red-500'
            } bg-gray-900/50 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm`}
          >
            {heartRateData.trend === 'up' ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            <span className="font-medium">{heartRateData.trendValue}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-gray-400 text-xs sm:text-sm mb-1">Latest Heart Rate</div>
        <div className="text-2xl sm:text-3xl text-white font-light">
          {heartRateData.latestHeartRate} bpm
        </div>

        {heartRateData.trendLabel && (
          <div className="text-xs sm:text-sm text-gray-400 mt-1">
            {heartRateData.trendLabel}
          </div>
        )}

        {heartRateData.latestTimestamp && (
          <div className="text-[11px] sm:text-xs text-gray-500 mt-2">
            Recorded:{' '}
            {new Date(heartRateData.latestTimestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HeartRate;
