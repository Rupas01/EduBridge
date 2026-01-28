import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AddModuleScreen from './screens/AddModuleScreen';
import ManualQuizAddScreen from './screens/ManualQuizAddScreen';
import QuizAttemptScreen from './screens/QuizAttemptScreen';

// Import all the necessary screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CreateCourseScreen from './screens/CreateCourseScreen';
import AddBitScreen from './screens/AddBitScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import AddLessonScreen from './screens/AddLessonScreen';
import LessonContentScreen from './screens/LessonContentScreen';
import ProfileBitsPlayerScreen from './screens/ProfileBitsPlayerScreen';
import ProfileScreen from './screens/ProfileScreen'; 
import CourseDashboardScreen from './screens/CourseDashboardScreen';

// Import the main Tab Navigator
import TabNavigator from './navigation/TabNavigator';

const Stack = createStackNavigator();

export default function App() {
  return (
    // 3. Wrap the entire app in SafeAreaProvider
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {/* Screens for users who are NOT logged in */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />

          {/* Main App Screen for LOGGED-IN users */}
          <Stack.Screen
            name="MainApp"
            component={TabNavigator}
            options={{ headerShown: false }}
          />

          {/* Additional screens */}
          <Stack.Screen
            name="CreateCourse"
            component={CreateCourseScreen}
            options={{ title: 'Create a New Course' }}
          />
          <Stack.Screen
            name="AddBit"
            component={AddBitScreen}
            options={{ title: 'Add a New Bit' }}
          />
          <Stack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
            options={{ title: 'Course Details' }}
          />
          <Stack.Screen
            name="AddModule"
            component={AddModuleScreen}
            options={{ title: 'Create New Module' }}
          />
          <Stack.Screen
            name="AddLesson"
            component={AddLessonScreen}
          />
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LessonContent"
            component={LessonContentScreen}
          />
          <Stack.Screen
            name="ProfileBitsPlayer"
            component={ProfileBitsPlayerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserProfile"
            component={ProfileScreen}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: 'Edit Profile' }}
          />
          <Stack.Screen
            name="ManualQuizAdd"
            component={ManualQuizAddScreen}
            options={{ title: 'Quiz Editor' }}
          />
          <Stack.Screen
            name="QuizAttempt"
            component={QuizAttemptScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CourseDashboard"
            component={CourseDashboardScreen}
            options={{ title: 'My Progress' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}