import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from "expo-router/react-navigation";
import API, { API_URL } from '../../src/services/api';

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusFilters = ['All', ...statuses];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [deletingOrderId, setDeletingOrderId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const visibleOrders = getVisibleOrders(orders, statusFilter);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await API.get('/orders');
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

    const updateStatus = async (order, status) => {
        const orderId = order._id || order.id;

        try {
            setUpdatingOrderId(orderId);
            const res = await API.put(`/orders/${orderId}/status`, { status });

            setOrders((current) =>
                current.map((item) => ((item._id || item.id) === orderId ? res.data : item))
            );
        } catch (error) {
            Alert.alert('Status Error', error.response?.data?.msg || 'Failed to update order status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const confirmStatusChange = (order, status) => {
        const currentStatus = order.status || 'Pending';

        Alert.alert(
            'Change Order Status',
            `Change order #${shortId(order._id || order.id)} from ${currentStatus} to ${status}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Change',
                    onPress: () => updateStatus(order, status)
                }
            ]
        );
    };

    const deleteOrder = async (order) => {
        const orderId = order._id || order.id;

        try {
            setDeletingOrderId(orderId);
            await API.delete(`/orders/${orderId}`);
            setOrders((current) => current.filter((item) => (item._id || item.id) !== orderId));
            Alert.alert('Deleted', 'Cancelled order deleted successfully');
        } catch (error) {
            Alert.alert('Delete Error', error.response?.data?.msg || 'Failed to delete order');
        } finally {
            setDeletingOrderId(null);
        }
    };

    const confirmDeleteOrder = (order) => {
        if ((order.status || 'Pending') !== 'Cancelled') {
            Alert.alert('Delete Disabled', 'Only cancelled orders can be deleted');
            return;
        }

        Alert.alert(
            'Delete Order',
            `Delete cancelled order #${shortId(order._id || order.id)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteOrder(order)
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Order Tracking</Text>
                <TouchableOpacity onPress={loadOrders}>
                    <Text style={styles.refresh}>Refresh</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.filterCard}>
                <Text style={styles.filterLabel}>Order Status</Text>
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
                <ActivityIndicator color="#0891b2" />
            ) : (
                <FlatList
                    data={visibleOrders}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={visibleOrders.length === 0 ? styles.emptyList : styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {orders.length === 0 ? 'No orders yet' : 'No orders match that status'}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            isUpdating={updatingOrderId === (item._id || item.id)}
                            isDeleting={deletingOrderId === (item._id || item.id)}
                            onStatusChange={(status) => confirmStatusChange(item, status)}
                            onDelete={() => confirmDeleteOrder(item)}
                        />
                    )}
                />
            )}
        </View>
    );
}

function getVisibleOrders(orders, statusFilter) {
    if (statusFilter === 'All') {
        return orders;
    }

    return orders.filter((order) => (order.status || 'Pending') === statusFilter);
}

function OrderCard({ order, isUpdating, isDeleting, onStatusChange, onDelete }) {
    const customer = order.user || {};
    const canDelete = (order.status || 'Pending') === 'Cancelled';

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{shortId(order._id || order.id)}</Text>
                    <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
                    <Text style={styles.customer}>Customer: {customer.name || 'Unknown'}</Text>
                    <Text style={styles.customer}>Email: {customer.email || 'Not available'}</Text>
                    <Text style={styles.customer}>Mobile: {order.mobileNumber || customer.phone || 'Not available'}</Text>
                </View>
                <View style={styles.cardRightActions}>
                    <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
                        <Text style={styles.statusText}>{isUpdating ? 'Updating...' : isDeleting ? 'Deleting...' : order.status || 'Pending'}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.deleteOrderButton, (!canDelete || isDeleting) && styles.deleteOrderButtonDisabled]}
                        onPress={onDelete}
                        disabled={!canDelete || isUpdating || isDeleting}
                    >
                        <Ionicons name="trash-outline" size={18} color={canDelete ? '#dc2626' : '#9ca3af'} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.items}>
                {(order.items || []).map((item, index) => (
                    <View style={styles.itemRow} key={`${item.product || item.name}-${index}`}>
                        <View style={styles.itemNameWrap}>
                            <Text style={styles.itemName} numberOfLines={1}>{getAdminItemName(item)}</Text>
                            <Text style={styles.itemMeta}>Qty {item.quantity} x Rs. {formatMoney(item.price)}</Text>
                        </View>
                        <Text style={styles.itemTotal}>Rs. {formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.details}>
                <Text style={styles.detailText}>Payment: {order.paymentMethod || 'Cash on Delivery'}</Text>
                <Text style={styles.detailText}>Address: {order.shippingAddress || 'Not provided'}</Text>
                {order.paymentProof?.url ? (
                    <TouchableOpacity style={styles.proofLink} onPress={() => Linking.openURL(getFileUrl(order.paymentProof.url))}>
                        <Text style={styles.proofLinkText}>View payment proof</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <Text style={styles.total}>Total: Rs. {formatMoney(order.totalAmount)}</Text>

            <View style={styles.statusRow}>
                {statuses.map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.statusButton,
                            order.status === status && styles.statusButtonActive
                        ]}
                        onPress={() => onStatusChange(status)}
                        disabled={isUpdating || order.status === status}
                    >
                        <Text style={[
                            styles.statusButtonText,
                            order.status === status && styles.statusButtonTextActive
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

function getAdminItemName(item) {
    const name = item.name || 'Product';
    const sku = formatSku(item.sku || item.product?.sku);

    return sku ? `${name} (${sku})` : name;
}

function formatSku(value) {
    const sku = Number(value);

    if (!Number.isInteger(sku) || sku < 1 || sku > 999) {
        return '';
    }

    return String(sku).padStart(3, '0');
}

function getFileUrl(value) {
    const baseUrl = API_URL.replace(/\/api$/, '');
    return value.startsWith('http') ? value : `${baseUrl}${value}`;
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '900' },
    refresh: { color: '#0891b2', fontWeight: '900' },
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
    orderInfo: { flex: 1 },
    orderId: { fontWeight: '900', fontSize: 18, color: '#111827' },
    date: { color: '#6b7280', marginTop: 4 },
    customer: { color: '#374151', marginTop: 4 },
    cardRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    deleteOrderButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
    deleteOrderButtonDisabled: { backgroundColor: '#f3f4f6' },
    statusBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12 },
    statusConfirmed: { backgroundColor: '#cffafe' },
    statusProcessing: { backgroundColor: '#ede9fe' },
    statusShipped: { backgroundColor: '#fef3c7' },
    statusDelivered: { backgroundColor: '#dcfce7' },
    statusPending: { backgroundColor: '#ecfeff' },
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
    proofLink: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#ecfeff', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10 },
    proofLinkText: { color: '#0891b2', fontWeight: '900', fontSize: 12 },
    total: { color: '#0891b2', fontWeight: '900', fontSize: 18, marginTop: 12 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    statusButton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
    statusButtonActive: { backgroundColor: '#111827', borderColor: '#111827' },
    statusButtonText: { color: '#374151', fontSize: 12, fontWeight: '900' },
    statusButtonTextActive: { color: '#fff' }
});
