import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import BitItem from '../components/BitItem';

const ProfileBitsPlayerScreen = ({ route }) => {
    const { bits, initialScrollIndex } = route.params;
    const [visibleItemIndex, setVisibleItemIndex] = useState(initialScrollIndex || 0);
    const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
    const flatListRef = useRef(null);

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setVisibleItemIndex(viewableItems[0].index);
        }
    }, []);

    if (!bits || bits.length === 0) {
        return (
            <View style={styles.loader}>
                <StatusBar barStyle="light-content" />
                <Text style={styles.emptyText}>No Bits found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                ref={flatListRef}
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    emptyText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default ProfileBitsPlayerScreen;