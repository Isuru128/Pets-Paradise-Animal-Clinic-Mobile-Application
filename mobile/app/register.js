import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import API from '../src/services/api';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    const update = (key, value) => setForm({ ...form, [key]: value });
    const updatePhone = (value) => setForm({ ...form, phone: value.replace(/\D/g, '').slice(0, 10) });

    const handleRegister = async () => {
        try {
            if (!form.name || !form.email || !form.phone || !form.password) {
                Alert.alert('Validation Error', 'Name, email, mobile number and password are required');
                return;
            }

            if (!/^\d{10}$/.test(form.phone)) {
                Alert.alert('Validation Error', 'Mobile number must be exactly 10 digits');
                return;
            }

            if (form.password !== form.confirmPassword) {
                Alert.alert('Validation Error', 'Passwords do not match');
                return;
            }

            await API.post('/auth/register', {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                password: form.password
            });

            Alert.alert('Success', 'Profile created successfully', [
                { text: 'OK', onPress: () => router.replace('/') }
            ]);
        } catch (error) {
            Alert.alert('Registration Error', error.response?.data?.msg || 'Failed to register');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create User Profile</Text>

            {[
                { key: 'name', label: 'Full Name' },
                { key: 'email', label: 'Email', keyboardType: 'email-address' },
                { key: 'phone', label: 'Mobile Number', keyboardType: 'number-pad', maxLength: 10 },
                { key: 'address', label: 'Default Address', multiline: true },
                { key: 'password', label: 'Password' },
                { key: 'confirmPassword', label: 'Confirm Password' }
            ].map((field) => (
                <TextInput
                    key={field.key}
                    style={[styles.input, field.multiline && styles.textArea]}
                    placeholder={field.label}
                    value={form[field.key]}
                    onChangeText={(value) => (field.key === 'phone' ? updatePhone(value) : update(field.key, value))}
                    secureTextEntry={field.key.toLowerCase().includes('password')}
                    autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
                    keyboardType={field.keyboardType || 'default'}
                    maxLength={field.maxLength}
                    multiline={field.multiline}
                />
            ))}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Create Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/')}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 24 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 13, marginBottom: 13 },
    textArea: { minHeight: 88, textAlignVertical: 'top' },
    button: { backgroundColor: '#16a34a', padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 6 },
    buttonText: { color: '#fff', fontWeight: '800' },
    link: { textAlign: 'center', marginTop: 18, color: '#2563eb', fontWeight: '700' }
});
