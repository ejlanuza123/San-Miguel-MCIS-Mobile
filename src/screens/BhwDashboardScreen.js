import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- ICONS ---
const NotificationIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></Svg>;
const SettingsIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></Svg>;
const SearchIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24"><Path fill="#9e9e9e" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></Svg>;
const QRScanIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 21h8v-8h-8v8zm2-6h4v4h-4v-4z"/></Svg>;
const FilterIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></Svg>;

// In src/screens/BhwDashboardScreen.js

const BhwDashboardScreen = () => {
    const { profile } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const navigation = useNavigation();
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchDashboardData = useCallback(async () => {
        if (!profile) return;
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('created_by', profile.id)
            .gte('date', today)
            .order('date', { ascending: true })
            .order('time', { ascending: true })
            .limit(5);
        if (data) setAppointments(data);
    }, [profile]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    
    const changeMonth = (amount) => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + amount); return d; });
    const generateCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let days = [];
        // Add blank views for padding at the start of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`pad-${i}`} style={styles.calendarDay} />);
        }
        // Add a view for each actual day
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
            days.push(
                <View key={i} style={styles.calendarDay}>
                    <View style={isToday ? styles.today : {}}>
                        <Text style={isToday && styles.todayText}>{i}</Text>
                    </View>
                </View>
            );
        }
        return days;
    };

    return (
        <SafeAreaView style={styles.container}>
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

            {/* --- Main Content Area --- */}
            <View style={styles.contentArea}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <View style={styles.quickAccessContainer}>
                        <TouchableOpacity style={[styles.quickButton, styles.orangeButton]}><Text style={styles.quickButtonText}>Add Appointment</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.quickButton, styles.blueButton]}><Text style={styles.quickButtonText}>Add Patient</Text></TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {appointments.length > 0 ? appointments.map(app => (
                            <View key={app.id} style={styles.appointmentCard}>
                                <Text style={styles.appDay}>{new Date(app.date).toLocaleDateString('en-US', { weekday: 'long' })}</Text>
                                <Text style={styles.appTime}>{app.time}</Text>
                                <Text style={styles.appReason}>{app.reason}</Text>
                            </View>
                        )) : (
                            <View style={styles.noAppointmentCard}>
                                <Text style={styles.noAppointmentText}>No upcoming appointments.</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                 <View style={[styles.section, styles.calendarSection]}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={() => changeMonth(-1)}>
                        <Text style={styles.arrow}>&lt;</Text>
                        </TouchableOpacity>
                        <Text style={styles.sectionTitle}>
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)}>
                        <Text style={styles.arrow}>&gt;</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.calendarCard}>
                        <View style={styles.calendarGrid}>
                        {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(day => (
                            <Text key={day} style={styles.dayHeader}>{day}</Text>
                        ))}
                        {generateCalendarGrid()}
                        </View>
                    </View>
                </View>
                </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 35, backgroundColor: '#dbeafe', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    profileInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    welcomeText: { fontSize: 14, color: '#6b7280' },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' },
    headerIcons: { flexDirection: 'row', gap: 15 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 15, marginHorizontal: 20, marginTop: -20, gap: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 16 },
    contentArea: { flex: 1, paddingTop: 10 },
    section: { paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    quickAccessContainer: { flexDirection: 'row', gap: 15 },
    quickButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    orangeButton: { backgroundColor: '#fb923c' },
    blueButton: { backgroundColor: '#3b82f6' },
    quickButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    appointmentCard: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginRight: 10, width: 150 },
    appDay: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' },
    appTime: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', marginVertical: 5 },
    appReason: { fontSize: 12, color: '#6b7280' },
    noAppointmentCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, width: 250, height: 110, justifyContent: 'center', alignItems: 'center' },
    noAppointmentText: { color: '#6b7280', fontStyle: 'italic', fontSize: 12 },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
    arrow: { fontSize: 22, color: '#6b7280' },
    
    // --- CORRECTED CALENDAR STYLES ---
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // This aligns items in a grid
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 10,
        elevation: 2,
    },
    dayHeader: {
        width: '14.28%',
        textAlign: 'center',
        color: '#6b7280',
        fontWeight: 'bold',
        fontSize: 12,
        paddingBottom: 10,
    },
    calendarDay: {
        width: '14.28%',
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    today: {
        width: 30,
        height: 30,
        backgroundColor: '#60a5fa',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    todayText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
export default BhwDashboardScreen;