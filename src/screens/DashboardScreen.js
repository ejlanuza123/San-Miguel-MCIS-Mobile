import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- CORRECTED IMPORT


const DashboardScreen = () => {
    const { signOut, profile } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.welcome}>Welcome, {profile?.first_name || 'User'}!</Text>
            <Button title="Log Out" onPress={signOut} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    welcome: {
        fontSize: 18,
        marginVertical: 20
    }
});

export default DashboardScreen;