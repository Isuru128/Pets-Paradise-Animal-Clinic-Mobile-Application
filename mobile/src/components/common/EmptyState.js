import { View, Text, StyleSheet } from 'react-native';
import AppButton from './AppButton';

export default function EmptyState({
    icon = '🐾',
    title = 'Nothing found',
    message = 'There is no data to display right now.',
    buttonTitle,
    onPress
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {buttonTitle ? (
                <AppButton title={buttonTitle} onPress={onPress} style={styles.button} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    icon: {
        fontSize: 42,
        marginBottom: 10
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 6
    },
    message: {
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20
    },
    button: {
        marginTop: 16
    }
});