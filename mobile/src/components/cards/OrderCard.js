import { View, Text, StyleSheet } from 'react-native';

export default function OrderCard({ order }) {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.id}>{order?.id || order?._id || 'ORD-000'}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{order?.status || 'Pending'}</Text>
                </View>
            </View>

            <Text style={styles.text}>Date: {order?.date || order?.createdAt || 'Not available'}</Text>
            <Text style={styles.text}>Items: {order?.items?.length || 0}</Text>
            <Text style={styles.total}>
                Total: {order?.totalAmount ? `Rs. ${order.totalAmount}` : order?.total || 'Rs. 0'}
            </Text>
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
    id: {
        fontSize: 17,
        fontWeight: '900',
        color: '#111827'
    },
    badge: {
        backgroundColor: '#ecfeff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 12
    },
    badgeText: {
        color: '#0891b2',
        fontWeight: '900',
        fontSize: 12
    },
    text: {
        color: '#6b7280',
        marginTop: 3
    },
    total: {
        color: '#0891b2',
        fontWeight: '900',
        marginTop: 10,
        fontSize: 16
    }
});