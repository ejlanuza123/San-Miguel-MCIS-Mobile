//App.js
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import React, { useState, useEffect } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationProvider } from "./src/context/NotificationContext"; // <-- 1. IMPORT THE PROVIDER
import { initDatabase } from './src/services/database';
import OfflineIndicator from './src/components/layout/OfflineIndicator';
import { SafeAreaProvider } from "react-native-safe-area-context"; 

// Import all screens and navigators
import SplashScreen from "./src/screens/SplashScreen";
import GetStartedScreen from "./src/screens/GetStartedScreen";
import TermsAndConditionsScreen from "./src/screens/TermsAndConditionsScreen";
import AuthNavigator from "./src/navigation/AuthNavigator";
import AppNavigator from "./src/navigation/AppNavigator";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ["sm.mcis://"],
  config: {
    screens: {
      // This tells the navigator that the path "login"
      // should navigate to the 'Login' screen inside the 'Auth' navigator.
      Auth: {
        screens: {
          Login: "login",
        },
      },
    },
  },
};

function RootNavigator() {
  const { user, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    // FOR DEVELOPMENT: Uncomment the line below to always see the onboarding flow
    // AsyncStorage.removeItem('hasCompletedOnboarding'); // Now it's safely commented out

    AsyncStorage.getItem("hasCompletedOnboarding").then((value) => {
      if (value === null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if (loading || isFirstLaunch === null) {
    return null; // Or a loading view
  }

  return (
 
        <NavigationContainer ref={navigationRef} linking={linking}>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={user ? "App" : isFirstLaunch ? "Splash" : "Auth"}
          >
            {user ? (
              // If user is logged in, they only see the main app navigator
              <Stack.Screen name="App" component={AppNavigator} />
            ) : (
              // If no user, all onboarding and auth screens are available
              <>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="GetStarted" component={GetStartedScreen} />
                <Stack.Screen name="Terms" component={TermsAndConditionsScreen} />
                <Stack.Screen name="Auth" component={AuthNavigator} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
  );
}

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  // <-- 2. Add this useEffect to initialize the database on startup
  useEffect(() => {
    initDatabase()
      .then(() => {
        setDbInitialized(true);
        console.log("Database has been successfully initialized.");
      })
      .catch(error => {
        console.error("Database initialization failed:", error);
      });
  }, []);

  // 3. Optional: You can show a loading screen until the DB is ready
  if (!dbInitialized) {
    return null; // Or your custom loading component
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <RootNavigator />
          <OfflineIndicator />
        </NotificationProvider>
      </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
