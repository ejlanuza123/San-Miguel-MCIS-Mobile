import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

function RootNavigator() {
    const { user, loading } = useAuth();

    // While the app is checking for a logged-in user, we can show a loading screen or nothing
    if (loading) {
        return null; 
    }

    return (
        <NavigationContainer>
            {/* If a 'user' exists, show the main app. If not, show the login screens. */}
            {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}