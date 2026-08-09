import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HeroBanner({ onPress }) {
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <Text style={styles.title}>Everything Your Pet Needs</Text>
                <Text style={styles.subtitle}>
                    Shop products, book appointments, and manage pet records in one app.
                </Text>

                <TouchableOpacity style={styles.button} onPress={onPress}>
                    <Text style={styles.buttonText}>Shop Now</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.right}>
                <Text style={styles.bigIcon}>🐶</Text>
                <Text style={styles.smallIcon}>🐱</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2563eb',
        borderRadius: 26,
        padding: 22,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
        overflow: 'hidden'
    },
    left: {
        flex: 1
    },
    title: {
        color: '#ffffff',
        fontSize: 25,
        fontWeight: '900',
        marginBottom: 8
    },
    subtitle: {
        color: '#dbeafe',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 14,
        alignSelf: 'flex-start'
    },
    buttonText: {
        color: '#2563eb',
        fontWeight: '900'
    },
    right: {
        width: 95,
        alignItems: 'center'
    },
    bigIcon: {
        fontSize: 58
    },
    smallIcon: {
        fontSize: 30,
        marginTop: -8
    }
});