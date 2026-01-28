import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MINI_PLAYER_HEIGHT = 100;
const MINI_PLAYER_WIDTH = (MINI_PLAYER_HEIGHT * 16) / 9;

const VideoPlayerScreen = ({ route, navigation }) => {
    const { lessons, currentLessonIndex } = route.params;
    const [currentLesson, setCurrentLesson] = useState(lessons[currentLessonIndex]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const videoRef = useRef(null);

    // Sync video play/pause with minimize state
    useEffect(() => {
        if (videoRef.current) {
            if (isMinimized) {
                videoRef.current.pauseAsync();
            } else {
                videoRef.current.playAsync();
            }
        }
    }, [isMinimized]);

    // NEW: Function to notify backend that lesson is finished
    const markLessonComplete = async (lessonId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            // We use the course ID from the lesson object
            const courseId = currentLesson.course; 
            
            await axios.post(`${API_URL}/courses/${courseId}/complete-lesson`, 
                { lessonId }, 
                { headers: { 'x-auth-token': token } }
            );
            
            console.log("Lesson marked as complete:", lessonId);
        } catch (error) {
            console.error("Error marking lesson complete:", error);
        }
    };

    // NEW: Handle Video Status Updates
    const handlePlaybackStatusUpdate = (status) => {
        setIsBuffering(status.isBuffering);

        // Check if the video just finished
        if (status.didJustFinish && !status.isLooping) {
            markLessonComplete(currentLesson._id);
            
            // Optional: Auto-play next video if available
            const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
            if (currentIndex !== -1 && currentIndex + 1 < lessons.length) {
                Alert.alert(
                    "Lesson Complete!", 
                    "Moving to next video...",
                    [{ text: "OK", onPress: () => setCurrentLesson(lessons[currentIndex + 1]) }],
                    { cancelable: true }
                );
            } else {
                Alert.alert("Course Update", "You've finished this video segment!");
            }
        }
    };

    const renderLessonItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.lessonItem,
                item._id === currentLesson._id && styles.activeLessonItem,
            ]}
            onPress={() => {
                setCurrentLesson(item);
                setIsMinimized(false);
            }}
            accessibilityLabel={`Play lesson ${item.title}`}
        >
            <Ionicons 
                name={item._id === currentLesson._id ? "play-circle" : "videocam-outline"} 
                size={24} 
                color={item._id === currentLesson._id ? "#2196F3" : "gray"} 
            />
            <Text style={[
                styles.lessonTitle, 
                item._id === currentLesson._id && { color: '#2196F3', fontWeight: 'bold' }
            ]}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.playerContainer, isMinimized && styles.miniPlayer]}>
                <Video
                    ref={videoRef}
                    style={StyleSheet.absoluteFill}
                    source={{ uri: currentLesson.videoUrl }}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay
                    useNativeControls
                    onError={(error) => {
                        console.error('Video playback error:', error);
                    }}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate} // Updated listener
                />
                
                {isBuffering && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator color="#fff" size="large" />
                    </View>
                )}
                
                <TouchableOpacity
                    style={styles.minimizeButton}
                    onPress={() => setIsMinimized(!isMinimized)}
                >
                    <Ionicons
                        name={isMinimized ? 'expand' : 'chevron-down'}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.detailsBox}>
                <Text style={styles.nowPlayingLabel}>Now Playing</Text>
                <Text style={styles.currentTitle}>{currentLesson.title}</Text>
            </View>

            <FlatList
                data={lessons}
                renderItem={renderLessonItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={
                    <Text style={styles.playlistHeader}>Course Playlist</Text>
                }
                style={styles.playlistContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    playerContainer: { width: '100%', height: 250, backgroundColor: 'black' },
    loaderOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    miniPlayer: {
        position: 'absolute', bottom: 50, right: 10,
        height: MINI_PLAYER_HEIGHT, width: MINI_PLAYER_WIDTH,
        zIndex: 10, borderRadius: 8, overflow: 'hidden', elevation: 5,
    },
    minimizeButton: { position: 'absolute', top: 10, right: 10, padding: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    detailsBox: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    nowPlayingLabel: { fontSize: 12, color: '#2196F3', fontWeight: 'bold', textTransform: 'uppercase' },
    currentTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: '#333' },
    playlistContainer: { flex: 1 },
    playlistHeader: { fontSize: 16, fontWeight: 'bold', padding: 15, backgroundColor: '#f8f9fa', color: '#666' },
    lessonItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    lessonTitle: { fontSize: 15, marginLeft: 12, flex: 1, color: '#444' },
    activeLessonItem: { backgroundColor: '#e3f2fd' },
});

export default VideoPlayerScreen;