import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const UserDashboardScreen = ({ navigation }) => {
    const { profile } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Hi, Welcome Back</Text>
                    <Text style={styles.userName}>{profile?.first_name || 'User'}</Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <TouchableOpacity style={[styles.quickButton, styles.blueButton]}>
                        <Text style={styles.quickButtonText}>Schedule an Appointment</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Upcoming Appointments</Text>
                    <View style={styles.placeholderCard}>
                        <Text style={styles.placeholderText}>Your upcoming appointments will be shown here.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { padding: 20, backgroundColor: '#fee2e2', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    welcomeText: { fontSize: 16, color: '#6b7280' },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#991b1b' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    quickButton: { flex: 1, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    blueButton: { backgroundColor: '#3b82f6' },
    quickButtonText: { color: 'white', fontWeight: 'bold' },
    placeholderCard: { backgroundColor: 'white', borderRadius: 15, padding: 40, alignItems: 'center' },
    placeholderText: { color: '#9ca3af' },
});

export default UserDashboardScreen;