import { View, Text, FlatList, StyleSheet } from 'react-native';

const inventory = [
    { id: '1', item: 'Pedigree Dog Food', stock: 20, level: 'Good' },
    { id: '2', item: 'Whiskas Cat Food', stock: 4, level: 'Low Stock' },
    { id: '3', item: 'Pet Shampoo', stock: 12, level: 'Good' }
];

export default function InventoryPage() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stock Keeping</Text>

            <FlatList
                data={inventory}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.item}</Text>
                        <Text>Stock: {item.stock}</Text>
                        <Text style={item.level === 'Low Stock' ? styles.low : styles.good}>
                            {item.level}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
    title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 12 },
    name: { fontWeight: '900', fontSize: 17, marginBottom: 6 },
    good: { color: '#16a34a', fontWeight: '900', marginTop: 8 },
    low: { color: '#dc2626', fontWeight: '900', marginTop: 8 }
});