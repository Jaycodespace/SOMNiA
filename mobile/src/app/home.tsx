import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../assets/styles/home.styles';
import LinearGradient from 'react-native-linear-gradient';
import BottomNav from '../components/BottomNav';
import SleepAnalysis from './sleepAnalysis';
import Profile from './profile/profile';
import Tips from './Insights';
import { useExerciseSession } from '../hooks/useExerciseSession';
import { useHeartRate } from '../hooks/useHeartRate';
import { useSleepSession } from '../hooks/useSleepSession';
import { useSteps } from '../hooks/useSteps';
import { useOxygenSaturation } from '../hooks/useSpo2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncToDB } from '../utils/syncToDB';
import { useAuthStore } from '../store/useAuthStore';

const backendUrl = 'http://172.20.10.2:4000';


const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const { name, email, token, userId } = useAuthStore();
  const [userData, setUserData] = useState({ name: name || '', email: email || '' });
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

  // --- Load User Data from Auth Store ---
  useEffect(() => {
    const authStore = useAuthStore.getState();
    if (authStore.name || authStore.email) {
      setUserData({
        name: authStore.name || 'User',
        email: authStore.email || ''
      });
    }
  }, [name, email]);

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
            <Text style={styles.profileName}>{userData.name || userData.email || 'User'}</Text>
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
