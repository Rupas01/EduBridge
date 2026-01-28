import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useIsFocused } from '@react-navigation/native'; // 1. Import the hook

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BitItem = ({ item, isVisible }) => {
    const videoRef = useRef(null);
    const isFocused = useIsFocused(); // 2. Use the hook to track screen focus

    React.useEffect(() => {
        if (isVisible && isFocused) {
            videoRef.current?.playAsync();
        } else {
            videoRef.current?.pauseAsync();
        }
    }, [isVisible, isFocused]);

    return (
        <View style={styles.bitContainer}>
            <Video
                ref={videoRef}
                source={{ uri: item.videoUrl }}
                style={StyleSheet.absoluteFill}
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay={isVisible && isFocused} // Also useful for initial play
            />
            <View style={styles.overlay}>
                <Text style={styles.bitTitle}>{item.title}</Text>
                <Text style={styles.creatorName}>@{item.creator?.username}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bitContainer: {
        width: '100%',
        height: SCREEN_HEIGHT,
        justifyContent: 'flex-end',
        backgroundColor: 'black',
    },
    overlay: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        padding: 20,
    },
    bitTitle: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    creatorName: {
        fontSize: 14,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});

export default BitItem;