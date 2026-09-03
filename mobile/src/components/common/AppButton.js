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
                <ActivityIndicator color={variant === 'primary' ? '#111827' : '#ffffff'} />
            ) : (
                <Text style={[styles.text, (variant === 'secondary' || variant === 'danger') && styles.secondaryText]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#5ce1e6',
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
        color: '#111827',
        fontWeight: '900',
        fontSize: 16
    },
    secondaryText: {
        color: '#ffffff'
    }
});