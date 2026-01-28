import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import MyLearningsScreen from '../screens/MyLearningsScreen';
import ExploreScreen from '../screens/ExploreScreen';
import BitsScreen from '../screens/BitsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'MyLearnings') {
                        iconName = focused ? 'play-circle' : 'play-circle-outline';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Bits') {
                        iconName = focused ? 'videocam' : 'videocam-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                    title: 'EduBridge',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => alert('Messenger pressed!')}
                            style={{ marginRight: 15 }}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={25} color="black" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Tab.Screen
                name="MyLearnings"
                component={MyLearningsScreen}
                options={{ title: 'My Learnings' }}
            />
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen
                name="Bits"
                component={BitsScreen}
                options={{ headerShown: false }}
            />
            {/* <Tab.Screen
                name="Bits"
                component={BitsScreen}
                options={{ headerShown: false }}
            /> */}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;