import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TextInput, 
    TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { formatDistanceToNow } from 'date-fns';

const CommentsScreen = ({ route, navigation }) => {
    const { postId } = route.params;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`${API_URL}/comments/${postId}`, {
                headers: { 'x-auth-token': token }
            });
            setComments(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.post(`${API_URL}/comments/${postId}`, 
                { text: newComment }, 
                { headers: { 'x-auth-token': token } }
            );
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (e) {
            alert("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const renderComment = ({ item }) => (
        <View style={styles.commentContainer}>
            {item.user.profilePictureUrl ? (
                <Image source={{ uri: item.user.profilePictureUrl }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarFallback}><Ionicons name="person" size={14} color="#999" /></View>
            )}
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.username}>{item.user.username}</Text>
                    <Text style={styles.time}>{formatDistanceToNow(new Date(item.createdAt))} ago</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comments</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="tomato" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>Be the first to comment!</Text>}
                />
            )}

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity 
                        onPress={handleAddComment} 
                        disabled={submitting || !newComment.trim()}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="tomato" />
                        ) : (
                            <Text style={[styles.sendBtn, !newComment.trim() && { color: '#ccc' }]}>Post</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    list: { padding: 15 },
    commentContainer: { flexDirection: 'row', marginBottom: 20 },
    avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 12 },
    avatarFallback: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    commentContent: { flex: 1 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    username: { fontWeight: 'bold', fontSize: 14 },
    time: { fontSize: 11, color: '#999' },
    commentText: { fontSize: 14, color: '#333', lineHeight: 18 },
    inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
    input: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, maxHeight: 100 },
    sendBtn: { color: 'tomato', fontWeight: 'bold', fontSize: 16 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default CommentsScreen;