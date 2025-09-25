// src/components/bhw/ViewAppointmentModal.js
import React from 'react'; // No longer needs useState or useEffect
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- ICONS (remain the same) ---
const PatientIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#3b82f6" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></Svg>;
const CalendarIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#10b981" d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></Svg>;

const ViewAppointmentModal = ({ appointment, onClose }) => {
    // The modal is now simpler. It directly uses the 'patients' object
    // that was joined and passed in the 'appointment' prop.
    const patientData = appointment.patients; 

    return (
        <View style={styles.modalOverlay}>
            <Animated.View style={styles.modalContainer} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <View style={styles.header}>
                        <Image source={{ uri: `https://ui-avatars.com/api/?name=${appointment.patient_name}&background=random` }} style={styles.avatar} />
                        <View>
                            <Text style={styles.welcomeText}>Viewing Appointment for</Text>
                            <Text style={styles.userName}>{appointment.patient_name}</Text>
                        </View>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}><PatientIcon /><Text style={styles.cardTitle}>Patient Information</Text></View>
                            <Text style={styles.fieldLabel}>Full Name</Text>
                            <Text style={styles.fieldValue}>{appointment.patient_name}</Text>
                            <Text style={styles.fieldLabel}>Age</Text>
                            <Text style={styles.fieldValue}>{patientData?.age || 'N/A'} years old</Text>
                            <Text style={styles.fieldLabel}>Phone Number</Text>
                            <Text style={styles.fieldValue}>{patientData?.contact_no || 'N/A'}</Text>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}><CalendarIcon /><Text style={styles.cardTitle}>Appointment Details</Text></View>
                            <Text style={styles.fieldLabel}>Appointment Type</Text>
                            <Text style={styles.fieldValue}>{appointment.reason}</Text>
                            <Text style={styles.fieldLabel}>Location</Text>
                            <Text style={styles.fieldValue}>Brgy. San Miguel</Text>
                            <Text style={styles.fieldLabel}>Scheduled</Text>
                            <Text style={styles.fieldValue}>{`${new Date(appointment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${appointment.time}`}</Text>
                        </View>
                    </ScrollView>
                     <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Animated.View>
        </View>
    );
};

// Styles remain the same
const styles = StyleSheet.create({
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { width: '100%', height: '95%', backgroundColor: '#f0f4f8', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dbeafe', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    welcomeText: { fontSize: 14, color: '#6b7280' },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' },
    scrollContent: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    fieldLabel: { fontSize: 12, color: '#6b7280', marginTop: 10 },
    fieldValue: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 5 },
    closeButton: { backgroundColor: '#3b82f6', padding: 15, margin: 20, borderRadius: 10, alignItems: 'center' },
    closeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default ViewAppointmentModal;