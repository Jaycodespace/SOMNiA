import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useExerciseSession } from '../hooks/useExerciseSession';
import { useHeartRate } from '../hooks/useHeartRate';
import { useSleepSession } from '../hooks/useSleepSession';
import { useSteps } from '../hooks/useSteps';
import { useOxygenSaturation } from '../hooks/useSpo2';
import { useAuthStore } from '../store/useAuthStore';
import styles from '../assets/styles/sleepAnalysis.styles';

type Prediction = {
  hours: number | null;
  quality: 'Quality sleep' | 'Good sleep' | 'Poor sleep' | '';
  factors: { label: string; impact: string }[];
  insomniaRisk: number | null; // percentage (0-100)
};

type RiskStatus = 'idle' | 'loading' | 'ok' | 'no-data' | 'error';

const backendUrl = 'https://somnia-api-iuvq.onrender.com';

export default function SleepAnalysis() {
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
  const [latestHeartRate, setLatestHeartRate] = useState(0);
  const [latestSpO2, setLatestSpO2] = useState<number | null>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [latestBloodPressure, setLatestBloodPressure] = useState<{ systolic: number; diastolic: number } | null>(null);

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
                setLatestHeartRate(dbHeartRate);
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
                setTotalSteps(dbSteps);
              }
            } catch (stepsErr) {
              console.log("Steps fetch error:", stepsErr);
            }

            // Fetch Sleep from database
            try {
              const sleepResponse = await axios.get(`${backendUrl}/api/sleepSession/latest`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                timeout: 10000,
              });
              if (sleepResponse.data.success && sleepResponse.data.data) {
                const sleepData = sleepResponse.data.data;
                // Convert to format compatible with local data
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
            } catch (sleepErr) {
              // Fallback to stats endpoint
              try {
                const sleepStatsResponse = await axios.get(`${backendUrl}/api/sleepSession/stats`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                  timeout: 10000,
                });
                if (sleepStatsResponse.data.success && sleepStatsResponse.data.data) {
                  // Process stats data if needed
                }
              } catch (statsErr) {
                console.log("Sleep stats fetch error:", statsErr);
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
                dbSpO2 = spo2Response.data.data.percentage;
                setLatestSpO2(dbSpO2);
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
          // HEART RATE (local device) - only use if no database data
          const hrRecords = await readHeartRate();
          setHeartRateData(hrRecords);
          if (dbHeartRate === null && hrRecords.length > 0) {
            const lastRecord = hrRecords[hrRecords.length - 1];
            const lastSample = lastRecord.samples?.length
              ? lastRecord.samples[lastRecord.samples.length - 1]
              : null;
            if (lastSample?.beatsPerMinute) {
              setLatestHeartRate(lastSample.beatsPerMinute);
            }
          }

          // SPO2 (local device) - only use if no database data
          const spo2Records = await readOxygenSaturation();
          setSpo2Data(spo2Records);
          if (dbSpO2 === null && spo2Records.length > 0) {
            const last = spo2Records[spo2Records.length - 1];
            if (last.percentage) {
              setLatestSpO2(last.percentage);
            }
          }

          // SLEEP (local device) - only use if no database data
          if (dbSleep === null) {
            const sleepRecords = await readSleepSession();
            if (sleepRecords.length > 0) {
              setSleepDataRaw(sleepRecords);
            }
          }

          // STEPS (local device) - only use if no database data
          const stepRecords = await readSteps();
          setStepsData(stepRecords);
          if (dbSteps === null) {
            const total = stepRecords.reduce((t, s) => t + (s.count ?? 0), 0);
            if (total > 0) {
              setTotalSteps(total);
            }
          }
        } catch (localErr) {
          console.log("Local health data load error:", localErr);
        }

      } catch (err) {
        console.log("Health data load error:", err);
      }
    };

    loadHealthData();
  }, [token, userId]);

  // Calculate sleep hours from raw data
  const sleepData = useMemo(() => {
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

  const stepsToday = totalSteps;

  const [prediction, setPrediction] = useState<Prediction>({
    hours: null,
    quality: '',
    factors: [],
    insomniaRisk: null,
  });
  const [riskRaw, setRiskRaw] = useState<number | null>(null); // Store raw 0-1 value like web version
  const [riskStatus, setRiskStatus] = useState<RiskStatus>('idle');
  const [riskMessage, setRiskMessage] = useState<string>('');
  const [riskLastUpdated, setRiskLastUpdated] = useState<Date | null>(null);

  const averageSleep = useMemo(() => {
    if (!sleepData.length) return null;
    const total = sleepData.reduce((sum, v) => sum + v, 0);
    return total / sleepData.length;
  }, [sleepData]);

  const lastSleepHours = sleepData.length ? sleepData[sleepData.length - 1] : null;

  const sleepStreak = useMemo(() => {
    // consecutive nights (from most recent) with >= 6h
    let streak = 0;
    for (let i = sleepData.length - 1; i >= 0; i--) {
      if (sleepData[i] >= 6) streak += 1;
      else break;
    }
    return streak;
  }, [sleepData]);

  const derivedFactors = useMemo(() => {
    const factors: { label: string; impact: string }[] = [];
    if (averageSleep !== null) factors.push({ label: 'Average sleep', impact: `${averageSleep.toFixed(1)}h` });
    if (lastSleepHours !== null) factors.push({ label: 'Last night', impact: `${lastSleepHours.toFixed(1)}h` });
    factors.push({ label: 'Streak', impact: `${sleepStreak} days` });
    factors.push({ label: 'Steps', impact: `${stepsToday} steps` });
    factors.push({ label: 'Heart rate', impact: `${latestHeartRate} bpm` });
    if (latestSpO2 !== null) factors.push({ label: 'SpO₂', impact: `${latestSpO2}%` });
    if (latestBloodPressure !== null) factors.push({ label: 'BP', impact: `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic} mmHg` });
    return factors;
  }, [averageSleep, lastSleepHours, sleepStreak, stepsToday, latestHeartRate, latestSpO2, latestBloodPressure]);

  // Helper: convert 0–1 risk to percentage with normal rounding
  const getRiskPercent = (value: number | null): number | null => {
    if (typeof value !== "number") return null;
    return Math.round(value * 100); // 0.554 -> 55, 0.555 -> 56
  };

  // POST → call AI, save to DB, return fresh score (same as web implementation)
  const handlePredict = async () => {
    if (!backendUrl || !token) return;

    try {
      setRiskStatus('loading');
      setRiskMessage("Computing your insomnia risk score…");
      setRiskRaw(null);

      const url = `${backendUrl}/api/ai/insomnia-risk`;
      console.log("[SleepAnalysis] Sending POST /api/ai/insomnia-risk", { url });

      const res = await axios.post(
        url,
        {}, // no body; user comes from token on the server
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 20000,
        }
      );

      console.log("[SleepAnalysis] Response from POST /insomnia-risk", res.data);
      console.log("[SleepAnalysis] Full response:", JSON.stringify(res.data, null, 2));

      const { success, data, message: apiMessage } = res.data || {};

      console.log("[SleepAnalysis] Parsed values:", {
        success,
        hasData: !!data,
        dataType: typeof data,
        riskValue: data?.risk,
        riskType: typeof data?.risk,
      });

      if (success && data && typeof data.risk === "number") {
        console.log("[SleepAnalysis] Setting risk - value:", data.risk);
        setRiskRaw(data.risk); // keep the raw 0.xxx value
        const riskPercent = getRiskPercent(data.risk);
        console.log("[SleepAnalysis] Risk percent:", riskPercent);
        setRiskStatus('ok');
        setRiskMessage(apiMessage || "Insomnia risk computed successfully.");
        setRiskLastUpdated(
          data.createdAt ? new Date(data.createdAt) : new Date()
        );
        console.log("[SleepAnalysis] State updated - riskStatus: ok, riskRaw:", data.risk);
      } else {
        console.log("[SleepAnalysis] No valid risk - success:", success, "data:", data, "risk type:", typeof data?.risk);
        setRiskRaw(null);
        setRiskStatus('no-data');
        setRiskMessage(
          apiMessage ||
          "Insufficient data to compute insomnia risk. Keep wearing your device consistently."
        );
        setRiskLastUpdated(null);
      }
    } catch (err: any) {
      console.error("[SleepAnalysis] ERROR calling insomnia-risk:", err);

      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;

      setRiskRaw(null);
      setRiskStatus('error');
      setRiskMessage(
        serverMsg || "Something went wrong while contacting the AI service."
      );
      setRiskLastUpdated(null);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.headerCenter}>
          <Text style={styles.cardTitle}>Sleep Prediction</Text>
          <Text style={styles.metaText}>Tap predict to generate tonight’s outlook.</Text>
        </View>

        <View style={styles.predictionHero}>
          {riskStatus === 'loading' ? (
            <>
              <ActivityIndicator size="large" color="#a259ff" />
              <Text style={styles.metaText}>
                {riskMessage || "Computing your insomnia risk score…"}
              </Text>
            </>
          ) : (
            <>
              {/* Insomnia Risk Display - following web pattern */}
              {riskStatus === 'ok' && riskRaw !== null ? (
                <>
                  <Text style={[styles.metaText, { fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }]}>
                    Current Risk
                  </Text>
                  <Text style={[styles.predictedHours, { fontSize: 48, marginBottom: 4 }]}>
                    {getRiskPercent(riskRaw) ?? '--'}%
                  </Text>
                  <Text style={[styles.metaText, { fontSize: 11, marginBottom: 8 }]}>
                    Raw score:{" "}
                    <Text style={{ fontFamily: 'monospace' }}>
                      {riskRaw.toFixed(3)}
                    </Text>{" "}
                    (0.000 – 1.000)
                  </Text>
                  <Text style={[styles.metaText, { fontSize: 10, marginBottom: 8 }]}>
                    0.000 = very low risk · 1.000 = very high risk
                  </Text>
                  {riskMessage && (
                    <Text style={[styles.metaText, { marginTop: 8 }]}>
                      {riskMessage}
                    </Text>
                  )}
                </>
              ) : riskStatus === 'ok' ? (
                <Text style={[styles.metaText, { color: '#ff6b6b' }]}>
                  Error: Risk calculated but value is missing
                </Text>
              ) : null}
              
              {riskStatus === 'no-data' && (
                <Text style={[styles.metaText, { color: '#ffa500', marginTop: 8 }]}>
                  {riskMessage}
                </Text>
              )}
              
              {riskStatus === 'error' && (
                <Text style={[styles.metaText, { color: '#ff6b6b', marginTop: 8 }]}>
                  {riskMessage}
                </Text>
              )}
              
              {(riskStatus === 'idle' || (riskStatus === 'error' && riskRaw === null)) && (
                <Text style={[styles.metaText, { marginTop: 8 }]}>
                  When you are ready, tap predict to compute your current insomnia risk score.
                </Text>
              )}
              
              {riskLastUpdated && (
                <Text style={[styles.metaText, { fontSize: 10, marginTop: 8 }]}>
                  Last computed {riskLastUpdated.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              )}
            </>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.predictButtonFull, riskStatus === 'loading' && { opacity: 0.6 }]} 
          onPress={handlePredict}
          disabled={riskStatus === 'loading'}
        >
          <Ionicons name="sparkles-outline" size={18} color="#fff" />
          <Text style={styles.predictButtonText}>
            {riskStatus === 'loading' ? 'Running prediction…' : 'Predict'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Signals used</Text>
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Ionicons name="walk-outline" size={20} color="#43e97b" />
            <Text style={styles.statValue}>{stepsToday ? stepsToday : '--'}</Text>
            <Text style={styles.statLabel}>Steps today</Text>
          </View>
          <View style={styles.statTile}>
            <Ionicons name="moon-outline" size={20} color="#5d3fd3" />
            <Text style={styles.statValue}>{averageSleep !== null ? `${averageSleep.toFixed(1)}h` : '--'}</Text>
            <Text style={styles.statLabel}>Sleep avg</Text>
          </View>
          <View style={styles.statTile}>
            <Ionicons name="heart-outline" size={20} color="#ff4d6d" />
            <Text style={styles.statValue}>{latestHeartRate ? `${latestHeartRate} bpm` : '--'}</Text>
            <Text style={styles.statLabel}>Heart rate</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Ionicons name="pulse-outline" size={20} color="#4dd4ff" />
            <Text style={styles.statValue}>{latestSpO2 ? `${latestSpO2}%` : '--'}</Text>
            <Text style={styles.statLabel}>SpO₂</Text>
          </View>
          <View style={styles.statTile}>
            <Ionicons name="medkit-outline" size={20} color="#ff9f1c" />
            <Text style={styles.statValue}>
              {latestBloodPressure
                ? `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic}`
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Blood pressure</Text>
          </View>
          <View style={styles.statTile}>
            <Ionicons name="flame-outline" size={20} color="#ff9f1c" />
            <Text style={styles.statValue}>{sleepStreak} days</Text>
            <Text style={styles.statLabel}>Sleep streak</Text>
          </View>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipRow}>
            <Ionicons name="timer-outline" size={18} color="#9aa0c2" />
            <Text style={styles.tipText}>Keep bedtime within a 30m window to boost stability.</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="walk-outline" size={18} color="#9aa0c2" />
            <Text style={styles.tipText}>Hit 6-8k steps before evening to aid sleep pressure.</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="cafe-outline" size={18} color="#9aa0c2" />
            <Text style={styles.tipText}>Avoid caffeine after 2pm to protect sleep onset.</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
