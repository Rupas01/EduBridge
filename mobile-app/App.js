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
import CreatePostScreen from './screens/CreatePostScreen';
import CommentsScreen from './screens/CommentsScreen';
import SearchResults from './screens/SearchResults';
import AllBits from './screens/AllBits';
import UserProfileScreen from './screens/UserProfileScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ChatScreen from './screens/ChatScreen';
import MessengerScreen from './screens/MessengerScreen'

// Import the main Tab Navigator
import TabNavigator from './navigation/TabNavigator';

const Stack = createStackNavigator();

export default function App() {
  return (
    // 3. Wrap the entire app in SafeAreaProvider
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="MainApp"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AllBits"
            component={AllBits}
            options={{ title: 'All Bits' }}
          />
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
          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{
              headerShown: false, // We built a custom header in the screen
              presentation: 'modal' // Optional: Makes it slide up from the bottom like Instagram/X
            }}
          />
          <Stack.Screen
            name="Comments"
            component={CommentsScreen}
            options={{
              title: 'Comments',
              headerBackTitleVisible: false, // Cleaner look for iOS
            }}
          />
          <Stack.Screen
            name="SearchResults"
            component={SearchResults}
            options={{ headerShown: false }} // This eliminates the top ribbon
          />
          <Stack.Screen
            name="UserProfile"
            component={UserProfileScreen} // Use the wrapper we created
            options={{
              title: 'Profile',
              headerBackTitleVisible: false
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({ title: route.params.name })}
          />
          <Stack.Screen
            name="Messenger"
            component={MessengerScreen}
            options={{ title: 'Messages' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}