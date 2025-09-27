// src/screens/ProfileViewScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const InfoField = ({ label, value }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
    </View>
);

export default function ProfileViewScreen({ navigation }) {
    const { profile } = useAuth();
    
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><BackArrowIcon /></TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{width: 24}}/>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Image source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name || 'U'}`}} style={styles.avatar} />
                <InfoField label="Full Name" value={`${profile?.first_name || ''} ${profile?.last_name || ''}`} />
                <InfoField label="Contact Number" value={profile?.contact_no} />
                <InfoField label="Email Address" value={profile?.email} />
                <InfoField label="Assigned Purok" value={profile?.assigned_purok} />
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ProfileEdit')}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20, alignItems: 'center' },
    avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 30 },
    fieldContainer: { width: '100%', backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 15 },
    fieldLabel: { fontSize: 12, color: '#6b7280' },
    fieldValue: { fontSize: 18, fontWeight: '500', marginTop: 2 },
    footer: { padding: 20 },
    editButton: { backgroundColor: '#d1d5db', padding: 15, borderRadius: 10 },
    editButtonText: { fontWeight: 'bold', color: '#1f2937', textAlign: 'center', fontSize: 16 },
});