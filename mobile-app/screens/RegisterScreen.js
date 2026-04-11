import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { API_URL } from '../config';
// New Import for DatePicker
import DateTimePicker from '@react-native-community/datetimepicker';

const RegisterScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Username Check States
    const [usernameStatus, setUsernameStatus] = useState(null); 
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // DatePicker State
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Form Data
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        username: '',
        mobileNumber: '',
        dateOfBirth: '', // This will store the formatted YYYY-MM-DD string
        interests: []
    });

    const categories = ['Programming', 'Design', 'Business', 'Marketing'];

    const updateForm = (key, value) => setForm({ ...form, [key]: value });

    // Handle Date Selection
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            updateForm('dateOfBirth', formattedDate);
        }
    };

    // Live Username Check Logic
    const checkUsername = async (username) => {
        if (username.length < 3) {
            setUsernameStatus(null);
            return;
        }
        setIsCheckingUsername(true);
        setUsernameStatus('checking');
        try {
            const res = await axios.get(`${API_URL}/auth/check-username/${username}`);
            setUsernameStatus(res.data.available ? 'available' : 'taken');
        } catch (error) {
            setUsernameStatus(null);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const toggleInterest = (interest) => {
        let updated = [...form.interests];
        if (updated.includes(interest)) {
            updated = updated.filter(i => i !== interest);
        } else {
            updated.push(interest);
        }
        updateForm('interests', updated);
    };

    const nextStep = () => {
        if (step === 1) {
            if (!form.email || !form.password) return Alert.alert("Required", "Please fill in all fields.");
            if (form.password !== form.confirmPassword) return Alert.alert("Error", "Passwords do not match.");
        }
        if (step === 2) {
            if (!form.firstName || !form.username) return Alert.alert("Required", "First name and Username are required.");
            if (usernameStatus === 'taken') return Alert.alert("Username Taken", "Please choose another username.");
        }
        if (step === 3) {
            if (!form.mobileNumber || !form.dateOfBirth) return Alert.alert("Required", "Please provide mobile and date of birth.");
        }
        if (step < 4) setStep(step + 1);
    };

    const handleFinalRegister = async () => {
        setIsLoading(true);
        try {
            const payload = { ...form };
            delete payload.confirmPassword;
            await axios.post(`${API_URL}/auth/register`, payload);
            Alert.alert("Success ✨", "Account created! Please sign in.");
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert("Error", error.response?.data?.msg || "Registration failed.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP RENDERS ---

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Create Account</Text>
            <Text style={styles.stepSub}>Step 1 of 4: Credentials</Text>
            <View style={styles.card}>
                <InputField icon="mail-outline" placeholder="Email Address" value={form.email} onChangeText={(v) => updateForm('email', v.trim())} keyboardType="email-address" autoCapitalize="none" />
                <View style={styles.divider} />
                <InputField icon="lock-closed-outline" placeholder="Password" value={form.password} onChangeText={(v) => updateForm('password', v)} secureTextEntry />
                <View style={styles.divider} />
                <InputField icon="lock-closed-outline" placeholder="Confirm Password" value={form.confirmPassword} onChangeText={(v) => updateForm('confirmPassword', v)} secureTextEntry />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Digital Identity</Text>
            <Text style={styles.stepSub}>Step 2 of 4: Profile Details</Text>
            <View style={styles.card}>
                <InputField icon="person-outline" placeholder="First Name" value={form.firstName} onChangeText={(v) => updateForm('firstName', v)} />
                <View style={styles.divider} />
                <InputField icon="person-outline" placeholder="Last Name" value={form.lastName} onChangeText={(v) => updateForm('lastName', v)} />
                <View style={styles.divider} />
                
                <View style={styles.inputGroup}>
                    <Ionicons name="at-outline" size={20} color="#A0AEC0" style={{ marginRight: 12 }} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Username" 
                        value={form.username} 
                        onChangeText={(v) => {
                            const clean = v.toLowerCase().replace(/[^a-z0-9_]/g, '');
                            updateForm('username', clean);
                            checkUsername(clean);
                        }} 
                        autoCapitalize="none"
                    />
                    {isCheckingUsername ? (
                        <ActivityIndicator size="small" color="#2196F3" />
                    ) : usernameStatus === 'available' ? (
                        <Ionicons name="checkmark-circle" size={20} color="#48BB78" />
                    ) : usernameStatus === 'taken' ? (
                        <Ionicons name="close-circle" size={20} color="#F56565" />
                    ) : null}
                </View>
                {usernameStatus === 'taken' && <Text style={styles.errorText}>This username is already taken</Text>}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Security</Text>
            <Text style={styles.stepSub}>Step 3 of 4: Verification</Text>
            <View style={styles.card}>
                <InputField icon="call-outline" placeholder="Mobile Number" value={form.mobileNumber} onChangeText={(v) => updateForm('mobileNumber', v)} keyboardType="phone-pad" />
                <View style={styles.divider} />
                
                {/* MODERN DATE PICKER FIELD */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputGroup}>
                    <Ionicons name="calendar-outline" size={20} color="#A0AEC0" style={{ marginRight: 12 }} />
                    <Text style={[styles.input, !form.dateOfBirth && { color: '#CBD5E0' }]}>
                        {form.dateOfBirth || "Select Date of Birth"}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(2000, 0, 1)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()} // Prevents selecting future dates
                    />
                )}
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Interests</Text>
            <Text style={styles.stepSub}>Step 4 of 4: Personalize Feed</Text>
            <View style={styles.chipGrid}>
                {categories.map(cat => (
                    <TouchableOpacity 
                        key={cat} 
                        style={[styles.chip, form.interests.includes(cat) && styles.activeChip]}
                        onPress={() => toggleInterest(cat)}
                    >
                        <Text style={[styles.chipText, form.interests.includes(cat) && styles.activeChipText]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.progressWrapper}>
                <View style={[styles.progressBar, { width: `${(step / 4) * 100}%` }]} />
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#4A5568" />
                    </TouchableOpacity>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </ScrollView>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.mainBtn} onPress={step === 4 ? handleFinalRegister : nextStep}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{step === 4 ? "Create Account" : "Continue"}</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const InputField = ({ icon, ...props }) => (
    <View style={styles.inputGroup}>
        <Ionicons name={icon} size={20} color="#A0AEC0" style={{ marginRight: 12 }} />
        <TextInput style={styles.input} placeholderTextColor="#CBD5E0" {...props} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    progressWrapper: { height: 4, backgroundColor: '#E2E8F0' },
    progressBar: { height: '100%', backgroundColor: '#2196F3' },
    scrollContent: { padding: 25 },
    backBtn: { marginBottom: 20 },
    stepContainer: { flex: 1 },
    stepTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A202C' },
    stepSub: { fontSize: 15, color: '#718096', marginTop: 6, marginBottom: 30 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    input: { flex: 1, fontSize: 16, color: '#2D3748' },
    divider: { height: 1, backgroundColor: '#F7FAFC' },
    errorText: { color: '#F56565', fontSize: 12, marginTop: -8, marginBottom: 10, marginLeft: 32, fontWeight: '600' },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
    activeChip: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
    chipText: { color: '#4A5568', fontWeight: '600' },
    activeChipText: { color: '#fff' },
    footer: { padding: 25, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EDF2F7' },
    mainBtn: { backgroundColor: '#2196F3', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default RegisterScreen;