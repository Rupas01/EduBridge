import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TextInput, FlatList,
    TouchableOpacity, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

const SearchResults = ({ route, navigation }) => {
    const { query: initialQuery } = route.params;
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [results, setResults] = useState({ courses: [], people: [], posts: [], bits: [] });
    const [activeTab, setActiveTab] = useState('Courses');
    const [loading, setLoading] = useState(true);

    const performSearch = useCallback(async (query) => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`${API_URL}/search?q=${query}`, {
                headers: { 'x-auth-token': token }
            });
            setResults(res.data);
        } catch (e) {
            console.error("Search error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { performSearch(initialQuery); }, [initialQuery]);

    const renderResultItem = ({ item }) => {
        switch (activeTab) {
            case 'Courses':
                return (
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}>
                        <Image source={{ uri: item.thumbnailUrl }} style={styles.cardThumb} />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSub}>By {item.mentor?.username}</Text>
                        </View>
                    </TouchableOpacity>
                );
            case 'People':
                return (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('UserProfile', { userId: item._id })}
                    >
                        <Image source={{ uri: item.profilePictureUrl || 'https://via.placeholder.com/50' }} style={styles.avatar} />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{item.username}</Text>
                            <Text style={styles.cardSub}>{item.bio || 'EduBridge Member'}</Text>
                        </View>
                    </TouchableOpacity>
                );
            case 'Posts':
                return (
                    <View style={styles.card}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle} numberOfLines={2}>{item.content}</Text>
                            <Text style={styles.cardSub}>Post by @{item.user?.username}</Text>
                        </View>
                        {item.imageUrls?.length > 0 && <Image source={{ uri: item.imageUrls[0] }} style={styles.postMiniThumb} />}
                    </View>
                );
            case 'Bits':
                return (
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AllBits')}>
                        <Image source={{ uri: item.videoUrl?.replace(/\.(mp4|mov|avi)$/, '.jpg') }} style={styles.cardThumb} />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSub}>Video Bit</Text>
                        </View>
                    </TouchableOpacity>
                );
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.searchRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        onSubmitEditing={() => performSearch(searchQuery)}
                    />
                    <Ionicons name="search" size={20} color="#666" />
                </View>
            </View>

            <View style={styles.tabsWrapper}>
                {['Courses', 'People', 'Posts', 'Bits'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabPill, activeTab === tab && styles.activeTabPill]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? <ActivityIndicator style={{ marginTop: 50 }} color="#2196F3" /> : (
                <FlatList
                    data={results[activeTab.toLowerCase()]}
                    renderItem={renderResultItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 15 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No results found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchRow: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    backButton: { marginRight: 10 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', borderRadius: 10, paddingHorizontal: 12, height: 45 },
    searchInput: { flex: 1, fontSize: 16 },
    tabsWrapper: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tabPill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f2f5', marginRight: 8 },
    activeTabPill: { backgroundColor: '#2196F3' },
    tabText: { fontWeight: 'bold', color: '#666' },
    activeTabText: { color: '#fff' },
    card: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
    cardThumb: { width: 80, height: 50, borderRadius: 6 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    cardInfo: { flex: 1, marginLeft: 15 },
    cardTitle: { fontWeight: 'bold', color: '#333' },
    cardSub: { color: '#999', fontSize: 12, marginTop: 2 },
    postMiniThumb: { width: 50, height: 50, borderRadius: 4, marginLeft: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#ccc' }
});

export default SearchResults;