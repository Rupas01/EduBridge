import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
    Keyboard, Alert, Image, Modal, TouchableWithoutFeedback, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video, Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

const socket = io(API_URL.replace('/api', ''), {
    transports: ['websocket'],
    forceNew: true
});

const ChatScreen = ({ route, navigation }) => {
    const { conversationId, name, otherUserId } = route.params;
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [myId, setMyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // For Progress Indicator
    const [menuVisible, setMenuVisible] = useState(false);
    const [pendingMedia, setPendingMedia] = useState(null);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    
    // Media View States
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [sound, setSound] = useState(null);
    const [playingAudioId, setPlayingAudioId] = useState(null);

    const flatListRef = useRef();
    const headerHeight = useHeaderHeight();

    useEffect(() => {
        const initializeChat = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                const user = JSON.parse(userData);
                setMyId(user.id);
                const token = await AsyncStorage.getItem('userToken');
                const res = await axios.get(`${API_URL}/messages/history/${conversationId}`, {
                    headers: { 'x-auth-token': token }
                });
                await axios.put(`${API_URL}/messages/read/${conversationId}`, {}, {
                    headers: { 'x-auth-token': token }
                });
                setMessages(res.data);
                setLoading(false);
                socket.emit('join_room', conversationId);
            } catch (error) { setLoading(false); }
        };
        initializeChat();

        socket.on('receive_message', (data) => {
            if (data.conversationId === conversationId) {
                setMessages((prev) => [...prev, data]);
            }
        });

        socket.on('message_deleted_everyone', (messageId) => {
            setMessages(prev => prev.map(m => 
                m._id === messageId ? { ...m, isDeletedForEveryone: true, text: "", mediaUrl: null } : m
            ));
        });

        return () => {
            socket.off('receive_message');
            socket.off('message_deleted_everyone');
            if (sound) sound.unloadAsync(); // Cleanup audio on leave
        };
    }, [conversationId, myId]);

    // --- AUDIO PLAYBACK LOGIC ---
    const playAudio = async (url, msgId) => {
        try {
            if (sound && playingAudioId === msgId) {
                await sound.pauseAsync();
                setPlayingAudioId(null);
                return;
            }
            if (sound) await sound.unloadAsync();

            setPlayingAudioId(msgId);
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true }
            );
            setSound(newSound);
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) setPlayingAudioId(null);
            });
        } catch (e) { Alert.alert("Error", "Could not play audio."); }
    };

    const handleFileUpload = async () => {
        if (!pendingMedia) return null;
        try {
            const formData = new FormData();
            const { uri, type } = pendingMedia;
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const ext = match ? match[1] : (type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'mp3');

            formData.append(type, {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: filename || `upload.${ext}`,
                type: type === 'audio' ? 'audio/mpeg' : `${type}/${ext}`
            });

            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.post(`${API_URL}/upload/${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            return res.data.mediaUrl;
        } catch (e) { return null; }
    };

    const sendMessage = async () => {
        if (!text.trim() && !pendingMedia) return;
        setIsSending(true);
        setUploadProgress(0);

        let mediaUrl = null;
        let mediaType = 'text';

        if (pendingMedia) {
            mediaUrl = await handleFileUpload();
            if (!mediaUrl) { 
                Alert.alert("Upload Error", "Failed to upload media."); 
                setIsSending(false); 
                return; 
            }
            mediaType = pendingMedia.type;
        }

        const msgData = {
            conversationId, sender: myId, recipientId: otherUserId,
            text: text.trim(), mediaUrl, mediaType,
            replyTo: replyingTo ? replyingTo._id : null, createdAt: new Date()
        };

        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${API_URL}/messages/send`, msgData, { headers: { 'x-auth-token': token } });
            setMessages((prev) => [...prev, response.data]);
            socket.emit('send_message', response.data);
            setText(''); setPendingMedia(null); setReplyingTo(null);
        } catch (error) { Alert.alert("Error", "Failed to send."); }
        finally { setIsSending(false); setUploadProgress(0); }
    };

    const handleDelete = async (type) => {
        const messageId = selectedMsg._id;
        setActionMenuVisible(false);
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(`${API_URL}/messages/${messageId}?type=${type}`, { headers: { 'x-auth-token': token } });
            if (type === 'everyone') {
                socket.emit('delete_message_everyone', { messageId, conversationId });
                setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeletedForEveryone: true, text: "", mediaUrl: null } : m));
            } else {
                setMessages(prev => prev.filter(m => m._id !== messageId));
            }
        } catch (error) { console.error(error); }
    };

    const pickMedia = async (type) => {
        setMenuVisible(false);
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos, allowsEditing: true, quality: 0.6 });
        if (!result.canceled) setPendingMedia({ uri: result.assets[0].uri, type });
    };

    const pickAudio = async () => {
        setMenuVisible(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
            if (!result.canceled) setPendingMedia({ uri: result.assets[0].uri, type: 'audio' });
        } catch (e) { Alert.alert("Error", "Could not access audio."); }
    };

    const renderMessage = ({ item, index }) => {
        const isMine = item.sender === myId;
        const showDate = index === 0 || new Date(messages[index - 1].createdAt).toDateString() !== new Date(item.createdAt).toDateString();
        const isCurrentlyUploading = isSending && item.mediaUrl === null && item.sender === myId; // Simplified check for sending state

        const renderContent = () => {
            if (item.isDeletedForEveryone) {
                return <View style={styles.deletedContainer}><Ionicons name="ban" size={14} color="#94A3B8" /><Text style={styles.deletedText}>This message was deleted</Text></View>;
            }
            if (item.mediaType === 'image' && item.mediaUrl) {
                return (
                    <TouchableOpacity onPress={() => setFullScreenImage(item.mediaUrl)}>
                        <Image source={{ uri: item.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
                    </TouchableOpacity>
                );
            }
            if (item.mediaType === 'video' && item.mediaUrl) return <Video source={{ uri: item.mediaUrl }} style={styles.mediaVideo} useNativeControls resizeMode="contain" />;
            if (item.mediaType === 'audio' && item.mediaUrl) return (
                <TouchableOpacity style={styles.audioContainer} onPress={() => playAudio(item.mediaUrl, item._id)}>
                    <Ionicons name={playingAudioId === item._id ? "pause-circle" : "play-circle"} size={35} color={isMine ? "#fff" : "#6366F1"} />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.audioText, isMine ? styles.myText : styles.theirText]}>Audio Clip</Text>
                        <View style={[styles.audioWave, { backgroundColor: isMine ? 'rgba(255,255,255,0.3)' : '#E2E8F0' }]} />
                    </View>
                </TouchableOpacity>
            );
            return <Text style={[styles.msgText, isMine ? styles.myText : styles.theirText]}>{item.text}</Text>;
        };

        return (
            <View>
                {showDate && <View style={styles.dateDivider}><Text style={styles.dateText}>{format(new Date(item.createdAt), 'MMMM d, yyyy')}</Text></View>}
                <View style={[styles.messageWrapper, isMine ? styles.myWrapper : styles.theirWrapper]}>
                    <TouchableOpacity 
                        onLongPress={() => { setSelectedMsg(item); setActionMenuVisible(true); }}
                        delayLongPress={500}
                        activeOpacity={0.9} 
                        style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble, isMine ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }]}
                    >
                        {item.replyTo && !item.isDeletedForEveryone && (
                            <View style={[styles.replyQuote, isMine ? styles.myReplyQuote : styles.theirReplyQuote]}>
                                <Text style={styles.replyQuoteText} numberOfLines={1}>{item.replyTo.isDeletedForEveryone ? "Deleted" : (item.replyTo.mediaType !== 'text' ? `Attached ${item.replyTo.mediaType}` : item.replyTo.text)}</Text>
                            </View>
                        )}
                        {renderContent()}
                        {/* SENDING PROGRESS OVERLAY */}
                        {isSending && item._id === undefined && isMine && (
                            <View style={styles.progressOverlay}>
                                <Text style={styles.progressText}>{uploadProgress}%</Text>
                            </View>
                        )}
                        {item.text && item.mediaType !== 'text' && !item.isDeletedForEveryone && <Text style={[styles.msgText, isMine ? styles.myText : styles.theirText, { marginTop: 5 }]}>{item.text}</Text>}
                        <Text style={[styles.timeText, isMine ? styles.myTime : styles.theirTime]}>{format(new Date(item.createdAt), 'HH:mm')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#6366F1" /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={headerHeight}>
                <FlatList ref={flatListRef} data={messages} keyExtractor={(item, index) => item._id || index.toString()} renderItem={renderMessage} onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />
                
                {replyingTo && (
                    <View style={styles.replyPreviewBar}><View style={styles.replyPreviewContent}><View style={styles.replyIndicator} /><View style={{ flex: 1, paddingLeft: 10 }}><Text style={styles.replyingToTitle}>Replying to</Text><Text style={styles.replyingToText} numberOfLines={1}>{replyingTo.text || `Attached ${replyingTo.mediaType}`}</Text></View><TouchableOpacity onPress={() => setReplyingTo(null)}><Ionicons name="close" size={20} color="#64748B" /></TouchableOpacity></View></View>
                )}

                {pendingMedia && (
                    <View style={styles.previewBar}><View style={styles.previewContent}>{pendingMedia.type === 'image' ? <Image source={{ uri: pendingMedia.uri }} style={styles.smallPreview} /> : <View style={styles.previewIconBox}><Ionicons name={pendingMedia.type === 'video' ? "videocam" : "musical-note"} size={20} color="#6366F1" /></View>}<Text style={styles.previewName}>{pendingMedia.type.toUpperCase()} Selected</Text><TouchableOpacity onPress={() => setPendingMedia(null)}><Ionicons name="close-circle" size={26} color="#ef4444" /></TouchableOpacity></View></View>
                )}

                <View style={styles.inputContainer}>
                    <View style={styles.floatingInputBar}>
                        <TouchableOpacity style={styles.plusBtn} onPress={() => setMenuVisible(true)} disabled={isSending}><Ionicons name="add" size={24} color="#6366F1" /></TouchableOpacity>
                        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder={isSending ? "Uploading..." : "Message..."} placeholderTextColor="#94A3B8" multiline editable={!isSending} />
                        <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, (!text.trim() && !pendingMedia || isSending) && styles.sendDisabled]} disabled={(!text.trim() && !pendingMedia) || isSending}>{isSending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="arrow-up" size={22} color="#fff" />}</TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* FULL SCREEN IMAGE MODAL */}
            <Modal visible={!!fullScreenImage} transparent={true} animationType="fade">
                <View style={styles.fullScreenContainer}>
                    <TouchableOpacity style={styles.closeFullImg} onPress={() => setFullScreenImage(null)}>
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Image source={{ uri: fullScreenImage }} style={styles.fullImage} resizeMode="contain" />
                </View>
            </Modal>

            {/* ACTION MENU MODAL */}
            <Modal animationType="slide" transparent={true} visible={actionMenuVisible} onRequestClose={() => setActionMenuVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setActionMenuVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.actionMenu}>
                            {!selectedMsg?.isDeletedForEveryone && (
                                <TouchableOpacity style={styles.actionItem} onPress={() => { setReplyingTo(selectedMsg); setActionMenuVisible(false); }}>
                                    <Ionicons name="arrow-undo" size={22} color="#1E293B" /><Text style={styles.actionText}>Reply</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.actionItem} onPress={() => handleDelete('me')}>
                                <Ionicons name="trash-outline" size={22} color="#1E293B" /><Text style={styles.actionText}>Delete for me</Text>
                            </TouchableOpacity>
                            {selectedMsg?.sender === myId && !selectedMsg?.isDeletedForEveryone && (
                                <TouchableOpacity style={styles.actionItem} onPress={() => handleDelete('everyone')}>
                                    <Ionicons name="trash" size={22} color="#EF4444" /><Text style={[styles.actionText, { color: '#EF4444' }]}>Delete for everyone</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ATTACHMENT MENU MODAL */}
            <Modal animationType="fade" transparent={true} visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                    <View style={styles.modalOverlay}><View style={styles.menuWrapper}><Text style={styles.menuTitle}>Share Content</Text><View style={styles.menuGrid}><TouchableOpacity style={styles.menuItem} onPress={() => pickMedia('image')}><View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}><Ionicons name="image" size={26} color="#6366F1" /></View><Text style={styles.menuLabel}>Image</Text></TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={() => pickMedia('video')}><View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}><Ionicons name="videocam" size={26} color="#D97706" /></View><Text style={styles.menuLabel}>Video</Text></TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={() => pickAudio()}><View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}><Ionicons name="musical-notes" size={26} color="#16A34A" /></View><Text style={styles.menuLabel}>Audio</Text></TouchableOpacity></View></View></View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 },
    dateDivider: { alignItems: 'center', marginVertical: 20 },
    dateText: { fontSize: 12, fontWeight: '600', color: '#94A3B8', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    messageWrapper: { flexDirection: 'row', marginVertical: 2, width: '100%' },
    myWrapper: { justifyContent: 'flex-end' },
    theirWrapper: { justifyContent: 'flex-start' },
    bubble: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, maxWidth: '85%', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    myBubble: { backgroundColor: '#6366F1' },
    theirBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F1F5F9' },
    msgText: { fontSize: 15, lineHeight: 22 },
    myText: { color: '#fff' },
    theirText: { color: '#1E293B' },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end', fontWeight: '500' },
    myTime: { color: 'rgba(255,255,255,0.7)' },
    theirTime: { color: '#94A3B8' },
    
    // NEW AUDIO STYLES
    audioContainer: { flexDirection: 'row', alignItems: 'center', paddingRight: 20, paddingVertical: 5 },
    audioText: { fontSize: 14, fontWeight: '700' },
    audioWave: { width: 100, height: 3, borderRadius: 2, marginTop: 5 },

    // UPLOAD PROGRESS
    progressOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    progressText: { color: '#fff', fontWeight: '900', fontSize: 16 },

    // FULL SCREEN IMAGE
    fullScreenContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '100%', height: '80%' },
    closeFullImg: { position: 'absolute', top: 50, right: 20, zIndex: 10 },

    deletedContainer: { flexDirection: 'row', alignItems: 'center', opacity: 0.6 },
    deletedText: { fontSize: 14, fontStyle: 'italic', marginLeft: 5, color: '#94A3B8' },
    replyQuote: { padding: 8, borderRadius: 10, marginBottom: 5, borderLeftWidth: 3 },
    myReplyQuote: { backgroundColor: 'rgba(255,255,255,0.15)', borderLeftColor: '#fff' },
    theirReplyQuote: { backgroundColor: '#F1F5F9', borderLeftColor: '#6366F1' },
    replyQuoteText: { fontSize: 13, color: '#475569', opacity: 0.8 },
    replyPreviewBar: { paddingHorizontal: 16, marginBottom: -10 },
    replyPreviewContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    replyIndicator: { width: 4, height: '100%', backgroundColor: '#6366F1', borderRadius: 2 },
    replyingToTitle: { fontSize: 12, fontWeight: 'bold', color: '#6366F1' },
    replyingToText: { fontSize: 13, color: '#64748B' },
    mediaImage: { width: 220, height: 220, borderRadius: 12, marginBottom: 4 },
    mediaVideo: { width: 220, height: 160, borderRadius: 12, marginBottom: 4 },
    previewBar: { paddingHorizontal: 20, marginBottom: -8 },
    previewContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, padding: 8, borderWidth: 1, borderColor: '#E2E8F0', elevation: 3 },
    smallPreview: { width: 42, height: 42, borderRadius: 8 },
    previewIconBox: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    previewName: { flex: 1, marginLeft: 12, fontSize: 13, fontWeight: '700', color: '#64748B' },
    inputContainer: { paddingHorizontal: 16, paddingVertical: 12 },
    floatingInputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 30, paddingHorizontal: 8, paddingVertical: 6, elevation: 5, shadowOpacity: 0.1, shadowRadius: 12 },
    plusBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    input: { flex: 1, fontSize: 16, color: '#1E293B', paddingHorizontal: 10, maxHeight: 100 },
    sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    sendDisabled: { backgroundColor: '#E2E8F0' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    menuWrapper: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40 },
    menuTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
    menuGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    menuItem: { alignItems: 'center' },
    iconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    menuLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
    actionMenu: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 10 },
    actionItem: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    actionText: { marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#1E293B' }
});

export default ChatScreen;