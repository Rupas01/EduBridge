import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ActivityIndicator, Alert, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';
import CurriculumItem from '../components/CurriculumItem';

const CourseDetailScreen = ({ route, navigation }) => {
    const { courseId } = route.params;
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const fetchCourseDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${API_URL}/courses/${courseId}`, {
                headers: { 'x-auth-token': token }
            });
            setCourse(response.data);
        } catch (error) {
            Alert.alert("Error", "Could not load course details.");
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useFocusEffect(useCallback(() => { fetchCourseDetails(); }, [fetchCourseDetails]));

    const handleEnrollmentToggle = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (course.isEnrolled) {
            Alert.alert("Unenroll", "Confirm unenrollment?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes", style: "destructive", onPress: async () => {
                        await axios.delete(`${API_URL}/courses/${courseId}/enroll`, { headers: { 'x-auth-token': token } });
                        fetchCourseDetails();
                    }
                }
            ]);
        } else {
            try {
                await axios.post(`${API_URL}/courses/${courseId}/enroll`, {}, { headers: { 'x-auth-token': token } });
                fetchCourseDetails();
            } catch (e) {
                Alert.alert("Error", "Enrollment failed.");
            }
        }
    };

    const handleNavigateLesson = (item, isLocked) => {
        // 1. Check Security
        if (isLocked && !course.isMentor) {
            if (!course.isEnrolled) {
                Alert.alert("Course Locked", "Please enroll in the course to access this content.");
            } else {
                Alert.alert("Sequence Locked", "Please complete the previous lesson first!");
            }
            return;
        }

        // 2. Determine Item Type
        const isQuiz = item.questions || item.type === 'quiz' || (!item.contentType && item.course);

        // 3. Navigate and EXIT function (return) to prevent collision
        if (isQuiz) {
            if (course.isMentor) {
                return navigation.navigate('ManualQuizAdd', {
                    courseId: course._id,
                    moduleId: item.module || null,
                    quizId: item._id,
                    initialData: item.questions,
                    mode: item.creationMode || 'manual',
                    title: item.title
                });
            } else {
                return navigation.navigate('QuizAttempt', { quizId: item._id });
            }
        }

        if (item.contentType === 'video') {
            let moduleVideos = [];

            // Find the specific module this video belongs to
            const parentModule = course.curriculum.find(entry =>
                entry.type === 'module' && entry.item._id === item.moduleId // Ensure your lesson objects have moduleId
            );

            if (parentModule && parentModule.item.lessons) {
                moduleVideos = parentModule.item.lessons.filter(l => l.contentType === 'video');
            } else {
                moduleVideos = [item];
            }

            const currentIndex = moduleVideos.findIndex(v => v._id === item._id);
            return navigation.navigate('VideoPlayer', {
                lessons: moduleVideos,
                currentLessonIndex: currentIndex !== -1 ? currentIndex : 0
            });
        }
        return navigation.navigate('LessonContent', { lessonId: item._id });
    };

    const handleAddContent = (moduleId = null, contentType, initialData = null) => {
        if (contentType === 'module') {
            navigation.navigate('AddModule', { courseId });
        } else if (contentType === 'quiz') {
            Alert.alert("Quiz Action", "Choose method:", [
                { text: "Manual Entry", onPress: () => navigation.navigate('ManualQuizAdd', { courseId: course._id, moduleId, mode: 'manual' }) },
                { text: "Generate AI", onPress: () => handleAiGeneration(moduleId) },
                { text: "Cancel", style: "cancel" }
            ]);
        } else {
            navigation.navigate('AddLesson', { courseId, moduleId, contentType, initialData });
        }
    };

    const handleDeleteContent = (itemId, itemType) => {
        Alert.alert("Delete Content", "This action is permanent.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        const endpoint = itemType === 'quiz' ? `${API_URL}/quizzes/${itemId}` : `${API_URL}/courses/lessons/${itemId}`;
                        await axios.delete(endpoint, { headers: { 'x-auth-token': token } });
                        fetchCourseDetails();
                    } catch (e) { Alert.alert("Error", "Delete failed."); }
                }
            }
        ]);
    };

    const handleAiGeneration = async (moduleId) => {
        setIsAiGenerating(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${API_URL}/quizzes/generate-ai`, { courseId: course._id, moduleId }, { headers: { 'x-auth-token': token } });
            navigation.navigate('ManualQuizAdd', {
                courseId: course._id, moduleId, initialData: response.data, mode: 'ai', title: "AI Generated Quiz"
            });
        } catch (error) { Alert.alert("AI Error", "Ensure lessons have descriptions."); }
        finally { setIsAiGenerating(false); }
    };

    if (isLoading) return <ActivityIndicator size="large" color="tomato" style={styles.loader} />;

    const firstModuleId = course.curriculum.find(c => c.type === 'module')?.item?._id;

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            {isAiGenerating && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="purple" />
                    <Text style={styles.loadingText}>AI is analyzing your content...</Text>
                </View>
            )}
            <FlatList
                ListHeaderComponent={
                    <>
                        {course.thumbnailUrl ? (
                            <Image source={{ uri: course.thumbnailUrl }} style={styles.thumbnail} />
                        ) : (
                            <View style={[styles.thumbnail, styles.defaultThumbnail]}>
                                <Ionicons name="image-outline" size={50} color="#ccc" />
                            </View>
                        )}

                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>{course?.title}</Text>
                            <Text style={styles.category}>{course?.category}</Text>

                            {!course?.isMentor && (
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.enrollButton, course.isEnrolled && styles.unenrollButton]}
                                        onPress={handleEnrollmentToggle}
                                    >
                                        <Text style={[styles.enrollButtonText, course.isEnrolled && styles.unenrollText]}>
                                            {course.isEnrolled ? 'Unenroll' : 'Enroll Now'}
                                        </Text>
                                    </TouchableOpacity>

                                    {course.isEnrolled && (
                                        <TouchableOpacity
                                            style={styles.statsButton}
                                            onPress={() => navigation.navigate('CourseDashboard', { courseId: course._id })}
                                        >
                                            <Ionicons name="stats-chart" size={20} color="white" />
                                            <Text style={styles.statsButtonText}>Stats</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <Text style={styles.description}>{course?.description}</Text>

                            {course?.isMentor && (
                                <View style={styles.creatorToolbox}>
                                    <ActionButton icon="folder-open-outline" label="Module" color="#2196F3" onPress={() => handleAddContent(null, 'module')} />
                                    <ActionButton icon="help-circle-outline" label="Final Quiz" color="purple" onPress={() => handleAddContent(null, 'quiz')} />
                                </View>
                            )}
                        </View>
                        <Text style={styles.curriculumHeader}>Course Content</Text>
                    </>
                }
                data={course?.curriculum}
                renderItem={({ item }) => (
                    <CurriculumItem
                        data={item}
                        isMentor={course.isMentor}
                        isEnrolled={course.isEnrolled}
                        onAddContent={handleAddContent}
                        onNavigateLesson={handleNavigateLesson}
                        onDeleteContent={handleDeleteContent}
                    />
                )}
                keyExtractor={(item) => item._id}
            />
        </SafeAreaView>
    );
};

const ActionButton = ({ icon, label, onPress, color }) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
        <View style={[styles.iconCircle, { borderColor: color }]}><Ionicons name={icon} size={22} color={color} /></View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    thumbnail: { width: '100%', height: 220, backgroundColor: '#f0f0f0' },
    defaultThumbnail: { justifyContent: 'center', alignItems: 'center' },
    headerContainer: { padding: 20 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
    category: { fontSize: 14, color: 'tomato', fontWeight: '600', textTransform: 'uppercase', marginVertical: 8 },
    description: { fontSize: 16, lineHeight: 24, color: '#666', marginTop: 10 },
    creatorToolbox: { flexDirection: 'row', marginTop: 20, backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12 },
    actionBtn: { alignItems: 'center', marginRight: 20 },
    iconCircle: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    actionLabel: { fontSize: 11, fontWeight: 'bold' },
    curriculumHeader: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 10, color: '#333' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
    loadingText: { marginTop: 15, fontWeight: '600', color: 'purple' },
    buttonRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    enrollButton: { flex: 2, backgroundColor: 'tomato', borderRadius: 12, padding: 16, alignItems: 'center', marginRight: 10 },
    unenrollButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ff4444' },
    statsButton: { flex: 1, backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    statsButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
    enrollButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    unenrollText: { color: '#ff4444' },
});

export default CourseDetailScreen;