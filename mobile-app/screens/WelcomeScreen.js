import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Brand Area */}
                <View style={styles.brandSection}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="school" size={60} color="#2196F3" />
                    </View>
                    <Text style={styles.appName}>EduBridge</Text>
                    <Text style={styles.tagline}>Learn. Teach. Grow together.</Text>
                </View>

                {/* Illustration Placeholder or Feature List */}
                <View style={styles.featureSection}>
                    <FeatureItem icon="people" text="Connect with expert mentors" />
                    <FeatureItem icon="trophy" text="Earn certificates and skills" />
                </View>

                {/* Action Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.getStartedBtn}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginLinkText}>
                            Already have an account? <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const FeatureItem = ({ icon, text }) => (
    <View style={styles.featureItem}>
        <Ionicons name={icon} size={20} color="#4A5568" />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, padding: 30, justifyContent: 'space-between' },
    brandSection: { alignItems: 'center', marginTop: 50 },
    logoCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#EBF8FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    appName: { fontSize: 32, fontWeight: 'bold', color: '#1A202C', letterSpacing: -1 },
    tagline: { fontSize: 16, color: '#718096', marginTop: 8 },
    featureSection: { marginVertical: 40 },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    featureText: { marginLeft: 15, fontSize: 16, color: '#4A5568', fontWeight: '500' },
    footer: { marginBottom: 20 },
    getStartedBtn: { backgroundColor: '#2196F3', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#2196F3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    getStartedText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    loginLink: { marginTop: 20, alignItems: 'center' },
    loginLinkText: { color: '#718096', fontSize: 14 }
});

export default WelcomeScreen;