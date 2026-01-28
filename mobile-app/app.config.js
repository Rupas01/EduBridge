import 'dotenv/config';

export default {
  "expo": {
    "name": "mobile-app-v2",
    "slug": "mobile-app-v2",
    "version": "1.0.0",
    "android": {
      "package": "com.rupas50.edubridgev2"
    },
    "ios": {
      "bundleIdentifier": "com.rupas50.edubridgev2"
    },
    "plugins": [
      "expo-font",
      "expo-video",
      [
        "expo-image-picker",
        {
          "photosPermission": "The app needs access to your photos to let you upload course thumbnails and lesson videos.",
          "videosPermission": "The app needs access to your videos to let you upload lesson videos."
        }
      ]
    ],
    "extra": {
      "apiUrl": process.env.EXPO_PUBLIC_API_URL,
      "eas": {
        "projectId": "5062bd9a-908a-4b8b-8b17-dec64a367636" // Note: This is your old projectId. You might get a new one when you run `eas build:configure`.
      }
    }
  }
};