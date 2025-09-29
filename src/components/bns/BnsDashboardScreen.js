// src/components/bns/BnsDashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddBnsAppointmentModal from './AddBnsAppointmentModal';
import AddChildModal from './AddChildModal';
import ViewBnsAppointmentModal from './ViewBnsAppointmentModal';

// --- HELPER COMPONENTS ---
const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const changeMonth = (amount) => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + amount); return d; });
    const generateCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let days = [];
        for (let i = 0; i < firstDay; i++) { days.push(<View key={`pad-${i}`} style={styles.calendarDay} />); }
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
            days.push(<View key={i} style={styles.calendarDay}><View style={isToday ? styles.today : {}}><Text style={isToday && styles.todayText}>{i}</Text></View></View>);
        }
        return days;
    };
    return (
        <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth(-1)}><Text style={styles.arrow}>&lt;</Text></TouchableOpacity>
                <Text style={styles.calendarTitle}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                <TouchableOpacity onPress={() => changeMonth(1)}><Text style={styles.arrow}>&gt;</Text></TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(day => <Text key={day} style={styles.dayHeader}>{day}</Text>)}
                {generateCalendarGrid()}
            </View>
        </View>
    );
};

export default function BnsDashboardScreen() {
    const { profile } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [isAddAppointmentModalOpen, setIsAddAppointmentModalOpen] = useState(false);
    const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setIsViewModalOpen(true);
    };

    const fetchDashboardData = useCallback(async () => {
        if (!profile) return;
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('created_by', profile.id) // Only fetch appointments created by this BNS
            .gte('date', today)
            .order('date', { ascending: true })
            .order('time', { ascending: true })
            .limit(5);
        if (data) setAppointments(data);
    }, [profile]);

    // useFocusEffect ensures data is refreshed every time the screen is viewed
    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [fetchDashboardData])
    );
    

    return (
        <>
            <Modal visible={isAddAppointmentModalOpen} animationType="slide" onRequestClose={() => setIsAddAppointmentModalOpen(false)}>
                <AddBnsAppointmentModal onClose={() => setIsAddAppointmentModalOpen(false)} onSave={fetchDashboardData} />
            </Modal>
            <Modal visible={isAddChildModalOpen} animationType="slide" onRequestClose={() => setIsAddChildModalOpen(false)}>
                <AddChildModal onClose={() => setIsAddChildModalOpen(false)} onSave={fetchDashboardData} />
            </Modal>
            <Modal
                transparent={true}
                visible={isViewModalOpen}
                animationType="fade"
                onRequestClose={() => setIsViewModalOpen(false)}
                >
                <View style={styles.modalOverlay}>
                    {selectedAppointment && (
                    <ViewBnsAppointmentModal 
                        appointment={selectedAppointment} 
                        onClose={() => setIsViewModalOpen(false)} 
                    />
                    )}
                </View>
            </Modal>
            <SafeAreaView style={styles.container}>
                <View style={styles.contentArea}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Access</Text>
                        <View style={styles.quickAccessContainer}>
                            <TouchableOpacity style={[styles.quickButton, styles.orangeButton]} onPress={() => setIsAddAppointmentModalOpen(true)}>
                                <Text style={styles.quickButtonText}>Add Appointment</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.quickButton, styles.greenButton]} onPress={() => setIsAddChildModalOpen(true)}>
                                <Text style={styles.quickButtonText}>Add Patient</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {appointments.length > 0 ? appointments.map(app => (
                                <TouchableOpacity key={app.id} style={styles.appointmentCard} onPress={() => handleViewAppointment(app)}>
                                    <Text style={styles.appDay}>{new Date(app.date).toLocaleDateString('en-US', { weekday: 'long' })}</Text>
                                    <Text style={styles.appTime}>{app.time}</Text>
                                    <Text style={styles.appReason}>{app.reason}</Text>
                                </TouchableOpacity>
                            )) : (
                                <View style={styles.noAppointmentCard}><Text style={styles.noAppointmentText}>No upcoming appointments.</Text></View>
                            )}
                        </ScrollView>
                    </View>

                    {/* The Calendar now takes up the remaining space */}
                    <View style={{ flex: 1, paddingHorizontal: 20 }}>
                         <Calendar />
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    contentArea: { flex: 1, paddingTop: 0, marginTop: -30, paddingBottom: 42 }, 
    section: { paddingHorizontal: 20, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    quickAccessContainer: { flexDirection: 'row', gap: 15 },
    quickButton: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 3 },
    orangeButton: { backgroundColor: '#fb923c' },
    greenButton: { backgroundColor: '#22c55e' },
    quickButtonText: { color: 'white', fontWeight: 'bold' },
    appointmentCard: { backgroundColor: '#dbeafe', borderRadius: 15, padding: 15, marginRight: 10, width: 160, justifyContent: 'center' },
    appDay: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' },
    appTime: { fontSize: 28, fontWeight: 'bold', color: '#1e3a8a', marginVertical: 8 },
    appReason: { fontSize: 14, color: '#6b7280' },
    noAppointmentCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, height: 120, justifyContent: 'center', alignItems: 'center' },
    noAppointmentText: { color: '#6b7280', fontStyle: 'italic' },
    calendarContainer: { flex: 1, backgroundColor: 'white', borderRadius: 15, padding: 10, elevation: 2 }, // MODIFIED: Added flex: 1
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    calendarTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    arrow: { fontSize: 22, color: '#6b7280' },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayHeader: { width: '14.28%', textAlign: 'center', color: '#6b7280', fontWeight: 'bold', fontSize: 12, paddingBottom: 10 },
    calendarDay: { width: '14.28%', height: 35, justifyContent: 'center', alignItems: 'center' },
    today: { width: 30, height: 30, backgroundColor: '#60a5fa', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    todayText: { color: 'white', fontWeight: 'bold' },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    },
});
