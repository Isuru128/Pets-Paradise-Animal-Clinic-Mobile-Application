import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from "expo-router/react-navigation";
import API from '../../src/services/api';

const initialForm = {
    petName: '',
    reason: '',
    customReason: '',
    date: formatDateInput(new Date()),
    time: ''
};
const appointmentReasons = ['Checkup', 'Vaccination', 'Grooming', 'Treatment', 'Surgery Consultation', 'Other'];
const sessions = [
    { label: 'Morning Session', time: '9.00 AM - 12.30 PM', start: '09:00', end: '12:30' },
    { label: 'Evening Session', time: '5.00 PM - 8.30 PM', start: '17:00', end: '20:30' }
];

export default function AppointmentsPage() {
    const [form, setForm] = useState(initialForm);
    const [appointments, setAppointments] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const [cancellingAppointmentId, setCancellingAppointmentId] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await API.get('/appointments/my-appointments');
            setAppointments(res.data);
        } catch (error) {
            Alert.alert('Appointments Error', error.response?.data?.msg || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadSlots = useCallback(async (date) => {
        try {
            setLoadingSlots(true);
            const res = await API.get('/appointments/available-slots', { params: { date } });
            setSlots(res.data?.slots || []);
        } catch (error) {
            setSlots([]);
            Alert.alert('Slots Error', error.response?.data?.msg || 'Failed to load appointment slots');
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAppointments();
        }, [loadAppointments])
    );

    useEffect(() => {
        loadSlots(form.date);
    }, [form.date, loadSlots]);

    useEffect(() => {
        if (form.time && !isSlotAvailable(form.time, slots)) {
            setForm((current) => ({ ...current, time: '' }));
        }
    }, [form.time, slots]);

    const updateForm = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const selectReason = (reason) => {
        setForm((current) => ({
            ...current,
            reason,
            customReason: reason === 'Other' ? current.customReason : ''
        }));
    };

    const bookAppointment = async () => {
        const appointmentReason = getAppointmentReason(form);

        if (!form.petName.trim() || !appointmentReason || !form.date || !form.time) {
            Alert.alert('Validation Error', 'Please complete pet name, reason, date and time slot');
            return;
        }

        const slotError = validateSelectedSlot(form.date, form.time, slots);

        if (slotError) {
            Alert.alert('Time Slot Error', slotError);
            return;
        }

        try {
            setBooking(true);
            const res = await API.post('/appointments', {
                petName: form.petName.trim(),
                reason: appointmentReason,
                date: form.date,
                time: form.time
            });

            setAppointments((current) => [res.data, ...current]);
            setForm((current) => ({ ...initialForm, date: current.date }));
            await loadSlots(form.date);
            Alert.alert('Booked', 'Appointment booked successfully');
        } catch (error) {
            Alert.alert('Booking Error', error.response?.data?.msg || 'Failed to book appointment');
        } finally {
            setBooking(false);
        }
    };

    const cancelAppointment = (appointment) => {
        const appointmentId = appointment._id || appointment.id;

        if (!appointmentId) {
            return;
        }

        Alert.alert(
            'Cancel Appointment',
            'This will release the booked time slot for another appointment.',
            [
                { text: 'Keep Appointment', style: 'cancel' },
                {
                    text: 'Cancel Appointment',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setCancellingAppointmentId(appointmentId);
                            const res = await API.put(`/appointments/${appointmentId}/cancel`);

                            setAppointments((current) =>
                                current.map((item) => ((item._id || item.id) === appointmentId ? res.data : item))
                            );
                            await loadSlots(form.date);
                        } catch (error) {
                            Alert.alert('Cancel Error', error.response?.data?.msg || 'Failed to cancel appointment');
                        } finally {
                            setCancellingAppointmentId(null);
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Appointments</Text>
                <TouchableOpacity onPress={loadAppointments}>
                    <Text style={styles.refresh}>Refresh</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sessionCard}>
                {sessions.map((session) => (
                    <View style={styles.sessionRow} key={session.label}>
                        <Ionicons name="time-outline" size={20} color="#2563eb" />
                        <View>
                            <Text style={styles.sessionTitle}>{session.label}</Text>
                            <Text style={styles.sessionTime}>{session.time}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Book Appointment</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Pet Name"
                    value={form.petName}
                    onChangeText={(value) => updateForm('petName', value)}
                />
                <Text style={styles.fieldLabel}>Reason for appointment</Text>
                <View style={styles.reasonGrid}>
                    {appointmentReasons.map((reason) => (
                        <TouchableOpacity
                            key={reason}
                            style={[styles.reasonButton, form.reason === reason && styles.reasonButtonActive]}
                            onPress={() => selectReason(reason)}
                        >
                            <Text style={[styles.reasonText, form.reason === reason && styles.reasonTextActive]}>{reason}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {form.reason === 'Other' ? (
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Type appointment reason"
                        value={form.customReason}
                        onChangeText={(value) => updateForm('customReason', value)}
                        multiline
                    />
                ) : null}

                <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>{form.date}</Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
                {showDatePicker ? (
                    <DateTimePicker
                        value={parseDate(form.date)}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);

                            if (event.type === 'dismissed') {
                                return;
                            }

                            if (selectedDate) {
                                setForm((current) => ({
                                    ...current,
                                    date: formatDateInput(selectedDate),
                                    time: ''
                                }));
                            }
                        }}
                    />
                ) : null}

                <Text style={styles.slotTitle}>Choose Time Slot</Text>
                {loadingSlots ? (
                    <View style={styles.slotLoading}>
                        <ActivityIndicator color="#2563eb" />
                    </View>
                ) : (
                    <View style={styles.slotGrid}>
                        {slots.length === 0 ? (
                            <Text style={styles.emptyText}>No slots available for this date</Text>
                        ) : (
                            slots.map((slot) => (
                                <TouchableOpacity
                                    key={slot.time}
                                    style={[
                                        styles.slotButton,
                                        form.time === slot.time && styles.slotButtonActive,
                                        !slot.available && styles.slotButtonDisabled
                                    ]}
                                    onPress={() => updateForm('time', slot.time)}
                                    disabled={!slot.available}
                                >
                                    {!slot.available ? (
                                        <View style={styles.slotBlockedIcon}>
                                            <Ionicons name="close" size={10} color="#fff" />
                                        </View>
                                    ) : null}
                                    <Text
                                        style={[
                                            styles.slotText,
                                            form.time === slot.time && styles.slotTextActive,
                                            !slot.available && styles.slotTextDisabled
                                        ]}
                                    >
                                        {formatTimeLabel(slot.time)}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.bookButton, (booking || loadingSlots || !isSlotAvailable(form.time, slots)) && styles.buttonDisabled]}
                    onPress={bookAppointment}
                    disabled={booking || loadingSlots || !isSlotAvailable(form.time, slots)}
                >
                    <Text style={styles.bookButtonText}>{booking ? 'Booking...' : 'Book Appointment'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>My Appointments</Text>
            </View>
            {loading ? (
                <ActivityIndicator color="#2563eb" />
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={(item) => item._id || item.id}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.emptyText}>No appointments booked yet</Text>}
                    renderItem={({ item }) => (
                        <AppointmentCard
                            appointment={item}
                            isCancelling={cancellingAppointmentId === (item._id || item.id)}
                            onCancel={cancelAppointment}
                        />
                    )}
                />
            )}
        </ScrollView>
    );
}

function AppointmentCard({ appointment, isCancelling, onCancel }) {
    const canCancel = canCancelAppointment(appointment.status);

    return (
        <View style={styles.appointmentCard}>
            <View style={styles.appointmentTopRow}>
                <View style={styles.appointmentIcon}>
                    <Ionicons name="calendar-outline" size={22} color="#2563eb" />
                </View>
                <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentReason}>{appointment.reason}</Text>
                    <Text style={styles.appointmentMeta}>
                        {appointment.petName} | {appointment.date} | {formatTimeLabel(appointment.time)}
                    </Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(appointment.status)]}>
                    <Text style={styles.statusText}>{appointment.status || 'Pending'}</Text>
                </View>
            </View>
            {canCancel ? (
                <TouchableOpacity
                    style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
                    onPress={() => onCancel(appointment)}
                    disabled={isCancelling}
                >
                    <Ionicons name="close-circle-outline" size={17} color={isCancelling ? '#fca5a5' : '#dc2626'} />
                    <Text style={[styles.cancelText, isCancelling && styles.cancelTextDisabled]}>
                        {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

function getStatusStyle(status) {
    if (status === 'Completed') return styles.statusCompleted;
    if (status === 'Confirmed') return styles.statusConfirmed;
    if (status === 'Cancelled') return styles.statusCancelled;

    return styles.statusPending;
}

function getAppointmentReason(form) {
    if (form.reason === 'Other') {
        return form.customReason.trim();
    }

    return form.reason.trim();
}

function canCancelAppointment(status) {
    return ['Pending', 'Confirmed'].includes(status || 'Pending');
}

function parseDate(value) {
    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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

function validateSelectedSlot(date, time, slots) {
    if (!isValidDate(date)) {
        return 'Please choose a valid appointment date';
    }

    if (isPastDate(date)) {
        return 'Appointment date cannot be in the past';
    }

    if (!isClinicSlot(time)) {
        return 'Please choose a valid 15-minute clinic time slot';
    }

    if (isPastSlot(date, time)) {
        return 'Appointment time cannot be in the past';
    }

    if (!isSlotAvailable(time, slots)) {
        return 'This appointment slot is no longer available';
    }

    return '';
}

function isSlotAvailable(time, slots) {
    if (!time) {
        return false;
    }

    return slots.some((slot) => slot.time === time && slot.available);
}

function isClinicSlot(time) {
    if (!isValidTime(time)) {
        return false;
    }

    const minutes = timeToMinutes(time);

    return sessions.some((session) => {
        const start = timeToMinutes(session.start);
        const end = timeToMinutes(session.end);

        return minutes >= start && minutes < end;
    });
}

function isValidDate(value) {
    const date = parseDate(value);

    return formatDateInput(date) === value;
}

function isPastDate(value) {
    const date = parseDate(value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return date < today;
}

function isPastSlot(date, time) {
    return new Date(`${date}T${time}:00`) < new Date();
}

function isValidTime(value) {
    if (!/^\d{2}:\d{2}$/.test(String(value || ''))) {
        return false;
    }

    const [hours, minutes] = value.split(':').map(Number);

    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && minutes % 15 === 0;
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fb' },
    content: { padding: 16, paddingBottom: 34 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '900', color: '#111827' },
    refresh: { color: '#2563eb', fontWeight: '900' },
    sessionCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 14, gap: 12 },
    sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sessionTitle: { color: '#111827', fontWeight: '900' },
    sessionTime: { color: '#6b7280', marginTop: 2 },
    formCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 12 },
    fieldLabel: { color: '#374151', fontWeight: '900', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 13, marginBottom: 12, backgroundColor: '#fff' },
    textArea: { minHeight: 76, textAlignVertical: 'top' },
    reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    reasonButton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
    reasonButtonActive: { backgroundColor: '#111827', borderColor: '#111827' },
    reasonText: { color: '#374151', fontWeight: '900', fontSize: 12 },
    reasonTextActive: { color: '#fff' },
    dateInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 13, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dateText: { color: '#111827', fontWeight: '800' },
    slotTitle: { color: '#374151', fontWeight: '900', marginBottom: 10 },
    slotLoading: { paddingVertical: 20, alignItems: 'center' },
    slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    slotButton: { width: '30.8%', minHeight: 42, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    slotButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    slotButtonDisabled: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
    slotBlockedIcon: { position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
    slotText: { color: '#2563eb', fontWeight: '900', fontSize: 12 },
    slotTextActive: { color: '#fff' },
    slotTextDisabled: { color: '#9ca3af' },
    bookButton: { backgroundColor: '#16a34a', padding: 14, borderRadius: 14, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#86efac' },
    bookButtonText: { color: '#fff', fontWeight: '900' },
    listHeader: { marginTop: 2 },
    appointmentCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 12 },
    appointmentTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    appointmentIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    appointmentInfo: { flex: 1 },
    appointmentReason: { color: '#111827', fontWeight: '900', fontSize: 16 },
    appointmentMeta: { color: '#6b7280', marginTop: 4 },
    cancelButton: { alignSelf: 'flex-end', marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fef2f2' },
    cancelButtonDisabled: { backgroundColor: '#fee2e2' },
    cancelText: { color: '#dc2626', fontWeight: '900', fontSize: 12 },
    cancelTextDisabled: { color: '#fca5a5' },
    statusBadge: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 12 },
    statusPending: { backgroundColor: '#eff6ff' },
    statusConfirmed: { backgroundColor: '#dbeafe' },
    statusCompleted: { backgroundColor: '#dcfce7' },
    statusCancelled: { backgroundColor: '#fee2e2' },
    statusText: { color: '#111827', fontSize: 12, fontWeight: '900' },
    emptyText: { color: '#6b7280', fontWeight: '800' }
});
