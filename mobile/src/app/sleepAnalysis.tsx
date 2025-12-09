import { View, Text, TouchableOpacity } from 'react-native';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import styles from '../assets/styles/sleepAnalysis.styles';

type Prediction = {
  hours: number | null;
  quality: 'Quality sleep' | 'Good sleep' | 'Poor sleep' | '';
  confidence: number | null;
  factors: { label: string; impact: string }[];
  insomniaRisk: number | null;
};

export default function SleepAnalysis() {
  // Replace with real readings from HC/backend
  const sleepData = [7, 6.5, 8, 7.5, 8.3, 7, 5.8]; // hours per night (mock)
  const stepsToday = 5400;
  const latestHeartRate = 76;
  const latestSpO2 = 97;
  const latestBloodPressure = { systolic: 118, diastolic: 76 };

  const [prediction, setPrediction] = useState<Prediction>({
    hours: null,
    quality: '',
    confidence: null,
    factors: [],
    insomniaRisk: null,
  });

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
    factors.push({ label: 'SpO₂', impact: `${latestSpO2}%` });
    factors.push({ label: 'BP', impact: `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic} mmHg` });
    return factors;
  }, [averageSleep, lastSleepHours, sleepStreak, stepsToday, latestHeartRate, latestSpO2, latestBloodPressure]);

  const handlePredict = () => {
    // Placeholder prediction logic; replace with actual model when available.
    const avg = averageSleep ?? 6.5;
    const last = lastSleepHours ?? 6.5;
    const predictedHours = Math.max(5.5, Math.min(8.5, avg * 0.4 + last * 0.6));
    let quality: Prediction['quality'] = 'Good sleep';
    if (predictedHours > 7) quality = 'Quality sleep';
    else if (predictedHours < 6) quality = 'Poor sleep';

    // Simple insomnia risk heuristic: lower hours => higher risk
    let insomniaRisk = 30; // base
    if (predictedHours < 6) insomniaRisk = 75;
    else if (predictedHours < 7) insomniaRisk = 55;
    else insomniaRisk = 20;

    setPrediction({
      hours: Number(predictedHours.toFixed(1)),
      quality,
      confidence: 82,
      factors: derivedFactors,
      insomniaRisk,
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.headerCenter}>
          <Text style={styles.cardTitle}>Sleep Prediction</Text>
          <Text style={styles.metaText}>Tap predict to generate tonight’s outlook.</Text>
        </View>

        <View style={styles.predictionHero}>
          <Ionicons name="moon-outline" size={36} color="#a259ff" />
          <Text style={styles.predictedHours}>
            {prediction.hours !== null ? `${prediction.hours}h` : '--'}
          </Text>
          <Text style={styles.qualityBadge}>{prediction.quality || 'Tap Predict'}</Text>
          {prediction.insomniaRisk !== null && (
            <Text style={styles.riskBadge}>Insomnia risk: {prediction.insomniaRisk}%</Text>
          )}
          {prediction.confidence !== null && (
            <Text style={styles.metaText}>Confidence: {prediction.confidence}%</Text>
          )}
        </View>

        <TouchableOpacity style={styles.predictButtonFull} onPress={handlePredict}>
          <Ionicons name="sparkles-outline" size={18} color="#fff" />
          <Text style={styles.predictButtonText}>Predict</Text>
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
              {latestBloodPressure.systolic && latestBloodPressure.diastolic
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
