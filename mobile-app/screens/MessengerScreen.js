import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    Image, ActivityIndicator, TextInput, RefreshControl, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import io from 'socket.io-client';

const socket = io(API_URL.replace('/api', ''), {
    transports: ['websocket'],
    forceNew: true
});

const MessengerScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: "Messages",
            headerTitleStyle: { fontWeight: '800', fontSize: 22, color: '#1E293B' },
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#fff' },
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity style={{ marginRight: 15 }}>
                    <Ionicons name="create-outline" size={24} color="#6366F1" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const fetchConversations = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`${API_URL}/messages/conversations`, {
                headers: { 'x-auth-token': token }
            });
            setConversations(res.data);
            setFilteredConversations(res.data);
        } catch (error) { console.error(error); } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchConversations(); }, [fetchConversations]));

    useEffect(() => {
        const setupSocket = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                socket.emit('join_user_inbox', user.id);
            }
        };
        setupSocket();

        socket.on('update_inbox', (newMessage) => {
            setConversations((prev) => {
                const index = prev.findIndex(c => c._id === newMessage.conversationId);
                let updatedList = [...prev];
                if (index !== -1) {
                    const conv = updatedList[index];
                    updatedList[index] = { ...conv, lastMessage: newMessage.text, updatedAt: newMessage.createdAt, unreadCount: (conv.unreadCount || 0) + 1 };
                    const item = updatedList.splice(index, 1)[0];
                    updatedList = [item, ...updatedList];
                } else { fetchConversations(); }
                setFilteredConversations(updatedList);
                return updatedList;
            });
        });
        return () => socket.off('update_inbox');
    }, [fetchConversations]);

    const handleSearch = (text) => {
        setSearchQuery(text);
        const filtered = conversations.filter(conv => {
            const partner = conv.participants[0];
            return `${partner.firstName} ${partner.lastName}`.toLowerCase().includes(text.toLowerCase());
        });
        setFilteredConversations(filtered);
    };

    const handleDeleteConversation = (convId) => {
        Alert.alert(
            "Delete Chat",
            "Are you sure? This will delete the entire chat history.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            await axios.delete(`${API_URL}/messages/conversation/${convId}`, {
                                headers: { 'x-auth-token': token }
                            });
                            setConversations(prev => prev.filter(c => c._id !== convId));
                            setFilteredConversations(prev => prev.filter(c => c._id !== convId));
                        } catch (error) { Alert.alert("Error", "Could not delete chat."); }
                    }
                }
            ]
        );
    };

    const renderChatListItem = ({ item }) => {
        const otherUser = item.participants[0];
        const hasUnread = item.unreadCount > 0;
        const timeAgo = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: false });

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onLongPress={() => handleDeleteConversation(item._id)}
                delayLongPress={600}
                style={styles.chatCard}
                onPress={() => navigation.navigate('Chat', {
                    conversationId: item._id,
                    name: `${otherUser.firstName} ${otherUser.lastName}`,
                    otherUserId: otherUser._id
                })}
            >
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: otherUser.profilePictureUrl || 'https://via.placeholder.com/100' }} style={styles.avatar} />
                    {otherUser.isOnline && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.userName}>{otherUser.firstName} {otherUser.lastName}</Text>
                        <Text style={[styles.timeText, hasUnread && styles.unreadTime]}>{timeAgo}</Text>
                    </View>
                    <View style={styles.messageRow}>
                        <Text style={[styles.lastMessage, hasUnread && styles.unreadTextBold]} numberOfLines={1}>
                            {item.lastMessage || "Start a conversation..."}
                        </Text>
                        {hasUnread && (
                            <View style={styles.unreadBadge}><Text style={styles.unreadCountText}>{item.unreadCount}</Text></View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) return <View style={styles.center}><ActivityIndicator size="large" color="#6366F1" /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#94A3B8" />
                    <TextInput placeholder="Search chats..." style={styles.searchInput} value={searchQuery} onChangeText={handleSearch} placeholderTextColor="#94A3B8" />
                </View>
            </View>
            <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item._id}
                renderItem={renderChatListItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} tintColor="#6366F1" />}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchSection: { paddingHorizontal: 20, marginVertical: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 15, paddingHorizontal: 15, height: 48 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
    chatCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    avatarContainer: { position: 'relative' },
    avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#F1F5F9' },
    onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFF' },
    chatContent: { flex: 1, marginLeft: 16 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    userName: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
    timeText: { fontSize: 12, color: '#94A3B8' },
    unreadTime: { color: '#6366F1', fontWeight: '700' },
    messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    lastMessage: { fontSize: 14, color: '#64748B', flex: 1 },
    unreadTextBold: { color: '#1E293B', fontWeight: '700' },
    unreadBadge: { backgroundColor: '#6366F1', minWidth: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
    unreadCountText: { color: '#FFF', fontSize: 11, fontWeight: '800' }
});

export default MessengerScreen;