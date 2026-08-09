import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CategoryRow({ categories = [], onCategoryPress }) {
    return (
        <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id || item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => onCategoryPress && onCategoryPress(item)}
                >
                    <View style={styles.circle}>
                        <Text style={styles.icon}>{item.icon || '🐾'}</Text>
                    </View>
                    <Text style={styles.label}>{item.label || item.name}</Text>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        paddingBottom: 10
    },
    item: {
        alignItems: 'center',
        marginRight: 18
    },
    circle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    icon: {
        fontSize: 26
    },
    label: {
        marginTop: 8,
        fontSize: 13,
        fontWeight: '800',
        color: '#374151'
    }
});