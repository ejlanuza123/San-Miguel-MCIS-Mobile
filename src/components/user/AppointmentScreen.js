// src/components/user/AppointmentScreen.js
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

// --- ICONS for Detail Card ---
const CalendarIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24" fill="#9d174d"><Path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></Svg>;
const ClockIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24" fill="#9d174d"><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" opacity=".3"/><Path d="M11 7h2v6h-2zm0 8h2v2h-2zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></Svg>;
const TypeIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24" fill="#9d174d"><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"/></Svg>;
const DoctorIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24" fill="#9d174d"><Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></Svg>;
const LocationIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24" fill="#9d174d"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></Svg>;

// --- Calendar Component ---
const Calendar = ({ appointments = [], onDateSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // NEW: Create a set of dates with appointments
    const appointmentDates = useMemo(() => 
        new Set(appointments.map(app => new Date(app.date).toDateString()))
    , [appointments]);

    const changeMonth = (amount) => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + amount); return d; });
    
    const generateCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let days = [];
        for (let i = 0; i < firstDay; i++) { days.push(<View key={`pad-${i}`} style={styles.calendarDay} />); }
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const hasAppointment = appointmentDates.has(date.toDateString());

            days.push(
                <TouchableOpacity key={i} style={styles.calendarDay} onPress={() => onDateSelect(date)}>
                    <View style={isSelected ? styles.selectedCircle : {}}>
                        <Text style={isSelected ? styles.selectedText : styles.dayText}>{i}</Text>
                    </View>
                     {/* NEW: Render the indicator dot */}
                    {hasAppointment && !isSelected && <View style={styles.appointmentIndicator} />}
                </TouchableOpacity>
            );
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

// --- Detail Card Component ---
const AppointmentDetailCard = ({ item }) => {
    const formatTime = (timeStr) => { /* Same time formatting function as dashboard */ };
    return (
        <View style={styles.detailCard}>
            <View style={styles.detailRow}><CalendarIcon /><Text style={styles.detailText}>{new Date(item.date).toDateString()}</Text></View>
            <View style={styles.detailRow}><ClockIcon /><Text style={styles.detailText}>{item.time}</Text></View>
            <View style={styles.detailRow}><TypeIcon /><Text style={styles.detailText}>{item.reason}</Text></View>
            <View style={styles.detailRow}><DoctorIcon /><Text style={styles.detailText}>{item.assigned_to || 'San Miguel Health Center'}</Text></View>
            <View style={styles.detailRow}><LocationIcon /><Text style={styles.detailText}>Barangay San Miguel</Text></View>
        </View>
    );
};

export default function AppointmentScreen() {
    const { user } = useAuth();
    const [allAppointments, setAllAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase.from('appointments').select('*').eq('created_by', user.id);
        if (!error) setAllAppointments(data || []);
        setLoading(false);
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            const fetchAppointments = async () => {
                if (!user) {
                    setLoading(false);
                    return;
                }
                setLoading(true);
                const { data, error } = await supabase.from('appointments').select('*').eq('created_by', user.id);
                if (!error) setAllAppointments(data || []);
                setLoading(false);
            };
            
            fetchAppointments();
        }, [user])
    );

    const appointmentsOnSelectedDate = useMemo(() => {
        return allAppointments.filter(app => new Date(app.date).toDateString() === selectedDate.toDateString());
    }, [allAppointments, selectedDate]);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Appointment</Text>
                <Calendar appointments={allAppointments} onDateSelect={setSelectedDate} selectedDate={selectedDate} />
                
                <Text style={[styles.title, { marginTop: 20 }]}>Appointment Details</Text>
                {loading ? <ActivityIndicator color="#c026d3" /> : (
                    appointmentsOnSelectedDate.length > 0 ? (
                        appointmentsOnSelectedDate.map(item => <AppointmentDetailCard key={item.id} item={item} />)
                    ) : (
                        <View style={styles.noAppointmentsContainer}>
                            <Text style={styles.emptyText}>No appointments for this day.</Text>
                        </View>
                    )
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// NEW: Styles to match the mockup
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    content: { padding: 20, paddingBottom: 100 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 15 },
    
    calendarContainer: { backgroundColor: '#fdf2f8', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#fbcfe8' },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    calendarTitle: { fontSize: 16, fontWeight: 'bold', color: '#9d174d' },
    arrow: { fontSize: 22, color: '#be185d', fontWeight: 'bold' },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayHeader: { width: `${100/7}%`, textAlign: 'center', color: '#6b7280', fontWeight: 'bold', fontSize: 12, paddingBottom: 10 },
    calendarDay: { width: `${100/7}%`, height: 35, justifyContent: 'center', alignItems: 'center' },
    dayText: { fontSize: 14, color: '#4b5563' },
    selectedCircle: { width: 30, height: 30, backgroundColor: '#db2777', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    selectedText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

    detailCard: { backgroundColor: '#fdf2f8', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#fbcfe8' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    detailText: { marginLeft: 15, fontSize: 16, color: '#374151', fontWeight: '500' },
    noAppointmentsContainer: { backgroundColor: '#f9fafb', padding: 30, borderRadius: 15, alignItems: 'center' },
    emptyText: { color: '#6b7280', fontStyle: 'italic' },
    appointmentIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9d174d',
    position: 'absolute',
    bottom: 4,
},
});