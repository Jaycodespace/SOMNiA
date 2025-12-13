import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { readRecords, getGrantedPermissions, requestPermission } from 'react-native-health-connect';
import { useExerciseSession } from '../hooks/useExerciseSession';
import { useHeartRate } from '../hooks/useHeartRate';
import { useSleepSession } from '../hooks/useSleepSession';
import { useSteps } from '../hooks/useSteps';
import { useOxygenSaturation } from '../hooks/useSpo2';
import { useAuthStore } from '../store/useAuthStore';
import styles from '../assets/styles/insights.styles';

const backendUrl = 'https://somnia-api-iuvq.onrender.com';

interface TrendData {
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: string;
  color: string;
  dataPoints: number[];
}

interface Correlation {
  title: string;
  description: string;
  icon: string;
  correlationType: 'positive' | 'negative';
}

interface Recommendation {
  title: string;
  text: string;
  icon: string;
}

export default function Insights() {
  const { readExerciseSession } = useExerciseSession(new Date());
  const { readHeartRate } = useHeartRate(new Date());
  const { readSleepSession } = useSleepSession(new Date());
  const { readSteps } = useSteps(new Date());
  const { readOxygenSaturation } = useOxygenSaturation(new Date());
  const { token, userId } = useAuthStore();

  const [sleepDataRaw, setSleepDataRaw] = useState<any[]>([]);
  const [stepsData, setStepsData] = useState<any[]>([]);
  const [heartRateData, setHeartRateData] = useState<any[]>([]);
  const [spo2Data, setSpo2Data] = useState<any[]>([]);

  // --- Fetch All Health Data from Database and Local Device ---
  useEffect(() => {
    const loadHealthData = async () => {
      let dbHeartRate = null;
      let dbSteps = null;
      let dbSleep = null;
      let dbSpO2 = null;

      try {
        // First, try to fetch from database if user is authenticated
        if (token && userId) {
          try {
            // Fetch Heart Rate from database
            try {
              const hrResponse = await axios.get(`${backendUrl}/api/heartRate/stats`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                timeout: 10000,
              });
              if (hrResponse.data.success && hrResponse.data.data?.latestHeartRate) {
                dbHeartRate = hrResponse.data.data.latestHeartRate;
                // Convert to array format for Insights (needs records for trends)
                // We'll use the latest heart rate and create a record structure
                if (hrResponse.data.data.latestTimestamp) {
                  dbHeartRate = [{
                    samples: [{
                      beatsPerMinute: hrResponse.data.data.latestHeartRate,
                      time: hrResponse.data.data.latestTimestamp,
                    }],
                  }];
                  setHeartRateData(dbHeartRate);
                }
              }
            } catch (hrErr) {
              console.log("Heart rate fetch error:", hrErr);
            }

            // Fetch Steps from database
            try {
              const stepsResponse = await axios.get(`${backendUrl}/api/step/stats`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                timeout: 10000,
              });
              if (stepsResponse.data.success && stepsResponse.data.data?.totalSteps) {
                dbSteps = stepsResponse.data.data.totalSteps;
                // Note: Stats endpoint gives totals, but Insights needs individual records for trends
                // We'll still fetch from local device for the records array
              }
            } catch (stepsErr) {
              console.log("Steps fetch error:", stepsErr);
            }

            // Fetch Sleep from database - try history first for trends
            try {
              const sleepResponse = await axios.get(`${backendUrl}/api/sleepSession/history`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                timeout: 10000,
              });
              if (sleepResponse.data.success && sleepResponse.data.data) {
                const sleepHistory = Array.isArray(sleepResponse.data.data.sessions) 
                  ? sleepResponse.data.data.sessions 
                  : Array.isArray(sleepResponse.data.data)
                  ? sleepResponse.data.data
                  : [];
                // Convert database format to local format
                dbSleep = sleepHistory.map((session: any) => ({
                  startTime: session.startTime || session.start,
                  endTime: session.endTime || session.end,
                }));
                if (dbSleep.length > 0) {
                  setSleepDataRaw(dbSleep);
                }
              }
            } catch (sleepErr) {
              // Fallback to latest endpoint
              try {
                const sleepLatestResponse = await axios.get(`${backendUrl}/api/sleepSession/latest`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                  timeout: 10000,
                });
                if (sleepLatestResponse.data.success && sleepLatestResponse.data.data) {
                  const sleepData = sleepLatestResponse.data.data;
                  if (sleepData.latestSessionMinutes) {
                    const now = new Date();
                    const startTime = sleepData.sessionStartTime 
                      ? new Date(sleepData.sessionStartTime)
                      : new Date(now.getTime() - sleepData.latestSessionMinutes * 60 * 1000);
                    const endTime = sleepData.sessionEndTime 
                      ? new Date(sleepData.sessionEndTime)
                      : now;
                    
                    dbSleep = [{
                      startTime: startTime.toISOString(),
                      endTime: endTime.toISOString(),
                    }];
                    setSleepDataRaw(dbSleep);
                  }
                }
              } catch (latestErr) {
                console.log("Sleep latest fetch error:", latestErr);
              }
            }

            // Fetch SpO2 from database
            try {
              const spo2Response = await axios.get(`${backendUrl}/api/spo2/get/${userId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                timeout: 10000,
              });
              if (spo2Response.data.success && spo2Response.data.data?.percentage) {
                // Convert to array format for Insights
                const spo2Record = spo2Response.data.data;
                dbSpO2 = [{
                  percentage: spo2Record.percentage,
                  time: spo2Record.time || spo2Record.lastModifiedTime,
                }];
                setSpo2Data(dbSpO2);
              }
            } catch (spo2Err) {
              console.log("SpO2 fetch error:", spo2Err);
            }
          } catch (dbErr) {
            console.log("Database fetch error:", dbErr);
          }
        }

        // Also load from local device (Health Connect) as fallback or supplement
        try {
          // STEPS (local device) - always load (like home.tsx)
          const stepRecords = await readSteps();
          console.log("[Insights] Loaded step records from hook:", stepRecords?.length || 0);
          setStepsData(stepRecords);
          
          // Try to get additional days for better trends (if permission allows)
          if (stepRecords && stepRecords.length > 0) {
            try {
              const granted = await getGrantedPermissions();
              const hasPermission = granted.some((p) => p.recordType === 'Steps');
              
              if (hasPermission) {
                const allStepRecords: any[] = [...stepRecords]; // Start with today's data
                
                // Fetch steps for last 6 days (we already have today)
                for (let i = 1; i <= 6; i++) {
                  try {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    
                    const endDate = new Date(date);
                    endDate.setHours(23, 59, 59, 999);

                    const { records } = await readRecords('Steps', {
                      timeRangeFilter: {
                        operator: 'between',
                        startTime: date.toISOString(),
                        endTime: endDate.toISOString(),
                      },
                    });
                    if (records && records.length > 0) {
                      allStepRecords.push(...records);
                    }
                  } catch (dayErr) {
                    // Continue to next day if one fails
                    console.log(`[Insights] Error loading steps for day ${i}:`, dayErr);
                  }
                }
                
                console.log("[Insights] Total step records (7 days):", allStepRecords.length);
                if (allStepRecords.length > stepRecords.length) {
                  // Only update if we got more data
                  setStepsData(allStepRecords);
                }
              }
            } catch (extendedErr) {
              // If extended read fails, we already have today's data from hook
              console.log("[Insights] Extended steps read failed, using today's data:", extendedErr);
            }
          }

          // HEART RATE (local device) - only use if no database data
          const hrRecords = await readHeartRate();
          if (dbHeartRate === null && hrRecords.length > 0) {
            setHeartRateData(hrRecords);
          } else if (dbHeartRate === null && hrRecords.length === 0) {
            // No data from either source, keep empty
          } else if (dbHeartRate !== null && Array.isArray(dbHeartRate) && hrRecords.length > 0) {
            // Merge database and local data for more complete history
            setHeartRateData([...dbHeartRate, ...hrRecords]);
          } else if (dbHeartRate !== null && Array.isArray(dbHeartRate)) {
            // Use database data if available
            setHeartRateData(dbHeartRate);
          }

          // SPO2 (local device) - only use if no database data
          const spo2Records = await readOxygenSaturation();
          if (dbSpO2 === null && spo2Records.length > 0) {
            setSpo2Data(spo2Records);
          } else if (dbSpO2 === null && spo2Records.length === 0) {
            // No data from either source
          } else if (dbSpO2 !== null && Array.isArray(dbSpO2) && spo2Records.length > 0) {
            // Merge database and local data for more complete history
            setSpo2Data([...dbSpO2, ...spo2Records]);
          } else if (dbSpO2 !== null && Array.isArray(dbSpO2)) {
            // Use database data if available
            setSpo2Data(dbSpO2);
          }

          // SLEEP (local device) - only use if no database data
          if (dbSleep === null) {
            const sleepRecords = await readSleepSession();
            if (sleepRecords.length > 0) {
              setSleepDataRaw(sleepRecords);
            }
          } else if (dbSleep !== null && Array.isArray(dbSleep) && dbSleep.length > 0) {
            // Merge database and local data for more complete history
            const sleepRecords = await readSleepSession();
            if (sleepRecords.length > 0) {
              setSleepDataRaw([...dbSleep, ...sleepRecords]);
            } else {
              // Use database data if no local data
              setSleepDataRaw(dbSleep);
            }
          }
        } catch (localErr) {
          console.error("[Insights] Local health data load error:", localErr);
        }

      } catch (err) {
        console.log("Health data load error:", err);
      }
    };

    loadHealthData();
  }, [token, userId]);

  // Calculate sleep hours from raw data
  const sleepHours = useMemo(() => {
    return sleepDataRaw.map((session) => {
      if (session?.startTime && session?.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const totalMs = end.getTime() - start.getTime();
        return Math.max(totalMs / (1000 * 60 * 60), 0);
      }
      return 0;
    }).filter(hours => hours > 0);
  }, [sleepDataRaw]);

  // Calculate average sleep
  const averageSleep = useMemo(() => {
    if (sleepHours.length === 0) return 0;
    return sleepHours.reduce((sum, h) => sum + h, 0) / sleepHours.length;
  }, [sleepHours]);

  // Calculate sleep trend (compare last 3 days vs previous 3 days)
  const sleepTrend = useMemo(() => {
    if (sleepHours.length < 6) return { trend: 'neutral' as const, value: '0h' };
    const recent = sleepHours.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous = sleepHours.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    const diff = recent - previous;
    if (diff > 0.3) return { trend: 'up' as const, value: `+${diff.toFixed(1)}h` };
    if (diff < -0.3) return { trend: 'down' as const, value: `${diff.toFixed(1)}h` };
    return { trend: 'neutral' as const, value: '0h' };
  }, [sleepHours]);

  // Calculate steps trend
  const stepsTrend = useMemo(() => {
    if (stepsData.length < 6) return { trend: 'neutral' as const, value: '0%', total: 0 };
    const recent = stepsData.slice(-3).reduce((sum, s) => sum + (s.count ?? 0), 0);
    const previous = stepsData.slice(-6, -3).reduce((sum, s) => sum + (s.count ?? 0), 0);
    const total = stepsData.reduce((sum, s) => sum + (s.count ?? 0), 0);
    const percentChange = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    if (percentChange > 5) return { trend: 'up' as const, value: `+${percentChange.toFixed(0)}%`, total };
    if (percentChange < -5) return { trend: 'down' as const, value: `${percentChange.toFixed(0)}%`, total };
    return { trend: 'neutral' as const, value: '0%', total };
  }, [stepsData]);

  // Calculate heart rate trend
  const heartRateTrend = useMemo(() => {
    if (heartRateData.length < 2) {
      const latest = heartRateData.length > 0 
        ? heartRateData[heartRateData.length - 1]?.samples?.[heartRateData[heartRateData.length - 1].samples.length - 1]?.beatsPerMinute ?? 0
        : 0;
      return { trend: 'neutral' as const, value: '0%', avg: latest };
    }
    const recentSamples = heartRateData.slice(-3).flatMap(hr => hr.samples || []).map(s => s.beatsPerMinute);
    const previousSamples = heartRateData.slice(-6, -3).flatMap(hr => hr.samples || []).map(s => s.beatsPerMinute);
    if (recentSamples.length === 0 || previousSamples.length === 0) {
      const latest = recentSamples.length > 0 ? recentSamples[recentSamples.length - 1] : 0;
      return { trend: 'neutral' as const, value: '0%', avg: latest };
    }
    const recentAvg = recentSamples.reduce((a, b) => a + b, 0) / recentSamples.length;
    const previousAvg = previousSamples.reduce((a, b) => a + b, 0) / previousSamples.length;
    const diff = recentAvg - previousAvg;
    if (Math.abs(diff) < 2) return { trend: 'neutral' as const, value: '0%', avg: Math.round(recentAvg) };
    if (diff > 0) return { trend: 'up' as const, value: `+${diff.toFixed(0)}`, avg: Math.round(recentAvg) };
    return { trend: 'down' as const, value: `${diff.toFixed(0)}`, avg: Math.round(recentAvg) };
  }, [heartRateData]);

  // Calculate trends dynamically
  const trends: TrendData[] = useMemo(() => [
    {
      title: 'Average Sleep Duration',
      value: averageSleep > 0 ? averageSleep.toFixed(1) : '0',
      unit: 'hrs',
      trend: sleepTrend.trend,
      trendValue: sleepTrend.value,
      icon: 'moon-outline',
      color: '#a259ff',
      dataPoints: sleepHours.slice(-7).map(h => h * 10), // Scale for mini graph
    },
    {
      title: 'Activity Patterns',
      value: stepsTrend.total > 0 ? stepsTrend.total.toLocaleString() : '0',
      unit: 'steps',
      trend: stepsTrend.trend,
      trendValue: stepsTrend.value,
      icon: 'walk-outline',
      color: '#43e97b',
      dataPoints: stepsData.slice(-7).map(s => (s.count ?? 0) / 100), // Scale for mini graph
    },
    {
      title: 'Heart Rate Trends',
      value: heartRateTrend.avg > 0 ? heartRateTrend.avg.toString() : '0',
      unit: 'bpm',
      trend: heartRateTrend.trend,
      trendValue: heartRateTrend.value,
      icon: 'heart-outline',
      color: '#ff4d6d',
      dataPoints: heartRateData.slice(-7).map(hr => {
        const samples = hr.samples || [];
        return samples.length > 0 ? samples[samples.length - 1]?.beatsPerMinute ?? 0 : 0;
      }),
    },
    {
      title: 'Oxygen Saturation',
      value: spo2Data.length > 0 ? (spo2Data[spo2Data.length - 1]?.percentage ?? 0).toString() : '0',
      unit: '%',
      trend: 'neutral',
      trendValue: '0%',
      icon: 'pulse-outline',
      color: '#4dd4ff',
      dataPoints: spo2Data.slice(-7).map(s => s.percentage ?? 0),
    },
  ], [averageSleep, sleepTrend, stepsTrend, heartRateTrend, sleepHours, stepsData, heartRateData, spo2Data]);

  // Calculate correlations dynamically
  const correlations: Correlation[] = useMemo(() => {
    const correlationsList: Correlation[] = [];
    
    // Activity & Sleep Quality correlation
    if (stepsData.length > 0 && sleepHours.length > 0) {
      const recentSteps = stepsData.slice(-3).reduce((sum, s) => sum + (s.count ?? 0), 0) / 3;
      const recentSleep = sleepHours.slice(-3).reduce((sum, h) => sum + h, 0) / 3;
      const previousSteps = stepsData.length >= 6 
        ? stepsData.slice(-6, -3).reduce((sum, s) => sum + (s.count ?? 0), 0) / 3 
        : recentSteps;
      const previousSleep = sleepHours.length >= 6 
        ? sleepHours.slice(-6, -3).reduce((sum, h) => sum + h, 0) / 3 
        : recentSleep;
      
      const stepsChange = previousSteps > 0 ? ((recentSteps - previousSteps) / previousSteps) * 100 : 0;
      const sleepChange = previousSleep > 0 ? ((recentSleep - previousSleep) / previousSleep) * 100 : 0;
      
      if (stepsChange > 5 && sleepChange > 0) {
        correlationsList.push({
          title: 'Activity & Sleep Quality',
          description: `Regular physical activity improves sleep quality. Your activity increased by ${stepsChange.toFixed(0)}% this week.`,
          icon: 'fitness-outline',
          correlationType: 'positive',
        });
      }
    }

    // Heart Rate & Sleep correlation
    if (heartRateData.length > 0 && sleepHours.length > 0) {
      correlationsList.push({
        title: 'Heart Rate & Sleep',
        description: 'Lower resting heart rate correlates with better sleep quality. Monitor your heart rate patterns.',
        icon: 'heart-outline',
        correlationType: 'negative',
      });
    }

    // Steps & Sleep correlation
    if (stepsData.length > 0 && sleepHours.length > 0) {
      correlationsList.push({
        title: 'Activity Patterns & Sleep Duration',
        description: 'Higher daily activity levels show positive correlation with sleep duration. Keep moving!',
        icon: 'walk-outline',
        correlationType: 'positive',
      });
    }

    return correlationsList.length > 0 ? correlationsList : [
      {
        title: 'Data Collection',
        description: 'Continue tracking your health metrics to see personalized correlations.',
        icon: 'analytics-outline',
        correlationType: 'positive',
      },
    ];
  }, [stepsData, sleepHours, heartRateData]);

  // Generate recommendations based on actual data
  const recommendations: Recommendation[] = useMemo(() => {
    const recs: Recommendation[] = [];
    
    // Sleep consistency recommendation
    if (sleepHours.length > 0) {
      const sleepVariance = Math.max(...sleepHours) - Math.min(...sleepHours);
      if (sleepVariance > 1.5) {
        recs.push({
          title: 'Consistent Bedtime',
          text: 'Your sleep duration varies significantly. Try maintaining a consistent bedtime schedule.',
          icon: 'time-outline',
        });
      }
    }

    // Activity recommendation
    if (stepsTrend.total > 0 && stepsTrend.total < 6000) {
      recs.push({
        title: 'Increase Activity',
        text: `You're averaging ${Math.round(stepsTrend.total / Math.max(stepsData.length, 1))} steps per day. Aim for 6-8k steps to improve sleep quality.`,
        icon: 'walk-outline',
      });
    } else if (stepsTrend.trend === 'down') {
      recs.push({
        title: 'Activity Balance',
        text: 'Your activity has decreased recently. Try evening walks to balance sleep patterns.',
        icon: 'walk-outline',
      });
    }

    // Sleep duration recommendation
    if (averageSleep > 0 && averageSleep < 6.5) {
      recs.push({
        title: 'Sleep Duration',
        text: `Your average sleep is ${averageSleep.toFixed(1)} hours. Aim for 7-9 hours for optimal health.`,
        icon: 'moon-outline',
      });
    }

    // Heart rate recommendation
    if (heartRateTrend.avg > 0 && heartRateTrend.avg > 80) {
      recs.push({
        title: 'Heart Rate',
        text: 'Your heart rate is elevated. Consider stress management techniques to improve sleep quality.',
        icon: 'heart-outline',
      });
    }

    // Default recommendations if no specific ones
    if (recs.length === 0) {
      recs.push(
        {
          title: 'Evening Routine',
          text: 'Consider reducing screen time 1 hour before bed to improve sleep duration.',
          icon: 'moon-outline',
        },
        {
          title: 'Regular Exercise',
          text: 'Maintain regular physical activity to support healthy sleep patterns.',
          icon: 'fitness-outline',
        }
      );
    }

    return recs.slice(0, 3); // Limit to 3 recommendations
  }, [sleepHours, averageSleep, stepsTrend, stepsData, heartRateTrend]);

  const renderTrendArrow = (trend: 'up' | 'down' | 'neutral') => {
    const iconName = 
      trend === 'up' ? 'arrow-up' :
      trend === 'down' ? 'arrow-down' :
      'remove';
    
    const iconColor = 
      trend === 'up' ? '#43e97b' :
      trend === 'down' ? '#ff4d6d' :
      '#4dd4ff';
    
    return (
      <View style={styles.trendArrow}>
        <Ionicons name={iconName} size={14} color={iconColor} />
      </View>
    );
  };

  const renderMiniGraph = (color: string, dataPoints: number[]) => {
    if (dataPoints.length === 0 || dataPoints.every(p => p === 0)) {
      // Show placeholder bars if no data - all same height, bottom-aligned
      return (
        <View style={styles.trendMiniGraph}>
          {[1, 1, 1, 1, 1, 1, 1].map((_, index) => (
            <View
              key={index}
              style={[
                styles.trendBar,
                {
                  height: 12, // Fixed height for placeholders
                  backgroundColor: color,
                  opacity: 0.3,
                },
              ]}
            />
          ))}
        </View>
      );
    }
    
    // Normalize each graph independently but use consistent height range (20-100%)
    const maxValue = Math.max(...dataPoints, 1);
    const minValue = Math.min(...dataPoints, maxValue);
    const range = maxValue - minValue || 1; // Avoid division by zero
    
    const normalizedPoints = dataPoints.map(point => {
      // Normalize to 0-1 range, then scale to 20-100% height range
      const normalized = range > 0 ? (point - minValue) / range : 0.5;
      // Map to 20-100% height range for consistent visual scale
      return 20 + (normalized * 80);
    });
    
    // Pad or trim to 7 points for consistent display
    const displayPoints = normalizedPoints.length >= 7 
      ? normalizedPoints.slice(-7)
      : [...Array(7 - normalizedPoints.length).fill(20), ...normalizedPoints];
    
    return (
      <View style={styles.trendMiniGraph}>
        {displayPoints.map((height, index) => (
          <View
            key={index}
            style={[
              styles.trendBar,
              {
                height: `${height}%`,
                backgroundColor: color,
                minHeight: 4, // Ensure minimum visible height
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={styles.headerActions}>
          <Text style={styles.filterText}>Last 7 days</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Trend Overview Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trend Overview</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.trendScrollView}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {trends.map((trend, index) => (
            <View key={index} style={styles.trendCard}>
              <View>
                <View style={styles.trendCardHeader}>
                  <View style={styles.trendIcon}>
                    <Ionicons name={trend.icon} size={20} color={trend.color} />
                  </View>
                  {renderTrendArrow(trend.trend)}
                </View>
                <Text style={styles.trendValue}>
                  {trend.value} <Text style={styles.trendLabel}>{trend.unit}</Text>
                </Text>
                <Text style={styles.trendLabel}>{trend.title}</Text>
              </View>
              <View style={{ marginTop: 'auto' }}>
                {renderMiniGraph(trend.color, trend.dataPoints)}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Correlation Analysis Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Correlation Analysis</Text>
        {correlations.map((correlation, index) => (
          <TouchableOpacity key={index} style={styles.correlationCard}>
            <View style={styles.correlationHeader}>
              <View style={styles.correlationIcon}>
                <Ionicons 
                  name={correlation.icon} 
                  size={18} 
                  color={correlation.correlationType === 'positive' ? '#43e97b' : '#ff4d6d'} 
                />
              </View>
              <Text style={styles.correlationTitle}>{correlation.title}</Text>
            </View>
            <Text style={styles.correlationDescription}>{correlation.description}</Text>
            <View style={styles.correlationChart}>
              {[40, 55, 45, 60, 50, 65, 55].map((height, i) => (
                <View
                  key={i}
                  style={[
                    styles.correlationBar,
                    {
                      height: `${height}%`,
                      backgroundColor: correlation.correlationType === 'positive' 
                        ? 'rgba(67, 233, 123, 0.6)' 
                        : 'rgba(255, 77, 109, 0.6)',
                    },
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommendations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {recommendations.map((recommendation, index) => (
          <TouchableOpacity key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationIcon}>
                <Ionicons name={recommendation.icon} size={18} color="#a259ff" />
              </View>
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            </View>
            <Text style={styles.recommendationText}>{recommendation.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
