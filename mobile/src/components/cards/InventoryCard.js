import { View, Text, StyleSheet } from 'react-native';

export default function InventoryCard({ item }) {
    const stock = item?.stock ?? item?.quantity ?? 0;
    const isLow = stock <= 5;

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.name}>{item?.name || item?.item || 'Inventory Item'}</Text>
                <View style={[styles.badge, isLow ? styles.lowBadge : styles.goodBadge]}>
                    <Text style={[styles.badgeText, isLow ? styles.lowText : styles.goodText]}>
                        {isLow ? 'Low Stock' : 'Good'}
                    </Text>
                </View>
            </View>

            <Text style={styles.text}>Category: {item?.category || 'General'}</Text>
            <Text style={styles.stock}>Stock: {stock}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    name: {
        flex: 1,
        fontSize: 17,
        fontWeight: '900',
        color: '#111827',
        marginRight: 8
    },
    text: {
        color: '#6b7280',
        marginTop: 4
    },
    stock: {
        color: '#0891b2',
        fontWeight: '900',
        marginTop: 8
    },
    badge: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 12
    },
    goodBadge: {
        backgroundColor: '#ecfdf5'
    },
    lowBadge: {
        backgroundColor: '#fef2f2'
    },
    badgeText: {
        fontWeight: '900',
        fontSize: 12
    },
    goodText: {
        color: '#16a34a'
    },
    lowText: {
        color: '#dc2626'
    }
});