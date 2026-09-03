import {
    ActivityIndicator,
    Alert,
    BackHandler,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from "expo-router/react-navigation";
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import API from '../../src/services/api';

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingProductId, setUpdatingProductId] = useState(null);

    const loadCart = async () => {
        try {
            setLoading(true);
            const res = await API.get('/cart');
            setCart(res.data);
        } catch (error) {
            Alert.alert('Cart Error', error.response?.data?.msg || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCart();

            const onBackPress = () => {
                if (router.canGoBack()) {
                    router.back();
                } else {
                    router.replace('/user/dashboard');
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [router])
    );

    const items = cart?.items || [];
    const total = getCartTotal(items);

    const updateQuantity = async (item, quantity) => {
        const productId = getProductId(item);

        if (quantity < 1) {
            removeItem(item);
            return;
        }

        try {
            setUpdatingProductId(productId);
            const res = await API.put(`/cart/${productId}`, { quantity });
            setCart(res.data);
        } catch (error) {
            Alert.alert('Cart Error', error.response?.data?.msg || 'Failed to update quantity');
        } finally {
            setUpdatingProductId(null);
        }
    };

    const removeItem = (item) => {
        const product = getProduct(item);
        const productId = getProductId(item);

        Alert.alert('Remove Item', `Remove ${product.name || 'this item'} from cart?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setUpdatingProductId(productId);
                        const res = await API.delete(`/cart/${productId}`);
                        setCart(res.data);
                    } catch (error) {
                        Alert.alert('Cart Error', error.response?.data?.msg || 'Failed to remove item');
                    } finally {
                        setUpdatingProductId(null);
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => (router.canGoBack() ? router.back() : router.replace('/user/dashboard'))}
                    >
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Cart</Text>
                </View>
                <TouchableOpacity onPress={loadCart}>
                    <Text style={styles.refresh}>Refresh</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color="#0891b2" />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => getProductId(item)}
                    contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty</Text>}
                    renderItem={({ item }) => (
                        <CartItem
                            item={item}
                            isUpdating={updatingProductId === getProductId(item)}
                            onIncrease={() => updateQuantity(item, item.quantity + 1)}
                            onDecrease={() => updateQuantity(item, item.quantity - 1)}
                            onRemove={() => removeItem(item)}
                        />
                    )}
                />
            )}

            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>Total</Text>
                    <Text style={styles.total}>Rs. {formatMoney(total)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.checkoutButton, items.length === 0 && styles.buttonDisabled]}
                    onPress={() => router.push('/user/checkout')}
                    disabled={items.length === 0}
                >
                    <Text style={styles.checkoutText}>Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function CartItem({ item, isUpdating, onIncrease, onDecrease, onRemove }) {
    const product = getProduct(item);
    const subtotal = Number(product.price || 0) * item.quantity;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.itemInfo}>
                    <Text style={styles.name}>{product.name || 'Product unavailable'}</Text>
                    <Text style={styles.meta}>{product.category || 'General'}</Text>
                    <Text style={styles.price}>Rs. {formatMoney(product.price || 0)} each</Text>
                </View>

                <TouchableOpacity style={styles.removeButton} onPress={onRemove} disabled={isUpdating}>
                    <MaterialIcons name="delete" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.itemFooter}>
                <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyButton} onPress={onDecrease} disabled={isUpdating}>
                        <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qty}>{isUpdating ? '...' : item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyButton} onPress={onIncrease} disabled={isUpdating}>
                        <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtotal}>Rs. {formatMoney(subtotal)}</Text>
            </View>
        </View>
    );
}

function getProduct(item) {
    return item.product && typeof item.product === 'object' ? item.product : {};
}

function getProductId(item) {
    const product = item.product;
    return typeof product === 'object' ? product._id || product.id : product;
}

function getCartTotal(items) {
    return items.reduce((sum, item) => {
        const product = getProduct(item);
        return sum + Number(product.price || 0) * item.quantity;
    }, 0);
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString();
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    backButton: { padding: 4, marginRight: 2 },
    title: { fontSize: 26, fontWeight: '900', color: '#111827' },
    refresh: { color: '#0891b2', fontWeight: '900' },
    list: { paddingBottom: 18 },
    emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#6b7280', fontWeight: '800' },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
    itemInfo: { flex: 1 },
    name: { fontSize: 17, fontWeight: '900', color: '#111827' },
    meta: { color: '#6b7280', marginTop: 4 },
    price: { color: '#0891b2', fontWeight: '900', marginTop: 6 },
    removeButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
    itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
    qtyButtonText: { fontSize: 20, fontWeight: '900', color: '#111827' },
    qty: { minWidth: 24, textAlign: 'center', fontWeight: '900', fontSize: 16 },
    subtotal: { color: '#111827', fontWeight: '900' },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
    },
    footerLabel: { color: '#6b7280', fontWeight: '800' },
    total: { fontSize: 20, fontWeight: '900', color: '#111827', marginTop: 2 },
    checkoutButton: { backgroundColor: '#16a34a', paddingVertical: 13, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#86efac' },
    checkoutText: { color: '#fff', fontWeight: '900' }
});
