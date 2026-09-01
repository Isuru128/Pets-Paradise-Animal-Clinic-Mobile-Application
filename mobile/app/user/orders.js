import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from "expo-router/react-navigation";
import API, { API_URL } from '../../src/services/api';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await API.get('/orders/my-orders');
            setOrders(res.data);
        } catch (error) {
            Alert.alert('Orders Error', error.response?.data?.msg || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Orders</Text>
                <TouchableOpacity onPress={loadOrders}>
                    <Text style={styles.refresh}>Refresh</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color="#2563eb" />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No orders yet</Text>}
                    renderItem={({ item }) => <OrderCard order={item} />}
                />
            )}
        </View>
    );
}

function OrderCard({ order }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{shortId(order._id || order.id)}</Text>
                    <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
                    <Text style={styles.statusText}>{order.status || 'Pending'}</Text>
                </View>
            </View>

            <View style={styles.items}>
                {(order.items || []).map((item, index) => (
                    <View style={styles.itemRow} key={`${item.product || item.name}-${index}`}>
                        <View style={styles.itemNameWrap}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.name || 'Product'}</Text>
                            <Text style={styles.itemMeta}>Qty {item.quantity} x Rs. {formatMoney(item.price)}</Text>
                        </View>
                        <Text style={styles.itemTotal}>Rs. {formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.details}>
                <Text style={styles.detailText}>Payment: {order.paymentMethod || 'Cash on Delivery'}</Text>
                <Text style={styles.detailText}>Mobile: {order.mobileNumber || 'Not provided'}</Text>
                <Text style={styles.detailText}>Address: {order.shippingAddress || 'Not provided'}</Text>
                {order.paymentProof?.url ? (
                    <TouchableOpacity style={styles.proofLink} onPress={() => Linking.openURL(getFileUrl(order.paymentProof.url))}>
                        <Text style={styles.proofLinkText}>View payment proof</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <Text style={styles.total}>Total: Rs. {formatMoney(order.totalAmount)}</Text>
        </View>
    );
}

function getStatusStyle(status) {
    if (status === 'Delivered') {
        return styles.statusDelivered;
    }

    if (status === 'Shipped') {
        return styles.statusShipped;
    }

    if (status === 'Processing') {
        return styles.statusProcessing;
    }

    if (status === 'Confirmed') {
        return styles.statusConfirmed;
    }

    if (status === 'Cancelled') {
        return styles.statusBad;
    }

    return styles.statusPending;
}

function shortId(value) {
    return String(value || '').slice(-6).toUpperCase();
}

function formatDate(value) {
    if (!value) return 'Not available';
    return new Date(value).toLocaleString();
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString();
}

function getFileUrl(value) {
    const baseUrl = API_URL.replace(/\/api$/, '');
    return value.startsWith('http') ? value : `${baseUrl}${value}`;
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '900' },
    refresh: { color: '#2563eb', fontWeight: '900' },
    list: { paddingBottom: 24 },
    emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#6b7280', fontWeight: '800' },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
    orderInfo: { flex: 1 },
    orderId: { fontSize: 18, fontWeight: '900', color: '#111827' },
    date: { color: '#6b7280', marginTop: 4 },
    statusBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12 },
    statusConfirmed: { backgroundColor: '#dbeafe' },
    statusProcessing: { backgroundColor: '#ede9fe' },
    statusShipped: { backgroundColor: '#fef3c7' },
    statusDelivered: { backgroundColor: '#dcfce7' },
    statusPending: { backgroundColor: '#eff6ff' },
    statusBad: { backgroundColor: '#fee2e2' },
    statusText: { fontSize: 12, fontWeight: '900', color: '#111827' },
    items: { marginTop: 14 },
    itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
    itemNameWrap: { flex: 1 },
    itemName: { fontWeight: '900', color: '#111827' },
    itemMeta: { color: '#6b7280', marginTop: 2 },
    itemTotal: { fontWeight: '900', color: '#111827' },
    details: { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 4 },
    detailText: { color: '#6b7280', marginTop: 4 },
    proofLink: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#eff6ff', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10 },
    proofLinkText: { color: '#2563eb', fontWeight: '900', fontSize: 12 },
    total: { color: '#2563eb', fontWeight: '900', fontSize: 18, marginTop: 12 }
});
