// src/components/bns/AddBnsAppointmentModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, ActivityIndicator , ScrollView} from 'react-native';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../context/NotificationContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logActivity } from '../../services/activityLogger';
import CalendarPickerModal from './CalendarPickerModal';
import TimePickerModal from '../common/TimePickerModal';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path } from 'react-native-svg';

// --- ICONS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const CalendarIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M8 7V3M16 4V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Svg>;

export default function AddBnsAppointmentModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({ patient_id: '', patient_name: '', reason: '', date: '', time: '' });
    const [loading, setLoading] = useState(false);
    const [allChildren, setAllChildren] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        const fetchAllChildren = async () => {
            const { data, error } = await supabase.from('child_records').select('id, child_id, first_name, last_name');
            if (error) console.error("Error fetching children:", error);
            else setAllChildren(data || []);
        };
        fetchAllChildren();
    }, []);

    const searchResults = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query) return [];
        return allChildren.filter(p => {
            const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
            return fullName.includes(query) || (p.child_id || '').toLowerCase().includes(query);
        });
    }, [searchQuery, allChildren]);

    const handlePatientSelect = (child) => {
        const fullName = `${child.first_name} ${child.last_name}`;
        setFormData(prev => ({ ...prev, patient_id: child.child_id, patient_name: fullName }));
        setSearchQuery(fullName);
        setIsSearching(false);
    };

    const handleSave = async () => {
        if (!formData.patient_id || !formData.date || !formData.time || !formData.reason) {
            addNotification('Please fill all required fields.', 'error');
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('appointments').insert([{
            patient_display_id: formData.patient_id,
            patient_name: formData.patient_name,
            reason: formData.reason,
            date: formData.date,
            time: formData.time,
            status: 'Scheduled',
            created_by: user?.id
        }]);

        if (error) {
            addNotification(`Error: ${error.message}`, 'error');
        } else {
            await logActivity('New BNS Appointment', `For ${formData.patient_name}`);
            addNotification('Appointment scheduled successfully.', 'success');
            onSave();
            onClose();
        }
        setLoading(false);
    };

    const isFormValid = formData.patient_id && formData.reason && formData.date && formData.time;

    return (
        <>
            <Modal transparent={true} visible={isCalendarOpen} animationType="fade"><CalendarPickerModal onClose={() => setIsCalendarOpen(false)} onDateSelect={(date) => setFormData(prev => ({...prev, date}))} disableWeekends={true} /></Modal>
            <Modal transparent={true} visible={isTimePickerOpen} animationType="fade"><TimePickerModal isVisible={isTimePickerOpen} onClose={() => setIsTimePickerOpen(false)} onTimeSelect={(time) => setFormData(prev => ({...prev, time}))} /></Modal>
            
            <SafeAreaView style={styles.container}>
                <View style={styles.header}><TouchableOpacity onPress={onClose}><BackArrowIcon /></TouchableOpacity><Text style={styles.headerTitle}>New Child Appointment</Text><View style={{width: 24}} /></View>
                <ScrollView contentContainerStyle={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Child's Name</Text>
                        <TextInput style={styles.input} placeholder="Type to search..." value={searchQuery} onChangeText={setSearchQuery} onFocus={() => setIsSearching(true)} />
                        {isSearching && searchResults.length > 0 && (
                            <View style={styles.searchResultsContainer}>
                                <FlatList data={searchResults.slice(0, 5)} keyExtractor={item => item.id.toString()} renderItem={({ item }) => (<TouchableOpacity style={styles.searchResultItem} onPress={() => handlePatientSelect(item)}><Text>{`${item.first_name} ${item.last_name} (${item.child_id})`}</Text></TouchableOpacity>)} />
                            </View>
                        )}
                    </View>
                    <View style={styles.inputGroup}><Text style={styles.label}>Child ID</Text><TextInput style={[styles.input, styles.readOnlyInput]} value={formData.patient_id} editable={false} /></View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Appointment Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.reason}
                                onValueChange={(itemValue) => setFormData(prev => ({...prev, reason: itemValue}))}
                                style={styles.picker} // Style for the picker text itself
                            >
                                <Picker.Item label="Select appointment type..." value="" />
                                <Picker.Item label="Child Checkup" value="Child Checkup" />
                                <Picker.Item label="Immunization" value="Immunization" />
                                <Picker.Item label="Nutrition Counseling" value="Nutrition Counseling" />
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Date</Text><TouchableOpacity style={styles.dateInput} onPress={() => setIsCalendarOpen(true)}><Text style={styles.dateText}>{formData.date || 'Select a date'}</Text><CalendarIcon /></TouchableOpacity></View>
                        <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Time</Text><TouchableOpacity style={styles.dateInput} onPress={() => setIsTimePickerOpen(true)}><Text style={styles.dateText}>{formData.time || 'Select a time'}</Text></TouchableOpacity></View>
                    </View>
                </ScrollView>
                <View style={styles.footer}><TouchableOpacity style={[styles.saveButton, !isFormValid && styles.disabledButton]} onPress={handleSave} disabled={!isFormValid || loading}>{loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Create Appointment</Text>}</TouchableOpacity></View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#e5e7eb' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    formContainer: { padding: 20 },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', color: '#4b5563', marginBottom: 8 },
    input: { backgroundColor: '#f3f4f6', padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
    readOnlyInput: { backgroundColor: '#e5e7eb', color: '#6b7280' },
    row: { flexDirection: 'row', gap: 10 },
    dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
    dateText: { fontSize: 16 },
    searchResultsContainer: { position: 'absolute', top: 80, left: 0, right: 0, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', zIndex: 10, maxHeight: 150 },
    searchResultItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    pickerContainer: {
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
    },
    picker: {
        // On Android, we remove the default underline by setting a background color
        // On iOS, this style helps align the text. Height is needed for both.
        height: 54, 
        backgroundColor: 'transparent',
    },
    footer: { padding: 20, borderTopWidth: 1, borderColor: '#e5e7eb' },
    saveButton: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center' },
    saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    disabledButton: { backgroundColor: '#9ca3af' },
});