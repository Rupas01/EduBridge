import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });
            
            await AsyncStorage.setItem('userToken', response.data.token);

            Alert.alert('Login Successful', 'Welcome back!');
            
            navigation.navigate('MainApp'); 

        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'An error occurred during login.';
            Alert.alert('Login Failed', errorMessage);
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
             <View style={styles.registerLink}>
                <Text>Don't have an account? </Text>
                <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
                    Register
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 45,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingLeft: 10,
        borderRadius: 5,
    },
    registerLink: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    link: {
        color: 'blue',
        fontWeight: 'bold',
    },
});

export default LoginScreen;