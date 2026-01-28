import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManualQuizAddScreen = ({ route, navigation }) => {
    const { courseId, moduleId, quizId, initialData, mode = 'manual' } = route.params;

    // FIX: Fallback to empty string if title isn't passed (happens when creating new)
    const [title, setTitle] = useState(route.params.title || '');
    const [questions, setQuestions] = useState(initialData || [
        { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }
    ]);

    const handleSave = async (publish = false) => {
        if (!title.trim()) return Alert.alert("Error", "Please name your quiz.");

        try {
            const token = await AsyncStorage.getItem('userToken');
            const payload = {
                quizId: quizId || null,
                courseId,
                moduleId,
                title,
                questions,
                isPublished: publish, // This will now correctly overwrite the draft status
                creationMode: mode
            };

            await axios.post(`${API_URL}/quizzes/save`, payload, {
                headers: { 'x-auth-token': token }
            });

            Alert.alert("Success", publish ? "Quiz Published!" : "Draft Saved.");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", "Failed to save quiz.");
        }
    };

    const updateOptionText = (qIndex, optIndex, text) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = text;
        setQuestions(updated);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.label}>Quiz Name</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="e.g. Mid-term Assessment"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {questions.map((q, qIndex) => (
                    <View key={qIndex} style={styles.questionCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.questionNumber}>Question {qIndex + 1}</Text>
                            <TouchableOpacity onPress={() => {
                                const updated = questions.filter((_, i) => i !== qIndex);
                                setQuestions(updated);
                            }}>
                                <Ionicons name="trash-outline" size={20} color="red" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.questionInput}
                            placeholder="Question text..."
                            value={q.questionText}
                            onChangeText={(text) => {
                                const updated = [...questions];
                                updated[qIndex].questionText = text;
                                setQuestions(updated);
                            }}
                        />

                        {q.options.map((opt, optIndex) => (
                            <View key={optIndex} style={styles.optionRow}>
                                <TouchableOpacity onPress={() => {
                                    const updated = [...questions];
                                    updated[qIndex].correctAnswerIndex = optIndex;
                                    setQuestions(updated);
                                }}>
                                    <Ionicons
                                        name={q.correctAnswerIndex === optIndex ? "radio-button-on" : "radio-button-off"}
                                        size={22}
                                        color={q.correctAnswerIndex === optIndex ? "#4CAF50" : "#ccc"}
                                    />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.optionInput}
                                    placeholder={`Option ${optIndex + 1}`}
                                    value={opt}
                                    onChangeText={(text) => updateOptionText(qIndex, optIndex, text)}
                                />
                            </View>
                        ))}
                    </View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={() => setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }])}>
                    <Text style={styles.addBtnText}>+ Add Another Question</Text>
                </TouchableOpacity>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.draftBtn} onPress={() => handleSave(false)}>
                    <Text>Save Draft</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.publishBtn} onPress={() => handleSave(true)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Publish</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#999', marginBottom: 5 },
    titleInput: { fontSize: 18, fontWeight: 'bold', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
    questionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    questionNumber: { color: '#2196F3', fontWeight: 'bold' },
    questionInput: { borderBottomWidth: 1, borderColor: '#eee', marginVertical: 10, padding: 5 },
    optionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    optionInput: { flex: 1, marginLeft: 10, backgroundColor: '#fdfdfd', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#eee' },
    addBtn: { padding: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#2196F3', borderRadius: 10 },
    addBtnText: { color: '#2196F3', fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
    draftBtn: { flex: 1, alignItems: 'center', padding: 15, marginRight: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
    publishBtn: { flex: 1, alignItems: 'center', padding: 15, backgroundColor: '#4CAF50', borderRadius: 10 }
});

export default ManualQuizAddScreen;