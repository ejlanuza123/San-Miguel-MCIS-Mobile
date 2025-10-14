// src/components/user/ScheduleAppointmentScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import CalendarPickerModal from '../../components/bhw/CalendarPickerModal';
import TimePickerModal from '../../components/common/TimePickerModal';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path } from 'react-native-svg';

// NEW: Icon for the back button
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;

export default function ScheduleAppointmentScreen({ navigation }) {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);

    // State for the form and modals
    const [reason, setReason] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState(''); // NEW: State for notes
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

    const isFormValid = reason && date && time;

    // Fixed time selection handler
    const handleTimeSelect = (selectedTime) => {
        setTime(selectedTime);
        setIsTimePickerOpen(false); // Close modal immediately after selection
    };

    const handleRequestAppointment = async () => {
        if (!isFormValid) {
            Alert.alert("Incomplete Form", "Please select a reason, date, and time.");
            return;
        }
        setLoading(true);

        const appointmentDetails = {
            patient_id_param: user.id,
            patient_display_id_param: profile.patient_id,
            patient_name_param: profile.full_name,
            reason_param: reason,
            date_param: date,
            time_param: time,
            notes_param: notes, // NEW: Add notes_param to the payload
        };

        const { error } = await supabase.rpc('request_appointment_and_notify_bhws', appointmentDetails);

        if (error) {
            Alert.alert('Error', 'Could not request appointment: ' + error.message);
        } else {
            Alert.alert("Request Sent", "Your appointment request has been sent successfully.");
            navigation.goBack();
        }
        setLoading(false);
    };

    return (
        <>
            <Modal 
                transparent={true} 
                visible={isCalendarOpen} 
                animationType="fade"
                onRequestClose={() => setIsCalendarOpen(false)}
            >
                <CalendarPickerModal 
                    onClose={() => setIsCalendarOpen(false)} 
                    onDateSelect={setDate} 
                    disableWeekends={true} 
                />
            </Modal>
            
            <TimePickerModal
                isVisible={isTimePickerOpen}
                onClose={() => setIsTimePickerOpen(false)}
                onTimeSelect={handleTimeSelect} // Use the fixed handler
            />

            <SafeAreaView style={styles.container}>
                {/* NEW: Header with a back button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <BackArrowIcon />
                    </TouchableOpacity>
                    <Text style={styles.title}>Schedule Appointment</Text>
                    <View style={{ width: 24 }} />
                </View>
                
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Appointment Details</Text>

                        {/* Appointment Type Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Appointment Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker 
                                    selectedValue={reason} 
                                    onValueChange={(itemValue) => setReason(itemValue)} 
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a reason..." value="" />
                                    <Picker.Item label="General Checkup" value="General Checkup" />
                                    <Picker.Item label="Vaccination" value="Vaccination" />
                                    <Picker.Item label="Prenatal Visit" value="Prenatal Visit" />
                                    <Picker.Item label="Postnatal Visit" value="Postnatal Visit" />
                                </Picker>
                            </View>
                        </View>

                        {/* Date and Time Pickers */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Date</Text>
                                <TouchableOpacity 
                                    style={styles.input} 
                                    onPress={() => setIsCalendarOpen(true)}
                                >
                                    <Text style={[styles.inputText, !date && styles.placeholderText]}>
                                        {date || 'Select Date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Time</Text>
                                <TouchableOpacity 
                                    style={styles.input} 
                                    onPress={() => setIsTimePickerOpen(true)}
                                >
                                    <Text style={[styles.inputText, !time && styles.placeholderText]}>
                                        {time || 'Select Time'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        {/* NEW: Notes input field */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Notes (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.notesInput]}
                                placeholder="Add any additional details for the health worker..."
                                placeholderTextColor="#9ca3af"
                                value={notes}
                                onChangeText={setNotes}
                                multiline={true}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.button, !isFormValid && styles.disabledButton]} 
                        onPress={handleRequestAppointment}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Send Request</Text>}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}

// NEW: Updated styles for the header and notes input
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 10, 
        paddingVertical: 15, 
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    backButton: { padding: 10 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    scrollContent: { padding: 20, paddingBottom: 20 },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 15, 
        padding: 20, 
        borderWidth: 1, 
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#831843', marginBottom: 15 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#9d174d', marginBottom: 8 },
    input: { 
        backgroundColor: 'white', 
        padding: 15, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#fbcfe8', 
        justifyContent: 'center', 
        height: 54 
    },
    inputText: { fontSize: 16, color: '#111827' },
    placeholderText: { color: '#9ca3af' },
    notesInput: { 
        height: 100, 
        textAlignVertical: 'top', 
        paddingTop: 15 
    },
    row: { flexDirection: 'row', gap: 15 },
    pickerContainer: { 
        borderWidth: 1, 
        borderColor: '#fbcfe8', 
        borderRadius: 10, 
        backgroundColor: 'white', 
        justifyContent: 'center',
        overflow: 'hidden'
    },
    picker: { 
        height: 54,
        color: '#111827'
    },
    footer: { 
        padding: 20, 
        borderTopWidth: 1, 
        borderColor: '#e5e7eb', 
        backgroundColor: 'white' 
    },
    button: { 
        backgroundColor: '#10b981', 
        padding: 15, 
        borderRadius: 15, 
        alignItems: 'center' 
    },
    disabledButton: { 
        backgroundColor: '#6ee7b7' 
    },
    buttonText: { 
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 16 
    },
});