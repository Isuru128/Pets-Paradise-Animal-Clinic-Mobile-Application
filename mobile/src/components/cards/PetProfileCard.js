import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { API_URL } from '../../services/api';

const recordCategories = ['Checkup', 'Vaccination', 'Grooming', 'Treatment', 'Report', 'Other'];

const initialRecordForm = {
    title: 'Checkup',
    subtitle: '',
    category: 'Checkup',
    date: '',
    notes: ''
};

export default function PetProfileCard({
    pet,
    showOwner = false,
    canEdit = false,
    canDelete = false,
    canAddRecord = false,
    isDeleting = false,
    isSavingRecord = false,
    onEdit,
    onDelete,
    onAddRecord,
    onUpdateRecord
}) {
    const [recordForm, setRecordForm] = useState(initialRecordForm);
    const [showRecordForm, setShowRecordForm] = useState(false);
    const [showRecordDatePicker, setShowRecordDatePicker] = useState(false);
    const [recordAttachment, setRecordAttachment] = useState(null);
    const [editingRecordId, setEditingRecordId] = useState(null);
    const records = pet.records || [];
    const owner = pet.owner || {};

    const updateRecordForm = (key, value) => {
        setRecordForm((current) => ({ ...current, [key]: value }));
    };

    const selectRecordCategory = (category) => {
        setRecordForm((current) => ({
            ...current,
            title: category,
            category
        }));
    };

    const resetRecordForm = () => {
        setRecordForm(initialRecordForm);
        setRecordAttachment(null);
        setEditingRecordId(null);
        setShowRecordDatePicker(false);
        setShowRecordForm(false);
    };

    const openNewRecordForm = () => {
        setRecordForm(initialRecordForm);
        setRecordAttachment(null);
        setEditingRecordId(null);
        setShowRecordDatePicker(false);
        setShowRecordForm(true);
    };

    const openEditRecordForm = (record) => {
        setRecordForm({
            title: record.title || 'Checkup',
            subtitle: record.subtitle || '',
            category: record.category || record.title || 'Checkup',
            date: record.date || '',
            notes: record.notes || ''
        });
        setRecordAttachment(null);
        setEditingRecordId(record._id || record.id);
        setShowRecordDatePicker(false);
        setShowRecordForm(true);
    };

    const chooseReportImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow gallery access to choose a report image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            quality: 0.85,
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        });

        if (!result.canceled) {
            setAttachmentFromAsset(result.assets?.[0], 'image');
        }
    };

    const takeReportPhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow camera access to take a report photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.85
        });

        if (!result.canceled) {
            setAttachmentFromAsset(result.assets?.[0], 'image');
        }
    };

    const chooseReportFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
            copyToCacheDirectory: true,
            multiple: false
        });

        if (result.canceled) {
            return;
        }

        const asset = result.assets?.[0];

        if (!asset?.uri) {
            Alert.alert('Report Error', 'Could not read the selected report file');
            return;
        }

        setRecordAttachment({
            uri: asset.uri,
            name: asset.name || `pet-report-${Date.now()}`,
            type: asset.mimeType || 'application/octet-stream',
            kind: asset.mimeType?.startsWith('image/') ? 'image' : 'file'
        });
    };

    const setAttachmentFromAsset = (asset, kind) => {
        if (!asset?.uri) {
            Alert.alert('Report Error', 'Could not read the selected report image');
            return;
        }

        setRecordAttachment({
            uri: asset.uri,
            name: asset.fileName || `pet-report-${Date.now()}.jpg`,
            type: asset.mimeType || 'image/jpeg',
            kind
        });
    };

    const submitRecord = () => {
        if (editingRecordId) {
            onUpdateRecord?.(pet, editingRecordId, recordForm, recordAttachment, resetRecordForm);
            return;
        }

        onAddRecord?.(pet, recordForm, recordAttachment, resetRecordForm);
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <PetImagePreview uri={getFileUrl(pet.imageUrl)} />
                <View style={styles.cardTitleWrap}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    {showOwner ? (
                        <View style={styles.ownerBlock}>
                            <Text style={styles.ownerLine}>Owner: {owner.name || 'Unknown'}</Text>
                            <Text style={styles.ownerLine}>Gmail: {owner.email || 'Not set'}</Text>
                            <Text style={styles.ownerLine}>Mobile: {owner.phone || 'Not set'}</Text>
                        </View>
                    ) : null}
                    <Text style={styles.petMeta}>{[pet.type, pet.breed].filter(Boolean).join(' | ')}</Text>
                </View>
                {pet.status && pet.status !== 'Profile Added' ? (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{pet.status}</Text>
                    </View>
                ) : null}
            </View>

            <Text style={styles.ageRow}>Age: {getAgeLabel(pet)}</Text>
            <Text style={styles.detail}>Gender: {pet.gender || 'Not set'}</Text>
            <Text style={styles.detail}>Birthday: {pet.birthday || 'Not set'}</Text>
            <Text style={styles.detail}>Notes: {pet.medicalNotes || 'No notes'}</Text>

            {(canEdit || canDelete) ? (
                <View style={styles.cardActions}>
                    {canEdit ? (
                        <TouchableOpacity style={styles.editButton} onPress={() => onEdit?.(pet)} disabled={isDeleting}>
                            <Ionicons name="create-outline" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                    ) : null}
                    {canDelete ? (
                        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete?.(pet)} disabled={isDeleting}>
                            <Ionicons name="trash-outline" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>{isDeleting ? 'Deleting...' : 'Delete'}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            ) : null}

            <View style={styles.recordHeader}>
                <Text style={styles.recordsTitle}>Records</Text>
                {canAddRecord ? (
                    <TouchableOpacity style={styles.addRecordButton} onPress={openNewRecordForm}>
                        <Ionicons name="add" size={16} color="#fff" />
                        <Text style={styles.addRecordButtonText}>Add Record</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {records.length === 0 ? (
                <Text style={styles.emptyRecord}>No records added yet</Text>
            ) : (
                records.map((record) => (
                    <View style={styles.record} key={record._id || `${record.title}-${record.createdAt}`}>
                        <View style={styles.recordTopRow}>
                            <View style={styles.recordTextWrap}>
                                <Text style={styles.recordTitle}>{record.title}</Text>
                                {record.subtitle ? <Text style={styles.recordSubtitle}>{record.subtitle}</Text> : null}
                                <Text style={styles.recordMeta}>{record.category} {record.date ? `| ${record.date}` : ''}</Text>
                            </View>
                            {canAddRecord ? (
                                <TouchableOpacity
                                    style={styles.recordEditButton}
                                    onPress={() => openEditRecordForm(record)}
                                    disabled={isSavingRecord}
                                >
                                    <Ionicons name="create-outline" size={17} color="#0891b2" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        {record.notes ? <Text style={styles.recordNotes}>{record.notes}</Text> : null}
                        {record.attachmentUrl ? <RecordAttachment record={record} /> : null}
                    </View>
                ))
            )}

            {canAddRecord && showRecordForm ? (
                <View style={styles.recordForm}>
                    <View style={styles.formHeader}>
                        <Text style={styles.recordsTitle}>{editingRecordId ? 'Edit Pet Record' : 'Add Pet Record'}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={resetRecordForm} disabled={isSavingRecord}>
                            <Ionicons name="close" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                        {recordCategories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[styles.categoryButton, recordForm.category === category && styles.categoryButtonActive]}
                                onPress={() => selectRecordCategory(category)}
                            >
                                <Text style={[styles.categoryText, recordForm.category === category && styles.categoryTextActive]}>{category}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.inputLabel}>Record Subtitle</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Annual booster or routine checkup"
                        placeholderTextColor="#9ca3af"
                        value={recordForm.subtitle}
                        onChangeText={(value) => updateRecordForm('subtitle', value)}
                    />

                    <Text style={styles.inputLabel}>Record Date</Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setShowRecordDatePicker(true)}>
                        <Text style={recordForm.date ? styles.dateText : styles.datePlaceholder}>
                            {recordForm.date || 'Select record date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    {showRecordDatePicker ? (
                        <DateTimePicker
                            value={parseDate(recordForm.date)}
                            mode="date"
                            display="default"
                            maximumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                if (event.type === 'dismissed') {
                                    setShowRecordDatePicker(false);
                                    return;
                                }

                                setShowRecordDatePicker(false);

                                if (selectedDate) {
                                    updateRecordForm('date', formatDateInput(selectedDate));
                                }
                            }}
                        />
                    ) : null}

                    <Text style={styles.inputLabel}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Diagnosis, treatment, doctor instructions..."
                        placeholderTextColor="#9ca3af"
                        value={recordForm.notes}
                        onChangeText={(value) => updateRecordForm('notes', value)}
                        multiline
                    />

                    <View style={styles.attachmentButtons}>
                        <TouchableOpacity style={styles.attachmentButton} onPress={chooseReportImage} disabled={isSavingRecord}>
                            <Ionicons name="image-outline" size={18} color="#0891b2" />
                            <Text style={styles.attachmentButtonText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.attachmentButton} onPress={takeReportPhoto} disabled={isSavingRecord}>
                            <Ionicons name="camera-outline" size={18} color="#0891b2" />
                            <Text style={styles.attachmentButtonText}>Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.attachmentButton} onPress={chooseReportFile} disabled={isSavingRecord}>
                            <Ionicons name="document-text-outline" size={18} color="#0891b2" />
                            <Text style={styles.attachmentButtonText}>File</Text>
                        </TouchableOpacity>
                    </View>

                    {recordAttachment ? (
                        <View style={styles.attachmentPreview}>
                            {recordAttachment.kind === 'image' ? (
                                <Image source={{ uri: recordAttachment.uri }} style={styles.attachmentImage} contentFit="cover" />
                            ) : (
                                <View style={styles.fileIcon}>
                                    <Ionicons name="document-text-outline" size={24} color="#0891b2" />
                                </View>
                            )}
                            <View style={styles.attachmentInfo}>
                                <Text style={styles.attachmentName} numberOfLines={1}>{recordAttachment.name}</Text>
                                <Text style={styles.attachmentType}>{recordAttachment.type}</Text>
                            </View>
                            <TouchableOpacity style={styles.clearAttachmentButton} onPress={() => setRecordAttachment(null)}>
                                <Ionicons name="close" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.recordButton, isSavingRecord && styles.buttonDisabled]}
                        onPress={submitRecord}
                        disabled={isSavingRecord}
                    >
                        <Text style={styles.recordButtonText}>
                            {isSavingRecord ? 'Saving...' : editingRecordId ? 'Update Record' : 'Save Record'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
}

function PetImagePreview({ uri }) {
    if (uri) {
        return <Image source={{ uri }} style={styles.petImage} contentFit="cover" />;
    }

    return (
        <View style={styles.iconCircle}>
            <Ionicons name="paw-outline" size={24} color="#16a34a" />
        </View>
    );
}

function RecordAttachment({ record }) {
    const uri = getFileUrl(record.attachmentUrl);

    if (record.attachmentMimeType?.startsWith('image/')) {
        return (
            <Image
                source={{ uri }}
                style={styles.recordImage}
                contentFit="cover"
            />
        );
    }

    return (
        <View style={styles.recordFile}>
            <Ionicons name="document-text-outline" size={20} color="#0891b2" />
            <Text style={styles.recordLink} numberOfLines={1}>{record.attachmentName || 'View report file'}</Text>
        </View>
    );
}

function getAgeLabel(pet) {
    if (pet.birthday) {
        return calculateAge(pet.birthday);
    }

    return pet.age || 'Age not set';
}

function calculateAge(birthday) {
    const birthDate = new Date(`${birthday}T00:00:00`);

    if (Number.isNaN(birthDate.getTime())) {
        return 'Age not set';
    }

    const today = new Date();
    let totalMonths = (today.getFullYear() - birthDate.getFullYear()) * 12;
    totalMonths += today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
        totalMonths -= 1;
    }

    if (totalMonths < 0) {
        return 'Age not set';
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    return `${years} years ${String(months).padStart(2, '0')} months`;
}

function parseDate(value) {
    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getFileUrl(value) {
    if (!value) {
        return '';
    }

    const baseUrl = API_URL.replace(/\/api$/, '');

    return value.startsWith('http') ? value : `${baseUrl}${value}`;
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
    petImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e5e7eb' },
    cardTitleWrap: { flex: 1 },
    petName: { fontSize: 18, fontWeight: '900', color: '#111827' },
    ownerBlock: { marginTop: 4, gap: 2 },
    ownerLine: { color: '#374151', fontSize: 13, lineHeight: 18 },
    petMeta: { color: '#6b7280', marginTop: 3 },
    badge: { backgroundColor: '#ecfdf5', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
    badgeText: { color: '#16a34a', fontWeight: '900', fontSize: 12 },
    ageRow: { color: '#111827', fontWeight: '900', marginTop: 5 },
    detail: { color: '#374151', marginTop: 5 },
    cardActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
    editButton: { flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    deleteButton: { flex: 1, backgroundColor: '#dc2626', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    actionButtonText: { color: '#fff', fontWeight: '900' },
    recordHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 8 },
    recordsTitle: { fontWeight: '900', color: '#111827' },
    addRecordButton: { backgroundColor: '#5ce1e6', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
    addRecordButtonText: { color: '#111827', fontWeight: '900', fontSize: 12 },
    emptyRecord: { color: '#6b7280' },
    record: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 8 },
    recordTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
    recordTextWrap: { flex: 1 },
    recordEditButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#ecfeff', alignItems: 'center', justifyContent: 'center' },
    recordTitle: { fontWeight: '900', color: '#111827' },
    recordSubtitle: { color: '#374151', marginTop: 3 },
    recordMeta: { color: '#16a34a', fontWeight: '800', marginTop: 3 },
    recordNotes: { color: '#374151', marginTop: 6 },
    recordImage: { width: '100%', aspectRatio: 1.5, borderRadius: 12, backgroundColor: '#e5e7eb', marginTop: 10 },
    recordFile: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ecfeff', borderRadius: 12, padding: 10, marginTop: 10 },
    recordLink: { color: '#0891b2', fontWeight: '900', flex: 1 },
    recordForm: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 10, paddingTop: 12 },
    formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    closeButton: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6,
        marginTop: 4
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
    categoryRow: { gap: 8, paddingBottom: 12 },
    categoryButton: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
    categoryButtonActive: { backgroundColor: '#111827', borderColor: '#111827' },
    categoryText: { color: '#374151', fontWeight: '900', fontSize: 12 },
    categoryTextActive: { color: '#fff' },
    attachmentButtons: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    attachmentButton: { flex: 1, borderWidth: 1, borderColor: '#a5f3fc', backgroundColor: '#ecfeff', borderRadius: 12, padding: 10, alignItems: 'center', gap: 4 },
    attachmentButtonText: { color: '#0891b2', fontWeight: '900', fontSize: 12 },
    attachmentPreview: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    attachmentImage: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#e5e7eb' },
    fileIcon: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#ecfeff', alignItems: 'center', justifyContent: 'center' },
    attachmentInfo: { flex: 1 },
    attachmentName: { color: '#111827', fontWeight: '900' },
    attachmentType: { color: '#6b7280', marginTop: 3, fontSize: 12 },
    clearAttachmentButton: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
    recordButton: { backgroundColor: '#5ce1e6', padding: 14, borderRadius: 14, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#a5f3fc' },
    recordButtonText: { color: '#111827', fontWeight: '900' }
});
