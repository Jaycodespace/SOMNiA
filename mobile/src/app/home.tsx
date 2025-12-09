import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState, useContext} from 'react';
import styles from '../assets/styles/home.styles';
import LinearGradient from 'react-native-linear-gradient';
import BottomNav from '../components/BottomNav';
import { LineChart } from 'react-native-chart-kit';
import SleepAnalysis from './sleepAnalysis';
import Profile from './profile';
import Tips from './tips';
import { ExerciseType, SleepStageType, RecordResult } from 'react-native-health-connect';
import { useExerciseSession } from '../hooks/useExerciseSession';
import { initialize } from 'react-native-health-connect';
import { useHeartRate } from '../hooks/useHeartRate';
import { useSleepSession } from '../hooks/useSleepSession';
import { useSteps } from '../hooks/useSteps';
import { syncToDB } from '../utils/syncToDB';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const [userData, setUserData] = useState({ name: '', email: '' });
  const { readExerciseSession } = useExerciseSession(new Date());
  // sample Date '2025-05-29'
  const { readHeartRate } = useHeartRate(new Date());
  const { readSleepSession } = useSleepSession(new Date());
  const { readSteps } = useSteps(new Date());
  const [heartRateData, setHeartRateData] = useState([]);
  const [sleepDataRaw, setSleepDataRaw] = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [exerSession, setExerSession] = useState("");
  const [exerType, setExerType] = useState("");
  const [latestHeartRate, setLatestHeartRate] = useState(0);
  const [latestSpO2, setLatestSpO2] = useState<number | null>(null);
  const [latestBloodPressure, setLatestBloodPressure] = useState<{ systolic: number | null; diastolic: number | null }>({
    systolic: null,
    diastolic: null,
  });
  const [totalSleepHours, setTotalSleepHours] = useState("");
  const [totalSteps, setTotalSteps] = useState(0);
  const [sleepData, setSleepData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        color: (opacity = 1) => `rgba(162, 89, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  });
  const sleepTargetHours = 7;

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
    if (totalSleepHours) {
      const match = totalSleepHours.match(/([\d.]+)/);
      if (match) return parseFloat(match[1]);
    }
    return 0;
  })();

  const sleepStatus =
    sleepHours > 7
      ? 'Quality sleep'
      : sleepHours >= 6
        ? 'Good sleep'
        : 'Poor sleep';

  const sleepHoursDisplay = sleepHours > 0 ? sleepHours.toFixed(1) : '0';
  
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

      // Health Connect permission-driven requests are disabled for now to avoid prompts.
      // const isInitialized = await initialize();
      //
      // if (!isInitialized) {
      //   throw new Error('CLIENT_NOT_INITIALIZED');
      // }
      // 
      // // Steps
      // const steps = await readSteps();
      // setStepsData(steps);
      // const totalSteps = steps.reduce((sum, record) => sum + (record.count || 0), 0);
      // setTotalSteps(totalSteps);
      // 
      // // Exercise
      // const exerciseSession = await readExerciseSession();
      // if (exerciseSession.length > 0) {
      //   const lastExercise = exerciseSession.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0];
      //   const start = new Date(lastExercise.startTime);
      //   const end = new Date(lastExercise.endTime);
      //   const totalExerciseMs = end.getTime() - start.getTime();
      //   const totalMinutes = Math.floor(totalExerciseMs / (1000 * 60));
      //   const hours = Math.floor(totalMinutes / 60);
      //   const minutes = totalMinutes % 60;
      //   let formattedExercise = '';
      //
      //   if (hours > 0) {
      //     formattedExercise = `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      //   } else {
      //     formattedExercise = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      //   }
      //   
      //   setExerSession(formattedExercise);
      //
      //   const getExerciseName = (value: number): string | undefined => {
      //     return Object.keys(ExerciseType).find(
      //       (key) => ExerciseType[key as keyof typeof ExerciseType] === value
      //     );
      //   };
      //   const exerciseName = getExerciseName(exerciseSession[0].exerciseType);
      //   setExerType(exerciseName || 'Unknown');
      // }
      // 
      // // Heart Rate
      // const heartRate = await readHeartRate();
      // setHeartRateData(heartRate);
      // if (heartRate.length > 0 && heartRate[0].samples.length > 0) {
      //   setLatestHeartRate(heartRate[0].samples[0].beatsPerMinute);
      // }

      // // Sleep Session
      // const sleep = await readSleepSession();
      // setSleepDataRaw(sleep);
      // const start = new Date(sleep[0].startTime);
      // const end = new Date(sleep[0].endTime);
      // const totalSleepMs = end.getTime() - start.getTime();
      // const totalMinutes = Math.floor(totalSleepMs / (1000 * 60));
      // const hours = Math.floor(totalMinutes / 60);
      // const minutes = totalMinutes % 60;
      // const formattedSleep = `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      // setTotalSleepHours(formattedSleep);

      // // Sleep Graph
      // const labels: string[] = [];
      // const data: number[] = [];
      // const sleepStages = sleep.flatMap(session => session.stages || []);

      // const getStageValue = (value: number): number => {
      //   switch (value) {
      //     case SleepStageType.AWAKE: return 1;
      //     case SleepStageType.LIGHT: return 2;
      //     case SleepStageType.DEEP: return 3;
      //     case SleepStageType.REM: return 4;
      //     default: return 0;
      //   }
      // };

      // sleepStages.forEach((stage) => {
      //   const start = new Date(stage.startTime);
      //   const hour = start.getHours();
      //   const minute = String(start.getMinutes()).padStart(2, '0');
      //   const ampm = hour >= 12 ? 'PM' : 'AM';
      //   const displayHour = hour % 12 || 12;
      //   labels.push(`${displayHour}:${minute} ${ampm}`);
      //   const numericValue = getStageValue(stage.stage);
      //   data.push(numericValue);
      // });

      // setSleepData({
      //   labels,
      //   datasets: [
      //     {
      //       data,
      //       color: (opacity = 1) => `rgba(162, 89, 255, ${opacity})`,
      //       strokeWidth: 0, // Remove line
      //     },
      //   ],
      // });
    };

    fetchHealthData();
  }, []);

  const [selectedTab, setSelectedTab] = useState('home');

  useEffect(() => {
    const loadUserData = async () => {
      const authDataString = await AsyncStorage.getItem('authData');
      if (authDataString) {
        const authData = JSON.parse(authDataString);
        setUserData({
          name: authData.name || 'User',
          email: authData.email || ''
        });
      }
    };
    loadUserData();
  }, []);

  const bpValue =
    latestBloodPressure.systolic !== null && latestBloodPressure.diastolic !== null
      ? `${latestBloodPressure.systolic}/${latestBloodPressure.diastolic}`
      : 'N/A';

  const statBoxes = [
    { label: 'Total Steps Today', value: totalSteps || 'N/A', unit: '', icon: 'walk-outline', color: '#43e97b' },
    { label: 'Latest Heart Rate', value: latestHeartRate || 'N/A', unit: 'bpm', icon: 'heart-outline', color: '#ff4d6d' },
    { label: 'Latest SpO2', value: latestSpO2 ?? 'N/A', unit: '%', icon: 'pulse-outline', color: '#4dd4ff' },
    { label: 'Blood Pressure', value: bpValue, unit: 'mmHg', icon: 'medkit-outline', color: '#ff9f1c' },
  ];

  return (
    <LinearGradient colors={['#1a1a2e', '#23234b']} style={styles.background}>
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
    
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {selectedTab === 'home' && (
          <>
            <View style={styles.sleepSummaryCard}>
              <Text style={styles.sectionTitle}>Sleep Goal</Text>
              <View style={styles.sleepCircleRow}>
                <View style={styles.sleepCircle}>
                  <Text style={styles.sleepCircleValue}>{sleepHoursDisplay}</Text>
                  <Text style={styles.sleepCircleLabel}>hrs slept</Text>
                  <Text style={styles.sleepCircleTarget}>Goal: {sleepTargetHours} hrs</Text>
                </View>
              </View>
              <View style={styles.sleepSummaryText}>
                <Text style={styles.sleepStatus}>{sleepStatus}</Text>
                <Text style={styles.sleepSubtext}>Based on your latest night.</Text>
              </View>
            </View>

            <View style={styles.statsBoxContainer}>
              {statBoxes.map((box, idx) => (
                <View key={idx} style={[styles.statBox, { backgroundColor: box.color + '22' }]}> 
                  <Ionicons name={box.icon} size={28} color={box.color} style={{ marginBottom: 6 }} />
                  <Text style={[styles.statBoxValue, { color: box.color }]}>{box.value} <Text style={styles.statBoxUnit}>{box.unit}</Text></Text>
                  <Text style={styles.statBoxLabel}>{box.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.syncButton}
              onPress={async () => {

                await syncToDB(heartRateData, sleepDataRaw, stepsData, "68832672731725ac9a4373bc");
              }}>
              <Text style={styles.syncButtonText}>Sync data to database</Text>
            </TouchableOpacity>
          </>
        )}

        {selectedTab === 'sleepAnalysis' && <SleepAnalysis />}
        {selectedTab === 'insights' && <Tips />}
        {selectedTab === 'profile' && <Profile />}
      </ScrollView>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <BottomNav 
            onPress={() => setSelectedTab('home')} 
            icon={selectedTab === 'home' ? 'home' : 'home-outline'} 
            iconColor={selectedTab === 'home' ? '#a259ff' : '#fff'} 
            navName={<Text style={[styles.navText, selectedTab === 'home' && styles.navTextActive]}>Home</Text>} />
          <BottomNav 
            onPress={() => setSelectedTab('sleepAnalysis')} 
            icon={selectedTab === 'sleepAnalysis' ? 'moon' : 'moon-outline'} 
            iconColor={selectedTab === 'sleepAnalysis' ? '#a259ff' : '#fff'} 
            navName={<Text style={[styles.navText, selectedTab === 'sleepAnalysis' && styles.navTextActive]}>Sleep Analysis</Text>} />
          <BottomNav 
            onPress={() => setSelectedTab('insights')} 
            icon={selectedTab === 'insights' ? 'bulb' : 'bulb-outline'} 
            iconColor={selectedTab === 'insights' ? '#a259ff' : '#fff'} 
            navName={<Text style={[styles.navText, selectedTab === 'insights' && styles.navTextActive]}>Insights</Text>} />
          <BottomNav 
            onPress={() => setSelectedTab('profile')} 
            icon={selectedTab === 'profile' ? 'person' : 'person-outline'} 
            iconColor={selectedTab === 'profile' ? '#a259ff' : '#fff'} 
            navName={<Text style={[styles.navText, selectedTab === 'profile' && styles.navTextActive]}>Profile</Text>} />
        </View>
      </View>
    </LinearGradient>
  );
}