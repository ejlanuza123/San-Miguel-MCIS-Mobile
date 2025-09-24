import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
// --- ICONS ---
const NotificationIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></Svg>;
const SettingsIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61-.25-1.17-.59-1.69-.98l-2.49-1c-.23-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></Svg>;
const SearchIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24"><Path fill="#9e9e9e" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></Svg>;
const QRScanIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 21h8v-8h-8v8zm2-6h4v4h-4v-4z"/></Svg>;
const FilterIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></Svg>;

const FixedHeader = () => {
    const { profile } = useAuth();
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.fixedHeaderContainer} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.profileInfo}>
                    <Image source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name || 'U'}`}} style={styles.avatar} />
                    <View>
                        <Text style={styles.welcomeText}>Hi, Welcome Back</Text>
                        <Text style={styles.userName}>{profile?.first_name} {profile?.last_name}</Text>
                    </View>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity><NotificationIcon /></TouchableOpacity>
                    <TouchableOpacity><SettingsIcon /></TouchableOpacity>
                </View>
            </View>
            <View style={styles.searchContainer}>
                <SearchIcon />
                <TextInput placeholder="Search" style={styles.searchInput} />
                <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}><QRScanIcon /></TouchableOpacity>
                <TouchableOpacity><FilterIcon /></TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    fixedHeaderContainer: {
        backgroundColor: '#dbeafe',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 35,
    },
    profileInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    welcomeText: { fontSize: 14, color: '#6b7280' },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' },
    headerIcons: { flexDirection: 'row', gap: 15 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginHorizontal: 20,
        marginTop: -20,
        marginBottom: 10,
        gap: 10,
        elevation: 5,
    },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 16 },
});

export default FixedHeader;