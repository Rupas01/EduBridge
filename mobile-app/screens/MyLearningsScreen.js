import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View, Text, StyleSheet, FlatList, Image, 
    TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const MyLearningsScreen = ({ navigation }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Ongoing'); // Ongoing, Completed

    // 1. Simplified fetch logic (Removed savedRes)
    const fetchData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`${API_URL}/courses/enrolled`, { 
                headers: { 'x-auth-token': token } 
            });
            setCourses(res.data);
        } catch (e) {
            console.error("Fetch Learning Error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // 2. Updated Categorization (Removed Saved filter)
    const displayCourses = useMemo(() => {
        if (activeFilter === 'Ongoing') {
            return courses.filter(c => (c.progressPercentage || 0) < 100);
        } else if (activeFilter === 'Completed') {
            return courses.filter(c => (c.progressPercentage || 0) === 100);
        }
        return [];
    }, [activeFilter, courses]);

    const renderHeader = () => (
        <View style={styles.headerArea}>
            <Text style={styles.title}>My Learning</Text>
            
            <View style={styles.filterRow}>
                {['Ongoing', 'Completed'].map((tab) => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.filterPill, activeFilter === tab && styles.activePill]}
                        onPress={() => setActiveFilter(tab)}
                    >
                        <Text style={[styles.pillText, activeFilter === tab && styles.activePillText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderCourseCard = ({ item }) => {
        const progress = item.progressPercentage || 0;

        return (
            <TouchableOpacity 
                style={styles.courseCard}
                onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
            >
                <Image 
                    source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/150' }} 
                    style={styles.thumbnail} 
                />
                <View style={styles.cardInfo}>
                    <View>
                        <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.instructor}>By {item.mentor?.username || 'Mentor'}</Text>
                    </View>
                    
                    <View style={styles.progressSection}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progress}%` }]} /> 
                        </View>
                        <Text style={styles.progressText}>{progress}% complete</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#999" style={styles.arrow} />
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                data={displayCourses}
                renderItem={renderCourseCard}
                keyExtractor={item => item._id}
                ListHeaderComponent={renderHeader}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 30 }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyTitle}>Ready to grow?</Text>
                        <Text style={styles.emptySub}>
                            Jump back into Explore to find your next skill.
                        </Text>
                        <TouchableOpacity 
                            style={styles.exploreBtn}
                            onPress={() => navigation.navigate('Explore')}
                        >
                            <Text style={styles.exploreBtnText}>Explore Courses</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerArea: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1C1E21', marginBottom: 15 },
    filterRow: { flexDirection: 'row', gap: 10 },
    filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F2F5' },
    activePill: { backgroundColor: '#2196F3' },
    pillText: { fontSize: 14, fontWeight: '600', color: '#666' },
    activePillText: { color: '#fff' },
    courseCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 15, marginTop: 12, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    thumbnail: { width: 65, height: 65, borderRadius: 8, backgroundColor: '#eee' },
    cardInfo: { flex: 1, marginLeft: 15, height: 65, justifyContent: 'space-between' },
    courseTitle: { fontSize: 15, fontWeight: 'bold', color: '#1C1E21' },
    instructor: { fontSize: 12, color: '#666' },
    progressSection: { width: '100%' },
    progressBarBg: { height: 6, width: '100%', backgroundColor: '#E3F2FD', borderRadius: 3, marginBottom: 4 },
    progressBarFill: { height: 6, backgroundColor: '#2196F3', borderRadius: 3 },
    progressText: { fontSize: 11, color: '#666', fontWeight: 'bold' },
    arrow: { marginLeft: 10 },
    emptyState: { alignItems: 'center', marginTop: 60, padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, color: '#333' },
    emptySub: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 22, marginBottom: 25 },
    exploreBtn: { backgroundColor: '#2196F3', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default MyLearningsScreen;