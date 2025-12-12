import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/sidebar.jsx';
import DashboardCard from '../components/DashboardCard';
import HeartRate from '../components/HeartRate.jsx';
import SleepSession from '../components/SleepSession.jsx';
import Step from '../components/Steps.jsx';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import Ai from '../components/ai.jsx';

import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// Create a context for refresh functionality
const RefreshContext = createContext();

const StatCard = ({ icon: Icon, title, value, trend, trendValue, trendLabel }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-xl"
  >
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      {trend && (
        <div
          className={`flex items-center ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          } bg-gray-900/50 px-3 py-1.5 rounded-full`}
        >
          {trend === 'up' ? (
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
          )}
          <span className="text-sm font-medium">{trendValue}</span>
        </div>
      )}
    </div>
    <div className="mt-4">
      <div className="text-gray-400 text-sm mb-1">{title}</div>
      <div className="text-2xl text-white font-light">{value}</div>
      {trendLabel && (
        <div className="text-sm text-gray-400 mt-1">{trendLabel}</div>
      )}
    </div>
  </motion.div>
);

const AIModelStatus = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900/95 rounded-2xl p-8 border border-gray-800/50 backdrop-blur-xl col-span-full"
  >
    <div className="flex items-center space-x-4 text-yellow-500 mb-6">
      <BeakerIcon className="w-8 h-8" />
      <h2 className="text-xl font-light">AI Prediction Model</h2>
    </div>
    <div className="flex items-center space-x-3 bg-yellow-500/10 p-4 rounded-xl">
      <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
      <p className="text-yellow-400">
        The AI prediction model is currently under development. This feature will be available soon.
      </p>
    </div>
  </motion.div>
);

/* ------------------------- SLEEP HISTORY VIEW ------------------------- */

const SleepHistoryView = () => {
  const { backendUrl } = useContext(AppContext);
  const [sleepHistory, setSleepHistory] = useState({
    averageSleepTime: 0,
    sleepEfficiency: 0,
    deepSleepHours: 0,
    recentSessions: [],
    weeklyPattern: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSleepHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch detailed sleep session data
      let response;
      try {
        response = await axios.get(`${backendUrl}/api/sleepSession/history`, {
          withCredentials: true,
          timeout: 15000,
        });
      } catch (detailedError) {
        // Fallback to basic stats if history endpoint doesn't exist
        response = await axios.get(`${backendUrl}/api/sleepSession/stats`, {
          withCredentials: true,
          timeout: 10000,
        });
      }

      if (response.data.success) {
        let calculatedHistory;

        if (response.data.data.sessions) {
          // Detailed history available
          calculatedHistory = calculateSleepHistory(response.data.data.sessions);
        } else {
          // Basic stats only
          calculatedHistory = calculateBasicHistory(response.data.data);
        }

        setSleepHistory(calculatedHistory);
        setLastUpdated(new Date());
      } else {
        setError('Unable to load sleep history');
      }
    } catch (err) {
      console.error('Error fetching sleep history:', err);
      setError('Unable to load sleep history');
    } finally {
      setLoading(false);
    }
  };

  const calculateSleepHistory = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return {
        averageSleepTime: 0,
        sleepEfficiency: 0,
        deepSleepHours: 0,
        recentSessions: [],
        weeklyPattern: [],
      };
    }

    // Sort sessions by date (most recent first)
    const sortedSessions = sessions.sort(
      (a, b) => new Date(b.startTime) - new Date(a.startTime)
    );

    // Get last 30 days of data for calculations
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSessions = sortedSessions.filter(
      (session) => new Date(session.startTime) >= thirtyDaysAgo
    );

    // Calculate average sleep time
    let totalSleepMinutes = 0;
    let totalDeepSleepMinutes = 0;
    let totalTimeInBed = 0;

    recentSessions.forEach((session) => {
      const sessionDuration = calculateSessionDuration(session); // hours
      const sessionMinutes = sessionDuration * 60;

      totalSleepMinutes += sessionMinutes;

      // Time in bed (from start to end)
      const timeInBed =
        (new Date(session.endTime) - new Date(session.startTime)) /
        (1000 * 60);
      totalTimeInBed += timeInBed;

      // Deep sleep if stages available
      if (session.stages && session.stages.length > 0) {
        const deepSleepStages = session.stages.filter(
          (stage) => stage.stage === 5
        ); // DEEP sleep
        deepSleepStages.forEach((stage) => {
          const deepSleepDuration =
            (new Date(stage.endTime) - new Date(stage.startTime)) /
            (1000 * 60);
          totalDeepSleepMinutes += deepSleepDuration;
        });
      } else {
        // Estimate deep sleep as 20% of total sleep if no stages
        totalDeepSleepMinutes += sessionMinutes * 0.2;
      }
    });

    const nightsCount = recentSessions.length;

    // Hours slept per night (avg)
    const averageSleepTime =
      nightsCount > 0 ? totalSleepMinutes / nightsCount / 60 : 0;
    const averageDeepSleep =
      nightsCount > 0 ? totalDeepSleepMinutes / nightsCount / 60 : 0;

    // 1) Bed efficiency = asleep / in bed (0–1)
    const bedEfficiency =
      totalTimeInBed > 0 ? totalSleepMinutes / totalTimeInBed : 0;

    // 2) Duration factor = how close you are to 8h target (0–1)
    const TARGET_HOURS = 8;
    const durationFactor =
      averageSleepTime >= TARGET_HOURS
        ? 1
        : averageSleepTime > 0
        ? averageSleepTime / TARGET_HOURS
        : 0;

    // Final “sleep efficiency” = bed efficiency × duration factor
    const sleepEfficiency = Math.round(bedEfficiency * durationFactor * 100);

    // Weekly pattern for last 7 calendar days
    const weeklyPattern = createWeeklyPattern(recentSessions);

    return {
      averageSleepTime: Math.round(averageSleepTime * 10) / 10,
      sleepEfficiency,
      deepSleepHours: Math.round(averageDeepSleep * 10) / 10,
      recentSessions: recentSessions.slice(0, 10), // Last 10 sessions
      weeklyPattern,
    };
  };

  const calculateBasicHistory = (basicData) => {
    const avgHoursPerSession =
      basicData.sessionCount > 0
        ? basicData.totalSleepHours / basicData.sessionCount
        : 0;

    const TARGET_HOURS = 8;
    // Assume in-bed ≈ asleep for basic summary
    const durationFactor =
      avgHoursPerSession >= TARGET_HOURS
        ? 1
        : avgHoursPerSession > 0
        ? avgHoursPerSession / TARGET_HOURS
        : 0;

    const sleepEfficiency = Math.round(durationFactor * 100);

    return {
      averageSleepTime: Math.round(avgHoursPerSession * 10) / 10,
      sleepEfficiency,
      deepSleepHours: Math.round(avgHoursPerSession * 0.22 * 10) / 10, // ~22% deep sleep
      recentSessions: [],
      weeklyPattern: [],
    };
  };

  const calculateSessionDuration = (session) => {
    if (session.stages && session.stages.length > 0) {
      return session.stages.reduce((total, stage) => {
        const duration =
          (new Date(stage.endTime) - new Date(stage.startTime)) /
          (1000 * 60 * 60);
        return total + duration;
      }, 0);
    } else {
      return (
        (new Date(session.endTime) - new Date(session.startTime)) /
        (1000 * 60 * 60)
      );
    }
  };

  // Weekly pattern that sums ALL sessions per day (Sun–Sat)
  const createWeeklyPattern = (sessions) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const pattern = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];

      // All sessions that belong to this calendar day
      const sessionsForDay = sessions.filter((session) => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.toDateString() === date.toDateString();
      });

      let dayDuration = 0; // total hours of sleep for this day
      let qualitySum = 0;
      let qualityCount = 0;

      sessionsForDay.forEach((s) => {
        const d = calculateSessionDuration(s);
        dayDuration += d;

        const q = calculateSleepQuality(s);
        qualitySum += q;
        qualityCount += 1;
      });

      const avgQuality =
        qualityCount > 0 ? Math.round(qualitySum / qualityCount) : 0;

      pattern.push({
        day: dayName,
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        duration: dayDuration,
        quality: avgQuality,
      });
    }

    return pattern;
  };

  const calculateSleepQuality = (session) => {
    const duration = calculateSessionDuration(session);
    let quality = 50; // Base

    // Duration factor (7–9 hours optimal)
    if (duration >= 7 && duration <= 9) {
      quality += 30;
    } else if (duration >= 6 && duration <= 10) {
      quality += 15;
    } else {
      quality -= 20;
    }

    // Deep sleep factor (if stages available)
    if (session.stages && session.stages.length > 0) {
      const deepMs = session.stages
        .filter((stage) => stage.stage === 5)
        .reduce((sum, stage) => {
          return (
            sum +
            (new Date(stage.endTime) - new Date(stage.startTime))
          );
        }, 0);

      const deepSleepRatio =
        duration > 0 ? deepMs / (duration * 60 * 60 * 1000) : 0;

      if (deepSleepRatio > 0.15) quality += 20;
      else if (deepSleepRatio > 0.1) quality += 10;
    }

    return Math.min(100, Math.max(0, quality));
  };

  const formatSleepTime = (hours) => {
    if (hours === 0) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  React.useEffect(() => {
    fetchSleepHistory();

    const interval = setInterval(() => {
      fetchSleepHistory();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [backendUrl]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/95 rounded-2xl p-8 border border-gray-800/50 backdrop-blur-xl animate-pulse"
      >
        <div className="w-48 h-6 bg-gray-700/50 rounded mb-6"></div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800/50 p-4 rounded-xl">
                <div className="w-24 h-4 bg-gray-700/50 rounded mb-2"></div>
                <div className="w-16 h-6 bg-gray-700/50 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-[300px] bg-gray-800/50 rounded-xl"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <GlobalRefreshButton />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-sm text-gray-400">Average Sleep Time</div>
            <div className="text-xl text-white mt-1">
              {formatSleepTime(sleepHistory.averageSleepTime)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-sm text-gray-400">Sleep Efficiency</div>
            <div className="text-xl text-white mt-1">
              {sleepHistory.sleepEfficiency}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {sleepHistory.sleepEfficiency >= 85
                ? 'Excellent'
                : sleepHistory.sleepEfficiency >= 75
                ? 'Good'
                : 'Needs improvement'}
            </div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-sm text-gray-400">Deep Sleep</div>
            <div className="text-xl text-white mt-1">
              {formatSleepTime(sleepHistory.deepSleepHours)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Per night average</div>
          </div>
        </div>

        {/* Weekly Pattern Visualization (Sun–Sat bars) */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg text-white font-light mb-4">
            Weekly Sleep Pattern
          </h3>

          {sleepHistory.weeklyPattern.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-full sm:min-w-[560px]">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Y-axis labels */}
                  <div className="flex flex-row sm:flex-col justify-between text-[10px] text-gray-500 sm:h-32 sm:mt-2">
                    <span className="hidden sm:block">10h</span>
                    <span className="hidden sm:block">8h</span>
                    <span className="hidden sm:block">6h</span>
                    <span className="hidden sm:block">4h</span>
                    <span className="hidden sm:block">2h</span>
                    <span className="hidden sm:block">0h</span>
                    {/* Mobile compact label */}
                    <span className="sm:hidden text-xs">Hours of sleep</span>
                  </div>

                  {/* Bars */}
                  <div className="flex-1">
                    <div className="flex items-end gap-3 h-32">
                      {sleepHistory.weeklyPattern.map((day) => {
                        const maxHours = 10;
                        const safeDuration = Math.max(
                          0,
                          Math.min(day.duration || 0, maxHours)
                        );
                        const durationHeight =
                          (safeDuration / maxHours) * 100; // %

                        const quality = Math.max(
                          0,
                          Math.min(day.quality || 0, 100)
                        );

                        return (
                          <div
                            key={day.day}
                            className="flex-1 flex flex-col items-center"
                          >
                            <div className="relative w-6 sm:w-8 h-full flex items-end justify-center">
                              {/* Duration bar (hours) */}
                              <div
                                className="w-full rounded-full bg-blue-500/50 hover:bg-blue-400 transition-all duration-300"
                                style={{
                                  height: `${durationHeight}%`,
                                  boxShadow:
                                    durationHeight > 0
                                      ? '0 0 8px rgba(59,130,246,0.5)'
                                      : 'none',
                                }}
                              />
                              {/* Quality bar (percentage) */}
                              <div
                                className="absolute bottom-0 rounded-full bg-emerald-400/80 opacity-90"
                                style={{
                                  width: '55%',
                                  height: `${quality}%`,
                                  boxShadow:
                                    quality > 0
                                      ? '0 0 6px rgba(16,185,129,0.6)'
                                      : 'none',
                                }}
                              />
                            </div>
                            <div className="mt-2 text-[11px] sm:text-xs text-gray-300 font-medium">
                              {day.day}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {day.duration > 0
                                ? formatSleepTime(day.duration)
                                : '—'}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {day.quality > 0 ? `${day.quality}%` : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-500/80" />
                        <span>Nightly duration</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-emerald-400/90" />
                        <span>Sleep quality</span>
                      </div>
                      <span className="text-gray-500">
                        Target: around 7–9 hours + stable quality across the
                        week.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Empty state
            <div className="flex items-center justify-center h-28 sm:h-40 px-4 text-center text-gray-400">
              <p className="text-sm sm:text-base leading-relaxed">
                No sleep pattern data available yet. Your recent sleep sessions
                will appear here once data is synced.
              </p>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        {sleepHistory.recentSessions.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg text-white font-light mb-4">
              Recent Sleep Sessions
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {sleepHistory.recentSessions.slice(0, 5).map((session, index) => (
                <div
                  key={session.id || index}
                  className="flex justify-between items-center py-2 border-b border-gray-700/30 last:border-b-0"
                >
                  <div>
                    <div className="text-sm text-white">
                      {new Date(session.startTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(session.startTime).toLocaleTimeString(
                        'en-US',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}{' '}
                      -{' '}
                      {new Date(session.endTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">
                      {formatSleepTime(calculateSessionDuration(session))}
                    </div>
                    <div className="text-xs text-gray-400">
                      Quality: {calculateSleepQuality(session)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-900/20 border border-red-800/50 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </motion.div>
  );
};

/* ------------------------- STATISTICS VIEW ------------------------- */

const StatisticsView = () => {
  const { backendUrl } = useContext(AppContext);
  const [statistics, setStatistics] = useState({
    weekly: {
      averageSleepScore: 0,
      sleepConsistency: 0,
      sleepDebt: 0,
      averageDuration: 0,
    },
    monthly: {
      qualityTrend: 0,
      deepSleepRatio: 0,
      averageLatency: 0,
      totalSessions: 0,
    },
    yearly: {
      bestMonth: 'N/A',
      worstMonth: 'N/A',
      yearProgress: 0,
      totalHours: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSleepStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get detailed stats, fallback to basic stats
      let response;
      try {
        response = await axios.get(
          `${backendUrl}/api/sleepSession/detailed-stats`,
          {
            withCredentials: true,
            timeout: 10000,
          }
        );
      } catch (detailedError) {
        response = await axios.get(`${backendUrl}/api/sleepSession/stats`, {
          withCredentials: true,
          timeout: 10000,
        });
      }

      if (response.data.success) {
        let calculatedStats;

        if (response.data.data.sessions) {
          // Detailed stats available
          calculatedStats = calculateStatistics(response.data.data.sessions);
        } else {
          // Basic stats only
          calculatedStats = calculateBasicStatistics(response.data.data);
        }

        setStatistics(calculatedStats);
        setLastUpdated(new Date());
      } else {
        setError('Unable to load sleep statistics');
      }
    } catch (err) {
      console.error('Error fetching sleep statistics:', err);
      setError('Unable to load sleep statistics');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return {
        weekly: {
          averageSleepScore: 0,
          sleepConsistency: 0,
          sleepDebt: 0,
          averageDuration: 0,
        },
        monthly: {
          qualityTrend: 0,
          deepSleepRatio: 0,
          averageLatency: 0,
          totalSessions: 0,
        },
        yearly: {
          bestMonth: 'N/A',
          worstMonth: 'N/A',
          yearProgress: 0,
          totalHours: 0,
        },
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const weeklySessions = sessions.filter(
      (s) => new Date(s.startTime) >= oneWeekAgo
    );
    const monthlySessions = sessions.filter(
      (s) => new Date(s.startTime) >= oneMonthAgo
    );
    const yearlySessions = sessions.filter(
      (s) => new Date(s.startTime) >= oneYearAgo
    );

    return {
      weekly: calculateWeeklyStats(weeklySessions),
      monthly: calculateMonthlyStats(monthlySessions),
      yearly: calculateYearlyStats(yearlySessions),
    };
  };

  const calculateBasicStatistics = (basicData) => {
    const avgHoursPerSession =
      basicData.sessionCount > 0
        ? basicData.totalSleepHours / basicData.sessionCount
        : 0;

    return {
      weekly: {
        averageSleepScore: Math.min(
          100,
          Math.max(0, Math.round(avgHoursPerSession * 12.5))
        ),
        sleepConsistency:
          basicData.sessionCount >= 7
            ? 85
            : Math.round(basicData.sessionCount * 12),
        sleepDebt: Math.round((8 - avgHoursPerSession) * 10) / 10,
        averageDuration: Math.round(avgHoursPerSession * 10) / 10,
      },
      monthly: {
        qualityTrend:
          avgHoursPerSession > 7 ? 5 : avgHoursPerSession > 6 ? 0 : -3,
        deepSleepRatio: Math.round(avgHoursPerSession * 3),
        averageLatency: Math.max(
          5,
          Math.round(20 - avgHoursPerSession * 2)
        ),
        totalSessions: basicData.sessionCount,
      },
      yearly: {
        bestMonth: basicData.sessionCount > 0 ? 'Current' : 'N/A',
        worstMonth: 'N/A',
        yearProgress: basicData.totalSleepHours > 0 ? 15 : 0,
        totalHours: Math.round(basicData.totalSleepHours),
      },
    };
  };

  const calculateSessionDuration = (session) => {
    if (session.stages && session.stages.length > 0) {
      return session.stages.reduce((total, stage) => {
        const duration =
          (new Date(stage.endTime) - new Date(stage.startTime)) /
          (1000 * 60 * 60);
        return total + duration;
      }, 0);
    } else {
      return (
        (new Date(session.endTime) - new Date(session.startTime)) /
        (1000 * 60 * 60)
      );
    }
  };

  const calculateWeeklyStats = (sessions) => {
    if (sessions.length === 0) {
      return {
        averageSleepScore: 0,
        sleepConsistency: 0,
        sleepDebt: 0,
        averageDuration: 0,
      };
    }

    let totalDuration = 0;
    const sleepTimes = [];

    sessions.forEach((session) => {
      const duration = calculateSessionDuration(session);
      totalDuration += duration;
      sleepTimes.push(new Date(session.startTime).getHours());
    });

    const avgDuration = totalDuration / sessions.length;
    const sleepScore = Math.min(
      100,
      Math.max(0, Math.round(avgDuration * 12.5))
    );
    const consistency = calculateConsistency(sleepTimes);
    const sleepDebt = Math.round((8 - avgDuration) * 10) / 10;

    return {
      averageSleepScore: sleepScore,
      sleepConsistency: consistency,
      sleepDebt: sleepDebt,
      averageDuration: Math.round(avgDuration * 10) / 10,
    };
  };

  const calculateMonthlyStats = (sessions) => {
    if (sessions.length === 0) {
      return {
        qualityTrend: 0,
        deepSleepRatio: 0,
        averageLatency: 0,
        totalSessions: 0,
      };
    }

    const firstHalf = sessions.slice(Math.floor(sessions.length / 2));
    const secondHalf = sessions.slice(0, Math.floor(sessions.length / 2));

    const firstHalfAvg =
      firstHalf.reduce(
        (sum, s) => sum + calculateSessionDuration(s),
        0
      ) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.length > 0
        ? secondHalf.reduce(
            (sum, s) => sum + calculateSessionDuration(s),
            0
          ) / secondHalf.length
        : firstHalfAvg;

    const qualityTrend = Math.round(
      ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
    );

    let totalDeepSleep = 0;
    let totalSleep = 0;

    sessions.forEach((session) => {
      const duration = calculateSessionDuration(session);
      totalSleep += duration;

      if (session.stages) {
        const deepSleep = session.stages
          .filter((stage) => stage.stage === 5)
          .reduce((sum, stage) => {
            const stageDuration =
              (new Date(stage.endTime) - new Date(stage.startTime)) /
              (1000 * 60 * 60);
            return sum + stageDuration;
          }, 0);
        totalDeepSleep += deepSleep;
      }
    });

    const deepSleepRatio =
      totalSleep > 0
        ? Math.round((totalDeepSleep / totalSleep) * 100)
        : 0;

    return {
      qualityTrend: qualityTrend,
      deepSleepRatio: deepSleepRatio,
      averageLatency: Math.max(5, Math.round(25 - sessions.length * 0.5)),
      totalSessions: sessions.length,
    };
  };

  const calculateYearlyStats = (sessions) => {
    if (sessions.length === 0) {
      return {
        bestMonth: 'N/A',
        worstMonth: 'N/A',
        yearProgress: 0,
        totalHours: 0,
      };
    }

    const monthlyData = {};
    let totalHours = 0;

    sessions.forEach((session) => {
      const month = new Date(session.startTime).toLocaleString('default', {
        month: 'long',
      });
      const duration = calculateSessionDuration(session);

      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }

      monthlyData[month].total += duration;
      monthlyData[month].count += 1;
      totalHours += duration;
    });

    const monthAverages = Object.entries(monthlyData).map(
      ([month, data]) => ({
        month,
        average: data.total / data.count,
      })
    );

    monthAverages.sort((a, b) => b.average - a.average);

    const bestMonth =
      monthAverages.length > 0 ? monthAverages[0].month : 'N/A';
    const worstMonth =
      monthAverages.length > 0
        ? monthAverages[monthAverages.length - 1].month
        : 'N/A';
    const yearProgress =
      sessions.length > 10 ? Math.round(Math.random() * 20 + 10) : 5;

    return {
      bestMonth,
      worstMonth,
      yearProgress,
      totalHours: Math.round(totalHours),
    };
  };

  const calculateConsistency = (sleepTimes) => {
    if (sleepTimes.length < 2) return 50;

    const avgTime =
      sleepTimes.reduce((sum, time) => sum + time, 0) / sleepTimes.length;
    const variance =
      sleepTimes.reduce(
        (sum, time) => sum + Math.pow(time - avgTime, 2),
        0
      ) / sleepTimes.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.max(
      0,
      Math.min(100, Math.round(100 - standardDeviation * 10))
    );
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'score':
        return `${value}/100`;
      case 'percentage':
        return `${value}%`;
      case 'hours':
        return `${value}h`;
      case 'trend':
        return value > 0
          ? `↑ ${value}%`
          : value < 0
          ? `↓ ${Math.abs(value)}%`
          : '→ 0%';
      case 'minutes':
        return `${value}min`;
      default:
        return value;
    }
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  React.useEffect(() => {
    fetchSleepStatistics();

    const interval = setInterval(() => {
      fetchSleepStatistics();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-xl animate-pulse"
            >
              <div className="w-32 h-6 bg-gray-700/50 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="flex justify-between items-center"
                  >
                    <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
                    <div className="w-16 h-4 bg-gray-700/50 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <GlobalRefreshButton />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Overview */}
        <div className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-xl">
          <h3 className="text-lg text-white font-light mb-4">
            Weekly Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Sleep Score</span>
              <span className="text-white">
                {formatValue(
                  statistics.weekly.averageSleepScore,
                  'score'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Sleep Consistency</span>
              <span className="text-white">
                {formatValue(
                  statistics.weekly.sleepConsistency,
                  'percentage'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Sleep Debt</span>
              <span
                className={
                  statistics.weekly.sleepDebt > 0
                    ? 'text-red-400'
                    : 'text-green-400'
                }
              >
                {statistics.weekly.sleepDebt > 0 ? '+' : ''}
                {formatValue(
                  statistics.weekly.sleepDebt,
                  'hours'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Duration</span>
              <span className="text-white">
                {formatValue(
                  statistics.weekly.averageDuration,
                  'hours'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-xl">
          <h3 className="text-lg text-white font-light mb-4">
            Monthly Trends
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Sleep Quality Trend</span>
              <span
                className={getTrendColor(
                  statistics.monthly.qualityTrend
                )}
              >
                {formatValue(
                  statistics.monthly.qualityTrend,
                  'trend'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Deep Sleep Ratio</span>
              <span className="text-white">
                {formatValue(
                  statistics.monthly.deepSleepRatio,
                  'percentage'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Sleep Latency</span>
              <span className="text-white">
                {formatValue(
                  statistics.monthly.averageLatency,
                  'minutes'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Sessions</span>
              <span className="text-white">
                {statistics.monthly.totalSessions}
              </span>
            </div>
          </div>
        </div>

        {/* Yearly Analysis */}
        <div className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-xl">
          <h3 className="text-lg text-white font-light mb-4">
            Yearly Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Best Sleep Month</span>
              <span className="text-white">
                {statistics.yearly.bestMonth}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Worst Sleep Month</span>
              <span className="text-white">
                {statistics.yearly.worstMonth}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Year Progress</span>
              <span
                className={getTrendColor(
                  statistics.yearly.yearProgress
                )}
              >
                {statistics.yearly.yearProgress > 0 ? '+' : ''}
                {statistics.yearly.yearProgress}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Hours</span>
              <span className="text-white">
                {formatValue(
                  statistics.yearly.totalHours,
                  'hours'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </motion.div>
  );
};

/* ------------------------- INSOMNIA RISK HISTORY ------------------------- */

const InsomniaRiskHistory = () => {
  const { backendUrl } = useContext(AppContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRiskHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${backendUrl}/api/ai/insomnia-risk/history`;
      const res = await axios.get(url, {
        withCredentials: true,
        timeout: 15000,
      });

      const payload = res.data;
      let items = [];

      if (Array.isArray(payload.data)) {
        items = payload.data;
      } else if (Array.isArray(payload.data?.history)) {
        items = payload.data.history;
      }

      // Group by day
      const grouped = {};
      items.forEach((item) => {
        const createdAt = item.createdAt || item.timestamp || item.time;
        const risk = item.risk;

        if (createdAt && typeof risk === 'number') {
          const d = new Date(createdAt);
          const key = d.toISOString().slice(0, 10); // YYYY-MM-DD

          if (!grouped[key]) {
            grouped[key] = {
              date: d,
              risks: [],
            };
          }
          grouped[key].risks.push(risk);
        }
      });

      const perDay = Object.keys(grouped)
        .sort()
        .map((key) => {
          const entry = grouped[key];
          const risks = entry.risks;
          const avgRisk =
            risks.reduce((sum, r) => sum + r, 0) / risks.length;
          const lastRisk = risks[risks.length - 1];

          const avgPercent = Math.round(avgRisk * 100);
          const lastPercent = Math.round(lastRisk * 100);

          return {
            key,
            dateObj: entry.date,
            dateLabel: entry.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            avgRisk,
            lastRisk,
            avgPercent,
            lastPercent,
          };
        });

      // Limit to last 14 days
      const recent = perDay.slice(-14);

      setHistory(recent);
    } catch (err) {
      console.error('[InsomniaRiskHistory] Error:', err);
      setError('Unable to load insomnia risk history.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRiskHistory();
  }, [backendUrl]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-xl"
      >
        <div className="w-48 h-5 bg-gray-700/50 rounded mb-4"></div>
        <div className="h-24 bg-gray-800/50 rounded mb-3 animate-pulse" />
        <div className="h-6 w-40 bg-gray-800/50 rounded animate-pulse" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/95 rounded-2xl p-6 border border-red-800/40 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <h3 className="text-sm font-medium">Insomnia Risk History</h3>
        </div>
        <p className="text-xs text-red-300">{error}</p>
      </motion.div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-xl"
      >
        <h3 className="text-sm sm:text-base text-white font-medium mb-2">
          Insomnia Risk History
        </h3>
        <p className="text-xs sm:text-sm text-gray-400">
          No saved insomnia risk scores yet. Run the AI prediction to start
          building your history.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/95 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-xl space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-sm sm:text-base text-white font-medium">
          Insomnia Risk History (per day)
        </h3>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Showing last {history.length} days · Bar uses the latest risk per day
        </p>
      </div>

      {/* Bar chart */}
      <div className="overflow-x-auto">
        <div className="min-w-full sm:min-w-[520px]">
          <div className="flex items-end gap-3 h-32">
            {history.map((day) => (
              <div
                key={day.key}
                className="flex-1 flex flex-col items-center"
              >
                <div className="relative w-5 sm:w-6 h-full flex items-end justify-center">
                  <div className="w-full rounded-full bg-purple-500/60 hover:bg-purple-400 transition-all duration-300"
                    style={{
                      height: `${day.lastPercent}%`,
                      boxShadow:
                        day.lastPercent > 0
                          ? '0 0 8px rgba(168,85,247,0.6)'
                          : 'none',
                    }}
                  />
                </div>
                <div className="mt-2 text-[10px] sm:text-xs text-gray-300">
                  {day.dateLabel}
                </div>
                <div className="text-[10px] text-gray-400">
                  {day.lastPercent}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details table */}
      <div className="border-t border-gray-800/60 pt-3">
        <table className="w-full text-[11px] sm:text-xs text-gray-300">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-1">Date</th>
              <th className="py-1">Avg risk (0–1)</th>
              <th className="py-1">Latest risk (0–1)</th>
              <th className="py-1 text-right">% (latest)</th>
            </tr>
          </thead>
          <tbody>
            {history
              .slice()
              .reverse()
              .map((day) => (
                <tr key={day.key} className="border-t border-gray-800/40">
                  <td className="py-1.5">{day.dateLabel}</td>
                  <td className="py-1.5">
                    {day.avgRisk.toFixed(3)}
                  </td>
                  <td className="py-1.5">
                    {day.lastRisk.toFixed(3)}
                  </td>
                  <td className="py-1.5 text-right">
                    {day.lastPercent}%
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

/* ------------------------- RISK LEVEL INDICATOR ------------------------- */

const RiskLevelIndicator = ({ percentage }) => {
  const getColor = (value) => {
    if (value <= 30) return 'text-green-500';
    if (value <= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getLabel = (value) => {
    if (value <= 30) return 'Low Risk';
    if (value <= 60) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/95 rounded-2xl p-8 border border-gray-800/50 backdrop-blur-xl col-span-2"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-white font-light">
          AI Sleep Risk Analysis
        </h2>
        <div
          className={`px-4 py-1.5 rounded-full ${
            percentage <= 30
              ? 'bg-green-500/10'
              : percentage <= 60
              ? 'bg-yellow-500/10'
              : 'bg-red-500/10'
          }`}
        >
          <span className={`text-sm font-medium ${getColor(percentage)}`}>
            {getLabel(percentage)}
          </span>
        </div>
      </div>
      <div className="flex items-end space-x-4 mb-6">
        <div className="text-5xl font-light text-white">{percentage}%</div>
        <div className={`text-lg ${getColor(percentage)} mb-1`}>
          Predicted Risk Level
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              percentage <= 30
                ? 'bg-green-500'
                : percentage <= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
            } transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-gray-400 text-sm">
          Based on recent sleep patterns, heart rate variability, and activity
          levels
        </p>
      </div>
    </motion.div>
  );
};

/* ------------------------- GLOBAL REFRESH BUTTON ------------------------- */

const GlobalRefreshButton = () => {
  const { refreshAll, isRefreshing, lastRefreshTime } =
    useContext(RefreshContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/95 rounded-xl p-4 border border-gray-800/50 backdrop-blur-xl mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          {lastRefreshTime && (
            <div className="text-xs text-gray-400">
              Last updated: {lastRefreshTime.toLocaleString()}
            </div>
          )}
        </div>
        <button
          onClick={refreshAll}
          disabled={isRefreshing}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 w-full sm:w-auto ${
            isRefreshing
              ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300'
          }`}
        >
          <ArrowPathIcon
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

/* ------------------------- HEALTH COMPONENTS WRAPPER ------------------------- */

const HealthComponentsWrapper = () => {
  const { refreshTrigger } = useContext(RefreshContext);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <HeartRate key={`heart-${refreshTrigger}`} />
      <SleepSession key={`sleep-${refreshTrigger}`} />
      <Step key={`steps-${refreshTrigger}`} />
    </div>
  );
};

/* ------------------------- PREDICTION VIEW (AI + HISTORY) ------------------------- */

const PredictionView = () => {
  return (
    <div className="space-y-6">
      {/* Existing AI component that shows current risk with decimals + % */}
      <Ai />
      {/* New per-day insomnia risk history (bars + table) */}
      <InsomniaRiskHistory />
    </div>
  );
};

/* ------------------------- MAIN DASHBOARD ------------------------- */

const Dashboard = () => {
  const [activeView, setActiveView] = useState('health');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleQuickAction = (action) => {
    setActiveView(action);
  };

  const refreshAll = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Trigger re-render of all health components by updating the key
      setRefreshTrigger((prev) => prev + 1);
      setLastRefreshTime(new Date());

      // Small delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshContextValue = {
    refreshAll,
    isRefreshing,
    lastRefreshTime,
    refreshTrigger,
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'health':
        return <HealthComponentsWrapper />;
      case 'sleep':
        return <SleepHistoryView />;
      case 'statistics':
        return <StatisticsView />;
      case 'prediction':
        return <PredictionView />;
      default:
        return <HealthComponentsWrapper />;
    }
  };

  return (
    <RefreshContext.Provider value={refreshContextValue}>
      <div className="min-h-screen bg-[#0A1628] font-['Inter'] relative overflow-x-hidden">
        {/* Background gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-800/10 via-transparent to-transparent pointer-events-none" />

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main
          className="min-h-screen transition-all duration-300
                     ml-16 sm:ml-20 md:ml-52 lg:ml-64
                     relative z-10"
        >
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {/* Dashboard Card */}
            <div className="mb-8">
              <DashboardCard
                onActionClick={handleQuickAction}
                activeView={activeView}
              />
            </div>

            {/* Global Refresh Button - only on health view */}
            {activeView === 'health' && <GlobalRefreshButton />}

            {/* Dynamic Content */}
            <div className="mb-8">{renderActiveView()}</div>
          </div>
        </main>
      </div>
    </RefreshContext.Provider>
  );
};

export default Dashboard;
