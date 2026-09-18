import 'dotenv/config';

export default {
  expo: {
    name: "EduBridge",
    slug: "EduBridge",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    android: {
      package: "com.rupas.edubridge",
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rupas50.edubridgev2"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-font",
      "expo-video",
      [
        "expo-image-picker",
        {
          photosPermission: "The app needs access to your photos to let you upload course thumbnails and lesson videos.",
          videosPermission: "The app needs access to your videos to let you upload lesson videos."
        }
      ]
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "bc29f4c6-b022-470f-96c0-accc14434656"
      }
    }
  }
};