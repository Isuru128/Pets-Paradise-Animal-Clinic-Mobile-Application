import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BottomNav({ active = 'home' }) {
    const router = useRouter();

    const items = [
        { key: 'home', label: 'Home', icon: '🏠', route: '/user/dashboard' },
        { key: 'shop', label: 'Shop', icon: '🛍️', route: '/user/shop' },
        { key: 'cart', label: 'Cart', icon: '🛒', route: '/user/cart' },
        { key: 'profile', label: 'Profile', icon: '👤', route: '/profile' }
    ];

    return (
        <View style={styles.container}>
            {items.map((item) => {
                const isActive = active === item.key;

                return (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.item}
                        onPress={() => router.push(item.route)}
                    >
                        <Text style={styles.icon}>{item.icon}</Text>
                        <Text style={[styles.label, isActive && styles.activeLabel]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 18,
        height: 72,
        borderRadius: 26,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8
    },
    item: {
        alignItems: 'center'
    },
    icon: {
        fontSize: 21
    },
    label: {
        fontSize: 11,
        marginTop: 3,
        color: '#6b7280',
        fontWeight: '800'
    },
    activeLabel: {
        color: '#2563eb'
    }
});