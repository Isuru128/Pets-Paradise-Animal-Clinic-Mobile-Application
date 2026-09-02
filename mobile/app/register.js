import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const isPasswordField = (key) => key === 'password' || key === 'confirmPassword';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create User Profile</Text>

            {[
                { key: 'name', label: 'Full Name', placeholder: 'e.g. John Doe', required: true },
                { key: 'email', label: 'Email', placeholder: 'e.g. john@example.com', keyboardType: 'email-address', required: true },
                { key: 'phone', label: 'Mobile Number', placeholder: '10-digit mobile number', keyboardType: 'number-pad', maxLength: 10, required: true },
                { key: 'address', label: 'Default Address', placeholder: 'Shipping or home address', multiline: true, required: false },
                { key: 'password', label: 'Password', placeholder: 'Enter password', required: true },
                { key: 'confirmPassword', label: 'Confirm Password', placeholder: 'Re-enter password', required: true }
            ].map((field) => (
                <View key={field.key} style={styles.fieldWrap}>
                    <Text style={styles.inputLabel}>
                        {field.label} {field.required ? <Text style={styles.requiredStar}>*</Text> : null}
                    </Text>

                    {isPasswordField(field.key) ? (
                        <>
                            <View style={styles.passwordField}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={field.placeholder || field.label}
                                    placeholderTextColor="#9ca3af"
                                    value={form[field.key]}
                                    onChangeText={(value) => update(field.key, value)}
                                    secureTextEntry={field.key === 'password' ? !showPassword : !showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => {
                                        if (field.key === 'password') {
                                            setShowPassword((current) => !current);
                                        } else {
                                            setShowConfirmPassword((current) => !current);
                                        }
                                    }}
                                >
                                    <Ionicons
                                        name={
                                            (field.key === 'password' ? showPassword : showConfirmPassword)
                                                ? 'eye-off-outline'
                                                : 'eye-outline'
                                        }
                                        size={22}
                                        color="#6b7280"
                                    />
                                </TouchableOpacity>
                            </View>

                            {form[field.key].length > 0 ? (
                                <View style={styles.passwordInfoRow}>
                                    <Text style={styles.asteriskPreview}>{'* '.repeat(form[field.key].length).trim()}</Text>
                                    <Text
                                        style={[
                                            styles.passwordCounter,
                                            field.key === 'confirmPassword' && (
                                                form.password === form.confirmPassword ? styles.passwordMatch : styles.passwordMismatch
                                            )
                                        ]}
                                    >
                                        {field.key === 'confirmPassword'
                                            ? (form.password === form.confirmPassword
                                                ? `✓ Match (${form.confirmPassword.length} digits)`
                                                : `✕ Doesn't match (${form.confirmPassword.length} digits)`)
                                            : `${form.password.length} ${form.password.length === 1 ? 'digit' : 'digits'} entered`}
                                    </Text>
                                </View>
                            ) : null}
                        </>
                    ) : (
                        <TextInput
                            style={[styles.input, field.multiline && styles.textArea]}
                            placeholder={field.placeholder || field.label}
                            placeholderTextColor="#9ca3af"
                            value={form[field.key]}
                            onChangeText={(value) => (field.key === 'phone' ? updatePhone(value) : update(field.key, value))}
                            autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
                            keyboardType={field.keyboardType || 'default'}
                            maxLength={field.maxLength}
                            multiline={field.multiline}
                        />
                    )}
                </View>
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
    fieldWrap: { marginBottom: 12 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
    requiredStar: { color: '#dc2626' },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 13, fontSize: 15, color: '#111827', backgroundColor: '#ffffff' },
    passwordField: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1, padding: 13, fontSize: 15, color: '#111827', backgroundColor: '#ffffff', borderRadius: 12 },
    eyeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    passwordInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingHorizontal: 4
    },
    asteriskPreview: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        color: '#16a34a'
    },
    passwordCounter: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6b7280'
    },
    passwordMatch: {
        color: '#16a34a'
    },
    passwordMismatch: {
        color: '#dc2626'
    },
    textArea: { minHeight: 88, textAlignVertical: 'top' },
    button: { backgroundColor: '#16a34a', padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#fff', fontWeight: '800' },
    link: { textAlign: 'center', marginTop: 18, color: '#2563eb', fontWeight: '700' }
});