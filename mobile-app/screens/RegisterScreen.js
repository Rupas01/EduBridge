import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet,
    Alert, ScrollView, Platform
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '../config';

const RegisterScreen = ({ navigation }) => {
    // State for all form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for the date picker
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !username || !mobileNumber || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                firstName,
                lastName,
                username,
                dateOfBirth: date.toISOString(),
                mobileNumber,
                email,
                password,
            });

            Alert.alert('Success', response.data.msg);
            navigation.navigate('Login');

        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'An error occurred during registration.';
            Alert.alert('Registration Failed', errorMessage);
            console.error(error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
            />
            <TextInput
                style={styles.input}
                placeholder="Create a unique username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <View style={styles.datePickerContainer}>
                <Button onPress={showDatepicker} title="Select Date of Birth" />
                <Text style={styles.dateText}>Selected: {date.toLocaleDateString()}</Text>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={'date'}
                    display="default"
                    onChange={onDateChange}
                />
            )}

            <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
            />
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
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <View style={styles.buttonContainer}>
                <Button title="Register" onPress={handleRegister} />
            </View>

            <View style={styles.loginLink}>
                <Text>Already have an account? </Text>
                <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                    Login
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
    datePickerContainer: {
        marginBottom: 12,
        alignItems: 'center',
    },
    dateText: {
        marginTop: 8,
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 10,
    },
    loginLink: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    link: {
        color: 'blue',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;