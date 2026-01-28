import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const QuizAttemptScreen = ({ route, navigation }) => {
    const { quizId } = route.params;
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`${API_URL}/quizzes/${quizId}`, {
                headers: { 'x-auth-token': token }
            });

            if (res.data) {
                setQuiz(res.data);
            } else {
                Alert.alert("Error", "Quiz data is empty.");
            }
        } catch (e) {
            Alert.alert("Error", "Could not load quiz.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (qIdx, optIdx) => {
        if (isSubmitted) return;
        setAnswers({ ...answers, [qIdx]: optIdx });
    };

    const handleSubmit = async () => {
        if (!quiz || !quiz.questions) return;

        if (Object.keys(answers).length < quiz.questions.length) {
            Alert.alert("Incomplete", "Please answer all questions.");
            return;
        }

        let finalScore = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswerIndex) finalScore++;
        });

        try {
            const token = await AsyncStorage.getItem('userToken');
            const passRate = 0.7; // 70% to pass
            const isPassed = finalScore / quiz.questions.length >= passRate;

            await axios.post(`${API_URL}/quizzes/${quizId}/submit`, {
                score: finalScore,
                passed: isPassed,
                courseId: quiz.course
            }, { headers: { 'x-auth-token': token } });

            setScore(finalScore);
            setIsSubmitted(true);
        } catch (e) {
            Alert.alert("Error", "Failed to save results.");
        }
    };

    const resetQuiz = () => {
        setAnswers({});
        setIsSubmitted(false);
        setScore(0);
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    const passRate = 0.7;
    const hasPassed = score / quiz.questions.length >= passRate;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.quizTitle} numberOfLines={1}>{quiz.title}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!isSubmitted ? (
                    // --- QUIZ TAKING VIEW ---
                    quiz.questions.map((q, qIdx) => (
                        <View key={qIdx} style={styles.questionCard}>
                            <Text style={styles.questionText}>{qIdx + 1}. {q.questionText}</Text>
                            {q.options.map((opt, optIdx) => {
                                const isSelected = answers[qIdx] === optIdx;
                                return (
                                    <TouchableOpacity
                                        key={optIdx}
                                        style={[styles.optionBtn, isSelected && styles.selectedOpt]}
                                        onPress={() => handleSelect(qIdx, optIdx)}
                                    >
                                        <Text style={[styles.optText, isSelected && styles.whiteText]}>{opt}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))
                ) : (
                    // --- SUCCESS HUB VIEW ---
                    <View style={styles.resultHub}>
                        <View style={styles.scoreCircle}>
                            <Ionicons 
                                name={hasPassed ? "trophy" : "refresh-circle"} 
                                size={80} 
                                color={hasPassed ? "#FFD700" : "#FF9800"} 
                            />
                            <Text style={styles.hubScoreText}>{score}/{quiz.questions.length}</Text>
                        </View>
                        
                        <Text style={styles.hubTitle}>
                            {hasPassed ? "Excellent Work!" : "Almost There!"}
                        </Text>
                        <Text style={styles.hubSubtitle}>
                            {hasPassed 
                                ? "You've mastered this module and unlocked the next steps." 
                                : "A bit more review will help you master this topic."}
                        </Text>

                        <View style={styles.buttonStack}>
                            {hasPassed ? (
                                <TouchableOpacity 
                                    style={styles.primaryActionBtn} 
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.primaryActionText}>Continue Learning</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                    style={[styles.primaryActionBtn, { backgroundColor: '#FF9800' }]} 
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.primaryActionText}>Review Lessons</Text>
                                    <Ionicons name="book-outline" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}

                            <View style={styles.secondaryRow}>
                                <TouchableOpacity style={styles.outlineBtn} onPress={resetQuiz}>
                                    <Ionicons name="refresh" size={18} color="#666" />
                                    <Text style={styles.outlineBtnText}>Retake Quiz</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.outlineBtn} 
                                    onPress={() => navigation.navigate('CourseDashboard', { courseId: quiz.course })}
                                >
                                    <Ionicons name="stats-chart" size={18} color="#666" />
                                    <Text style={styles.outlineBtnText}>My Progress</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {!isSubmitted && (
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Complete Quiz</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    backBtn: { padding: 4 },
    quizTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
    scrollContent: { padding: 20 },
    questionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2,
    },
    questionText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16, lineHeight: 24 },
    optionBtn: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 10,
    },
    selectedOpt: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
    optText: { fontSize: 15, color: '#555' },
    whiteText: { color: '#fff', fontWeight: 'bold' },
    submitBtn: {
        backgroundColor: '#2196F3',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
    },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Success Hub Styles
    resultHub: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        elevation: 5,
        marginTop: 20,
    },
    scoreCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    hubScoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: -10,
    },
    hubTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    hubSubtitle: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
    buttonStack: { width: '100%' },
    primaryActionBtn: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        padding: 18,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    primaryActionText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 },
    secondaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    outlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        width: '48%',
    },
    outlineBtnText: { marginLeft: 6, color: '#666', fontWeight: 'bold', fontSize: 13 },
});

export default QuizAttemptScreen;