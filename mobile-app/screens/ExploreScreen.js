import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TextInput, FlatList, 
    TouchableOpacity, Image, ScrollView, ActivityIndicator,
    RefreshControl // Added for swipe to refresh
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const ExploreScreen = ({ navigation }) => {
    const [search, setSearch] = useState('');
    const [trendingBits, setTrendingBits] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]); // New State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // New state for RefreshControl

    const fetchDiscoveryData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            // Fetching both Bits and Recommended Courses simultaneously
            const [bitsRes, coursesRes] = await Promise.all([
                axios.get(`${API_URL}/bits/trending`, { headers: { 'x-auth-token': token } }),
                axios.get(`${API_URL}/courses`, { headers: { 'x-auth-token': token } }) // Fetching all/featured courses
            ]);
            
            setTrendingBits(bitsRes.data);
            setRecommendedCourses(coursesRes.data.slice(0, 6)); // Show first 6 as recommendations
        } catch (e) {
            console.error("Explore Fetch Error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Function specifically for handling the pull-to-refresh action
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDiscoveryData();
        setRefreshing(false);
    }, [fetchDiscoveryData]);

    useEffect(() => { fetchDiscoveryData(); }, [fetchDiscoveryData]);

    const handleSearch = () => {
        if (!search.trim()) return;
        navigation.navigate('SearchResults', { query: search });
    };

    const categories = [
        { id: 'c1', name: 'Programming', icon: 'code-slash', color: '#E3F2FD' },
        { id: 'c2', name: 'Design', icon: 'color-palette', color: '#F3E5F5' },
        { id: 'c3', name: 'Business', icon: 'briefcase', color: '#E8F5E9' },
        { id: 'c4', name: 'Marketing', icon: 'megaphone', color: '#FFF3E0' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* SEARCH BAR */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search courses, mentors, or skills..."
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={["#2196F3"]} // Android loader color
                        tintColor="#2196F3" // iOS loader color
                    />
                }
            >
                {/* 1. TRENDING BITS */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Trending Quick Insights</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AllBits')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {loading ? <ActivityIndicator color="#2196F3" /> : (
                    <FlatList
                        horizontal
                        data={trendingBits}
                        keyExtractor={item => item._id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 15 }}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity 
                                style={styles.bitCard}
                                onPress={() => navigation.navigate('ProfileBitsPlayer', { bits: trendingBits, initialScrollIndex: index })}
                            >
                                <Image source={{ uri: item.videoUrl?.replace(/\.(mp4|mov|avi)$/, '.jpg') }} style={styles.bitThumb} />
                                <View style={styles.bitOverlay}><Ionicons name="play" size={20} color="white" /></View>
                                <Text style={styles.bitTitle} numberOfLines={1}>{item.title || "Video Bit"}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}

                {/* 2. RECOMMENDED COURSES (Restored Section) */}
                <View style={[styles.sectionHeader, { marginTop: 25 }]}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SearchResults', { query: '' })}>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    horizontal
                    data={recommendedCourses}
                    keyExtractor={item => item._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 15 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.courseCard}
                            onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
                        >
                            <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/150' }} style={styles.courseThumb} />
                            <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.courseInstructor}>By {item.mentor?.username || 'Expert'}</Text>
                        </TouchableOpacity>
                    )}
                />

                {/* 3. CATEGORY GRID */}
                <Text style={[styles.sectionTitle, { marginLeft: 15, marginTop: 25, marginBottom: 15 }]}>Browse Categories</Text>
                <View style={styles.categoryGrid}>
                    {categories.map(cat => (
                        <TouchableOpacity 
                            key={cat.id} 
                            style={[styles.catBox, { backgroundColor: cat.color }]}
                            onPress={() => navigation.navigate('SearchResults', { query: cat.name })}
                        >
                            <Ionicons name={cat.icon} size={28} color="#333" />
                            <Text style={styles.catName}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 40 }} /> 
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        margin: 15,
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 45, fontSize: 15 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1c1e21' },
    seeAll: { color: '#2196F3', fontWeight: 'bold' },
    
    // Bits Styles
    bitCard: { width: 120, marginRight: 12 },
    bitThumb: { width: 120, height: 180, borderRadius: 12, backgroundColor: '#eee' },
    bitOverlay: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 4 },
    bitTitle: { marginTop: 6, fontSize: 13, fontWeight: '600', textAlign: 'center' },

    // Course Recommendation Styles
    courseCard: { width: 200, marginRight: 15 },
    courseThumb: { width: 200, height: 110, borderRadius: 10, backgroundColor: '#f9f9f9' },
    courseTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 8, color: '#333' },
    courseInstructor: { fontSize: 12, color: '#666', marginTop: 2 },

    // Category Styles
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, justifyContent: 'space-between' },
    catBox: { width: '47%', height: 100, borderRadius: 12, padding: 15, marginBottom: 15, justifyContent: 'center', alignItems: 'center' },
    catName: { marginTop: 8, fontWeight: 'bold', color: '#333' }
});

export default ExploreScreen;