import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ActivityIndicator, ScrollView, RefreshControl, Alert, FlatList, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ route, navigation }) => {
    const userId = route.params?.userId;
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('courses');

    // DYNAMIC HEADER LOGIC
    useLayoutEffect(() => {
        const isSelf = profileData?.isSelf;

        navigation.setOptions({
            headerShown: true,
            headerTitle: profileData?.user?.username || "Profile",
            headerTitleAlign: 'left',
            headerLeft: userId ? () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
            ) : undefined,
            headerRight: () => (
                isSelf ? (
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 15 }}>
                        <Ionicons name="settings-outline" size={24} color="#333" />
                    </TouchableOpacity>
                ) : null
            ),
            headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#eee' },
        });
    }, [navigation, profileData, userId]);

    const handleStartChat = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            // Call the backend to get or create a conversation ID
            const res = await axios.post(
                `${API_URL}/messages/start`,
                { recipientId: profileData.user._id },
                { headers: { 'x-auth-token': token } }
            );

            // Navigate to ChatScreen with the returned ID and user info
            navigation.navigate('Chat', {
                conversationId: res.data._id,
                name: `${profileData.user.firstName} ${profileData.user.lastName}`,
                otherUserId: profileData.user._id
            });
        } catch (error) {
            console.error("Start chat error:", error);
            Alert.alert("Error", "Could not open conversation at this time.");
        }
    };

    // RESTORED: Handle Post Deletion
    const handleDeletePost = (postId) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            await axios.delete(`${API_URL}/posts/${postId}`, {
                                headers: { 'x-auth-token': token }
                            });
                            // Update local state immediately
                            setUserPosts(prev => prev.filter(post => post._id !== postId));
                        } catch (error) {
                            Alert.alert("Error", "Could not delete post.");
                        }
                    }
                }
            ]
        );
    };

    const fetchProfileData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const targetId = userId || 'me';
            const url = `${API_URL}/profile/${targetId}`;

            const response = await axios.get(url, { headers: { 'x-auth-token': token } });
            setProfileData(response.data);
            setIsFollowing(response.data.isFollowing);

            if (activeTab === 'activity') {
                const postsRes = await axios.get(`${API_URL}/posts/user/${response.data.user._id}`, {
                    headers: { 'x-auth-token': token }
                });
                setUserPosts(postsRes.data);
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, activeTab]);

    useFocusEffect(useCallback(() => {
        fetchProfileData();
    }, [fetchProfileData]));

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProfileData();
        setRefreshing(false);
    }, [fetchProfileData]);

    const handleFollowToggle = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const originalState = isFollowing;
            setIsFollowing(!isFollowing);

            if (originalState) {
                await axios.delete(`${API_URL}/users/${profileData.user._id}/unfollow`, { headers: { 'x-auth-token': token } });
            } else {
                await axios.post(`${API_URL}/users/${profileData.user._id}/follow`, {}, { headers: { 'x-auth-token': token } });
            }
        } catch (error) {
            setIsFollowing(!isFollowing);
            Alert.alert("Error", "Follow action failed.");
        }
    };

    // --- RENDERERS ---
    const renderCourseItem = ({ item }) => (
        <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}>
            <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/150' }} style={styles.listThumbnail} />
            <View style={styles.listTextContainer}>
                <Text style={styles.listTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.listSub}>{item.category}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderBitItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate('ProfileBitsPlayer', { bits: profileData.bits, initialScrollIndex: index })}
        >
            <Image source={{ uri: item.videoUrl?.replace(/\.(mp4|mov|avi)$/, '.jpg') }} style={styles.gridImage} />
            <Ionicons name="play" size={20} color="white" style={styles.playIcon} />
        </TouchableOpacity>
    );

    // RESTORED: renderActivityItem with Delete Option
    const renderActivityItem = ({ item }) => (
        <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
                <Text style={styles.activityTime}>{formatDistanceToNow(new Date(item.createdAt))} ago</Text>
                {profileData?.isSelf && (
                    <TouchableOpacity onPress={() => handleDeletePost(item._id)}>
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.activityContent}>{item.content}</Text>
            {item.imageUrls?.length > 0 && (
                <Image source={{ uri: item.imageUrls[0] }} style={styles.activityImage} resizeMode="cover" />
            )}
        </View>
    );

    const renderProfileHeader = () => (
        <View style={{ backgroundColor: '#fff' }}>
            <View style={styles.profileInfoSection}>
                <View style={styles.pfpWrapper}>
                    {profileData.user.profilePictureUrl ? (
                        <Image
                            source={{ uri: profileData.user.profilePictureUrl }}
                            style={styles.profilePicture}
                        />
                    ) : (
                        <View style={styles.defaultPfp}>
                            <Ionicons name="person" size={50} color="#B0B3B8" />
                        </View>
                    )}
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statCol}><Text style={styles.statNum}>{profileData.teachingsCount}</Text><Text style={styles.statLab}>Teachings</Text></View>
                    <View style={styles.statCol}><Text style={styles.statNum}>{profileData.pupilsCount}</Text><Text style={styles.statLab}>Pupils</Text></View>
                    <View style={styles.statCol}><Text style={styles.statNum}>{profileData.mentorsCount}</Text><Text style={styles.statLab}>Mentors</Text></View>
                </View>
            </View>

            {profileData.isSelf ? (
                <View style={styles.creatorToolbox}>
                    <ToolButton icon="add-circle" label="Post" color="#4CAF50" onPress={() => navigation.navigate('CreatePost')} />
                    <ToolButton icon="school" label="Course" color="#2196F3" onPress={() => navigation.navigate('CreateCourse')} />
                    <ToolButton icon="flash" label="Bit" color="#FF9800" onPress={() => navigation.navigate('AddBit')} />
                </View>
            ) : (
                // Inside renderProfileHeader -> visitorActions
                <View style={styles.visitorActions}>
                    <TouchableOpacity
                        style={[styles.socialBtn, isFollowing ? styles.btnInactive : styles.btnActive]}
                        onPress={handleFollowToggle}
                    >
                        <Text style={[styles.btnText, !isFollowing && { color: '#fff' }]}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>

                    {/* UPDATED BUTTON HERE */}
                    <TouchableOpacity
                        style={styles.socialBtn}
                        onPress={handleStartChat}
                    >
                        <Text style={styles.btnText}>Message</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.tabSwitcher}>
                <TabIcon name="grid" active={activeTab === 'courses'} onPress={() => setActiveTab('courses')} />
                <TabIcon name="videocam" active={activeTab === 'bits'} onPress={() => setActiveTab('bits')} />
                <TabIcon name="list" active={activeTab === 'activity'} onPress={() => setActiveTab('activity')} />
            </View>
        </View>
    );

    const ToolButton = ({ icon, label, onPress, color }) => (
        <TouchableOpacity style={styles.toolItem} onPress={onPress}>
            <View style={[styles.toolCircle, { backgroundColor: color }]}><Ionicons name={icon} size={24} color="white" /></View>
            <Text style={styles.toolLabel}>{label}</Text>
        </TouchableOpacity>
    );

    const TabIcon = ({ name, active, onPress }) => (
        <TouchableOpacity onPress={onPress} style={styles.tabItem}>
            <Ionicons name={name} size={26} color={active ? '#333' : '#ccc'} />
            {active && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
    );

    if (isLoading) return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#2196F3" /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <FlatList
                data={activeTab === 'courses' ? profileData.courses : activeTab === 'bits' ? profileData.bits : userPosts}
                renderItem={activeTab === 'courses' ? renderCourseItem : activeTab === 'bits' ? renderBitItem : renderActivityItem}
                keyExtractor={(item) => item._id}
                numColumns={activeTab === 'bits' ? 3 : 1}
                key={activeTab}
                ListHeaderComponent={renderProfileHeader}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>Nothing to show here yet.</Text>}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    profileInfoSection: { flexDirection: 'row', padding: 20, alignItems: 'center' },
    pfpWrapper: { marginRight: 25 },
    profilePicture: { width: 90, height: 90, borderRadius: 45 },
    statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
    statCol: { alignItems: 'center' },
    statNum: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    statLab: { fontSize: 12, color: '#999', marginTop: 2 },
    creatorToolbox: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    toolItem: { alignItems: 'center', width: width / 3.5 },
    toolCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 6, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
    toolLabel: { fontSize: 12, fontWeight: 'bold', color: '#666' },
    visitorActions: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
    socialBtn: { flex: 1, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
    btnActive: { backgroundColor: '#2196F3' },
    btnInactive: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
    btnText: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    tabSwitcher: { flexDirection: 'row', height: 50, borderTopWidth: 1, borderTopColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabIndicator: { position: 'absolute', bottom: 0, height: 2, width: '100%', backgroundColor: '#333' },
    listItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f8f8f8', alignItems: 'center' },
    listThumbnail: { width: 80, height: 50, borderRadius: 6, marginRight: 15 },
    listTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    listSub: { fontSize: 12, color: '#999', marginTop: 4 },
    listTextContainer: { flex: 1 },
    gridItem: { width: width / 3, height: (width / 3) * 1.5, padding: 1 },
    gridImage: { width: '100%', height: '100%', backgroundColor: '#eee' },
    playIcon: { position: 'absolute', bottom: 8, right: 8 },
    activityCard: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }, // Added spacing
    activityTime: { fontSize: 12, color: '#aaa' },
    activityContent: { fontSize: 15, color: '#333', lineHeight: 22 },
    activityImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 10, backgroundColor: '#f0f0f0' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#ccc', fontSize: 14 },
    defaultPfp: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F0F2F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E6EB',
    },
});

export default ProfileScreen;