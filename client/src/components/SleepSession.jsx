import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import {
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const SleepSession = () => {
  const { backendUrl } = useContext(AppContext);
  const [sleepData, setSleepData] = useState({
    latestSessionMinutes: 0,
    latestSessionHours: 0,
    sessionStartTime: null,
    sessionEndTime: null,
    trend: 'neutral',
    trendValue: '0h 0m',
    trendLabel: 'No data available'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSleepData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching latest sleep session from:', `${backendUrl}/api/sleepSession/latest`);
      
      // Try latest session endpoint first, fallback to regular stats if needed
      let response;
      try {
        response = await axios.get(`${backendUrl}/api/sleepSession/latest`, {
          withCredentials: true,
          timeout: 10000
        });
      } catch (latestError) {
        console.log('Latest session endpoint not available, using regular stats:', latestError.message);
        // Fallback to regular stats endpoint
        response = await axios.get(`${backendUrl}/api/sleepSession/stats`, {
          withCredentials: true,
          timeout: 10000
        });
      }
      
      console.log('Sleep API response:', response.data);
      
      if (response.data.success) {
        console.log('Setting sleep data:', response.data.data);
        const data = response.data.data;
        
        // Process data for latest session view
        const processedData = processLatestSessionData(data);
        
        // Calculate trend based on latest session sleep duration
        const trendInfo = calculateLatestSessionTrend(processedData);
        
        setSleepData({
          ...processedData,
          ...trendInfo
        });
        setLastUpdated(new Date());
      } else {
        console.log('API returned success: false');
        setError('Failed to fetch sleep data');
      }
    } catch (err) {
      console.error('Error fetching sleep data:', err);
      console.log('Error response:', err.response?.data);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out');
      } else if (err.response?.status === 401) {
        setError('Authentication required');
      } else if (err.response?.status === 404) {
        setError('Sleep data not found');
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setLoading(false);
    }
  };

  const processLatestSessionData = (data) => {
    // If the API already provides latest session data, use it directly
    if (data.latestSessionMinutes !== undefined) {
      return {
        latestSessionMinutes: data.latestSessionMinutes,
        latestSessionHours: Math.floor(data.latestSessionMinutes / 60),
        sessionStartTime: data.sessionStartTime ? new Date(data.sessionStartTime) : null,
        sessionEndTime: data.sessionEndTime ? new Date(data.sessionEndTime) : null
      };
    }
    
    // If we have session data with duration
    if (data.sessionDuration !== undefined) {
      return {
        latestSessionMinutes: data.sessionDuration,
        latestSessionHours: Math.floor(data.sessionDuration / 60),
        sessionStartTime: data.startTime ? new Date(data.startTime) : null,
        sessionEndTime: data.endTime ? new Date(data.endTime) : null
      };
    }
    
    // Otherwise, assume the current data represents the latest session
    const sessionMinutes = data.totalSleepMinutes || 0;
    
    return {
      latestSessionMinutes: sessionMinutes,
      latestSessionHours: Math.floor(sessionMinutes / 60),
      sessionStartTime: null,
      sessionEndTime: null
    };
  };

  const calculateLatestSessionTrend = (data) => {
    if (data.latestSessionMinutes > 0) {
      const sessionHours = data.latestSessionMinutes / 60;
      
      // Determine trend based on latest session duration
      let trend = 'neutral';
      let trendLabel = '';
      
      if (sessionHours >= 7) {
        trend = 'up';
        trendLabel = 'Excellent sleep session';
      } else if (sessionHours >= 4) {
        trend = 'neutral';
        trendLabel = 'Good sleep session';
      } else if (sessionHours >= 1) {
        trend = 'down';
        trendLabel = 'Short sleep session';
      } else {
        trend = 'down';
        trendLabel = 'Very brief sleep';
      }
      
      return {
        trend,
        trendValue: formatSleepDuration(data.latestSessionMinutes),
        trendLabel: trendLabel
      };
    }
    return {
      trend: 'neutral',
      trendValue: '--',
      trendLabel: 'No recent sleep session'
    };
  };

  const formatSleepDuration = (minutes) => {
    if (minutes === 0) return '0h 0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatSessionTime = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    
    const start = startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const end = endTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${start} - ${end}`;
  };

  useEffect(() => {
    fetchSleepData();

    // Set up automatic refresh every 5 minutes
    const interval = setInterval(() => {
      fetchSleepData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  const handleRefresh = () => {
    fetchSleepData();
  };

  if (loading && !sleepData.latestSessionMinutes) {
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

  if (error && !sleepData.latestSessionMinutes) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl mx-auto bg-gray-900/95 rounded-2xl p-4 sm:p-6 border border-red-800/50 backdrop-blur-xl"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-red-400 text-sm font-medium">Latest Sleep Session</div>
              <div className="text-red-300 text-xs">{error}</div>
            </div>
          </div>
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
        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
          <ClockIcon className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex items-center sm:justify-end w-full">
          {sleepData.trend !== 'neutral' && (
            <div
              className={`inline-flex items-center ${
                sleepData.trend === 'up' ? 'text-green-500' : 'text-red-500'
              } bg-gray-900/50 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm`}
            >
              {sleepData.trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              <span className="font-medium">{sleepData.trendValue}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="text-gray-400 text-xs sm:text-sm mb-1">
          Latest Sleep Session Duration
        </div>
        <div className="text-2xl sm:text-3xl text-white font-light">
          {formatSleepDuration(sleepData.latestSessionMinutes)}
        </div>
        {sleepData.trendLabel && (
          <div className="text-xs sm:text-sm text-gray-400 mt-1">
            {sleepData.trendLabel}
          </div>
        )}
        {sleepData.sessionStartTime && (
          <div className="text-[11px] sm:text-xs text-gray-500 mt-2">
            Start:{' '}
            {sleepData.sessionStartTime.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        )}
        {sleepData.sessionEndTime && (
          <div className="text-[11px] sm:text-xs text-gray-500 mt-1">
            End:{' '}
            {sleepData.sessionEndTime.toLocaleDateString('en-US', { 
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

export default SleepSession;
