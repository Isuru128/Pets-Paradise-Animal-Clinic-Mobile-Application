import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import API, { API_URL } from '../../src/services/api';

export default function ShopPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingProductId, setAddingProductId] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await API.get('/products');
            setProducts(res.data);
        } catch (error) {
            Alert.alert('Products Error', error.response?.data?.msg || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product) => {
        if ((product.stock ?? 0) === 0) {
            Alert.alert('Out of Stock', `${product.name} is currently out of stock`);
            return;
        }

        try {
            const productId = getProductId(product);
            setAddingProductId(productId);
            await API.post('/cart', { productId, quantity: 1 });
            Alert.alert('Added to Cart', `${product.name} added to cart successfully`);
        } catch (error) {
            Alert.alert('Cart Error', error.response?.data?.msg || 'Failed to add product to cart');
        } finally {
            setAddingProductId(null);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Shop Products</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={loadProducts}>
                        <Text style={styles.refresh}>Refresh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/user/cart')}>
                        <Ionicons name="cart-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#2563eb" />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id || item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={products.length === 0 ? styles.emptyList : styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No products available</Text>}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onAddToCart={handleAddToCart}
                            isAdding={addingProductId === getProductId(item)}
                        />
                    )}
                />
            )}
        </View>
    );
}

function ProductCard({ product, onAddToCart, isAdding }) {
    const stock = product.stock ?? 0;
    const stockStatus = getStockStatus(stock);
    const isOutOfStock = stock === 0;

    return (
        <View style={styles.card}>
            <ProductImage imageUrl={product.imageUrl} />

            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.description} numberOfLines={2}>
                {product.description || 'No description'}
            </Text>
            <Text style={styles.price}>Rs. {Number(product.price || 0).toLocaleString()}</Text>
            <Text style={stockStatus.style}>{stockStatus.label}</Text>
            {product.isFeatured ? <Text style={styles.featured}>Featured</Text> : null}

            <TouchableOpacity
                style={[styles.button, (isOutOfStock || isAdding) && styles.buttonDisabled]}
                onPress={() => onAddToCart(product)}
                disabled={isOutOfStock || isAdding}
            >
                <Text style={styles.buttonText}>{isAdding ? 'Adding...' : 'Add to Cart'}</Text>
            </TouchableOpacity>
        </View>
    );
}

function ProductImage({ imageUrl }) {
    const [hasError, setHasError] = useState(false);
    const uri = normalizeImageUrl(imageUrl);

    useEffect(() => {
        setHasError(false);
    }, [uri]);

    if (!uri || hasError) {
        return (
            <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Image unavailable</Text>
            </View>
        );
    }

    return (
        <Image
            source={{ uri, headers: { Accept: 'image/*,*/*' } }}
            style={styles.image}
            contentFit="cover"
            onError={() => setHasError(true)}
        />
    );
}

function getStockStatus(stock) {
    if (stock === 0) {
        return { label: 'out of stock', style: styles.outOfStock };
    }

    if (stock <= 5) {
        return { label: 'low stock', style: styles.lowStock };
    }

    return { label: 'in stock', style: styles.stock };
}

function normalizeImageUrl(value) {
    let imageUrl = String(value || '').trim();

    if (!imageUrl) {
        return '';
    }

    if (imageUrl.startsWith('www.')) {
        imageUrl = `https://${imageUrl}`;
    }

    if (imageUrl.startsWith('data:image/')) {
        return encodeURI(imageUrl);
    }

    if (/^https?:\/\//i.test(imageUrl)) {
        return `${API_URL}/images/product?url=${encodeURIComponent(imageUrl)}`;
    }

    return '';
}

function getProductId(product) {
    return product._id || product.id;
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { flex: 1, fontSize: 28, fontWeight: '900' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cartButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
    refresh: { color: '#2563eb', fontWeight: '900' },
    list: { paddingBottom: 24 },
    emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#6b7280', fontWeight: '800' },
    row: { justifyContent: 'space-between' },
    card: { width: '48%', backgroundColor: '#fff', borderRadius: 18, padding: 12, marginBottom: 14 },
    image: { width: '100%', aspectRatio: 1, borderRadius: 14, marginBottom: 10, backgroundColor: '#e5e7eb' },
    imagePlaceholder: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 14,
        marginBottom: 10,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imagePlaceholderText: { color: '#6b7280', fontWeight: '800' },
    name: { fontWeight: '900', fontSize: 15 },
    category: { color: '#6b7280', marginTop: 4 },
    description: { color: '#374151', marginTop: 6, minHeight: 38 },
    price: { color: '#2563eb', fontWeight: '900', marginTop: 8 },
    stock: { fontSize: 12, color: '#16a34a', fontWeight: '800', marginTop: 4 },
    lowStock: { fontSize: 12, color: '#dc2626', fontWeight: '900', marginTop: 4 },
    outOfStock: { fontSize: 12, color: '#991b1b', fontWeight: '900', marginTop: 4 },
    featured: { color: '#2563eb', fontSize: 12, fontWeight: '900', marginTop: 4 },
    button: { backgroundColor: '#2563eb', padding: 10, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonDisabled: { backgroundColor: '#93c5fd' },
    buttonText: { color: '#fff', fontWeight: '800' }
});
