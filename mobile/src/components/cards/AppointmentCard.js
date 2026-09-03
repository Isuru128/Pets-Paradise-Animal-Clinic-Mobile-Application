import { View, Text, StyleSheet } from 'react-native';

export default function AppointmentCard({ appointment }) {
    return (
        <View style={styles.card}>
            <View style={styles.iconCircle}>
                <Text style={styles.icon}>📅</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>
                    {appointment?.title || appointment?.reason || 'Appointment'}
                </Text>
                <Text style={styles.sub}>
                    {appointment?.pet || appointment?.petName || 'Pet'} • {appointment?.date || 'Date'} • {appointment?.time || 'Time'}
                </Text>
                <Text style={styles.status}>{appointment?.status || 'Pending'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#cffafe',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    icon: {
        fontSize: 22
    },
    content: {
        flex: 1
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111827'
    },
    sub: {
        color: '#6b7280',
        marginTop: 4,
        fontSize: 13
    },
    status: {
        color: '#0891b2',
        fontWeight: '900',
        marginTop: 6
    }
});