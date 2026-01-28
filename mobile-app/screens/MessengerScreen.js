import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessengerScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Messenger</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default MessengerScreen;