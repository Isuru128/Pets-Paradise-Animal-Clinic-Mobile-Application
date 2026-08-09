import { View, Text, StyleSheet } from 'react-native';

export default function PetRecordCard({ pet }) {
    return (
        <View style={styles.card}>
            <View style={styles.iconCircle}>
                <Text style={styles.icon}>🐾</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.name}>{pet?.name || 'Pet Name'}</Text>
                <Text style={styles.sub}>
                    {pet?.type || 'Type'} • {pet?.age || 'Age not set'}
                </Text>
            </View>

            <View style={styles.badge}>
                <Text style={styles.badgeText}>{pet?.status || 'Healthy'}</Text>
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
        backgroundColor: '#dcfce7',
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
    name: {
        fontSize: 17,
        fontWeight: '900',
        color: '#111827'
    },
    sub: {
        color: '#6b7280',
        marginTop: 4
    },
    badge: {
        backgroundColor: '#ecfdf5',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12
    },
    badgeText: {
        color: '#16a34a',
        fontWeight: '900',
        fontSize: 12
    }
});