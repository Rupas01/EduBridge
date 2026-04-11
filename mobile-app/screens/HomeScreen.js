import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, RefreshControl,
    Image, TouchableOpacity, Share, ActivityIndicator,
    Modal, TextInput, KeyboardAvoidingView, Platform, Keyboard, Alert, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import { jwtDecode } from "jwt-decode";
import io from 'socket.io-client';

const socket = io(API_URL.replace('/api', ''), {
    transports: ['websocket'],
    forceNew: true
});

const HomeScreen = ({ navigation }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [totalUnread, setTotalUnread] = useState(0);
    const lastTap = useRef(null);

    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                Alert.alert("Hold on!", "Are you sure you want to logout and exit?", [
                    { text: "Cancel", onPress: () => null, style: "cancel" },
                    { text: "Logout", onPress: handleLogout, style: "destructive" }
                ]);
                return true;
            };
            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => backHandler.remove();
        }, [navigation])
    );

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (e) { console.error("Logout error", e); }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`${API_URL}/messages/unread-total`, {
                headers: { 'x-auth-token': token }
            });
            setTotalUnread(res.data.total);
        } catch (e) { console.error("Unread fetch error:", e); }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUnreadCount();
        }, [])
    );

    useEffect(() => {
        const setupSocket = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                socket.emit('join_user_inbox', user.id);
            }
        };
        setupSocket();

        socket.on('refresh_badge', () => {
            // A tiny delay ensures the DB index has updated
            setTimeout(() => {
                fetchUnreadCount();
            }, 300);
        });

        return () => socket.off('refresh_badge');
    }, []);
    

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "",
            headerLeft: () => (
                <Text style={{ marginLeft: 15, fontSize: 20, fontWeight: '900', color: '#2196F3', letterSpacing: -0.5 }}>
                    EduBridge
                </Text>
            ),
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={() => navigation.navigate('Messenger')}
                >
                    <View>
                        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#4A5568" />
                        {totalUnread > 0 && (
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>
                                    {totalUnread > 9 ? '9+' : totalUnread}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            ),
            headerStyle: { backgroundColor: '#fff', elevation: 0, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
        });
    }, [navigation, totalUnread]);

    const fetchFeed = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded.user.id);
            }
            const res = await axios.get(`${API_URL}/posts/feed`, {
                headers: { 'x-auth-token': token }
            });
            setPosts(res.data);
        } catch (e) { console.error("Feed Error:", e); } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchFeed(); }, [fetchFeed]);

    const handleLike = async (postId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    const alreadyLiked = post.likes.includes(currentUserId);
                    const newLikes = alreadyLiked
                        ? post.likes.filter(id => id !== currentUserId)
                        : [...post.likes, currentUserId];
                    return { ...post, likes: newLikes };
                }
                return post;
            }));
            await axios.post(`${API_URL}/posts/like/${postId}`, {}, { headers: { 'x-auth-token': token } });
        } catch (e) { fetchFeed(); }
    };

    const handleDoubleTap = (postId) => {
        const now = Date.now();
        if (lastTap.current && (now - lastTap.current) < 300) { handleLike(postId); }
        else { lastTap.current = now; }
    };

    const openComments = async (postId) => {
        setSelectedPostId(postId);
        setCommentModalVisible(true);
        setIsCommentsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`${API_URL}/comments/${postId}`, { headers: { 'x-auth-token': token } });
            setComments(res.data);
        } catch (e) { console.error(e); } finally { setIsCommentsLoading(false); }
    };

    const submitComment = async () => {
        if (!newComment.trim()) return;
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.post(`${API_URL}/comments/${selectedPostId}`, { text: newComment }, { headers: { 'x-auth-token': token } });
            setComments([res.data, ...comments]);
            setNewComment('');
            setPosts(prev => prev.map(p => p._id === selectedPostId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
            Keyboard.dismiss();
        } catch (e) { alert("Comment failed."); }
    };

    const renderPost = ({ item }) => {
        const isLiked = item.likes?.includes(currentUserId);
        return (
            <View style={styles.postCard}>
                <View style={styles.postHeader}>
                    <View style={styles.userInfo}>
                        {item.user.profilePictureUrl ? (
                            <Image source={{ uri: item.user.profilePictureUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarFallback}><Ionicons name="person" size={18} color="#999" /></View>
                        )}
                        <View>
                            <Text style={styles.username}>{item.user.username}</Text>
                            <Text style={styles.time}>{formatDistanceToNow(new Date(item.createdAt))} • Edited</Text>
                        </View>
                    </View>
                    <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={20} color="#666" /></TouchableOpacity>
                </View>
                <View style={styles.textContainer}><Text style={styles.caption}>{item.content}</Text></View>
                {item.imageUrls?.length > 0 && (
                    <TouchableOpacity activeOpacity={0.9} onPress={() => handleDoubleTap(item._id)}>
                        <Image source={{ uri: item.imageUrls[0] }} style={styles.postImage} resizeMode="cover" />
                    </TouchableOpacity>
                )}
                <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                        <Ionicons name="thumbs-up" size={12} color="#2196F3" />
                        <Text style={styles.metricText}>{item.likes?.length || 0}</Text>
                    </View>
                    <TouchableOpacity onPress={() => openComments(item._id)}>
                        <Text style={styles.metricText}>{item.commentsCount || 0} comments</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.interactionBar}>
                    <TouchableOpacity style={styles.interactionBtn} onPress={() => handleLike(item._id)}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? "#FF3B30" : "#666"} />
                        <Text style={[styles.interactionText, isLiked && { color: "#FF3B30" }]}>Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.interactionBtn} onPress={() => openComments(item._id)}>
                        <Ionicons name="chatbubble-outline" size={20} color="#666" />
                        <Text style={styles.interactionText}>Comment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.interactionBtn} onPress={() => Share.share({ message: item.content })}>
                        <Ionicons name="paper-plane-outline" size={20} color="#666" />
                        <Text style={styles.interactionText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading && !refreshing) return <View style={styles.center}><ActivityIndicator size="large" color="#2196F3" /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item._id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFeed(); }} />}
                contentContainerStyle={[styles.listContainer, posts.length === 0 && { flex: 1, justifyContent: 'center' }]}
                ListEmptyComponent={<ActivityIndicator size="small" />}
                showsVerticalScrollIndicator={false}
            />
            <Modal animationType="slide" transparent={true} visible={commentModalVisible} onRequestClose={() => setCommentModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalCloseArea} activeOpacity={1} onPress={() => setCommentModalVisible(false)} />
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetBody}>
                        <View style={styles.sheetHeader}><View style={styles.dragHandle} /><Text style={styles.sheetTitle}>Comments</Text></View>
                        {isCommentsLoading ? <ActivityIndicator size="small" color="#2196F3" style={{ margin: 20 }} /> :
                            <FlatList data={comments} keyExtractor={item => item._id} renderItem={({ item }) => (
                                <View style={styles.commentItem}>
                                    <Text style={styles.commentUser}>@{item.user.username}</Text>
                                    <Text style={styles.commentText}>{item.text}</Text>
                                </View>
                            )} ListEmptyComponent={<Text style={styles.emptyText}>No comments yet.</Text>} />
                        }
                        <View style={styles.inputArea}>
                            <TextInput style={styles.input} placeholder="Add a comment..." value={newComment} onChangeText={setNewComment} />
                            <TouchableOpacity onPress={submitComment}><Text style={styles.sendBtn}>Post</Text></TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    listContainer: { paddingVertical: 8 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    badgeContainer: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF3B30', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
    postCard: { backgroundColor: '#fff', marginBottom: 8, elevation: 1 },
    postHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 8 },
    avatarFallback: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    username: { fontWeight: 'bold', fontSize: 14, color: 'rgba(0,0,0,0.9)' },
    time: { fontSize: 12, color: 'rgba(0,0,0,0.6)' },
    textContainer: { paddingHorizontal: 12, paddingBottom: 8 },
    caption: { fontSize: 14, color: 'rgba(0,0,0,0.9)', lineHeight: 20 },
    postImage: { width: '100%', height: 350, backgroundColor: '#F3F2EF' },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F2EF' },
    metricItem: { flexDirection: 'row', alignItems: 'center' },
    metricText: { fontSize: 12, color: 'rgba(0,0,0,0.6)', marginLeft: 4 },
    interactionBar: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 8 },
    interactionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 4 },
    interactionText: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.6)' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalCloseArea: { flex: 1 },
    sheetBody: { height: '75%', backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    sheetHeader: { alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    dragHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, marginBottom: 5 },
    sheetTitle: { fontWeight: 'bold', fontSize: 15 },
    commentItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
    commentUser: { fontWeight: 'bold', fontSize: 12, marginBottom: 2 },
    commentText: { fontSize: 14, color: '#333' },
    inputArea: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', backgroundColor: '#fff', paddingBottom: Platform.OS === 'ios' ? 30 : 12 },
    input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
    sendBtn: { color: '#2196F3', fontWeight: 'bold' },
});

export default HomeScreen;