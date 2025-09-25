import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationProvider } from './src/context/NotificationContext'; // <-- 1. IMPORT THE PROVIDER


// Import all screens and navigators
import SplashScreen from './src/screens/SplashScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import TermsAndConditionsScreen from './src/screens/TermsAndConditionsScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createNativeStackNavigator();

function RootNavigator() {
    const { user, loading } = useAuth();
    const [isFirstLaunch, setIsFirstLaunch] = useState(null);

    useEffect(() => {
        // FOR DEVELOPMENT: Uncomment the line below to always see the onboarding flow
        AsyncStorage.removeItem('hasCompletedOnboarding');

        AsyncStorage.getItem('hasCompletedOnboarding').then(value => {
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
        <NavigationContainer>
            <Stack.Navigator 
                screenOptions={{ headerShown: false }}
                initialRouteName={
                    user 
                    ? 'App'   // if logged in, start at AppNavigator
                    : isFirstLaunch 
                        ? 'Splash' 
                        : 'Auth'
                }
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
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <NotificationProvider>
                    <RootNavigator />
                </NotificationProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}