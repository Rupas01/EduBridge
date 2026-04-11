import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // New state for toggle
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            return Alert.alert("Required", "Please enter both email and password.");
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            
            await AsyncStorage.setItem('userToken', res.data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));

            navigation.replace('MainApp');
        } catch (error) {
            Alert.alert("Login Failed", error.response?.data?.msg || "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Header Section (Adjusted margin since back button is removed) */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
                    </View>

                    {/* Input Card */}
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Ionicons name="mail-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#CBD5E0"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Password Group with Toggle */}
                        <View style={styles.inputGroup}>
                            <Ionicons name="lock-closed-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#CBD5E0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword} // Toggles visibility
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color="#A0AEC0" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity style={styles.forgotBtn}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Action Button */}
                    <TouchableOpacity 
                        style={[styles.loginBtn, isLoading && styles.disabledBtn]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginBtnText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Registration Link */}
                    <TouchableOpacity 
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerLinkText}>
                            Don't have an account? <Text style={styles.highlightText}>Create one</Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    scrollContent: { padding: 30 },
    headerSection: { marginBottom: 40, marginTop: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1A202C' },
    subtitle: { fontSize: 16, color: '#718096', marginTop: 10 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3
    },
    inputGroup: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    inputIcon: { marginRight: 15 },
    input: { flex: 1, fontSize: 16, color: '#2D3748' },
    eyeIcon: { padding: 5 }, // Larger touch target
    divider: { height: 1, backgroundColor: '#F7FAFC' },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 15 },
    forgotText: { color: '#2196F3', fontWeight: '600', fontSize: 14 },
    loginBtn: {
        backgroundColor: '#2196F3',
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 5
    },
    disabledBtn: { backgroundColor: '#A0AEC0', shadowOpacity: 0 },
    loginBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    registerLink: { marginTop: 25, alignItems: 'center' },
    registerLinkText: { color: '#718096', fontSize: 15 },
    highlightText: { color: '#2196F3', fontWeight: 'bold' }
});

export default LoginScreen;