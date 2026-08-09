import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import API from '../src/services/api';

const initialPasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
    const [editing, setEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const storedUser = await AsyncStorage.getItem('user');

        if (storedUser) {
            const cachedUser = JSON.parse(storedUser);

            setUser(cachedUser);
            setForm(getProfileForm(cachedUser));
        }

        try {
            const res = await API.get('/auth/me');
            const freshUser = normalizeUser(res.data);

            setUser(freshUser);
            setForm(getProfileForm(freshUser));
            await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
            if (!storedUser) {
                Alert.alert('Profile Error', error.response?.data?.msg || 'Failed to load profile');
            }
        }
    };

    const startEdit = () => {
        setForm(getProfileForm(user));
        setEditing(true);
    };

    const cancelEdit = () => {
        setForm(getProfileForm(user));
        setEditing(false);
    };

    const updateForm = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const updatePhone = (value) => {
        setForm((current) => ({ ...current, phone: value.replace(/\D/g, '').slice(0, 10) }));
    };

    const updatePasswordForm = (key, value) => {
        setPasswordForm((current) => ({ ...current, [key]: value }));
    };

    const saveProfile = async () => {
        if (!form.name.trim()) {
            Alert.alert('Validation Error', 'Name is required');
            return;
        }

        if (!/^\d{10}$/.test(form.phone)) {
            Alert.alert('Validation Error', 'Mobile number must be exactly 10 digits');
            return;
        }

        try {
            setSaving(true);
            const res = await API.put('/auth/me', {
                name: form.name.trim(),
                phone: form.phone,
                address: form.address.trim()
            });
            const updatedUser = normalizeUser(res.data);

            setUser(updatedUser);
            setForm(getProfileForm(updatedUser));
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setEditing(false);
            Alert.alert('Saved', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Profile Error', error.response?.data?.msg || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            Alert.alert('Validation Error', 'Please complete all password fields');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            Alert.alert('Validation Error', 'New password must be at least 6 characters');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            Alert.alert('Validation Error', 'New passwords do not match');
            return;
        }

        try {
            setSavingPassword(true);
            await API.put('/auth/change-password', passwordForm);
            setPasswordForm(initialPasswordForm);
            setShowPasswordForm(false);
            Alert.alert('Saved', 'Password changed successfully');
        } catch (error) {
            Alert.alert('Password Error', error.response?.data?.msg || 'Failed to change password');
        } finally {
            setSavingPassword(false);
        }
    };

    const logout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel' },
            {
                text: 'Logout',
                onPress: async () => {
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    router.replace('/');
                }
            }
        ]);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>Account</Text>
                    <Text style={styles.title}>My Profile</Text>
                </View>
                {!editing ? (
                    <TouchableOpacity style={styles.iconButton} onPress={startEdit}>
                        <Ionicons name="create-outline" size={21} color="#2563eb" />
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.identityCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
                </View>
                <View style={styles.identityInfo}>
                    <Text style={styles.identityName}>{user?.name || 'User'}</Text>
                    <Text style={styles.identityEmail} numberOfLines={1}>{user?.email || 'No email'}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
                    <Text style={styles.statusText}>Active</Text>
                </View>
            </View>

            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <Text style={styles.sectionSubtitle}>Contact details and shipping address</Text>
                    </View>
                </View>

                {editing ? (
                    <>
                        <FieldLabel label="Full Name" />
                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={(value) => updateForm('name', value)}
                            placeholder="Full Name"
                        />

                        <FieldLabel label="Mobile Number" />
                        <TextInput
                            style={styles.input}
                            value={form.phone}
                            onChangeText={updatePhone}
                            placeholder="Mobile Number"
                            keyboardType="number-pad"
                            maxLength={10}
                        />

                        <FieldLabel label="Shipping Address" />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={form.address}
                            onChangeText={(value) => updateForm('address', value)}
                            placeholder="Shipping Address"
                            multiline
                        />

                        <View style={styles.editActions}>
                            <TouchableOpacity
                                style={[styles.secondaryButton, saving && styles.buttonDisabled]}
                                onPress={cancelEdit}
                                disabled={saving}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.primaryButton, saving && styles.buttonDisabled]}
                                onPress={saveProfile}
                                disabled={saving}
                            >
                                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <InfoRow icon="person-outline" label="Name" value={user?.name || 'User'} />
                        <InfoRow icon="mail-outline" label="Email" value={user?.email || 'No email'} />
                        <InfoRow icon="call-outline" label="Mobile Number" value={user?.phone || 'No mobile number'} />
                        <InfoRow icon="location-outline" label="Shipping Address" value={user?.address || 'No shipping address'} />
                    </>
                )}
            </View>

            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Security</Text>
                        <Text style={styles.sectionSubtitle}>Manage password access for this account</Text>
                    </View>
                    <View style={styles.lockIcon}>
                        <Ionicons name="shield-checkmark-outline" size={22} color="#2563eb" />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.securityAction}
                    onPress={() => setShowPasswordForm((current) => !current)}
                    disabled={savingPassword}
                >
                    <View style={styles.securityActionIcon}>
                        <Ionicons name="key-outline" size={21} color="#2563eb" />
                    </View>
                    <View style={styles.securityActionTextWrap}>
                        <Text style={styles.securityActionTitle}>Change Password</Text>
                        <Text style={styles.securityActionSubtitle}>Use your current password to set a new one</Text>
                    </View>
                    <Ionicons name={showPasswordForm ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
                </TouchableOpacity>

                {showPasswordForm ? (
                    <View style={styles.passwordForm}>
                        <FieldLabel label="Current Password" />
                        <TextInput
                            style={styles.input}
                            value={passwordForm.currentPassword}
                            onChangeText={(value) => updatePasswordForm('currentPassword', value)}
                            placeholder="Current Password"
                            secureTextEntry
                        />

                        <FieldLabel label="New Password" />
                        <TextInput
                            style={styles.input}
                            value={passwordForm.newPassword}
                            onChangeText={(value) => updatePasswordForm('newPassword', value)}
                            placeholder="New Password"
                            secureTextEntry
                        />

                        <FieldLabel label="Confirm New Password" />
                        <TextInput
                            style={styles.input}
                            value={passwordForm.confirmPassword}
                            onChangeText={(value) => updatePasswordForm('confirmPassword', value)}
                            placeholder="Confirm New Password"
                            secureTextEntry
                        />

                        <View style={styles.editActions}>
                            <TouchableOpacity
                                style={[styles.secondaryButton, savingPassword && styles.buttonDisabled]}
                                onPress={() => {
                                    setPasswordForm(initialPasswordForm);
                                    setShowPasswordForm(false);
                                }}
                                disabled={savingPassword}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.primaryButton, savingPassword && styles.buttonDisabled]}
                                onPress={savePassword}
                                disabled={savingPassword}
                            >
                                <Text style={styles.primaryButtonText}>{savingPassword ? 'Saving...' : 'Update Password'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}
            </View>

            <TouchableOpacity style={styles.logout} onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <Ionicons name={icon} size={20} color="#2563eb" />
            </View>
            <View style={styles.infoTextWrap}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
}

function FieldLabel({ label }) {
    return <Text style={styles.fieldLabel}>{label}</Text>;
}

function normalizeUser(user) {
    return {
        ...user,
        id: user.id || user._id
    };
}

function getProfileForm(user) {
    return {
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    };
}

function getInitials(name) {
    const parts = String(name || 'User')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, paddingBottom: 34, backgroundColor: '#f5f7fb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
    eyebrow: { color: '#6b7280', fontWeight: '800', marginBottom: 4 },
    title: { fontSize: 30, fontWeight: '900', color: '#111827' },
    iconButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    identityCard: { backgroundColor: '#fff', padding: 18, borderRadius: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: '900', fontSize: 20 },
    identityInfo: { flex: 1 },
    identityName: { color: '#111827', fontWeight: '900', fontSize: 20 },
    identityEmail: { color: '#6b7280', marginTop: 4 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ecfdf5', paddingVertical: 6, paddingHorizontal: 9, borderRadius: 999 },
    statusText: { color: '#16a34a', fontWeight: '900', fontSize: 12 },
    sectionCard: { backgroundColor: '#fff', padding: 18, borderRadius: 18, marginBottom: 14 },
    sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
    sectionTitle: { color: '#111827', fontWeight: '900', fontSize: 18 },
    sectionSubtitle: { color: '#6b7280', marginTop: 4, lineHeight: 19 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    infoIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    infoTextWrap: { flex: 1 },
    label: { color: '#6b7280', fontSize: 13, fontWeight: '800' },
    value: { color: '#111827', fontSize: 16, fontWeight: '800', marginTop: 4, lineHeight: 22 },
    fieldLabel: { color: '#374151', fontSize: 13, fontWeight: '900', marginBottom: 7 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 13, marginBottom: 14, backgroundColor: '#fff', color: '#111827' },
    textArea: { minHeight: 92, textAlignVertical: 'top' },
    editActions: { flexDirection: 'row', gap: 10, marginTop: 2 },
    secondaryButton: { flex: 1, backgroundColor: '#f3f4f6', padding: 14, borderRadius: 14, alignItems: 'center' },
    primaryButton: { flex: 1, backgroundColor: '#2563eb', padding: 14, borderRadius: 14, alignItems: 'center' },
    secondaryButtonText: { color: '#374151', fontWeight: '900' },
    primaryButtonText: { color: '#fff', fontWeight: '900' },
    buttonDisabled: { opacity: 0.6 },
    lockIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    securityAction: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 14 },
    securityActionIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    securityActionTextWrap: { flex: 1 },
    securityActionTitle: { color: '#111827', fontWeight: '900', fontSize: 16 },
    securityActionSubtitle: { color: '#6b7280', marginTop: 3, lineHeight: 18 },
    passwordForm: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 },
    logout: { backgroundColor: '#dc2626', padding: 15, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
    logoutText: { color: '#fff', fontWeight: '900' }
});
