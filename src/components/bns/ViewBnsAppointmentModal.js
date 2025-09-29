// src/components/bns/ViewBnsAppointmentModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// --- ICONS & HELPERS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const PatientIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24" fill="#3b82f6"><Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></Svg>;
const CalendarIcon = () => <Svg width={24} height="24" viewBox="0 0 24 24" fill="#10b981"><Path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></Svg>;
const Section = ({ title, children }) => <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text>{children}</View>;
const Field = ({ label, value }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
);

export default function ViewBnsAppointmentModal({ appointment, onClose }) {
    const [childDetails, setChildDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildDetails = async () => {
            if (!appointment?.patient_display_id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const { data, error } = await supabase
                .from('child_records')
                .select('dob, sex, mother_name, health_details')
                .eq('child_id', appointment.patient_display_id)
                .single();

            if (error) console.error("Error fetching child details:", error);
            else setChildDetails(data);
            setLoading(false);
        };
        fetchChildDetails();
    }, [appointment]);

    return (
        <View style={styles.modalOverlay}>
            <Animated.View style={styles.modalContainer} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose}><BackArrowIcon /></TouchableOpacity>
                        <Text style={styles.headerTitle}>Appointment Details</Text>
                        <View style={{width: 24}}/>
                    </View>
                    {loading ? <ActivityIndicator style={{ flex: 1 }} size="large" color="#3b82f6" /> : (
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <Section title="Child Information">
                                <Field label="Full Name" value={appointment.patient_name} />
                                <Field label="Date of Birth" value={childDetails?.dob} />
                                <Field label="Sex" value={childDetails?.sex} />
                                <Field label="Mother's Name" value={childDetails?.mother_name} />
                            </Section>
                            <Section title="Appointment Details">
                                <Field label="Appointment Type" value={appointment.reason} />
                                <Field label="Date & Time" value={`${appointment.date} at ${appointment.time}`} />
                                <Field label="Notes" value={appointment.notes || 'No notes provided.'} />
                            </Section>
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', height: '70%', backgroundColor: '#f0f4f8', borderRadius: 20, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
    fieldContainer: { marginBottom: 10 },
    fieldLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
    fieldValue: { fontSize: 16, fontWeight: '500', color: '#111827' },
});