import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from "expo-router/react-navigation";
import API from '../../src/services/api';

const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const statusFilters = ['All', ...statuses];

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const visibleAppointments = getVisibleAppointments(appointments, statusFilter);

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await API.get('/appointments');
            setAppointments(res.data);
        } catch (error) {
            Alert.alert('Appointments Error', error.response?.data?.msg || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAppointments();
        }, [loadAppointments])
    );

    const updateStatus = async (appointment, status) => {
        const appointmentId = appointment._id || appointment.id;

        try {
            setUpdatingAppointmentId(appointmentId);
            const res = await API.put(`/appointments/${appointmentId}/status`, { status });

            setAppointments((current) =>
                current.map((item) => ((item._id || item.id) === appointmentId ? res.data : item))
            );
        } catch (error) {
            Alert.alert('Status Error', error.response?.data?.msg || 'Failed to update appointment status');
        } finally {
            setUpdatingAppointmentId(null);
        }
    };

    const confirmStatusChange = (appointment, status) => {
        const currentStatus = appointment.status || 'Pending';

        Alert.alert(
            'Change Appointment Status',
            `Change ${appointment.petName}'s appointment from ${currentStatus} to ${status}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Change',
                    onPress: () => updateStatus(appointment, status)
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Appointment Tracking</Text>
                <TouchableOpacity onPress={loadAppointments}>
                    <Text style={styles.refresh}>Refresh</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterCard}>
                <Text style={styles.filterLabel}>Appointment Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilterRow}>
                    {statusFilters.map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                            onPress={() => setStatusFilter(status)}
                        >
                            <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>{status}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator color="#2563eb" />
            ) : (
                <FlatList
                    data={visibleAppointments}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={visibleAppointments.length === 0 ? styles.emptyList : styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {appointments.length === 0 ? 'No appointments booked yet' : 'No appointments match that status'}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <AppointmentCard
                            appointment={item}
                            isUpdating={updatingAppointmentId === (item._id || item.id)}
                            onStatusChange={(status) => confirmStatusChange(item, status)}
                        />
                    )}
                />
            )}
        </View>
    );
}

function getVisibleAppointments(appointments, statusFilter) {
    if (statusFilter === 'All') {
        return appointments;
    }

    return appointments.filter((appointment) => (appointment.status || 'Pending') === statusFilter);
}

function AppointmentCard({ appointment, isUpdating, onStatusChange }) {
    const customer = appointment.user || {};

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                    <Text style={styles.name}>{appointment.reason}</Text>
                    <Text style={styles.meta}>Pet: {appointment.petName}</Text>
                    <Text style={styles.meta}>Date: {appointment.date}</Text>
                    <Text style={styles.meta}>Time: {formatTimeLabel(appointment.time)}</Text>
                    <Text style={styles.meta}>Owner: {customer.name || 'Unknown'}</Text>
                    <Text style={styles.meta}>Mobile: {customer.phone || 'Not available'}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(appointment.status)]}>
                    <Text style={styles.statusText}>{isUpdating ? 'Updating...' : appointment.status || 'Pending'}</Text>
                </View>
            </View>

            <View style={styles.statusRow}>
                {statuses.map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.statusButton,
                            appointment.status === status && styles.statusButtonActive
                        ]}
                        onPress={() => onStatusChange(status)}
                        disabled={isUpdating || appointment.status === status}
                    >
                        <Text style={[
                            styles.statusButtonText,
                            appointment.status === status && styles.statusButtonTextActive
                        ]}>
                            {status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

function getStatusStyle(status) {
    if (status === 'Completed') return styles.statusCompleted;
    if (status === 'Confirmed') return styles.statusConfirmed;
    if (status === 'Cancelled') return styles.statusCancelled;

    return styles.statusPending;
}

function formatTimeLabel(value) {
    if (!value) {
        return '';
    }

    const [hourText, minuteText] = value.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}.${String(minute).padStart(2, '0')} ${suffix}`;
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { flex: 1, fontSize: 28, fontWeight: '900', color: '#111827' },
    refresh: { color: '#2563eb', fontWeight: '900' },
    filterCard: { backgroundColor: '#fff', borderRadius: 18, padding: 12, marginBottom: 14 },
    filterLabel: { color: '#374151', fontWeight: '900', marginBottom: 8 },
    statusFilterRow: { gap: 8 },
    filterChip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
    filterChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
    filterChipText: { color: '#374151', fontSize: 12, fontWeight: '900' },
    filterChipTextActive: { color: '#fff' },
    list: { paddingBottom: 24 },
    emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#6b7280', fontWeight: '800' },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
    cardInfo: { flex: 1 },
    name: { fontWeight: '900', fontSize: 17, color: '#111827', marginBottom: 4 },
    meta: { color: '#374151', marginTop: 4 },
    statusBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12 },
    statusPending: { backgroundColor: '#eff6ff' },
    statusConfirmed: { backgroundColor: '#dbeafe' },
    statusCompleted: { backgroundColor: '#dcfce7' },
    statusCancelled: { backgroundColor: '#fee2e2' },
    statusText: { color: '#111827', fontSize: 12, fontWeight: '900' },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    statusButton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
    statusButtonActive: { backgroundColor: '#111827', borderColor: '#111827' },
    statusButtonText: { color: '#374151', fontSize: 12, fontWeight: '900' },
    statusButtonTextActive: { color: '#fff' }
});
