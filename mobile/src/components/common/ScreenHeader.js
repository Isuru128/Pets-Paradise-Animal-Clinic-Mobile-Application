import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScreenHeader({
    title,
    subtitle,
    showBack = true,
    rightText,
    onRightPress
}) {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                {showBack ? (
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backText}>‹</Text>
                    </TouchableOpacity>
                ) : null}

                <View>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
            </View>

            {rightText ? (
                <TouchableOpacity onPress={onRightPress}>
                    <Text style={styles.rightText}>{rightText}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    backText: {
        fontSize: 30,
        color: '#111827',
        marginTop: -2
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827'
    },
    subtitle: {
        color: '#6b7280',
        marginTop: 2
    },
    rightText: {
        color: '#2563eb',
        fontWeight: '800'
    }
});