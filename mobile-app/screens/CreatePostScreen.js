import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ActivityIndicator, Alert, ScrollView, Image, 
    KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const CreatePostScreen = ({ navigation }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null); 
    const [imageUri, setImageUri] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const res = await axios.get(`${API_URL}/profile/me`, {
                    headers: { 'x-auth-token': token }
                });
                setUserData(res.data.user);
            } catch (error) {
                console.error("Error fetching user for post:", error);
            }
        };
        fetchUserData();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const base64Str = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImage(base64Str);
            setImageUri(result.assets[0].uri);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImageUri(null);
    };

    const handlePost = async () => {
        if (!content.trim() && !image) return;
        setIsSubmitting(true);

        try {
            const token = await AsyncStorage.getItem('userToken');
            const payload = {
                content,
                imageUrls: image ? [image] : [],
                type: image ? 'media' : 'text'
            };

            await axios.post(`${API_URL}/posts`, payload, {
                headers: { 'x-auth-token': token }
            });
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Could not upload post.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="close" size={28} color="#1A202C" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.postBtn, (!content.trim() && !image) ? styles.disabledBtn : styles.activeBtn]} 
                    onPress={handlePost} 
                    disabled={isSubmitting || !content.trim()}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.postBtnText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
                    
                    {/* REAL USER IDENTITY */}
                    <View style={styles.userRow}>
                        <Image 
                            source={{ uri: userData?.profilePictureUrl || 'https://via.placeholder.com/100' }} 
                            style={styles.avatar} 
                        />
                        <View>
                            <Text style={styles.username}>{userData?.username || 'Loading...'}</Text>
                            <View style={styles.privacyBadge}>
                                <Ionicons name="earth" size={12} color="#718096" />
                                <Text style={styles.privacyText}>Public</Text>
                            </View>
                        </View>
                    </View>

                    {/* INPUT AREA */}
                    <TextInput 
                        placeholder="What are you learning today?" 
                        multiline 
                        autoFocus 
                        style={styles.input} 
                        value={content} 
                        onChangeText={setContent} 
                        placeholderTextColor="#A0AEC0"
                    />

                    {/* IMAGE PREVIEW */}
                    {imageUri && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeImgBtn} onPress={removeImage}>
                                <Ionicons name="close-circle" size={32} color="rgba(0,0,0,0.7)" />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* CLEAN TOOLBAR (Extra Icons Removed) */}
                <View style={styles.toolbar}>
                    <TouchableOpacity onPress={pickImage} style={styles.toolBtn}>
                        <Ionicons name="image-outline" size={28} color="#2196F3" />
                        <Text style={styles.toolLabel}>Add Photo</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.charCount}>
                        {content.length} characters
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F7FAFC'
    },
    closeBtn: { padding: 4 },
    postBtn: { 
        paddingHorizontal: 24, 
        paddingVertical: 8, 
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center'
    },
    activeBtn: { backgroundColor: '#2196F3' },
    disabledBtn: { backgroundColor: '#E2E8F0' },
    postBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

    scrollBody: { padding: 20 },
    userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#EDF2F7' },
    username: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
    privacyBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    privacyText: { fontSize: 12, color: '#718096', marginLeft: 4, fontWeight: '500' },

    input: { 
        fontSize: 18, 
        minHeight: 120, 
        textAlignVertical: 'top', 
        color: '#2D3748',
        lineHeight: 26 
    },

    previewContainer: { marginTop: 20, borderRadius: 16, overflow: 'hidden', position: 'relative' },
    previewImage: { width: '100%', height: 300, resizeMode: 'cover' },
    removeImgBtn: { position: 'absolute', top: 10, right: 10 },

    toolbar: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7'
    },
    toolBtn: { flexDirection: 'row', alignItems: 'center' },
    toolLabel: { marginLeft: 8, color: '#2196F3', fontWeight: '600', fontSize: 15 },
    charCount: { fontSize: 12, color: '#A0AEC0', fontWeight: '600' }
});

export default CreatePostScreen;