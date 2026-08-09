import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function AppInput({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    multiline = false,
    error
}) {
    return (
        <View style={styles.wrapper}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <TextInput
                style={[styles.input, multiline && styles.multiline, error && styles.errorInput]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                multiline={multiline}
                autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 14
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 15,
        color: '#111827'
    },
    multiline: {
        minHeight: 90,
        textAlignVertical: 'top'
    },
    errorInput: {
        borderColor: '#dc2626'
    },
    error: {
        color: '#dc2626',
        fontSize: 12,
        marginTop: 5
    }
});