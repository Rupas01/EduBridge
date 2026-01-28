import React, { useState, useCallback, useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ActivityIndicator, ScrollView, RefreshControl, Alert, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ProfileScreen = ({ route, navigation }) => {
    const userId = route.params?.userId;
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('courses');

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('Settings')}
                    style={{ marginRight: 15 }}
                >
                    <Ionicons name="settings-outline" size={24} color="black" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const fetchProfileData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const url = userId ? `${API_URL}/profile/${userId}` : `${API_URL}/profile/me`;
            
            const response = await axios.get(url, { headers: { 'x-auth-token': token } });
            
            setProfileData(response.data);
            setIsFollowing(response.data.isFollowing);
            navigation.setOptions({ title: response.data.user.username });
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
            Alert.alert("Error", "Could not load profile data.");
        } finally {
            setIsLoading(false);
        }
    }, [userId, navigation]);

    useFocusEffect(useCallback(() => { setIsLoading(true); fetchProfileData(); }, [fetchProfileData]));
    
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProfileData();
        setRefreshing(false);
    }, [fetchProfileData]);
    
    const handleFollowToggle = async () => {
        if (!profileData?.user?._id) {
            Alert.alert("User data missing.");
            return;
        }

        const userIdToToggle = profileData.user._id;
        const usernameToToggle = profileData.user.username;

        const performAction = async (action) => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    Alert.alert("Authentication error. Please log in again.");
                    return;
                }

                const url = `${API_URL}/users/${userIdToToggle}/${action}`;
                const config = { headers: { 'x-auth-token': token } };

                // Optimistically update UI
                setIsFollowing(action === 'follow');
                setProfileData(prev => ({
                    ...prev,
                    pupilsCount: action === 'follow' ? prev.pupilsCount + 1 : Math.max(prev.pupilsCount - 1, 0)
                }));

                if (action === 'unfollow') {
                    await axios.delete(url, config);
                } else {
                    await axios.post(url, {}, config);
                }

            } catch (error) {
                // Roll back UI on error
                setIsFollowing(action !== 'follow');
                setProfileData(prev => ({
                    ...prev,
                    pupilsCount: action === 'follow' ? Math.max(prev.pupilsCount - 1, 0) : prev.pupilsCount + 1
                }));
                alert("Action failed. Please try again.");
                console.error("Follow/Unfollow error:", error.response?.data || error.message);
            }
        };

        if (isFollowing) {
            Alert.alert(
                `Unfollow @${usernameToToggle}?`,
                "You can always follow them again later.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Unfollow", style: "destructive", onPress: () => performAction('unfollow') }
                ]
            );
        } else {
            performAction('follow');
        }
    };

    const renderCourseItem = ({ item }) => {
        let optimizedUrl = item.thumbnailUrl;
        if (optimizedUrl) {
            const parts = optimizedUrl.split('/upload/');
            if (parts.length === 2) optimizedUrl = `${parts[0]}/upload/w_200,h_120,c_fill,q_auto/${parts[1]}`;
        }
        return (
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}>
                {optimizedUrl ? <Image source={{ uri: optimizedUrl }} style={styles.listThumbnail} /> : <View style={[styles.listThumbnail, styles.defaultThumbnail]}><Ionicons name="image-outline" size={40} color="#ccc" /></View>}
                <View style={styles.listTextContainer}><Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text></View>
            </TouchableOpacity>
        );
    };

    const renderBitItem = ({ item, index }) => {
        const thumbnailUrl = item.videoUrl?.replace(/\.(mp4|mov|avi)$/, '.jpg');
        return (
            <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('ProfileBitsPlayer', { bits: profileData.bits, initialScrollIndex: index })}>
                {thumbnailUrl ? <Image source={{ uri: thumbnailUrl }} style={styles.gridImage} /> : <View style={[styles.gridImage, styles.defaultThumbnail]}><Ionicons name="videocam-outline" size={40} color="#ccc" /></View>}
                <Ionicons name="play" size={24} color="white" style={styles.playIcon} />
            </TouchableOpacity>
        );
    };

    const renderProfileHeader = () => (
        <>
            <View style={styles.profileSection}>
                <View style={styles.pfpContainer}>
                    <Text style={styles.usernameText}>{profileData.user.username}</Text>
                    {profileData.user.profilePictureUrl ? <Image source={{ uri: profileData.user.profilePictureUrl }} style={styles.profilePicture} /> : <View style={styles.defaultPfp}><Ionicons name="person-circle" size={100} color="#ccc" /></View>}
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.stat}><Text style={styles.statNumber}>{profileData.teachingsCount}</Text><Text style={styles.statLabel}>Teachings</Text></View>
                    <View style={styles.stat}><Text style={styles.statNumber}>{profileData.pupilsCount}</Text><Text style={styles.statLabel}>Pupils</Text></View>
                    <View style={styles.stat}><Text style={styles.statNumber}>{profileData.mentorsCount}</Text><Text style={styles.statLabel}>Mentors</Text></View>
                </View>
            </View>
            <View style={styles.buttonSection}>
                {profileData.isSelf ? (
                    <>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CreateCourse')}><Text style={styles.actionButtonText}>Create a Course</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AddBit')}><Text style={styles.actionButtonText}>Add a Bit</Text></TouchableOpacity>
                    </>
                ) : (
                    isFollowing ? (
                        <>
                            <TouchableOpacity style={[styles.actionButton, styles.followButtonInactive]} onPress={handleFollowToggle}><Text style={styles.actionButtonText}>Following</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => alert('Navigate to chat screen')}><Text style={styles.actionButtonText}>Message</Text></TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity style={[styles.actionButton, styles.followButtonActive]} onPress={handleFollowToggle}><Text style={[styles.actionButtonText, styles.followButtonTextActive]}>Follow</Text></TouchableOpacity>
                    )
                )}
            </View>
            <View style={styles.switcherSection}>
                <TouchableOpacity onPress={() => setActiveTab('courses')} style={styles.switchButton}>
                    <Ionicons name="grid" size={28} color={activeTab === 'courses' ? '#333' : '#ccc'} />
                    {activeTab === 'courses' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('bits')} style={styles.switchButton}>
                    <Ionicons name="videocam" size={28} color={activeTab === 'bits' ? '#333' : '#ccc'} />
                    {activeTab === 'bits' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
            </View>
        </>
    );

    const renderContent = () => (
        activeTab === 'courses' ? (
            <FlatList
                key='courses-list'
                data={profileData.courses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderProfileHeader}
                ListFooterComponent={profileData.courses?.length === 0 ? <Text style={styles.contentPlaceholder}>No courses created yet.</Text> : null}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 50 }}
            />
        ) : (
            <FlatList
                key='bits-grid'
                data={profileData.bits}
                renderItem={renderBitItem}
                keyExtractor={(item) => item._id}
                numColumns={3}
                ListHeaderComponent={renderProfileHeader}
                ListFooterComponent={profileData.bits?.length === 0 ? <Text style={styles.contentPlaceholder}>No Bits created yet.</Text> : null}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 50 }}
            />
        )
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 100, height: 100, borderRadius: 50, marginRight: 20 }} />
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
                            <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 60, height: 40 }} />
                            <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 60, height: 40 }} />
                            <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 60, height: 40 }} />
                        </View>
                    </View>
                    <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '100%', height: 40, marginTop: 20 }} />
                </View>
            </SafeAreaView>
        );
    }

    if (!profileData) {
        return (
            <ScrollView contentContainerStyle={styles.loader} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}><Text>Could not load profile. Pull down to refresh.</Text></ScrollView>
        );
    }
    
    return (
        <SafeAreaView style={styles.container}>
            {renderContent()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loaderContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    profileSection: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingLeft: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    pfpContainer: { alignItems: 'center', marginRight: 20 },
    usernameText: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
    profilePicture: { width: 100, height: 100, borderRadius: 50 },
    defaultPfp: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
    statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
    stat: { alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 14, color: '#777' },
    buttonSection: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, paddingHorizontal: 20, gap: 10 },
    actionButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, alignItems: 'center' },
    actionButtonText: { fontWeight: '600', fontSize: 14, textAlign: 'center' },
    followButtonActive: { backgroundColor: 'tomato', borderWidth: 0 },
    followButtonTextActive: { color: 'white' },
    followButtonInactive: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
    switcherSection: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#eee' },
    switchButton: { flex: 1, alignItems: 'center', paddingVertical: 12 },
    activeIndicator: { height: 2, backgroundColor: '#333', width: '100%', position: 'absolute', bottom: 0 },
    contentPlaceholder: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#aaa' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    listThumbnail: { width: 100, height: 60, borderRadius: 5, marginRight: 15 },
    defaultThumbnail: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
    listTextContainer: { flex: 1 },
    listTitle: { fontSize: 16, fontWeight: 'bold' },
    gridItem: { flex: 1 / 3, aspectRatio: 9 / 16, padding: 1, justifyContent: 'center', alignItems: 'center' },
    gridImage: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },
    playIcon: { position: 'absolute', opacity: 0.7, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});

export default ProfileScreen;