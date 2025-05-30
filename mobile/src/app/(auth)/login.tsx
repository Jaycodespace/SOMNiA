import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react'
import { useRouter, Link } from 'expo-router'
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContainer from '../../components/AuthContainer';
import AuthTextInputs from '../../components/AuthITextInputs';
import AuthPasswordInputs from '../../components/AuthPasswordInputs';
import styles from '../../assets/styles/login.styles';
 
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
 
    const router = useRouter();
 
    // Use localhost for web development
<<<<<<< HEAD
    const backendUrl = 'http://192.168.1.8:4000'

    const handleLogin = async () => {
        setIsLoading(true);

        // Create user data object
        const userData = { 
            email, 
            password 
        };

=======
    const backendUrl = 'http://192.168.254.142:4000'
 
    const handleLogin = async () => {
        setIsLoading(true);
 
        // Create user data object
        const userData = {
            email,
            password
        };
 
>>>>>>> d4eb89d042084f702f50d394c47e685c34a2e95d
        try {
            // Send POST request to the backend to login
            console.log('Attempting login to:', `${backendUrl}/api/auth/login`);
            const response = await axios.post(`${backendUrl}/api/auth/login`, userData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
<<<<<<< HEAD

            // Handle successful login
            if (response.data.success) {
                console.log('Login successful, response:', response.data);
                
                // Extract token from cookie
                const token = response.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
                
=======
 
            // Handle successful login
            if (response.data.success) {
                console.log('Login successful, response:', response.data);
               
                // Extract token from cookie
                const token = response.data.token;
                console.log(token);
>>>>>>> d4eb89d042084f702f50d394c47e685c34a2e95d
                if (token) {
                    // Store auth data
                    const authData = {
                        token,
                        timestamp: new Date().getTime(),
                        isAuthenticated: true
                    };
<<<<<<< HEAD
                    await AsyncStorage.setItem('authData', JSON.stringify(authData));
                }

=======
                    await AsyncStorage.setItem('token', token);
                }
 
>>>>>>> d4eb89d042084f702f50d394c47e685c34a2e95d
                Toast.show({
                    type: 'success',
                    text1: 'Login successful!',
                });
<<<<<<< HEAD
                router.replace('/home'); 
=======
                router.replace('/home');
>>>>>>> d4eb89d042084f702f50d394c47e685c34a2e95d
            } else {
                console.log('Login failed, response:', response.data);
                Toast.show({
                    type: 'error',
                    text1: 'Login failed',
                    text2: 'Please try again.',
                });
            }
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            Toast.show({
                type: 'error',
                text1: 'Login Error',
                text2: error.response?.data?.message || 'An error occurred. Please try again later.',
            });
        } finally {
            setIsLoading(false);
        }
    };
<<<<<<< HEAD
  
    return (
        <AuthContainer 
            authTitleImg={require('../../assets/images/login.png')} 
            authType="Login" 
=======
 
    return (
        <AuthContainer
            authTitleImg={require('../../assets/images/login.png')}
            authType="Login"
>>>>>>> d4eb89d042084f702f50d394c47e685c34a2e95d
            authOnPress={handleLogin}
            authBtnLoading={isLoading}
            goToLink={
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
<<<<<<< HEAD
                    
=======
                   
>>>>>>> d4eb89d042084f702f50d394c47e685c34a2e95d
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                            <Text style={styles.link}>Register</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            }>
            <View style={styles.formContainer}>
                {/* Email */}
                <Text style={styles.label}>Email</Text>
<<<<<<< HEAD
                <AuthTextInputs 
                    icon="mail-outline" 
                    placeHolder="Enter your email" 
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address" />

                {/* Password */}
                <Text style={styles.label}>Password</Text>
                <AuthPasswordInputs 
                    icon="lock-closed-outline" 
                    placeHolder="Enter your password" 
                    value={password} 
=======
                <AuthTextInputs
                    icon="mail-outline"
                    placeHolder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address" />
 
                {/* Password */}
                <Text style={styles.label}>Password</Text>
                <AuthPasswordInputs
                    icon="lock-closed-outline"
                    placeHolder="Enter your password"
                    value={password}
>>>>>>> d4eb89d042084f702f50d394c47e685c34a2e95d
                    onChangeText={setPassword} />
            </View>
        </AuthContainer>
    );
}