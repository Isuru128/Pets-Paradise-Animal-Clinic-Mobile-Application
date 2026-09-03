import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { useFocusEffect } from "expo-router/react-navigation";
import { Ionicons } from '@expo/vector-icons';
import API, { API_URL } from '../../src/services/api';
import PetProfileCard from '../../src/components/cards/PetProfileCard';

const initialForm = {
    name: '',
    type: '',
    breed: '',
    birthday: '',
    gender: '',
    medicalNotes: ''
};

export default function PetsPage() {
    const [form, setForm] = useState(initialForm);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPetId, setEditingPetId] = useState(null);
    const [deletingPetId, setDeletingPetId] = useState(null);
    const [petImage, setPetImage] = useState(null);
    const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

    const loadPets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await API.get('/pets/my-pets');
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

    const updateForm = (key, value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setPetImage(null);
        setEditingPetId(null);
        setShowBirthdayPicker(false);
        setShowAddForm(false);
    };

    const startAddPet = () => {
        setForm(initialForm);
        setPetImage(null);
        setEditingPetId(null);
        setShowBirthdayPicker(false);
        setShowAddForm(true);
    };

    const startEditPet = (pet) => {
        setEditingPetId(getPetId(pet));
        setForm({
            name: pet.name || '',
            type: pet.type || '',
            breed: pet.breed || '',
            birthday: pet.birthday || '',
            gender: pet.gender || '',
            medicalNotes: pet.medicalNotes || ''
        });
        setPetImage(null);
        setShowBirthdayPicker(false);
        setShowAddForm(true);
    };

    const choosePetImageFromGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow gallery access to choose a pet photo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        });

        if (!result.canceled) {
            setPetImageFromAsset(result.assets?.[0]);
        }
    };

    const takePetPhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow camera access to take a pet photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85
        });

        if (!result.canceled) {
            setPetImageFromAsset(result.assets?.[0]);
        }
    };

    const setPetImageFromAsset = (asset) => {
        if (!asset?.uri) {
            Alert.alert('Image Error', 'Could not read the selected pet image');
            return;
        }

        setPetImage({
            uri: asset.uri,
            name: asset.fileName || `pet-image-${Date.now()}.jpg`,
            type: asset.mimeType || 'image/jpeg'
        });
    };

    const savePet = async () => {
        if (!form.name.trim() || !form.type.trim()) {
            Alert.alert('Validation Error', 'Pet name and pet type are required');
            return;
        }

        if (!form.birthday.trim()) {
            Alert.alert('Validation Error', 'Please select your pet birthday');
            return;
        }

        if (!isPastBirthday(form.birthday)) {
            Alert.alert('Validation Error', 'Birthday must be a past date');
            return;
        }

        try {
            setSaving(true);
            const requestBody = getPetRequestBody(form, petImage);
            const requestConfig = petImage ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;

            if (editingPetId) {
                const res = await API.put(`/pets/${editingPetId}`, requestBody, requestConfig);

                setPets((current) =>
                    current.map((pet) => (getPetId(pet) === editingPetId ? res.data : pet))
                );
                resetForm();
                Alert.alert('Updated', 'Pet profile updated successfully');
            } else {
                const res = await API.post('/pets', requestBody, requestConfig);

                setPets((current) => [res.data, ...current]);
                resetForm();
                Alert.alert('Saved', 'Pet profile added successfully');
            }
        } catch (error) {
            Alert.alert('Save Error', error.response?.data?.msg || 'Failed to save pet profile');
        } finally {
            setSaving(false);
        }
    };

    const deletePet = (pet) => {
        const petId = getPetId(pet);

        Alert.alert('Delete Pet', `Delete ${pet.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setDeletingPetId(petId);
                        await API.delete(`/pets/${petId}`);
                        setPets((current) => current.filter((item) => getPetId(item) !== petId));

                        if (editingPetId === petId) {
                            resetForm();
                        }
                    } catch (error) {
                        Alert.alert('Delete Error', error.response?.data?.msg || 'Failed to delete pet profile');
                    } finally {
                        setDeletingPetId(null);
                    }
                }
            }
        ]);
    };

    const editedPet = pets.find((pet) => getPetId(pet) === editingPetId);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>My Pets</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={loadPets}>
                        <Text style={styles.refresh}>Refresh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addHeaderButton} onPress={startAddPet}>
                        <Ionicons name="add" size={16} color="#fff" />
                        <Text style={styles.addHeaderButtonText}>Add My Pet</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showAddForm ? (
                <View style={styles.form}>
                    <View style={styles.formHeader}>
                        <Text style={styles.formTitle}>{editingPetId ? 'Edit Pet Profile' : 'Add Pet Profile'}</Text>
                        <TouchableOpacity style={styles.closeFormButton} onPress={resetForm} disabled={saving}>
                            <Ionicons name="close" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.photoPicker}>
                        <PetImagePreview uri={petImage?.uri || getFileUrl(editedPet?.imageUrl)} size={96} />
                        <View style={styles.photoActions}>
                            <TouchableOpacity style={styles.photoButton} onPress={choosePetImageFromGallery} disabled={saving}>
                                <Ionicons name="image-outline" size={18} color="#16a34a" />
                                <Text style={styles.photoButtonText}>Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.photoButton} onPress={takePetPhoto} disabled={saving}>
                                <Ionicons name="camera-outline" size={18} color="#16a34a" />
                                <Text style={styles.photoButtonText}>Camera</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Pet Name <Text style={styles.requiredStar}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Buddy"
                        placeholderTextColor="#9ca3af"
                        value={form.name}
                        onChangeText={(value) => updateForm('name', value)}
                    />

                    <Text style={styles.inputLabel}>Pet Type <Text style={styles.requiredStar}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Dog or Cat"
                        placeholderTextColor="#9ca3af"
                        value={form.type}
                        onChangeText={(value) => updateForm('type', value)}
                    />

                    <Text style={styles.inputLabel}>Breed</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Golden Retriever"
                        placeholderTextColor="#9ca3af"
                        value={form.breed}
                        onChangeText={(value) => updateForm('breed', value)}
                    />

                    <Text style={styles.inputLabel}>Birthday <Text style={styles.requiredStar}>*</Text></Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setShowBirthdayPicker(true)}>
                        <Text style={form.birthday ? styles.dateText : styles.datePlaceholder}>
                            {form.birthday || 'Select pet birthday'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    {showBirthdayPicker ? (
                        <DateTimePicker
                            value={parseBirthdayDate(form.birthday)}
                            mode="date"
                            display="default"
                            maximumDate={getYesterday()}
                            onChange={(event, selectedDate) => {
                                if (event.type === 'dismissed') {
                                    setShowBirthdayPicker(false);
                                    return;
                                }

                                setShowBirthdayPicker(false);

                                if (selectedDate) {
                                    updateForm('birthday', formatDateInput(selectedDate));
                                }
                            }}
                        />
                    ) : null}

                    <Text style={styles.inputLabel}>Gender</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Male or Female"
                        placeholderTextColor="#9ca3af"
                        value={form.gender}
                        onChangeText={(value) => updateForm('gender', value)}
                    />

                    <Text style={styles.inputLabel}>Medical Notes or Allergies</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Any known allergies, vaccine history, or medical notes"
                        placeholderTextColor="#9ca3af"
                        value={form.medicalNotes}
                        onChangeText={(value) => updateForm('medicalNotes', value)}
                        multiline
                    />

                    <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={savePet} disabled={saving}>
                        <Text style={styles.buttonText}>
                            {saving ? 'Saving...' : (editingPetId ? 'Update Pet Profile' : 'Add Pet Profile')}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {loading ? (
                <ActivityIndicator color="#16a34a" />
            ) : (
                <FlatList
                    data={pets}
                    keyExtractor={(item) => item._id || item.id}
                    scrollEnabled={false}
                    contentContainerStyle={pets.length === 0 ? styles.emptyList : null}
                    ListEmptyComponent={<Text style={styles.emptyText}>No pet profiles yet</Text>}
                    renderItem={({ item }) => (
                        <PetProfileCard
                            pet={item}
                            canEdit
                            canDelete
                            isDeleting={deletingPetId === getPetId(item)}
                            onEdit={startEditPet}
                            onDelete={deletePet}
                        />
                    )}
                />
            )}
        </ScrollView>
    );
}

function getPetId(pet) {
    return pet._id || pet.id;
}

function isPastBirthday(value) {
    const selectedDate = new Date(`${value}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
}

function getYesterday() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 1);

    return date;
}

function parseBirthdayDate(value) {
    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime()) ? getYesterday() : date;
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function PetImagePreview({ uri, size }) {
    if (uri) {
        return (
            <Image
                source={{ uri }}
                style={[styles.petImage, { width: size, height: size, borderRadius: size / 2 }]}
                contentFit="cover"
            />
        );
    }

    return (
        <View style={[styles.iconCircle, { width: size, height: size, borderRadius: size / 2 }]}>
            <Ionicons name="camera-outline" size={Math.round(size * 0.42)} color="#16a34a" />
        </View>
    );
}

function getPetRequestBody(form, petImage) {
    if (!petImage) {
        return form;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
    });

    formData.append('petImage', {
        uri: petImage.uri,
        name: petImage.name,
        type: petImage.type
    });

    return formData;
}

function getFileUrl(value) {
    if (!value) {
        return '';
    }

    const baseUrl = API_URL.replace(/\/api$/, '');

    return value.startsWith('http') ? value : `${baseUrl}${value}`;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fb' },
    content: { padding: 16, paddingBottom: 36 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '900' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    refresh: { color: '#16a34a', fontWeight: '900' },
    addHeaderButton: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
    addHeaderButtonText: { color: '#fff', fontWeight: '900', fontSize: 12 },
    form: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 18 },
    formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    formTitle: { fontSize: 18, fontWeight: '900' },
    closeFormButton: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6,
        marginTop: 4
    },
    requiredStar: {
        color: '#dc2626'
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        fontSize: 15,
        color: '#111827'
    },
    dateInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dateText: { color: '#111827' },
    datePlaceholder: { color: '#9ca3af' },
    textArea: { minHeight: 84, textAlignVertical: 'top' },
    button: { backgroundColor: '#16a34a', padding: 14, borderRadius: 14, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#86efac' },
    buttonText: { color: '#fff', fontWeight: '900' },
    emptyList: { paddingVertical: 18, alignItems: 'center' },
    emptyText: { color: '#6b7280', fontWeight: '800' },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    photoPicker: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
    photoActions: { flex: 1, flexDirection: 'row', gap: 8 },
    photoButton: { flex: 1, borderWidth: 1, borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', borderRadius: 12, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', gap: 4 },
    photoButtonText: { color: '#16a34a', fontWeight: '900', fontSize: 12 },
    iconCircle: { backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
    petImage: { backgroundColor: '#e5e7eb' },
    cardTitleWrap: { flex: 1 },
    petName: { fontSize: 18, fontWeight: '900', color: '#111827' },
    petMeta: { color: '#6b7280', marginTop: 3 },
    badge: { backgroundColor: '#ecfdf5', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
    badgeText: { color: '#16a34a', fontWeight: '900', fontSize: 12 },
    ageRow: { color: '#111827', fontWeight: '900', marginTop: 5 },
    detail: { color: '#374151', marginTop: 5 },
    cardActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
    editButton: { flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    deleteButton: { flex: 1, backgroundColor: '#dc2626', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    actionButtonText: { color: '#fff', fontWeight: '900' },
    recordsTitle: { fontWeight: '900', color: '#111827', marginTop: 14, marginBottom: 8 },
    emptyRecord: { color: '#6b7280' },
    record: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 8 },
    recordTitle: { fontWeight: '900', color: '#111827' },
    recordMeta: { color: '#16a34a', fontWeight: '800', marginTop: 3 },
    recordNotes: { color: '#374151', marginTop: 6 },
    recordLink: { color: '#2563eb', marginTop: 6 }
});
