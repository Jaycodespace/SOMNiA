import { View, Text, TouchableOpacity, Image, TextInput, Pressable, Modal } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../../assets/styles/register.styles';
import LinearGradient from 'react-native-linear-gradient';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' as const },
  { label: 'Female', value: 'female' as const },
  { label: 'Prefer not to say', value: 'prefer_not_say' as const },
];

const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getGenderLabel = (value: string): string => {
  const option = GENDER_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : 'Select gender';
};

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_say' | ''>('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formattedBirthdate = useMemo(() => formatDate(birthdate), [birthdate]);
  const genderLabel = useMemo(() => getGenderLabel(gender), [gender]);
  const defaultDate = useMemo(() => new Date(), []);

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setBirthdate(selectedDate);
    }
  }, []);

  const handleGenderSelect = useCallback((value: 'male' | 'female' | 'prefer_not_say') => {
    setGender(value);
    setShowGenderDropdown(false);
  }, []);

  const router = useRouter();
  const backendUrl = 'http://192.168.1.8:4000';

  const handleRegister = async () => {
    console.log('Register button pressed!');
    console.log('Form data:', { email, name, password });
    
    if (!email || !name || !password || !birthdate || !gender) {
      console.log('Missing fields detected');
      Toast.show({
        type: 'error',
        text1: 'Please fill in all fields!',
      });
      return;
    }
    
    console.log('Starting registration...');
    setIsLoading(true);
    const userData = { email, name, password, birthdate: formatDate(birthdate), gender };
    
    try {
      console.log('Sending request to:', `${backendUrl}/api/auth/register`);
      const response = await axios.post(`${backendUrl}/api/auth/register`, userData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        Toast.show({ type: 'success', text1: 'Account created successfully!' });
        router.replace('/(auth)/login');
      } else {
        Toast.show({ type: 'error', text1: 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.log('Registration error:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again later.';
      Toast.show({ type: 'error', text1: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
    colors={['#101522', '#18213a', '#2d325a']}
      style={{ flex: 1 }}
    >
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/somnia.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.cardNew}>
        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <Pressable style={styles.tab} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.tabText}>Log In</Text>
          </Pressable>
          <View style={[styles.tab, styles.tabActive]}><Text style={styles.tabTextActive}>Sign Up</Text></View>
        </View>
        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputNew}
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputNew}
            placeholder="Enter your name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputNew}
            placeholder="Enter your password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#888" style={styles.eyeIcon} />
          </TouchableOpacity>
        </View>
        {/* Birthdate */}
        <Text style={styles.label}>Birthdate</Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={{ flex: 1, justifyContent: 'center', height: 48 }}>
            <Text style={{ color: birthdate ? '#222' : '#aaa', fontSize: 17 }}>
              {birthdate ? formattedBirthdate : 'Select birthdate'}
            </Text>
          </View>
          <Icon name="calendar-outline" size={22} color="#888" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthdate || defaultDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={defaultDate}
          />
        )}
        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowGenderDropdown(true)}
        >
          <View style={{ flex: 1, justifyContent: 'center', height: 48 }}>
            <Text style={{ color: gender ? '#222' : '#aaa', fontSize: 17 }}>
              {genderLabel}
            </Text>
          </View>
          <Icon name="chevron-down" size={22} color="#888" />
        </TouchableOpacity>
        {/* Gender Dropdown Modal */}
        <Modal
          visible={showGenderDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowGenderDropdown(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => setShowGenderDropdown(false)}
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                width: '80%',
                maxWidth: 400,
                overflow: 'hidden',
              }}
            >
              {GENDER_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderBottomWidth: index < GENDER_OPTIONS.length - 1 ? 1 : 0,
                    borderBottomColor: '#e0e0e0',
                    backgroundColor: gender === option.value ? '#f0f4ff' : '#fff',
                  }}
                  onPress={() => handleGenderSelect(option.value)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: gender === option.value ? '#3578e5' : '#222',
                      fontWeight: gender === option.value ? '600' : '400',
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Sign Up Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.loginButtonText}>{isLoading ? 'Loading...' : 'Sign Up'}</Text>
        </TouchableOpacity>
        <View style={styles.signUpSpacing} />
      </View>
    </LinearGradient>
  );
}