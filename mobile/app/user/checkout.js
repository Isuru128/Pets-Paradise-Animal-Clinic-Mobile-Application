import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Image } from 'expo-image';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import API from '../../src/services/api';

const paymentMethods = ['Debit Card', 'Cash on Delivery', 'Bank Transfer'];

const initialCardDetails = {
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
};

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [useProfileAddress, setUseProfileAddress] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [useProfileMobile, setUseProfileMobile] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Debit Card');
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [cardDetails, setCardDetails] = useState(initialCardDetails);
    const [paymentProof, setPaymentProof] = useState(null);

    useEffect(() => {
        loadCheckoutData();
    }, []);

    const loadCheckoutData = async () => {
        try {
            setLoading(true);
            const [cartRes, profileRes] = await Promise.all([
                API.get('/cart'),
                API.get('/auth/me')
            ]);

            const profileData = profileRes.data || {};
            const profileAddress = profileData.address || '';
            const profileMobile = profileData.phone || '';

            setCart(cartRes.data);
            setProfile(profileData);
            setUseProfileAddress(Boolean(profileAddress));
            setShippingAddress(profileAddress);
            setUseProfileMobile(Boolean(profileMobile));
            setMobileNumber(profileMobile);
        } catch (error) {
            Alert.alert('Checkout Error', error.response?.data?.msg || 'Failed to load checkout details');
        } finally {
            setLoading(false);
        }
    };

    const items = cart?.items || [];
    const total = getCartTotal(items);

    const toggleProfileAddress = () => {
        if (useProfileAddress) {
            setUseProfileAddress(false);
            setShippingAddress('');
            return;
        }

        if (!profile?.address) {
            Alert.alert('Address Missing', 'No profile address found. Please enter a shipping address manually.');
            return;
        }

        setUseProfileAddress(true);
        setShippingAddress(profile.address);
    };

    const toggleProfileMobile = () => {
        if (useProfileMobile) {
            setUseProfileMobile(false);
            setMobileNumber('');
            return;
        }

        if (!profile?.phone) {
            Alert.alert('Mobile Missing', 'No profile mobile number found. Please enter a mobile number manually.');
            return;
        }

        setUseProfileMobile(true);
        setMobileNumber(profile.phone);
    };

    const updateMobileNumber = (value) => {
        setMobileNumber(value.replace(/\D/g, '').slice(0, 10));
    };

    const selectPaymentMethod = (method) => {
        setPaymentMethod(method);
        setShowPaymentOptions(false);
    };

    const updateCardDetails = (key, value) => {
        setCardDetails((current) => ({ ...current, [key]: value }));
    };

    const updateExpiry = (value) => {
        const formatted = formatExpiry(value, cardDetails.expiry);

        updateCardDetails('expiry', formatted);
    };

    const chooseProofImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow gallery access to choose a payment proof image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            quality: 0.85,
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        });

        if (result.canceled) {
            return;
        }

        const asset = result.assets?.[0];

        if (!asset?.uri) {
            Alert.alert('Proof Error', 'Could not read the selected image');
            return;
        }

        setPaymentProof({
            uri: asset.uri,
            name: asset.fileName || `payment-proof-${Date.now()}.jpg`,
            type: asset.mimeType || 'image/jpeg',
            kind: 'image'
        });
    };

    const chooseProofPdf = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
            multiple: false
        });

        if (result.canceled) {
            return;
        }

        const asset = result.assets?.[0];

        if (!asset?.uri) {
            Alert.alert('Proof Error', 'Could not read the selected PDF');
            return;
        }

        setPaymentProof({
            uri: asset.uri,
            name: asset.name || `payment-proof-${Date.now()}.pdf`,
            type: asset.mimeType || 'application/pdf',
            kind: 'pdf'
        });
    };

    const placeOrder = async () => {
        if (items.length === 0) {
            Alert.alert('Cart Empty', 'Please add products to cart before checkout');
            return;
        }

        if (!shippingAddress.trim()) {
            Alert.alert('Validation Error', 'Please enter a shipping address');
            return;
        }

        if (!/^\d{10}$/.test(mobileNumber)) {
            Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        if (paymentMethod === 'Debit Card') {
            const cardError = validateDebitCard(cardDetails);

            if (cardError) {
                Alert.alert('Card Error', cardError);
                return;
            }
        }

        if (paymentMethod === 'Bank Transfer' && !paymentProof) {
            Alert.alert('Payment Proof Required', 'Please add a bank transfer proof image or PDF');
            return;
        }

        try {
            setPlacingOrder(true);

            if (paymentMethod === 'Bank Transfer') {
                const formData = new FormData();

                formData.append('shippingAddress', shippingAddress.trim());
                formData.append('mobileNumber', mobileNumber);
                formData.append('paymentMethod', paymentMethod);
                formData.append('paymentProof', {
                    uri: paymentProof.uri,
                    name: paymentProof.name,
                    type: paymentProof.type
                });

                await API.post('/orders/checkout', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await API.post('/orders/checkout', {
                    shippingAddress: shippingAddress.trim(),
                    mobileNumber,
                    paymentMethod
                });
            }

            Alert.alert('Success', 'Order placed successfully', [
                { text: 'OK', onPress: () => router.replace('/user/orders') }
            ]);
        } catch (error) {
            Alert.alert('Order Error', error.response?.data?.msg || 'Failed to place order');
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Checkout</Text>

            {loading ? (
                <ActivityIndicator color="#2563eb" />
            ) : (
                <>
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Shipping Address</Text>

                        <TouchableOpacity style={styles.chooseRow} onPress={toggleProfileAddress}>
                            <View style={[styles.checkBox, useProfileAddress && styles.checkBoxActive]}>
                                {useProfileAddress ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
                            </View>
                            <View style={styles.chooseTextWrap}>
                                <Text style={styles.chooseTitle}>Use profile address</Text>
                                <Text style={styles.chooseHint} numberOfLines={2}>
                                    {profile?.address || 'No default address saved in profile'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TextInput
                            style={[
                                styles.input,
                                styles.addressInput,
                                useProfileAddress && styles.inputDisabled
                            ]}
                            placeholder="Shipping Address"
                            value={shippingAddress}
                            onChangeText={setShippingAddress}
                            editable={!useProfileAddress}
                            multiline
                        />
                    </View>

                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Mobile Number</Text>

                        <TouchableOpacity style={styles.chooseRow} onPress={toggleProfileMobile}>
                            <View style={[styles.checkBox, useProfileMobile && styles.checkBoxActive]}>
                                {useProfileMobile ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
                            </View>
                            <View style={styles.chooseTextWrap}>
                                <Text style={styles.chooseTitle}>Use profile mobile number</Text>
                                <Text style={styles.chooseHint} numberOfLines={1}>
                                    {profile?.phone || 'No mobile number saved in profile'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TextInput
                            style={[
                                styles.input,
                                useProfileMobile && styles.inputDisabled
                            ]}
                            placeholder="Mobile Number"
                            value={mobileNumber}
                            onChangeText={updateMobileNumber}
                            editable={!useProfileMobile}
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                    </View>

                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>

                        <TouchableOpacity
                            style={styles.paymentSelect}
                            onPress={() => setShowPaymentOptions((current) => !current)}
                        >
                            <Text style={styles.paymentSelectText}>{paymentMethod}</Text>
                            <Ionicons name={showPaymentOptions ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
                        </TouchableOpacity>

                        {showPaymentOptions ? (
                            <View style={styles.paymentMenu}>
                                {paymentMethods.map((method) => (
                                    <TouchableOpacity
                                        key={method}
                                        style={styles.paymentOption}
                                        onPress={() => selectPaymentMethod(method)}
                                    >
                                        <Text style={[
                                            styles.paymentOptionText,
                                            paymentMethod === method && styles.paymentOptionTextActive
                                        ]}>
                                            {method}
                                        </Text>
                                        {paymentMethod === method ? <Ionicons name="checkmark" size={18} color="#2563eb" /> : null}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null}

                        {paymentMethod === 'Debit Card' ? (
                            <View style={styles.cardFields}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Cardholder Name"
                                    value={cardDetails.cardName}
                                    onChangeText={(value) => updateCardDetails('cardName', value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Debit Card Number"
                                    value={cardDetails.cardNumber}
                                    onChangeText={(value) => updateCardDetails('cardNumber', value)}
                                    keyboardType="number-pad"
                                    maxLength={19}
                                />
                                <View style={styles.cardFieldRow}>
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChangeText={updateExpiry}
                                        keyboardType="number-pad"
                                        maxLength={5}
                                    />
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="CVV"
                                        value={cardDetails.cvv}
                                        onChangeText={(value) => updateCardDetails('cvv', value)}
                                        keyboardType="number-pad"
                                        secureTextEntry
                                        maxLength={3}
                                    />
                                </View>
                            </View>
                        ) : null}

                        {paymentMethod === 'Bank Transfer' ? (
                            <View style={styles.proofSection}>
                                <View style={styles.proofButtonRow}>
                                    <TouchableOpacity style={styles.proofButton} onPress={chooseProofImage}>
                                        <Ionicons name="image-outline" size={20} color="#2563eb" />
                                        <Text style={styles.proofButtonText}>Gallery Image</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.proofButton} onPress={chooseProofPdf}>
                                        <Ionicons name="document-text-outline" size={20} color="#2563eb" />
                                        <Text style={styles.proofButtonText}>PDF File</Text>
                                    </TouchableOpacity>
                                </View>

                                {paymentProof ? (
                                    <View style={styles.proofPreview}>
                                        {paymentProof.kind === 'image' ? (
                                            <Image source={{ uri: paymentProof.uri }} style={styles.proofImage} contentFit="cover" />
                                        ) : (
                                            <View style={styles.pdfIcon}>
                                                <Ionicons name="document-text-outline" size={26} color="#dc2626" />
                                            </View>
                                        )}

                                        <View style={styles.proofInfo}>
                                            <Text style={styles.proofName} numberOfLines={1}>{paymentProof.name}</Text>
                                            <Text style={styles.proofType}>{paymentProof.type}</Text>
                                        </View>

                                        <TouchableOpacity style={styles.clearProofButton} onPress={() => setPaymentProof(null)}>
                                            <Ionicons name="close" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={styles.proofHint}>Add a payment proof image or PDF before placing a bank transfer order.</Text>
                                )}
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>Order Summary</Text>
                        {items.length === 0 ? (
                            <Text style={styles.emptyText}>Your cart is empty</Text>
                        ) : (
                            items.map((item) => {
                                const product = getProduct(item);

                                return (
                                    <View style={styles.summaryRow} key={getProductId(item)}>
                                        <View style={styles.itemNameWrap}>
                                            <Text style={styles.itemName} numberOfLines={1}>{product.name || 'Product unavailable'}</Text>
                                            <Text style={styles.itemMeta}>Qty {item.quantity}</Text>
                                        </View>
                                        <Text style={styles.itemTotal}>
                                            Rs. {formatMoney(Number(product.price || 0) * item.quantity)}
                                        </Text>
                                    </View>
                                );
                            })
                        )}

                        <View style={styles.divider} />
                        <Text style={styles.total}>Total: Rs. {formatMoney(total)}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, (placingOrder || items.length === 0) && styles.buttonDisabled]}
                        onPress={placeOrder}
                        disabled={placingOrder || items.length === 0}
                    >
                        <Text style={styles.buttonText}>{placingOrder ? 'Placing Order...' : 'Place Order'}</Text>
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
}

function validateDebitCard(cardDetails) {
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    const expiry = cardDetails.expiry.trim();
    const cvv = cardDetails.cvv.trim();

    if (!cardDetails.cardName.trim()) {
        return 'Please enter the cardholder name';
    }

    if (!/^\d{13,19}$/.test(cardNumber) || !isValidCardNumber(cardNumber)) {
        return 'Please enter a valid debit card number';
    }

    if (!isValidExpiry(expiry)) {
        return 'Please enter a valid future expiry date in MM/YY format';
    }

    if (!/^\d{3}$/.test(cvv)) {
        return 'Please enter a valid 3-digit CVV';
    }

    return '';
}

function isValidCardNumber(value) {
    let sum = 0;
    let shouldDouble = false;

    for (let index = value.length - 1; index >= 0; index -= 1) {
        let digit = Number(value[index]);

        if (shouldDouble) {
            digit *= 2;

            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

function isValidExpiry(value) {
    const match = value.match(/^(\d{2})\/?(\d{2})$/);

    if (!match) {
        return false;
    }

    const month = Number(match[1]);
    const yearValue = Number(match[2]);
    const year = Number(`20${match[2]}`);

    if (month < 1 || month > 12) {
        return false;
    }

    if (yearValue < 0 || yearValue > 99) {
        return false;
    }

    const now = new Date();
    const expiryEnd = new Date(year, month, 0, 23, 59, 59);

    return expiryEnd >= now;
}

function formatExpiry(value, currentValue) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const currentDigits = currentValue.replace(/\D/g, '');

    if (!digits) {
        return '';
    }

    if (digits.length === 1) {
        if (digits === '0' || digits === '1') {
            return digits;
        }

        return `0${digits}/`;
    }

    let month = digits.slice(0, 2);
    let year = digits.slice(2);

    if (Number(month) === 0) {
        month = '01';
    }

    if (Number(month) > 12) {
        if (currentDigits.length <= 1 && digits[0] === '1') {
            month = '01';
            year = digits.slice(1, 3);
        } else {
            month = '12';
        }
    }

    return year ? `${month}/${year}` : `${month}/`;
}

function getProduct(item) {
    return item.product && typeof item.product === 'object' ? item.product : {};
}

function getProductId(item) {
    const product = item.product;
    return typeof product === 'object' ? product._id || product.id : product;
}

function getCartTotal(items) {
    return items.reduce((sum, item) => {
        const product = getProduct(item);
        return sum + Number(product.price || 0) * item.quantity;
    }, 0);
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString();
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fb' },
    content: { padding: 16, paddingBottom: 32 },
    title: { fontSize: 28, fontWeight: '900', marginBottom: 18 },
    sectionCard: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 14 },
    sectionTitle: { fontWeight: '900', fontSize: 18, marginBottom: 12 },
    chooseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    checkBox: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
    checkBoxActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    chooseTextWrap: { flex: 1 },
    chooseTitle: { fontWeight: '900', color: '#111827' },
    chooseHint: { color: '#6b7280', marginTop: 3 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 14, marginBottom: 14 },
    inputDisabled: { backgroundColor: '#f3f4f6', color: '#6b7280' },
    addressInput: { minHeight: 45, textAlignVertical: 'top' },
    paymentSelect: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    paymentSelectText: { fontWeight: '900', color: '#111827' },
    paymentMenu: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, marginTop: 8, marginBottom: 14, overflow: 'hidden' },
    paymentOption: { padding: 14, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    paymentOptionText: { color: '#374151', fontWeight: '800' },
    paymentOptionTextActive: { color: '#2563eb' },
    cardFields: { marginTop: 14 },
    cardFieldRow: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },
    proofSection: { marginTop: 14 },
    proofButtonRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    proofButton: { flex: 1, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff', borderRadius: 14, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
    proofButtonText: { color: '#2563eb', fontWeight: '900', fontSize: 12 },
    proofPreview: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
    proofImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#e5e7eb' },
    pdfIcon: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
    proofInfo: { flex: 1 },
    proofName: { color: '#111827', fontWeight: '900' },
    proofType: { color: '#6b7280', marginTop: 3, fontSize: 12 },
    clearProofButton: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
    proofHint: { color: '#6b7280', fontWeight: '800' },
    summary: { backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 18 },
    summaryTitle: { fontWeight: '900', fontSize: 18, marginBottom: 12 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
    itemNameWrap: { flex: 1 },
    itemName: { fontWeight: '900', color: '#111827' },
    itemMeta: { color: '#6b7280', marginTop: 2 },
    itemTotal: { fontWeight: '900', color: '#111827' },
    emptyText: { color: '#6b7280', fontWeight: '800' },
    divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
    total: { fontWeight: '900', color: '#2563eb', fontSize: 18 },
    button: { backgroundColor: '#16a34a', padding: 15, borderRadius: 14, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#86efac' },
    buttonText: { color: '#fff', fontWeight: '900' }
});
