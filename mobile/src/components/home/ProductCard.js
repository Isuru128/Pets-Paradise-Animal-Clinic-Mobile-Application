import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function ProductCard({ product, item, onPress, onAddToCart }) {
    const data = product || item || {};

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(data)}>
            {data.imageUrl || data.image ? (
                <Image
                    source={{ uri: data.imageUrl || data.image }}
                    style={styles.image}
                />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderIcon}>{data.icon || '🐾'}</Text>
                </View>
            )}

            <Text style={styles.name} numberOfLines={1}>
                {data.name || 'Product Name'}
            </Text>

            <Text style={styles.category} numberOfLines={1}>
                {data.category || 'Category'}
            </Text>

            <View style={styles.footer}>
                <Text style={styles.price}>
                    {typeof data.price === 'number' ? `Rs. ${data.price}` : data.price || 'Rs. 0'}
                </Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => onAddToCart && onAddToCart(data)}
                >
                    <Text style={styles.addText}>+</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 190,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 12,
        marginRight: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
        marginBottom: 10
    },
    placeholder: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    placeholderIcon: {
        fontSize: 52
    },
    name: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111827'
    },
    category: {
        color: '#6b7280',
        marginTop: 4,
        marginBottom: 10
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: {
        fontSize: 16,
        color: '#2563eb',
        fontWeight: '900'
    },
    addButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center'
    },
    addText: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: '900',
        marginTop: -2
    }
});