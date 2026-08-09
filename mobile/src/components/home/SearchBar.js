import { View, TextInput, StyleSheet, Text } from 'react-native';

export default function SearchBar() {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🔍</Text>
            <TextInput
                placeholder="Search for pet products..."
                placeholderTextColor="#9ca3af"
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 14,
        height: 56,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    icon: {
        fontSize: 18,
        marginRight: 10
    },
    input: {
        flex: 1,
        fontSize: 16
    }
});