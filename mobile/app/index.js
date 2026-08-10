import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import API from '../src/services/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                Alert.alert('Validation Error', 'Please enter email and password');
                return;
            }

            const res = await API.post('/auth/login', { email, password });
            const { token, user } = res.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'admin') {
                router.replace('/admin/dashboard');
            } else {
                router.replace('/user/dashboard');
            }
        } catch (error) {
            Alert.alert('Login Error', error.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>🐾 Pets Paradise</Text>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <View style={styles.passwordField}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((current) => !current)}
                >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.link}>Don&apos;t have an account? Create account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f7fb' },
    logo: { fontSize: 30, fontWeight: '900', color: '#2563eb', textAlign: 'center', marginBottom: 8 },
    title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 28 },
    input: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
    passwordField: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1, padding: 14 },
    eyeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 14, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    link: { textAlign: 'center', marginTop: 18, color: '#16a34a', fontWeight: '700' }
});