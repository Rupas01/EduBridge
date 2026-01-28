import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, Image, RefreshControl
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';

const MyLearningsScreen = ({ navigation }) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyLearnings = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${API_URL}/users/my-learnings`, {
                headers: { 'x-auth-token': token }
            });
            setEnrolledCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch learnings:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchMyLearnings();
        }, [fetchMyLearnings])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMyLearnings();
    }, [fetchMyLearnings]);

    const renderCourseItem = ({ item }) => {
        let optimizedUrl = item.thumbnailUrl;
        if (optimizedUrl) {
            const transformations = 'w_200,h_120,c_fill,q_auto';
            const urlParts = optimizedUrl.split('/upload/');
            if (urlParts.length === 2) {
                optimizedUrl = `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
            }
        }

        return (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
            >
                {optimizedUrl ? (
                    <Image source={{ uri: optimizedUrl }} style={styles.listThumbnail} />
                ) : (
                    <View style={[styles.listThumbnail, styles.defaultThumbnail]}>
                        <Ionicons name="image-outline" size={40} color="#ccc" />
                    </View>
                )}
                <View style={styles.listTextContainer}>
                    <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.listSubtitle}>by {item.mentor?.username}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
        <FlatList
            data={enrolledCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={<Text style={styles.header}>Your Enrolled Courses</Text>}
            ListEmptyComponent={<Text style={styles.emptyText}>You haven't enrolled in any courses yet.</Text>}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        />
    );
};

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 22, fontWeight: 'bold', padding: 15, backgroundColor: '#fff' },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    listThumbnail: { width: 100, height: 60, borderRadius: 5, marginRight: 15 },
    defaultThumbnail: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
    listTextContainer: { flex: 1 },
    listTitle: { fontSize: 16, fontWeight: 'bold' },
    listSubtitle: { fontSize: 14, color: 'gray', marginTop: 4 },
});

export default MyLearningsScreen;