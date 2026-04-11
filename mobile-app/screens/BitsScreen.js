import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
    View, Text, StyleSheet, FlatList, ActivityIndicator, 
    Alert, StatusBar, Dimensions, TouchableOpacity 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; // Install: npx expo install expo-linear-gradient
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import BitItem from '../components/BitItem';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const BitsScreen = ({ route, navigation }) => {
    const [bits, setBits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleItemIndex, setVisibleItemIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('foryou');
    
    const insets = useSafeAreaInsets();
    const initialScrollIndex = route.params?.initialScrollIndex || 0;
    const passedBits = route.params?.bits;

    const fetchBits = useCallback(async () => {
        setIsLoading(true);
        try {
            if (passedBits) {
                setBits(passedBits);
            } else {
                const token = await AsyncStorage.getItem('userToken');
                const response = await axios.get(`${API_URL}/bits`, {
                    headers: { 'x-auth-token': token }
                });
                setBits(response.data);
            }
        } catch (error) {
            console.error("Bits Error:", error);
            Alert.alert("Connection Error", "Check your local server (Old Laptop).");
        } finally {
            setIsLoading(false);
        }
    }, [passedBits]);

    useFocusEffect(
        useCallback(() => {
            fetchBits();
            return () => {};
        }, [fetchBits])
    );

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setVisibleItemIndex(viewableItems[0].index);
        }
    }, []);
    
    const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
    const flatListRef = useRef(null);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading micro-content...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            {/* MODERN FLOATING HEADER */}
            <View style={[styles.header, { top: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => setActiveTab('following')}>
                    <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>Following</Text>
                    {activeTab === 'following' && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity onPress={() => setActiveTab('foryou')}>
                    <Text style={[styles.tabText, activeTab === 'foryou' && styles.activeTabText]}>For You</Text>
                    {activeTab === 'foryou' && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={bits}
                renderItem={({ item, index }) => (
                    <View style={styles.bitWrapper}>
                        <BitItem item={item} isVisible={index === visibleItemIndex} />
                        
                        {/* BOTTOM GRADIENT OVERLAY (For readability) */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.bottomOverlay}
                        />

                        {/* RIGHT SIDE INTERACTION BAR */}
                        <View style={styles.sideBar}>
                            <TouchableOpacity style={styles.sideBtn}>
                                <View style={styles.avatarBorder}>
                                    <Ionicons name="person-circle" size={40} color="#fff" />
                                </View>
                                <View style={styles.plusIcon}><Ionicons name="add" size={12} color="#fff" /></View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sideBtn}>
                                <Ionicons name="heart" size={32} color="#fff" />
                                <Text style={styles.sideLabel}>2.4k</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sideBtn} onPress={() => navigation.navigate('Chat', { otherUserId: item.authorId })}>
                                <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
                                <Text style={styles.sideLabel}>48</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sideBtn}>
                                <Ionicons name="share-social" size={28} color="#fff" />
                                <Text style={styles.sideLabel}>Share</Text>
                            </TouchableOpacity>
                        </View>

                        {/* BOTTOM INFO SECTION */}
                        <View style={styles.infoSection}>
                            <Text style={styles.authorName}>@{item.authorName || 'Mentor'}</Text>
                            <Text style={styles.bitTitle} numberOfLines={2}>{item.title}</Text>
                            <View style={styles.tagRow}>
                                <Ionicons name="bookmark" size={14} color="#6366F1" />
                                <Text style={styles.tagText}>{item.category || 'Education'}</Text>
                            </View>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item._id}
                pagingEnabled
                snapToInterval={height}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={initialScrollIndex}
                onScrollToIndexFailed={() => {}}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={60} color="#475569" />
                        <Text style={styles.emptyText}>No Bits available in your area.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bitWrapper: { width: width, height: height },
    
    // HEADER
    header: {
        position: 'absolute',
        flexDirection: 'row',
        alignSelf: 'center',
        zIndex: 10,
        alignItems: 'center'
    },
    tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '700', marginHorizontal: 15 },
    activeTabText: { color: '#fff' },
    tabIndicator: { height: 3, width: 20, backgroundColor: '#fff', alignSelf: 'center', marginTop: 4, borderRadius: 2 },
    divider: { width: 1, height: 15, backgroundColor: 'rgba(255,255,255,0.3)' },

    // INTERACTION BAR
    sideBar: {
        position: 'absolute',
        right: 12,
        bottom: 120,
        alignItems: 'center',
        zIndex: 5
    },
    sideBtn: { alignItems: 'center', marginBottom: 20 },
    sideLabel: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 4 },
    avatarBorder: { borderWidth: 2, borderColor: '#fff', borderRadius: 25, padding: 2 },
    plusIcon: { 
        position: 'absolute', bottom: -5, backgroundColor: '#6366F1', 
        borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' 
    },

    // INFO SECTION
    bottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 300 },
    infoSection: { position: 'absolute', bottom: 40, left: 16, right: 80, zIndex: 5 },
    authorName: { color: '#fff', fontWeight: '800', fontSize: 17, marginBottom: 6 },
    bitTitle: { color: '#fff', fontSize: 15, lineHeight: 20, opacity: 0.9 },
    tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    tagText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 5 },

    // LOADER & EMPTY
    loaderContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#6366F1', marginTop: 15, fontWeight: '600' },
    emptyContainer: { height: height, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#94A3B8', marginTop: 10, fontSize: 16 }
});

export default BitsScreen;