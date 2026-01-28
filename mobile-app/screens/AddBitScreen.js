import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const AddBitScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [videoAsset, setVideoAsset] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    const pickVideo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need video library permissions.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setVideoAsset(result.assets[0]);
        }
    };

    const handleAddBit = async () => {
        if (!title || !videoAsset) {
            Alert.alert('Missing Information', 'Please provide a title and select a video.');
            return;
        }
        setIsLoading(true);
        let finalVideoUrl = null;

        try {
            const token = await AsyncStorage.getItem('userToken');

            // --- Step 1: Upload the video to Cloudinary ---
            setUploadProgress('Uploading video...');
            const formData = new FormData();
            formData.append('video', {
                uri: videoAsset.uri,
                name: `bit-video.${videoAsset.uri.split('.').pop()}`,
                type: `video/${videoAsset.uri.split('.').pop()}`,
            });

            const uploadResponse = await axios.post(`${API_URL}/upload/video`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token,
                },
            });
            finalVideoUrl = uploadResponse.data.videoUrl;

            // --- Step 2: Create the Bit with the new video URL ---
            setUploadProgress('Finalizing...');
            const bitData = {
                title,
                videoUrl: finalVideoUrl,
            };

            await axios.post(`${API_URL}/bits`, bitData, {
                headers: { 'x-auth-token': token },
            });

            Alert.alert('Success', 'Your Bit has been created!');
            navigation.goBack();

        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'Failed to create Bit.';
            Alert.alert('Error', errorMessage);
            console.error(error);
        } finally {
            setIsLoading(false);
            setUploadProgress('');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Title / Caption</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Write a caption..."
            />

            <Button title="Pick a Video from Gallery" onPress={pickVideo} />
            {videoAsset && <Text style={styles.uriText}>Video selected: {videoAsset.uri.split('/').pop()}</Text>}

            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <View>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.uriText}>{uploadProgress}</Text>
                    </View>
                ) : (
                    <Button title="Post Bit" onPress={handleAddBit} />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginTop: 15 },
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        backgroundColor: '#f9f9f9',
        marginBottom: 20,
    },
    uriText: {
        textAlign: 'center',
        marginTop: 10,
        color: 'gray',
    },
    buttonContainer: {
        marginTop: 30,
        marginBottom: 50,
    },
});

export default AddBitScreen;