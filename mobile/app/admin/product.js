import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import API, { API_URL } from '../../src/services/api';

const initialForm = {
    sku: '',
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    isFeatured: false
};
const stockFilters = [
    { label: 'All', value: 'all' },
    { label: 'In Stock', value: 'good' },
    { label: 'Low Stock', value: 'low' },
    { label: 'Out of Stock', value: 'out' }
];
const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Name A-Z', value: 'nameAsc' },
    { label: 'Name Z-A', value: 'nameDesc' },
    { label: 'Stock Status', value: 'stockStatus' }
];

export default function AdminProductsPage() {
    const scrollRef = useRef(null);
    const [form, setForm] = useState(initialForm);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [sortOption, setSortOption] = useState('newest');
    const visibleProducts = getVisibleProducts(products, productSearch, stockFilter, sortOption);

    useEffect(() => {
        loadProducts();
    }, []);

    const updateForm = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

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

    const getProductPayload = () => {
        const sku = Number(form.sku);
        const price = Number(form.price);
        const stock = Number(form.stock || 0);

        if (!form.sku || !form.name || !form.category || !form.price) {
            Alert.alert('Validation Error', 'SKU, product name, category and price are required');
            return null;
        }

        if (!/^\d{1,3}$/.test(form.sku) || Number.isNaN(sku) || sku < 1 || sku > 999) {
            Alert.alert('Validation Error', 'SKU must be a number from 001 to 999');
            return null;
        }

        if (Number.isNaN(price) || price < 0) {
            Alert.alert('Validation Error', 'Please enter a valid price');
            return null;
        }

        if (Number.isNaN(stock) || stock < 0) {
            Alert.alert('Validation Error', 'Please enter a valid stock amount');
            return null;
        }

        return {
            sku,
            name: form.name,
            category: form.category,
            description: form.description,
            price,
            stock,
            imageUrl: form.imageUrl,
            isFeatured: form.isFeatured
        };
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingProductId(null);
        setShowForm(false);
    };

    const openAddProductForm = () => {
        setForm(initialForm);
        setEditingProductId(null);
        setShowForm(true);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const startEditProduct = (product) => {
        setEditingProductId(getProductId(product));
        setShowForm(true);
        setForm({
            sku: product.sku ? String(product.sku).padStart(3, '0') : '',
            name: product.name || '',
            category: product.category || '',
            description: product.description || '',
            price: String(product.price ?? ''),
            stock: String(product.stock ?? ''),
            imageUrl: product.imageUrl || '',
            isFeatured: Boolean(product.isFeatured)
        });
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const handleDeleteProduct = (product) => {
        const productId = getProductId(product);

        Alert.alert('Delete Product', `Delete ${product.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await API.delete(`/products/${productId}`);

                        setProducts((current) =>
                            current.filter((item) => getProductId(item) !== productId)
                        );

                        if (editingProductId === productId) {
                            resetForm();
                        }

                        Alert.alert('Deleted', 'Product deleted successfully');
                    } catch (error) {
                        Alert.alert('Delete Error', error.response?.data?.msg || 'Failed to delete product');
                    }
                }
            }
        ]);
    };

    const handleSubmitProduct = async () => {
        const payload = getProductPayload();

        if (!payload) {
            return;
        }

        try {
            setSaving(true);

            if (editingProductId) {
                const res = await API.put(`/products/${editingProductId}`, payload);

                setProducts((current) =>
                    current.map((product) =>
                        getProductId(product) === editingProductId ? res.data : product
                    )
                );
                resetForm();
                Alert.alert('Updated', 'Product updated successfully');
            } else {
                const res = await API.post('/products', payload);

                setProducts((current) => [res.data, ...current]);
                resetForm();
                Alert.alert('Saved', 'Product added successfully');
            }
        } catch (error) {
            Alert.alert(
                editingProductId ? 'Update Error' : 'Save Error',
                error.response?.data?.msg || `Failed to ${editingProductId ? 'update' : 'add'} product`
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.pageHeader}>
                <Text style={styles.title}>Product Management</Text>
                <TouchableOpacity style={styles.addProductButton} onPress={openAddProductForm}>
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.addProductButtonText}>Add Product</Text>
                </TouchableOpacity>
            </View>

            {showForm ? (
                <View style={styles.form}>
                    <View style={styles.formHeader}>
                        <Text style={styles.formTitle}>
                            {editingProductId ? 'Edit Product' : 'Add New Product'}
                        </Text>
                        <TouchableOpacity style={styles.closeFormButton} onPress={resetForm} disabled={saving}>
                            <Ionicons name="close" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>SKU (001-999) <Text style={styles.requiredStar}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 001"
                        placeholderTextColor="#9ca3af"
                        value={form.sku}
                        onChangeText={(value) => updateForm('sku', value.replace(/\D/g, '').slice(0, 3))}
                        keyboardType="number-pad"
                        maxLength={3}
                    />

                    <Text style={styles.inputLabel}>Product Name <Text style={styles.requiredStar}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Pedigree Dog Food"
                        placeholderTextColor="#9ca3af"
                        value={form.name}
                        onChangeText={(value) => updateForm('name', value)}
                    />

                    <Text style={styles.inputLabel}>Category <Text style={styles.requiredStar}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Food, Medicine, Accessories"
                        placeholderTextColor="#9ca3af"
                        value={form.category}
                        onChangeText={(value) => updateForm('category', value)}
                    />

                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Detailed description of the product"
                        placeholderTextColor="#9ca3af"
                        value={form.description}
                        onChangeText={(value) => updateForm('description', value)}
                        multiline
                    />

                    <Text style={styles.inputLabel}>Price (LKR) <Text style={styles.requiredStar}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 2500"
                        placeholderTextColor="#9ca3af"
                        value={form.price}
                        onChangeText={(value) => updateForm('price', value)}
                        keyboardType="numeric"
                    />

                    <Text style={styles.inputLabel}>Stock Quantity <Text style={styles.requiredStar}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 25"
                        placeholderTextColor="#9ca3af"
                        value={form.stock}
                        onChangeText={(value) => updateForm('stock', value)}
                        keyboardType="numeric"
                    />

                    <Text style={styles.inputLabel}>Product Image URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://example.com/image.jpg"
                        placeholderTextColor="#9ca3af"
                        value={form.imageUrl}
                        onChangeText={(value) => updateForm('imageUrl', value)}
                        autoCapitalize="none"
                    />

                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.switchLabel}>Featured Product</Text>
                            <Text style={styles.switchHint}>Show in featured product lists</Text>
                        </View>
                        <Switch
                            value={form.isFeatured}
                            onValueChange={(value) => updateForm('isFeatured', value)}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, saving && styles.buttonDisabled]}
                        onPress={handleSubmitProduct}
                        disabled={saving}
                    >
                        <Text style={styles.buttonText}>
                            {saving ? (editingProductId ? 'Updating...' : 'Adding...') : (editingProductId ? 'Update Product' : 'Add Product')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={resetForm} disabled={saving}>
                        <Text style={styles.cancelButtonText}>{editingProductId ? 'Cancel Edit' : 'Close Form'}</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Products</Text>
                <TouchableOpacity onPress={loadProducts}>
                    <Text style={styles.refresh}>Refresh</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.filtersCard}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#6b7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by product name or SKU"
                        placeholderTextColor="#9ca3af"
                        value={productSearch}
                        onChangeText={setProductSearch}
                    />
                    {productSearch ? (
                        <TouchableOpacity style={styles.clearSearchButton} onPress={() => setProductSearch('')}>
                            <Ionicons name="close" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <Text style={styles.filterLabel}>Stock Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {stockFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            style={[styles.chip, stockFilter === filter.value && styles.chipActive]}
                            onPress={() => setStockFilter(filter.value)}
                        >
                            <Text style={[styles.chipText, stockFilter === filter.value && styles.chipTextActive]}>{filter.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.filterLabel}>Sort Products</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.chip, sortOption === option.value && styles.chipActive]}
                            onPress={() => setSortOption(option.value)}
                        >
                            <Text style={[styles.chipText, sortOption === option.value && styles.chipTextActive]}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator color="#2563eb" />
            ) : visibleProducts.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                        {products.length === 0 ? 'No products added yet' : 'No products match your search or filter'}
                    </Text>
                </View>
            ) : (
                <View style={styles.productGrid}>
                    {visibleProducts.map((product) => (
                        <ProductCard
                            key={getProductId(product)}
                            product={product}
                            onEdit={startEditProduct}
                            onDelete={handleDeleteProduct}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

function ProductCard({ product, onEdit, onDelete }) {
    const stock = product.stock ?? 0;
    const stockStatus = getStockStatus(stock);

    return (
        <View style={styles.card}>
            <ProductImage imageUrl={product.imageUrl} />

            <View style={styles.cardHeader}>
                <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                <View style={styles.cardActions}>
                    <View style={[styles.badge, product.isFeatured ? styles.featuredBadge : styles.standardBadge]}>
                        <Text style={[styles.badgeText, product.isFeatured ? styles.featuredText : styles.standardText]}>
                            {product.isFeatured ? 'Featured' : 'Standard'}
                        </Text>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(product)}>
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(product)}>
                            <MaterialIcons name="delete" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Text style={styles.meta} numberOfLines={1}>SKU: {formatSku(product.sku)}</Text>
            <Text style={styles.meta} numberOfLines={1}>Category: {product.category}</Text>
            <Text style={styles.description} numberOfLines={2}>Description: {product.description || 'No description'}</Text>
            <Text style={styles.price}>Price: Rs. {Number(product.price || 0).toLocaleString()}</Text>
            <Text style={stockStatus.style}>
                Stock: {stock} ({stockStatus.label})
            </Text>
            <Text style={styles.meta} numberOfLines={1}>Created: {formatDate(product.createdAt)}</Text>
            <Text style={styles.meta} numberOfLines={1}>Updated: {formatDate(product.updatedAt)}</Text>
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

function formatDate(value) {
    if (!value) return 'Not available';
    return new Date(value).toLocaleString();
}

function getProductId(product) {
    return product._id || product.id;
}

function getVisibleProducts(products, productSearch, stockFilter, sortOption) {
    const search = productSearch.trim().toLowerCase();
    const stockPriority = { out: 0, low: 1, good: 2 };

    return [...products]
        .filter((product) => {
            const sku = formatSku(product.sku).toLowerCase();
            const rawSku = String(product.sku || '');
            const nameMatches = !search || String(product.name || '').toLowerCase().includes(search) || sku.includes(search) || rawSku.includes(search);
            const stockMatches = stockFilter === 'all' || getStockBucket(product.stock ?? 0) === stockFilter;

            return nameMatches && stockMatches;
        })
        .sort((first, second) => {
            if (sortOption === 'nameAsc') {
                return String(first.name || '').localeCompare(String(second.name || ''));
            }

            if (sortOption === 'nameDesc') {
                return String(second.name || '').localeCompare(String(first.name || ''));
            }

            if (sortOption === 'stockStatus') {
                const priorityDifference = stockPriority[getStockBucket(first.stock ?? 0)] - stockPriority[getStockBucket(second.stock ?? 0)];

                if (priorityDifference !== 0) {
                    return priorityDifference;
                }

                return String(first.name || '').localeCompare(String(second.name || ''));
            }

            return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
        });
}

function getStockBucket(stock) {
    if (stock === 0) {
        return 'out';
    }

    if (stock <= 5) {
        return 'low';
    }

    return 'good';
}

function formatSku(value) {
    const sku = Number(value);

    if (!Number.isInteger(sku) || sku < 1 || sku > 999) {
        return 'Not set';
    }

    return String(sku).padStart(3, '0');
}

function getStockStatus(stock) {
    if (stock === 0) {
        return { label: 'Out of Stock', style: styles.outOfStock };
    }

    if (stock <= 5) {
        return { label: 'Low Stock', style: styles.low };
    }

    return { label: 'In Stock', style: styles.good };
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fb' },
    content: { padding: 16, paddingBottom: 36 },
    pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
    title: { flex: 1, fontSize: 28, fontWeight: '900' },
    addProductButton: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
    addProductButtonText: { color: '#fff', fontWeight: '900', fontSize: 12 },
    formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    formTitle: { fontSize: 18, fontWeight: '900' },
    closeFormButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    form: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 18 },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6,
        marginTop: 4
    },
    requiredStar: {
        color: '#dc2626'
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 15,
        color: '#111827'
    },
    textArea: { minHeight: 84, textAlignVertical: 'top' },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14
    },
    switchLabel: { fontWeight: '900', color: '#111827' },
    switchHint: { color: '#6b7280', marginTop: 2 },
    button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 14, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#93c5fd' },
    buttonText: { color: '#fff', fontWeight: '900' },
    cancelButton: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 13,
        borderRadius: 14,
        alignItems: 'center'
    },
    cancelButtonText: { color: '#374151', fontWeight: '900' },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    sectionTitle: { fontSize: 20, fontWeight: '900' },
    refresh: { color: '#2563eb', fontWeight: '900' },
    filtersCard: { backgroundColor: '#fff', borderRadius: 18, padding: 12, marginBottom: 14 },
    searchBox: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
    searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#111827' },
    clearSearchButton: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    filterLabel: { color: '#374151', fontWeight: '900', marginBottom: 8 },
    chipRow: { gap: 8, paddingBottom: 12 },
    chip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
    chipActive: { backgroundColor: '#111827', borderColor: '#111827' },
    chipText: { color: '#374151', fontSize: 12, fontWeight: '900' },
    chipTextActive: { color: '#fff' },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    card: { width: '48%', backgroundColor: '#fff', padding: 12, borderRadius: 18, marginBottom: 12 },
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
    imagePlaceholderText: { color: '#6b7280', fontWeight: '800', fontSize: 12, textAlign: 'center' },
    cardHeader: { gap: 8 },
    name: { fontSize: 15, fontWeight: '900', minHeight: 38 },
    cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
    buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    meta: { color: '#6b7280', marginTop: 5, fontSize: 11 },
    description: { color: '#374151', marginTop: 6, fontSize: 12, minHeight: 34 },
    price: { color: '#2563eb', fontWeight: '900', marginTop: 8, fontSize: 13 },
    good: { color: '#16a34a', fontWeight: '900', marginTop: 8, fontSize: 12 },
    low: { color: '#dc2626', fontWeight: '900', marginTop: 8, fontSize: 12 },
    outOfStock: { color: '#991b1b', fontWeight: '900', marginTop: 8, fontSize: 12 },
    badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    featuredBadge: { backgroundColor: '#eff6ff' },
    standardBadge: { backgroundColor: '#f3f4f6' },
    badgeText: { fontSize: 11, fontWeight: '900' },
    featuredText: { color: '#2563eb' },
    standardText: { color: '#6b7280' },
    editButton: { backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    editButtonText: { color: '#fff', fontSize: 11, fontWeight: '900' },
    deleteButton: { width: 28, height: 28, backgroundColor: '#dc2626', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    emptyCard: { backgroundColor: '#fff', padding: 18, borderRadius: 18, alignItems: 'center' },
    emptyText: { color: '#6b7280', fontWeight: '800' }
});
