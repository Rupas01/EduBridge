import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, FlatList,
    TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { API_URL } from '../config';

const ExploreScreen = ({ navigation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('people');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('Search for creators, courses, and more!');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = async (currentFilter = filterType) => {
        if (!searchTerm.trim()) {
            setResults([]);
            setMessage('Please enter a search term.');
            return;
        }
        setIsLoading(true);
        setMessage('');
        setShowFilters(true);
        try {
            const response = await axios.get(`${API_URL}/search`, {
                params: { term: searchTerm, type: currentFilter }
            });
            setResults(response.data);
            if (response.data.length === 0) {
                setMessage('No results found.');
            }
        } catch (error) {
            console.error("Search failed:", error);
            setMessage('Failed to perform search.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilterType(newFilter);
        if (searchTerm.trim()) {
            handleSearch(newFilter);
        }
    };
    
    const renderItem = ({ item, index }) => {
        switch (filterType) {
            case 'people':
                return (
                    <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item._id })}>
                        <View style={styles.resultItem}>
                            <Ionicons name="person-circle-outline" size={40} color="#555" />
                            <View style={styles.resultTextContainer}>
                                <Text style={styles.resultText}>{item.firstName} {item.lastName}</Text>
                                <Text style={styles.resultSubText}>@{item.username}</Text>
                            </View>
                            {/* The follow button has been removed from here */}
                        </View>
                    </TouchableOpacity>
                );
            case 'courses':
                return (
                    <TouchableOpacity onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}>
                        <View style={styles.resultItem}>
                            <Ionicons name="play-circle-outline" size={40} color="#555" />
                            <View style={styles.resultTextContainer}>
                                <Text style={styles.resultText}>{item.title}</Text>
                                <Text style={styles.resultSubText}>by {item.mentor?.firstName} {item.mentor?.lastName}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            case 'bits':
                return (
                    <TouchableOpacity onPress={() => navigation.navigate('Bits', { bits: results, initialScrollIndex: index })}>
                        <View style={styles.resultItem}>
                            <Ionicons name="videocam-outline" size={40} color="#555" />
                            <View style={styles.resultTextContainer}>
                                <Text style={styles.resultText}>{item.title}</Text>
                                <Text style={styles.resultSubText}>by {item.creator?.firstName} {item.creator?.lastName}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onSubmitEditing={() => handleSearch()}
                    returnKeyType="search"
                />
            </View>

            {showFilters && (
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filterType === 'people' && styles.activeFilter]}
                        onPress={() => handleFilterChange('people')}
                    >
                        <Text style={[styles.filterText, filterType === 'people' && styles.activeFilterText]}>People</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filterType === 'courses' && styles.activeFilter]}
                        onPress={() => handleFilterChange('courses')}
                    >
                        <Text style={[styles.filterText, filterType === 'courses' && styles.activeFilterText]}>Courses</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filterType === 'bits' && styles.activeFilter]}
                        onPress={() => handleFilterChange('bits')}
                    >
                        <Text style={[styles.filterText, filterType === 'bits' && styles.activeFilterText]}>Bits</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <ActivityIndicator size="large" color="tomato" style={{ marginTop: 50 }}/>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={() => <Text style={styles.messageText}>{message}</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 45, fontSize: 16 },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#e9e9e9' },
    activeFilter: { backgroundColor: 'tomato' },
    filterText: { fontWeight: '600', color: '#555' },
    activeFilterText: { color: '#fff' },
    messageText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultTextContainer: { flex: 1, marginLeft: 15 },
    resultText: { fontSize: 16, fontWeight: '600' },
    resultSubText: { fontSize: 14, color: '#888' },
});

export default ExploreScreen;