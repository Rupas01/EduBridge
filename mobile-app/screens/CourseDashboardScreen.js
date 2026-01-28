import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const CourseDashboardScreen = ({ route, navigation }) => {
    const { courseId } = route.params;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        progressPercentage: 0,
        completedLessons: 0,
        totalLessons: 0,
        averageScore: 0,
        performanceGrade: "N/A",
        gradeColor: "#999",
        quizzesPassed: 0
    });

    const fetchRealStats = useCallback(async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${API_URL}/courses/${courseId}`, {
                headers: { 'x-auth-token': token }
            });
            if (response.data.stats) setStats(response.data.stats);
        } catch (error) {
            Alert.alert("Error", "Could not fetch your progress.");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => { fetchRealStats(); }, [fetchRealStats]);

    if (loading) return <ActivityIndicator size="large" color="#2196F3" style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView padding={20} showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>Learning Analytics</Text>
                
                {/* 1. PROGRESS CARD */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Course Completion</Text>
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${stats.progressPercentage}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{stats.progressPercentage}% Finished</Text>
                </View>

                {/* 2. PERFORMANCE HERO CARD */}
                <View style={[styles.performanceCard, { borderColor: stats.gradeColor }]}>
                    <View style={styles.gradeCircle}>
                        <Text style={[styles.gradeText, { color: stats.gradeColor }]}>{stats.performanceGrade}</Text>
                        <Text style={styles.gradeLabel}>Overall Grade</Text>
                    </View>
                    
                    <View style={styles.perfDetails}>
                        <Text style={styles.perfTitle}>Quiz Mastery</Text>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Avg. Score:</Text>
                            <Text style={styles.statValue}>{stats.averageScore}%</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Passed Quizzes:</Text>
                            <Text style={styles.statValue}>{stats.quizzesPassed}</Text>
                        </View>
                    </View>
                </View>

                {/* 3. STATS GRID */}
                <View style={styles.grid}>
                    <View style={styles.statBox}>
                        <Ionicons name="book-outline" size={24} color="#2196F3" />
                        <Text style={styles.gridVal}>{stats.completedLessons}/{stats.totalLessons}</Text>
                        <Text style={styles.gridLabel}>Items Done</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Ionicons name="ribbon-outline" size={24} color="#FFD700" />
                        <Text style={styles.gridVal}>{stats.progressPercentage === 100 ? "Master" : "Student"}</Text>
                        <Text style={styles.gridLabel}>Level</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.backBtn} 
                    onPress={() => navigation.navigate('CourseDetail', { courseId })}
                >
                    <Text style={styles.backBtnText}>Return to Curriculum</Text>
                    <Ionicons name="chevron-forward" size={18} color="white" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 3, marginBottom: 20 },
    cardTitle: { fontSize: 16, color: '#666', marginBottom: 12, fontWeight: '600' },
    progressBg: { height: 12, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#4CAF50' },
    progressText: { marginTop: 10, textAlign: 'right', fontWeight: 'bold', color: '#4CAF50', fontSize: 14 },
    performanceCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1.5, alignItems: 'center', elevation: 3 },
    gradeCircle: { width: 85, height: 85, borderRadius: 42.5, backgroundColor: '#fdfdfd', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    gradeText: { fontSize: 32, fontWeight: '900' },
    gradeLabel: { fontSize: 9, color: '#999', textTransform: 'uppercase', fontWeight: 'bold' },
    perfDetails: { flex: 1, marginLeft: 20 },
    perfTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    statLabel: { fontSize: 13, color: '#666' },
    statValue: { fontSize: 13, fontWeight: 'bold', color: '#333' },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statBox: { backgroundColor: '#fff', width: '48%', padding: 18, borderRadius: 20, alignItems: 'center', elevation: 2 },
    gridVal: { fontSize: 18, fontWeight: 'bold', marginTop: 8, color: '#333' },
    gridLabel: { fontSize: 12, color: '#999', marginTop: 2 },
    backBtn: { backgroundColor: '#2196F3', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    backBtnText: { color: '#fff', fontWeight: 'bold', marginRight: 10, fontSize: 16 }
});

export default CourseDashboardScreen;