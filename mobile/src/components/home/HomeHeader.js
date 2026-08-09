import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search pet food, toys, medicine...'
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🔍</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 54,
        borderRadius: 18,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 18
    },
    icon: {
        fontSize: 18,
        marginRight: 10
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827'
    }
});