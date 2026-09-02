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
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (loading) return;

        try {
            if (!email || !password) {
                Alert.alert('Validation Error', 'Please enter email and password');
                return;
            }

            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>🐾 Pets Paradise</Text>
            <Text style={styles.title}>Welcome Back</Text>

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordField}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
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

            {password.length > 0 ? (
                <View style={styles.passwordInfoRow}>
                    <Text style={styles.asteriskPreview}>{'* '.repeat(password.length).trim()}</Text>
                    <Text style={styles.passwordCounter}>
                        {password.length} {password.length === 1 ? 'digit' : 'digits'} entered
                    </Text>
                </View>
            ) : null}

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
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
    title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 4 },
    input: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 15, color: '#111827' },
    passwordField: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1, padding: 14, fontSize: 15, color: '#111827' },
    eyeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    passwordInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: -6,
        marginBottom: 14,
        paddingHorizontal: 4
    },
    asteriskPreview: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#2563eb'
    },
    passwordCounter: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6b7280'
    },
    button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 14, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#93c5fd' },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    link: { textAlign: 'center', marginTop: 18, color: '#16a34a', fontWeight: '700' }
});