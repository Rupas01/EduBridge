import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, Alert,
    ScrollView, Image, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';

const CreateCourseScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Programming'); // Default selected
    const [thumbnailAsset, setThumbnailAsset] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const categories = ['Programming', 'Design', 'Business', 'Marketing'];

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your gallery to upload a thumbnail.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });
        if (!result.canceled) setThumbnailAsset(result.assets[0]);
    };

    const handleCreateCourse = async () => {
        if (!title || !description || !thumbnailAsset) {
            Alert.alert('Incomplete', 'Please provide a title, description, and thumbnail.');
            return;
        }
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            // Image Upload
            const formData = new FormData();
            formData.append('image', {
                uri: thumbnailAsset.uri,
                name: `thumb_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            const uploadRes = await axios.post(`${API_URL}/upload/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token },
            });

            // Course Creation
            await axios.post(`${API_URL}/courses`, {
                title, description, category, thumbnailUrl: uploadRes.data.imageUrl
            }, { headers: { 'x-auth-token': token } });

            Alert.alert('Success ✨', 'Your course is live!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* 1. THUMBNAIL PICKER */}
                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {thumbnailAsset ? (
                        <View>
                            <Image source={{ uri: thumbnailAsset.uri }} style={styles.thumbnail} />
                            <View style={styles.editOverlay}>
                                <Ionicons name="camera" size={24} color="#fff" />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.placeholderThumb}>
                            <Ionicons name="image-outline" size={48} color="#A0AEC0" />
                            <Text style={styles.placeholderText}>Add Course Thumbnail</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* 2. INPUT CARD */}
                <View style={styles.card}>
                    <Text style={styles.inputLabel}>Course Details</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Title" 
                        value={title} 
                        onChangeText={setTitle}
                        placeholderTextColor="#A0AEC0"
                    />
                    <View style={styles.divider} />
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        placeholder="Description" 
                        multiline 
                        value={description} 
                        onChangeText={setDescription}
                        placeholderTextColor="#A0AEC0"
                    />
                </View>

                {/* 3. CATEGORY CHIPS */}
                <Text style={styles.sectionHeader}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity 
                            key={cat} 
                            onPress={() => setCategory(cat)}
                            style={[styles.chip, category === cat && styles.activeChip]}
                        >
                            <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* 4. SUBMIT BUTTON */}
                <TouchableOpacity 
                    style={[styles.submitBtn, isLoading && styles.disabledBtn]} 
                    onPress={handleCreateCourse}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>Launch Course</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    scrollContent: { padding: 20 },
    
    // Thumbnail Styles
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 25,
        backgroundColor: '#EDF2F7',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    thumbnail: { width: '100%', height: '100%' },
    editOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
    placeholderThumb: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { marginTop: 10, color: '#718096', fontWeight: '600' },

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
        marginBottom: 25
    },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#4A5568', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    input: { fontSize: 16, paddingVertical: 12, color: '#2D3748' },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 5 },

    // Chip Styles
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#1A202C', marginBottom: 12 },
    chipScroll: { marginBottom: 30 },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    activeChip: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
    chipText: { color: '#4A5568', fontWeight: '600' },
    activeChipText: { color: '#fff' },

    // Submit Styles
    submitBtn: {
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
        marginBottom: 50
    },
    disabledBtn: { backgroundColor: '#A0AEC0', shadowOpacity: 0 },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CreateCourseScreen;