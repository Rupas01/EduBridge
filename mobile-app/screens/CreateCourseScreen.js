import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, Alert,
    ScrollView, Image, TouchableOpacity, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const CreateCourseScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [thumbnailAsset, setThumbnailAsset] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setThumbnailAsset(result.assets[0]);
        }
    };

    const handleCreateCourse = async () => {
        if (!title || !description || !category || !thumbnailAsset) {
            Alert.alert('Missing Information', 'Please fill out all fields and select a thumbnail.');
            return;
        }
        setIsLoading(true);
        let finalImageUrl = null;

        try {
            const token = await AsyncStorage.getItem('userToken');

            setUploadProgress('Uploading thumbnail...');
            const formData = new FormData();
            formData.append('image', {
                uri: thumbnailAsset.uri,
                name: `thumbnail.${thumbnailAsset.uri.split('.').pop()}`,
                type: `image/${thumbnailAsset.uri.split('.').pop()}`,
            });

            const uploadResponse = await axios.post(`${API_URL}/upload/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token,
                },
            });
            finalImageUrl = uploadResponse.data.imageUrl;

            setUploadProgress('Finalizing course...');
            const courseData = { 
                title, 
                description, 
                category,
                thumbnailUrl: finalImageUrl
            };
            
            await axios.post(`${API_URL}/courses`, courseData, {
                headers: { 'x-auth-token': token }
            });

            Alert.alert('Success', 'Your course has been created!');
            navigation.goBack();

        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'Failed to create course.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
            setUploadProgress('');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Course Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Introduction to React Native" />

            <Text style={styles.label}>Course Description</Text>
            <TextInput style={styles.inputMulti} value={description} onChangeText={setDescription} placeholder="What will students learn in this course?" multiline />

            <Text style={styles.label}>Category</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g., Programming" />

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Text style={styles.imagePickerText}>Upload Thumbnail</Text>
            </TouchableOpacity>

            {thumbnailAsset && <Image source={{ uri: thumbnailAsset.uri }} style={styles.thumbnailPreview} />}

            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <View>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.progressText}>{uploadProgress}</Text>
                    </View>
                ) : (
                    <Button title="Create Course" onPress={handleCreateCourse} />
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
    imagePicker: {
        backgroundColor: '#e9e9e9',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    imagePickerText: { fontWeight: 'bold' },
    thumbnailPreview: {
        width: '100%',
        height: 200,
        borderRadius: 5,
        marginTop: 15,
        resizeMode: 'cover',
    },
    buttonContainer: {
        marginTop: 30,
        marginBottom: 50,
    },
    progressText: {
        textAlign: 'center',
        marginTop: 10,
        color: 'gray',
    },
});

export default CreateCourseScreen;