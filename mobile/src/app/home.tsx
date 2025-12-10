import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import styles from '../assets/styles/home.styles';
import LinearGradient from 'react-native-linear-gradient';
import BottomNav from '../components/BottomNav';
import SleepAnalysis from './sleepAnalysis';
import Profile from './profile';
import Tips from './tips';
import { useExerciseSession } from '../hooks/useExerciseSession';
import { useHeartRate } from '../hooks/useHeartRate';
import { useSleepSession } from '../hooks/useSleepSession';
import { useSteps } from '../hooks/useSteps';
import { useOxygenSaturation } from '../hooks/useSpo2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncToDB } from '../utils/syncToDB';


const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const [userData, setUserData] = useState({ name: '', email: '' });
  const { readExerciseSession } = useExerciseSession(new Date());
  const { readHeartRate } = useHeartRate(new Date());
  const { readSleepSession } = useSleepSession(new Date());
  const { readSteps } = useSteps(new Date());
  const { readOxygenSaturation } = useOxygenSaturation(new Date());

  const [heartRateData, setHeartRateData] = useState([]);
  const [sleepDataRaw, setSleepDataRaw] = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [latestHeartRate, setLatestHeartRate] = useState(0);
  const [latestSpO2, setLatestSpO2] = useState<number | null>(null);
  const [spo2Data, setSpo2Data] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);

  const [selectedTab, setSelectedTab] = useState('home');

  // --- Load User Data from AsyncStorage ---
  useEffect(() => {
    const fetchHealthData = async () => {
      const authDataString = await AsyncStorage.getItem('authData');
      if (authDataString) {
        const authData = JSON.parse(authDataString);
        setUserData({
          name: authData.name || 'User',
          email: authData.email || ''
        });
      }
    };

    fetchHealthData();
  }, []);

  // --- Fetch All Health Data Including SpO2 ---
  useEffect(() => {
  const loadHealthData = async () => {
    try {
      // HEART RATE
      const hrRecords = await readHeartRate();
      setHeartRateData(hrRecords);
      if (hrRecords.length > 0) {
        const lastRecord = hrRecords[hrRecords.length - 1];

        const lastSample = lastRecord.samples?.length
          ? lastRecord.samples[lastRecord.samples.length - 1]
          : null;

        setLatestHeartRate(lastSample?.beatsPerMinute ?? 0);
      }


      // SPO2
      const spo2Records = await readOxygenSaturation();
      setSpo2Data(spo2Records);

      if (spo2Records.length > 0) {
        const last = spo2Records[spo2Records.length - 1];
        setLatestSpO2(last.percentage ?? null);
      }

      // SLEEP
      const sleepRecords = await readSleepSession();
      setSleepDataRaw(sleepRecords);

      // STEPS
      const stepRecords = await readSteps();
      setStepsData(stepRecords);

      const total = stepRecords.reduce((t, s) => t + (s.count ?? 0), 0);
      setTotalSteps(total);

    } catch (err) {
      console.log("Health data load error:", err);
    }
  };

  loadHealthData();
}, []);


  // --- Sleep Calculations ---
  const sleepHours = (() => {
    if (sleepDataRaw.length > 0) {
      const session = sleepDataRaw[0];
      if (session?.startTime && session?.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const totalMs = end.getTime() - start.getTime();
        return Math.max(totalMs / (1000 * 60 * 60), 0);
      }
    }
    return 0;
  })();

  const sleepHoursDisplay = sleepHours > 0 ? sleepHours.toFixed(1) : "0";
  const sleepStatus =
    sleepHours > 7 ? "Quality sleep" :
    sleepHours >= 6 ? "Good sleep" : "Poor sleep";

  const statBoxes = [
    { label: 'Total Steps Today', value: totalSteps || 'N/A', unit: '', icon: 'walk-outline', color: '#43e97b' },
    { label: 'Latest Heart Rate', value: latestHeartRate || 'N/A', unit: 'bpm', icon: 'heart-outline', color: '#ff4d6d' },
    { label: 'Latest SpO2', value: latestSpO2 ?? 'N/A', unit: '%', icon: 'pulse-outline', color: '#4dd4ff' },
    { label: 'Blood Pressure', value: 'N/A', unit: 'mmHg', icon: 'medkit-outline', color: '#ff9f1c' },
  ];

  return (
    <LinearGradient colors={['#1a1a2e', '#23234b']} style={styles.background}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/images/default-avatar.png')} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.profileName}>{userData.name}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setSelectedTab('profile')}>
          <Ionicons name="person-circle-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {selectedTab === 'home' && (
          <>
            {/* Sleep Widget */}
            <View style={styles.sleepSummaryCard}>
              <Text style={styles.sectionTitle}>Sleep Goal</Text>
              <View style={styles.sleepCircleRow}>
                <View style={styles.sleepCircle}>
                  <Text style={styles.sleepCircleValue}>{sleepHoursDisplay}</Text>
                  <Text style={styles.sleepCircleLabel}>hrs slept</Text>
                  <Text style={styles.sleepCircleTarget}>Goal: 7 hrs</Text>
                </View>
              </View>
              <Text style={styles.sleepStatus}>{sleepStatus}</Text>
              <Text style={styles.sleepSubtext}>Based on your latest night.</Text>
            </View>

            {/* STAT BOXES */}
            <View style={styles.statsBoxContainer}>
              {statBoxes.map((box, idx) => (
                <View key={idx} style={[styles.statBox, { backgroundColor: box.color + '22' }]}>
                  <Ionicons name={box.icon} size={28} color={box.color} style={{ marginBottom: 6 }} />
                  <Text style={[styles.statBoxValue, { color: box.color }]}>
                    {box.value} <Text style={styles.statBoxUnit}>{box.unit}</Text>
                  </Text>
                  <Text style={styles.statBoxLabel}>{box.label}</Text>
                </View>
              ))}
            </View>

            {/* Sync Button */}
            <TouchableOpacity 
              style={styles.syncButton}
              onPress={async () => {
                await syncToDB(heartRateData, sleepDataRaw, stepsData, spo2Data);
              }}>
              <Text style={styles.syncButtonText}>Sync data to database</Text>
            </TouchableOpacity>
          </>
        )}

        {selectedTab === 'sleepAnalysis' && <SleepAnalysis />}
        {selectedTab === 'insights' && <Tips />}
        {selectedTab === 'profile' && <Profile />}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <BottomNav 
            onPress={() => setSelectedTab('home')} 
            icon={selectedTab === 'home' ? 'home' : 'home-outline'} 
            iconColor={selectedTab === 'home' ? '#a259ff' : '#fff'} 
            navName={<Text style={[styles.navText, selectedTab === 'home' && styles.navTextActive]}>Home</Text>} 
          />

          <BottomNav 
            onPress={() => setSelectedTab('sleepAnalysis')} 
            icon={selectedTab === 'sleepAnalysis' ? 'moon' : 'moon-outline'} 
            iconColor={selectedTab === 'sleepAnalysis' ? '#a259ff' : '#fff'} 
            navName={<Text style={[styles.navText, selectedTab === 'sleepAnalysis' && styles.navTextActive]}>Sleep Analysis</Text>} 
          />

          <BottomNav 
            onPress={() => setSelectedTab('insights')} 
            icon={selectedTab === 'insights' ? 'bulb' : 'bulb-outline'} 
            iconColor={selectedTab === 'insights' ? '#a259ff' : '#fff'} 
            navName={<Text style={[styles.navText, selectedTab === 'insights' && styles.navTextActive]}>Insights</Text>} 
          />

          <BottomNav 
            onPress={() => setSelectedTab('profile')} 
            icon={selectedTab === 'profile' ? 'person' : 'person-outline'} 
            iconColor={selectedTab === 'profile' ? '#a259ff' : '#fff'} 
            navName={<Text style={[styles.navText, selectedTab === 'profile' && styles.navTextActive]}>Profile</Text>} 
          />
        </View>
      </View>
    </LinearGradient>
  );
}
