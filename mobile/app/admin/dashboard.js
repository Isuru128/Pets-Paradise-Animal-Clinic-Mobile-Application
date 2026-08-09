import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../src/services/api';

const defaultStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalAppointments: 0
};

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState(defaultStats);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState('');

    const loadStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            setStatsError('');

            const res = await API.get('/admin/stats');

            setStats({
                totalOrders: Number(res.data?.totalOrders || 0),
                totalProducts: Number(res.data?.totalProducts || 0),
                totalAppointments: Number(res.data?.totalAppointments || 0)
            });
        } catch (error) {
            setStatsError(getStatsErrorMessage(error));
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [loadStats])
    );

    const logout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    router.replace('/');
                }
            }
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Admin Dashboard</Text>
                    <Text style={styles.sub}>Manage Pets Paradise system operations</Text>
                </View>

                <TouchableOpacity style={styles.logout} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <Stat label="Orders" value={stats.totalOrders} loading={statsLoading} />
                <Stat label="Products" value={stats.totalProducts} loading={statsLoading} />
                <Stat label="Bookings" value={stats.totalAppointments} loading={statsLoading} />
            </View>

            {statsError ? (
                <TouchableOpacity style={styles.statsError} onPress={loadStats}>
                    <Text style={styles.statsErrorText}>{statsError}. Tap to retry.</Text>
                </TouchableOpacity>
            ) : null}

            <AdminAction title="Products" icon="bag-outline" onPress={() => router.push('/admin/product')} />
            <AdminAction title="Orders" icon="cube-outline" onPress={() => router.push('/admin/orders')} />
            <AdminAction title="Appointments" icon="calendar-outline" onPress={() => router.push('/admin/appointments')} />
            <AdminAction title="Pet Records" icon="paw-outline" onPress={() => router.push('/admin/pets')} />
        </ScrollView>
    );
}

function Stat({ label, value, loading }) {
    return (
        <View style={styles.stat}>
            <Text style={styles.statValue}>{loading ? '...' : value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function getStatsErrorMessage(error) {
    const status = error.response?.status;

    if (status === 404) {
        return 'Dashboard stats endpoint not found. Restart the backend server';
    }

    if (!error.response) {
        return 'Cannot reach the backend server';
    }

    return (
        error.response?.data?.msg ||
        error.response?.data?.error ||
        'Unable to load dashboard stats'
    );
}

function AdminAction({ title, icon, onPress }) {
    return (
        <TouchableOpacity style={styles.action} onPress={onPress}>
            <Ionicons name={icon} size={24} color="#2563eb" style={styles.icon} />
            <Text style={styles.actionText}>{title}</Text>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fb' },
    content: { padding: 18 },
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
    headerText: { flex: 1 },
    title: { fontSize: 30, fontWeight: '900' },
    sub: { color: '#6b7280' },
    logout: { backgroundColor: '#dc2626', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14 },
    logoutText: { color: '#fff', fontWeight: '900' },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    stat: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 18 },
    statValue: { fontSize: 22, fontWeight: '900', color: '#2563eb' },
    statLabel: { color: '#6b7280' },
    statsError: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 14, marginBottom: 16 },
    statsErrorText: { color: '#991b1b', fontWeight: '800' },
    action: { backgroundColor: '#fff', padding: 18, borderRadius: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 14 },
    actionText: { flex: 1, fontWeight: '900', fontSize: 17 }
});
