import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, StyleSheet, ScrollView, Alert, 
    Image, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';

const EditProfileScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await axios.get(`${API_URL}/profile/me`, {
                    headers: { 'x-auth-token': token }
                });
                const { user } = response.data;
                setFirstName(user.firstName);
                setLastName(user.lastName);
                setBio(user.bio || '');
                setProfilePictureUrl(user.profilePictureUrl || '');
            } catch (error) {
                Alert.alert("Error", "Could not load your profile data.");
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled) {
            setNewImage(result.assets[0]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            let finalImageUrl = profilePictureUrl;

            if (newImage) {
                const formData = new FormData();
                formData.append('image', {
                    uri: newImage.uri,
                    name: `profile-pic.jpg`,
                    type: `image/jpeg`,
                });
                const uploadResponse = await axios.post(`${API_URL}/upload/image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token },
                });
                finalImageUrl = uploadResponse.data.imageUrl;
            }

            const updatedProfile = { firstName, lastName, bio, profilePictureUrl: finalImageUrl };

            await axios.put(`${API_URL}/profile`, updatedProfile, {
                headers: { 'x-auth-token': token }
            });

            Alert.alert("Success ✨", "Profile updated successfully!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* 1. PROFILE PICTURE SECTION */}
                <View style={styles.pfpSection}>
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                        <View style={styles.imageWrapper}>
                            {newImage ? (
                                <Image source={{ uri: newImage.uri }} style={styles.profilePicture} />
                            ) : profilePictureUrl ? (
                                <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
                            ) : (
                                <View style={styles.defaultPfp}>
                                    <Ionicons name="person" size={50} color="#A0AEC0" />
                                </View>
                            )}
                            <View style={styles.cameraIconBadge}>
                                <Ionicons name="camera" size={18} color="#fff" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Tap to change photo</Text>
                </View>

                {/* 2. INFORMATION CARD */}
                <View style={styles.card}>
                    <Text style={styles.inputLabel}>Personal Info</Text>
                    
                    <View style={styles.inputGroup}>
                        <Ionicons name="person-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="First Name" 
                            value={firstName} 
                            onChangeText={setFirstName} 
                            placeholderTextColor="#CBD5E0"
                        />
                    </View>
                    
                    <View style={styles.divider} />

                    <View style={styles.inputGroup}>
                        <Ionicons name="person-outline" size={20} color="#A0AEC0" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Last Name" 
                            value={lastName} 
                            onChangeText={setLastName} 
                            placeholderTextColor="#CBD5E0"
                        />
                    </View>
                </View>

                {/* 3. BIO CARD */}
                <View style={styles.card}>
                    <Text style={styles.inputLabel}>About You</Text>
                    <TextInput
                        style={styles.inputMulti}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell us a little about yourself..."
                        placeholderTextColor="#CBD5E0"
                        multiline
                        maxLength={150}
                    />
                    <Text style={styles.charCount}>{bio.length}/150</Text>
                </View>

                {/* 4. SAVE BUTTON */}
                <TouchableOpacity 
                    style={[styles.saveBtn, isSaving && styles.disabledBtn]} 
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    scrollContent: { padding: 20 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // PFP Styles
    pfpSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    imageWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#EDF2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        // Shadow for the avatar circle
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    profilePicture: { width: 110, height: 110, borderRadius: 55 },
    defaultPfp: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2196F3',
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff'
    },
    changePhotoText: { marginTop: 12, color: '#2196F3', fontWeight: '600', fontSize: 14 },

    // Card & Input Styles
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20
    },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    inputGroup: { flexDirection: 'row', alignItems: 'center' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#2D3748', paddingVertical: 10 },
    divider: { height: 1, backgroundColor: '#F7FAFC', marginVertical: 10 },
    
    inputMulti: {
        fontSize: 16,
        color: '#2D3748',
        minHeight: 80,
        textAlignVertical: 'top',
        lineHeight: 22
    },
    charCount: { textAlign: 'right', fontSize: 12, color: '#A0AEC0', marginTop: 8 },

    // Save Button
    saveBtn: {
        backgroundColor: '#2196F3',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 5,
        marginTop: 10,
        marginBottom: 40
    },
    disabledBtn: { backgroundColor: '#A0AEC0', shadowOpacity: 0 },
    saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default EditProfileScreen;