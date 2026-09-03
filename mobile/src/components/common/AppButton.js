import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function AppButton({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style
}) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'secondary' && styles.secondary,
                variant === 'danger' && styles.danger,
                disabled && styles.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="#ffffff" />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    secondary: {
        backgroundColor: '#16a34a'
    },
    danger: {
        backgroundColor: '#dc2626'
    },
    disabled: {
        opacity: 0.6
    },
    text: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16
    }
});