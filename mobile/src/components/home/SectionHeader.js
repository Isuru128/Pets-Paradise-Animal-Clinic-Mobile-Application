import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SectionHeader({
    title,
    actionText = 'See More',
    onPress,
    style
}) {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>{title}</Text>

            {onPress ? (
                <TouchableOpacity onPress={onPress}>
                    <Text style={styles.action}>{actionText}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 21,
        fontWeight: '900',
        color: '#111827'
    },
    action: {
        color: '#2563eb',
        fontWeight: '900'
    }
});