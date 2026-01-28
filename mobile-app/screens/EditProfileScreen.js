import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
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
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            let finalImageUrl = profilePictureUrl;

            // Step 1: If a new image was picked, upload it first
            if (newImage) {
                const formData = new FormData();
                formData.append('image', {
                    uri: newImage.uri,
                    name: `profile-pic.${newImage.uri.split('.').pop()}`,
                    type: `image/${newImage.uri.split('.').pop()}`,
                });
                const uploadResponse = await axios.post(`${API_URL}/upload/image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token },
                });
                finalImageUrl = uploadResponse.data.imageUrl;
            }

            // Step 2: Update the profile with all data
            const updatedProfile = { firstName, lastName, bio, profilePictureUrl: finalImageUrl };
            await axios.put(`${API_URL}/profile`, updatedProfile, {
                headers: { 'x-auth-token': token }
            });

            Alert.alert("Success", "Your profile has been updated.");
            navigation.navigate('MainApp', { screen: 'Profile' });
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
            console.error("Update profile error:", error.response?.data || error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.pfpContainer}>
                {newImage ? (
                    <Image source={{ uri: newImage.uri }} style={styles.profilePicture} />
                ) : profilePictureUrl ? (
                    <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
                ) : (
                    <Ionicons name="person-circle" size={120} color="#ccc" />
                )}
                <Button title="Change Profile Picture" onPress={pickImage} />
            </View>

            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
            
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

            <Text style={styles.label}>Bio</Text>
            <TextInput
                style={styles.inputMulti}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us a little about yourself"
                multiline
                maxLength={150}
            />
            
            <Button title={isLoading ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={isLoading} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    pfpContainer: { alignItems: 'center', marginBottom: 20 },
    profilePicture: { width: 120, height: 120, borderRadius: 60, marginBottom: 10, backgroundColor: '#eee' },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginTop: 15 },
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        backgroundColor: '#f9f9f9',
    },
    inputMulti: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        minHeight: 100,
        textAlignVertical: 'top',
        backgroundColor: '#f9f9f9',
    },
});

export default EditProfileScreen;