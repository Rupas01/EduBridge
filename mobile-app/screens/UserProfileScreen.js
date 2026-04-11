import React from 'react';
import ProfileScreen from './ProfileScreen';

const UserProfileScreen = ({ route, navigation }) => {
    // This passes the userId from SearchResults to the ProfileScreen logic
    return <ProfileScreen route={route} navigation={navigation} />;
};

export default UserProfileScreen;