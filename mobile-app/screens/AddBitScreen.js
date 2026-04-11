import React, { useState } from 'react';
import { 
    View, Text, TextInput, StyleSheet, ScrollView, 
    ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';

const AddBitScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [videoAsset, setVideoAsset] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    const pickVideo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need video library permissions to upload Bits.');
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
            Alert.alert('Missing Info', 'Please add a caption and select a video.');
            return;
        }
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            // --- Step 1: Upload to Cloudinary ---
            setUploadProgress('Uploading video...');
            const formData = new FormData();
            formData.append('video', {
                uri: videoAsset.uri,
                name: `bit_${Date.now()}.mp4`,
                type: `video/mp4`,
            });

            const uploadRes = await axios.post(`${API_URL}/upload/video`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token },
            });

            // --- Step 2: Create Bit Record ---
            setUploadProgress('Finalizing...');
            await axios.post(`${API_URL}/bits`, {
                title,
                videoUrl: uploadRes.data.videoUrl,
            }, { headers: { 'x-auth-token': token } });

            Alert.alert('Success ✨', 'Your Bit is now trending!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.msg || 'Failed to post Bit.');
        } finally {
            setIsLoading(false);
            setUploadProgress('');
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* 1. VIDEO SELECTION AREA */}
                <TouchableOpacity 
                    style={[styles.videoDropzone, videoAsset && styles.activeDropzone]} 
                    onPress={pickVideo}
                >
                    {videoAsset ? (
                        <View style={styles.selectedContent}>
                            <Ionicons name="checkmark-circle" size={48} color="#48BB78" />
                            <Text style={styles.selectedText}>Video Selected</Text>
                            <Text style={styles.fileName}>{videoAsset.uri.split('/').pop()}</Text>
                            <Text style={styles.changeText}>Tap to change video</Text>
                        </View>
                    ) : (
                        <View style={styles.placeholderContent}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="videocam" size={32} color="#2196F3" />
                            </View>
                            <Text style={styles.placeholderTitle}>Select Video Bit</Text>
                            <Text style={styles.placeholderSub}>Choose a short educational video</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* 2. CAPTION CARD */}
                <View style={styles.card}>
                    <Text style={styles.inputLabel}>Caption / Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="What is this Bit about?"
                        placeholderTextColor="#A0AEC0"
                        multiline
                    />
                </View>

                {/* 3. POST BUTTON */}
                <TouchableOpacity 
                    style={[styles.postBtn, isLoading && styles.disabledBtn]} 
                    onPress={handleAddBit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={styles.loaderRow}>
                            <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                            <Text style={styles.postBtnText}>{uploadProgress}</Text>
                        </View>
                    ) : (
                        <Text style={styles.postBtnText}>Post Bit</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.infoText}>
                    Bits are short videos designed for quick learning. Keep them under 60 seconds for best engagement.
                </Text>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    scrollContent: { padding: 20 },
    
    // Video Dropzone
    videoDropzone: {
        width: '100%',
        height: 240,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    activeDropzone: {
        borderColor: '#48BB78',
        borderStyle: 'solid',
        backgroundColor: '#F0FFF4'
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EBF8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    placeholderTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
    placeholderSub: { fontSize: 14, color: '#718096', marginTop: 5 },
    selectedText: { fontSize: 18, fontWeight: '700', color: '#2F855A', marginTop: 10 },
    fileName: { fontSize: 12, color: '#48BB78', marginTop: 4 },
    changeText: { marginTop: 15, color: '#2196F3', fontWeight: '600' },

    // Caption Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 25
    },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    input: { fontSize: 16, color: '#2D3748', minHeight: 60, textAlignVertical: 'top' },

    // Post Button
    postBtn: {
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
        marginBottom: 20
    },
    disabledBtn: { backgroundColor: '#A0AEC0', shadowOpacity: 0 },
    postBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    loaderRow: { flexDirection: 'row', alignItems: 'center' },
    
    infoText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#A0AEC0',
        lineHeight: 20,
        paddingHorizontal: 20
    }
});

export default AddBitScreen;