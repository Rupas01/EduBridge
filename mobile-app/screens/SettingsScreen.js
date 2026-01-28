import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

const SettingsScreen = ({ navigation }) => {

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK",
                    onPress: async () => {
                        await AsyncStorage.removeItem('userToken');
                        // Navigate back to the login screen, and reset the navigation stack
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ]
        );
    };

    const settingsOptions = [
        { title: 'Edit Profile', icon: 'person-circle-outline', action: () => navigation.navigate('EditProfile')},
        { title: 'Account Settings', icon: 'key-outline', action: () => alert('Navigate to Account Settings') },
        { title: 'Privacy', icon: 'lock-closed-outline', action: () => alert('Navigate to Privacy') },
        { title: 'Notifications', icon: 'notifications-outline', action: () => alert('Navigate to Notifications') },
        { title: 'Log Out', icon: 'log-out-outline', action: handleLogout },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {settingsOptions.map((option, index) => (
                <TouchableOpacity key={index} style={styles.option} onPress={option.action}>
                    <Ionicons name={option.icon} size={24} color="#333" />
                    <Text style={styles.optionText}>{option.title}</Text>
                    <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
                </TouchableOpacity>
            ))}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 15,
    },
});

export default SettingsScreen;