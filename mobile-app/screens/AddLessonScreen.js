import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, ScrollView,
    ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';

const AddLessonScreen = ({ route, navigation }) => {
    // const { courseId, contentType, moduleId } = route.params;
    const { courseId, contentType, moduleId, initialData } = route.params;

    const isEditMode = !!initialData;

    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [videoAsset, setVideoAsset] = useState(null);
    const [existingVideoUrl, setExistingVideoUrl] = useState(initialData?.videoUrl || null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: isEditMode ? `Edit ${initialData.title}` : `Add ${contentType}`,
        });
    }, [navigation, contentType, isEditMode]);

    const pickVideo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        });
        if (!result.canceled) {
            setVideoAsset(result.assets[0]);
        }
    };

    const handleSaveProcess = async () => {
        const isTitleMissing = !title.trim();
        // Logic updated: Articles don't need description to pass this check
        const isVideoInvalid = contentType === 'video' && (!description.trim() || !videoAsset);
        const isBlogInvalid = contentType === 'blog' && !content.trim();

        if (isTitleMissing || isVideoInvalid || isBlogInvalid) {
            Alert.alert('Missing Information', 'Please fill out all required fields.');
            return;
        }

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            let finalVideoUrl = existingVideoUrl;

            // Only upload if a NEW video was picked
            if (contentType === 'video' && videoAsset) {
                const formData = new FormData();
                formData.append('video', {
                    uri: videoAsset.uri,
                    name: `lesson-video.${videoAsset.uri.split('.').pop()}`,
                    type: `video/${videoAsset.uri.split('.').pop()}`,
                });
                const uploadRes = await axios.post(`${API_URL}/upload/video`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token },
                });
                finalVideoUrl = uploadRes.data.videoUrl;
            }

            const payload = { title, description, contentType, content, videoUrl: finalVideoUrl, moduleId };

            if (isEditMode) {
                // UPDATE Logic
                await axios.put(`${API_URL}/courses/lessons/${initialData._id}`, payload, {
                    headers: { 'x-auth-token': token }
                });
            } else {
                // CREATE Logic
                await axios.post(`${API_URL}/courses/${courseId}/lessons`, payload, {
                    headers: { 'x-auth-token': token }
                });
            }

            Alert.alert('Success', isEditMode ? 'Lesson updated!' : 'Lesson added!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Action failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Lesson Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Understanding React State"
            />

            {/* ONLY SHOW DESCRIPTION FOR VIDEOS */}
            {contentType === 'video' && (
                <>
                    <Text style={styles.label}>Video Description (Knowledge Source for AI Quiz)</Text>
                    <TextInput
                        style={styles.inputMultiSmall}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="What is taught in this video?"
                        multiline
                    />
                    <View style={{ marginTop: 15 }}>
                        <Button title="Pick Video from Gallery" onPress={pickVideo} color="tomato" />
                        {videoAsset && (
                            <Text style={styles.uriText}>Selected: {videoAsset.uri.split('/').pop()}</Text>
                        )}
                    </View>
                </>
            )}

            {contentType === 'blog' && (
                <>
                    <Text style={styles.label}>Article Content</Text>
                    <TextInput
                        style={styles.inputMulti}
                        value={content}
                        onChangeText={setContent}
                        placeholder="Write your article here... the AI will use this text for quizzes."
                        multiline
                    />
                </>
            )}

            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <View>
                        <ActivityIndicator size="large" color="tomato" />
                        <Text style={styles.uriText}>{uploadProgress}</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.mainBtn} onPress={handleSaveProcess}>
                        <Text style={styles.mainBtnText}>Save Lesson</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 15, color: '#444' },
    input: { height: 50, borderColor: '#eee', borderWidth: 1, borderRadius: 8, paddingLeft: 15, backgroundColor: '#fdfdfd' },
    inputMultiSmall: { borderColor: '#eee', borderWidth: 1, borderRadius: 8, padding: 15, minHeight: 80, textAlignVertical: 'top', backgroundColor: '#fdfdfd' },
    inputMulti: { borderColor: '#eee', borderWidth: 1, borderRadius: 8, padding: 15, minHeight: 300, textAlignVertical: 'top', backgroundColor: '#fdfdfd' },
    uriText: { textAlign: 'center', marginTop: 10, color: 'gray', fontSize: 12 },
    buttonContainer: { marginTop: 30, marginBottom: 50 },
    mainBtn: { backgroundColor: 'tomato', padding: 18, borderRadius: 12, alignItems: 'center' },
    mainBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default AddLessonScreen;