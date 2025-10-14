import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useNotification } from '../../context/NotificationContext';

// --- Calendar Component ---
const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (amount) => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + amount);
            return d;
        });
    };

    const generateCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let days = [];

        // Padding before start of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`pad-${i}`} style={styles.calendarDay} />);
        }

        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
            days.push(
                <View key={`day-${i}`} style={styles.calendarDay}>
                    <View style={isToday ? styles.todayCircle : {}}>
                        <Text style={isToday ? styles.todayText : styles.dayText}>{i}</Text>
                    </View>
                </View>
            );
        }
        return days;
    };

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <Text style={styles.arrow}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <Text style={styles.arrow}>{'>'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.calendarGrid}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <Text key={day} style={styles.dayHeader}>{day}</Text>
                ))}
                {generateCalendarGrid()}
            </View>
        </View>
    );
};

export default function UserDashboardScreen() {
    const { user, profile } = useAuth();
    const navigation = useNavigation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();
    const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);

    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('appointments')
            .select('id, date, time, reason, assigned_to')
            .eq('created_by', user.id)
            .gte('date', today)
            .order('date', { ascending: true })
            .order('time', { ascending: true })
            .limit(5);

        if (error) {
            console.error("Error fetching appointments:", error);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    }, [user]);

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;

            const fetchAppointmentsData = async () => {
            if (!user) return;
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('appointments')
                .select('id, date, time, reason, assigned_to')
                .eq('created_by', user.id)
                .gte('date', today)
                .order('date', { ascending: true })
                .order('time', { ascending: true })
                .limit(5);

            if (isActive) {
                if (error) {
                console.error("Error fetching appointments:", error);
                } else {
                setAppointments(data || []);
                }
                setLoading(false);
            }
            };

            fetchAppointmentsData();

            // cleanup
            return () => {
            isActive = false;
            };
        }, [user])
        );

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 === 0 ? 12 : h % 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    const handleFollowUp = async () => {
        Alert.alert(
            "Confirm Request",
            "This will notify a health worker that you are requesting a follow-up visit. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Request",
                    onPress: async () => {
                        setIsFollowUpLoading(true);
                        const { error } = await supabase.rpc('request_follow_up_and_notify_bhws', {
                            user_id_param: user.id,
                            user_name_param: profile?.full_name || "User"
                        });
                        if (error) {
                            addNotification('Could not send request: ' + error.message, 'error');
                        } else {
                            addNotification('Follow-up request sent successfully!', 'success');
                        }
                        setIsFollowUpLoading(false);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.content}>
                <Text style={styles.title}>Upcoming Appointment</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.horizontalScroll}
                    contentContainerStyle={styles.horizontalScrollContent}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#c026d3" />
                        </View>
                    ) : (
                        appointments.length > 0 ? appointments.map(app => (
                            <View key={app.id} style={styles.card}>
                                <Text style={styles.cardDay}>
                                    {new Date(app.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                </Text>
                                <Text style={styles.cardTime}>{formatTime(app.time)}</Text>
                                <Text style={styles.cardProvider}>{app.assigned_to || 'Pending Confirmation'}</Text>
                                <Text style={styles.cardType}>{app.reason}</Text>
                            </View>
                        )) : (
                            <View style={[styles.card, styles.noAppointmentCard]}>
                                <Text style={styles.noAppointmentText}>No upcoming appointments.</Text>
                            </View>
                        )
                    )}
                </ScrollView>

                <Calendar />

                <TouchableOpacity 
                    style={styles.followUpButton} 
                    onPress={handleFollowUp}
                    disabled={isFollowUpLoading}
                >
                    {isFollowUpLoading 
                        ? <ActivityIndicator color="white" /> 
                        : <Text style={styles.addButtonText}>Request Follow-up</Text>}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('ScheduleAppointment')}
                >
                    <Text style={styles.addButtonText}>+ Add New Appointment</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    content: { flex: 1, paddingTop: 10, paddingHorizontal: 20, paddingBottom: 50 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 15 },
    horizontalScroll: { marginHorizontal: -20 },
    horizontalScrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
    loadingContainer: { width: 220, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#fdf2f8', borderRadius: 20, padding: 20, marginRight: 15, width: 220, minHeight: 140, borderWidth: 1, borderColor: '#fbcfe8' },
    noAppointmentCard: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
    noAppointmentText: { color: '#6b7280', fontStyle: 'italic' },
    cardDay: { fontSize: 16, fontWeight: 'bold', color: '#9d174d' },
    cardTime: { fontSize: 32, fontWeight: 'bold', marginVertical: 4, color: '#be185d' },
    cardProvider: { fontSize: 15, fontWeight: '500', color: '#1f2937' },
    cardType: { fontSize: 14, color: '#4b5563' },
    calendarContainer: { backgroundColor: '#fdf2f8', borderRadius: 15, padding: 1, borderWidth: 1, borderColor: '#fbcfe8', marginTop: 10 },
    calendarHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    calendarTitle: { fontSize: 16, fontWeight: 'bold', color: '#9d174d', marginHorizontal: 30 },
    arrow: { fontSize: 22, color: '#be185d', fontWeight: 'bold' },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayHeader: { width: `${100/7}%`, textAlign: 'center', color: '#6b7280', fontWeight: 'bold', fontSize: 12, paddingBottom: 10 },
    calendarDay: { width: `${100/7}%`, height: 35, justifyContent: 'center', alignItems: 'center' },
    dayText: { fontSize: 14, color: '#4b5563' },
    todayCircle: { width: 30, height: 30, backgroundColor: '#db2777', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    todayText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    followUpButton: { backgroundColor: '#fb923c', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 15, marginVertical: -5 },
    addButton: { backgroundColor: '#10b981', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 15 },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});