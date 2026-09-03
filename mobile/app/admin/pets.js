import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from "expo-router/react-navigation";
import API from '../../src/services/api';
import PetProfileCard from '../../src/components/cards/PetProfileCard';

export default function AdminPetsPage() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingPetId, setSavingPetId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const filteredPets = getFilteredPets(pets, searchQuery);

    const loadPets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await API.get('/pets');
            setPets(res.data);
        } catch (error) {
            Alert.alert('Pets Error', error.response?.data?.msg || 'Failed to load pet profiles');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadPets();
        }, [loadPets])
    );

    const addRecord = async (pet, recordForm, recordAttachment, resetRecordForm) => {
        const petId = pet._id || pet.id;

        if (!recordForm.title.trim()) {
            Alert.alert('Validation Error', 'Record title is required');
            return;
        }

        try {
            setSavingPetId(petId);
            const requestBody = getRecordRequestBody(recordForm, recordAttachment);
            const requestConfig = recordAttachment ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
            const res = await API.post(`/pets/${petId}/records`, requestBody, requestConfig);

            setPets((current) =>
                current.map((item) => ((item._id || item.id) === petId ? res.data : item))
            );
            resetRecordForm();
            Alert.alert('Saved', 'Pet record added successfully');
        } catch (error) {
            Alert.alert('Save Error', error.response?.data?.msg || 'Failed to add pet record');
        } finally {
            setSavingPetId(null);
        }
    };

    const updateRecord = async (pet, recordId, recordForm, recordAttachment, resetRecordForm) => {
        const petId = pet._id || pet.id;

        if (!recordForm.title.trim()) {
            Alert.alert('Validation Error', 'Record title is required');
            return;
        }

        try {
            setSavingPetId(petId);
            const requestBody = getRecordRequestBody(recordForm, recordAttachment);
            const requestConfig = recordAttachment ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
            const res = await API.put(`/pets/${petId}/records/${recordId}`, requestBody, requestConfig);

            setPets((current) =>
                current.map((item) => ((item._id || item.id) === petId ? res.data : item))
            );
            resetRecordForm();
            Alert.alert('Saved', 'Pet record updated successfully');
        } catch (error) {
            Alert.alert('Save Error', error.response?.data?.msg || 'Failed to update pet record');
        } finally {
            setSavingPetId(null);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pet Record Management</Text>
                <TouchableOpacity onPress={loadPets}>
                    <Text style={styles.refresh}>Refresh</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#6b7280" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by pet, owner, or mobile"
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
                        <Ionicons name="close" size={18} color="#6b7280" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {loading ? (
                <ActivityIndicator color="#0891b2" />
            ) : (
                <FlatList
                    data={filteredPets}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={filteredPets.length === 0 ? styles.emptyList : styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No pet profiles match your search' : 'No pet profiles submitted yet'}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <PetProfileCard
                            pet={item}
                            showOwner
                            canAddRecord
                            isSavingRecord={savingPetId === (item._id || item.id)}
                            onAddRecord={addRecord}
                            onUpdateRecord={updateRecord}
                        />
                    )}
                />
            )}
        </View>
    );
}

function getFilteredPets(pets, searchQuery) {
    const query = searchQuery.trim().toLowerCase();
    const digits = searchQuery.replace(/\D/g, '');

    if (!query && !digits) {
        return pets;
    }

    return pets.filter((pet) => {
        const petName = String(pet.name || '').toLowerCase();
        const ownerName = String(pet.owner?.name || '').toLowerCase();
        const ownerPhone = String(pet.owner?.phone || '').replace(/\D/g, '');

        return petName.includes(query) || ownerName.includes(query) || (digits && ownerPhone.includes(digits));
    });
}

function getRecordRequestBody(recordForm, recordAttachment) {
    if (!recordAttachment) {
        return recordForm;
    }

    const formData = new FormData();

    Object.entries(recordForm).forEach(([key, value]) => {
        formData.append(key, value);
    });

    formData.append('recordAttachment', {
        uri: recordAttachment.uri,
        name: recordAttachment.name,
        type: recordAttachment.type
    });

    return formData;
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { flex: 1, fontSize: 28, fontWeight: '900' },
    refresh: { color: '#0891b2', fontWeight: '900' },
    searchBox: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center' },
    searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#111827' },
    clearSearchButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    list: { paddingBottom: 24 },
    emptyList: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#6b7280', fontWeight: '800' }
});
