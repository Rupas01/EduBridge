import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
    View, Text, StyleSheet, ScrollView, 
    ActivityIndicator, Alert, TouchableOpacity 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';

const LessonContentScreen = ({ route, navigation }) => {
    const { lessonId } = route.params;
    const [lesson, setLesson] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);

    const fetchLessonContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            // Using the /lessons/:id endpoint
            const response = await axios.get(`${API_URL}/lessons/${lessonId}`, {
                headers: { 'x-auth-token': token }
            });
            setLesson(response.data);
            navigation.setOptions({ title: response.data.title });
        } catch (error) {
            console.error("Failed to fetch lesson:", error);
            Alert.alert("Error", "Could not load lesson content.");
        } finally {
            setIsLoading(false);
        }
    }, [lessonId, navigation]);

    useFocusEffect(
        useCallback(() => {
            fetchLessonContent();
        }, [fetchLessonContent])
    );

    const handleMarkComplete = async () => {
        setIsCompleting(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            // We need the course ID to update the correct Progress document
            const courseId = lesson.course; 

            await axios.post(`${API_URL}/courses/${courseId}/complete-lesson`, 
                { lessonId }, 
                { headers: { 'x-auth-token': token } }
            );

            Alert.alert("Success", "Lesson completed!", [
                { text: "Continue", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Completion Error:", error);
            Alert.alert("Error", "Could not save your progress.");
        } finally {
            setIsCompleting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Fetching content...</Text>
            </View>
        );
    }

    if (!lesson) {
        return <View style={styles.loaderContainer}><Text>Lesson not found.</Text></View>;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <Text style={styles.title}>{lesson.title}</Text>
            
            <View style={styles.metaRow}>
                <View style={styles.badge}>
                    <Ionicons name="document-text-outline" size={14} color="#666" />
                    <Text style={styles.badgeText}>Article</Text>
                </View>
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.content}>{lesson.content}</Text>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.completeBtn, isCompleting && styles.disabledBtn]} 
                    onPress={handleMarkComplete}
                    disabled={isCompleting}
                >
                    {isCompleting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                            <Text style={styles.completeBtnText}>Mark as Completed</Text>
                        </>
                    )}
                </TouchableOpacity>
                <Text style={styles.footerHint}>Finish this lesson to unlock the next one.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    loaderContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    loadingText: {
        marginTop: 10,
        color: '#666'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5,
        fontWeight: '600',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 20,
    },
    content: {
        fontSize: 16,
        lineHeight: 28,
        color: '#444',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 30,
    },
    completeBtn: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    disabledBtn: {
        backgroundColor: '#a5d6a7',
    },
    completeBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    footerHint: {
        marginTop: 15,
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    }
});

export default LessonContentScreen;