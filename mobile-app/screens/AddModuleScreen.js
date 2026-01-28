import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const AddModuleScreen = ({ route, navigation }) => {
    const { courseId } = route.params;
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateModule = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter a title for the module.");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.post(`${API_URL}/courses/${courseId}/modules`, 
                { title }, 
                { headers: { 'x-auth-token': token } }
            );
            
            Alert.alert("Success", "Module added to curriculum!");
            navigation.goBack(); 
        } catch (error) {
            Alert.alert("Error", "Failed to create module.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Module Title</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Module 1: Getting Started"
                value={title}
                onChangeText={setTitle}
                autoFocus
            />
            
            <TouchableOpacity 
                style={[styles.button, !title.trim() && styles.disabledBtn]} 
                onPress={handleCreateModule}
                disabled={isSubmitting || !title.trim()}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Add to Course</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, backgroundColor: '#fff' },
    label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10 },
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
        padding: 15, fontSize: 16, marginBottom: 25, backgroundColor: '#f9f9f9'
    },
    button: {
        backgroundColor: '#2196F3', padding: 18, borderRadius: 10, alignItems: 'center',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4
    },
    disabledBtn: { backgroundColor: '#BDBDBD' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AddModuleScreen;