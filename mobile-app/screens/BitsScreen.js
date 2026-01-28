import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import BitItem from '../components/BitItem';

const BitsScreen = ({ route, navigation }) => {
    const [bits, setBits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleItemIndex, setVisibleItemIndex] = useState(0);
    
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
            console.error("Failed to fetch Bits:", error);
            Alert.alert("Error", "Could not load Bits.");
        } finally {
            setIsLoading(false);
        }
    }, [passedBits]);

    useFocusEffect(
        useCallback(() => {
            fetchBits();
            return () => {
                if (route.params?.passedBits) {
                    navigation.setParams({
                        bits: undefined,
                        initialScrollIndex: undefined,
                    });
                }
            };
        }, [fetchBits, navigation, route.params])
    );

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setVisibleItemIndex(viewableItems[0].index);
        }
    }, []);
    
    const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
    const flatListRef = useRef(null);

    if (isLoading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                ref={flatListRef}
                style={{ marginTop: -insets.top }}
                data={bits}
                renderItem={({ item, index }) => (
                    <BitItem item={item} isVisible={index === visibleItemIndex} />
                )}
                keyExtractor={(item) => item._id}
                pagingEnabled
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={initialScrollIndex}
                onScrollToIndexFailed={() => {}}
                ListEmptyComponent={
                    <View style={styles.loader}>
                        <Text style={styles.emptyText}>No Bits to show yet.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    loader: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    emptyText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default BitsScreen;