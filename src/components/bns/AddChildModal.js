// src/components/bns/AddChildModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../context/NotificationContext';
import { logActivity } from '../../services/activityLogger';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';

// --- ICONS & HELPER COMPONENTS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const ProfileIcon = () => <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="#d1d5db"><Path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></Svg>;
const Checkbox = ({ label, value, onValueChange }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={() => onValueChange(!value)}>
        <View style={[styles.checkboxBase, value && styles.checkboxChecked]}>
            {value && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
);
const InputField = ({ label, value, onChangeText, ...props }) => (
    <View>
        <Text style={styles.label}>{label}</Text>
        <TextInput style={styles.input} value={value} onChangeText={onChangeText} {...props} />
    </View>
);

// --- FORM STEP COMPONENTS ---
const Step1 = ({ formData, handleChange }) => (
    <>
        <Text style={styles.sectionTitle}>Child & Family Information</Text>
        <InputField label="Name of BHS" value={formData.bhs_name || 'San Miguel'} onChangeText={t => handleChange('bhs_name', t)} />
        <InputField label="Name of Child" value={formData.child_name || ''} onChangeText={t => handleChange('child_name', t)} />
        <View style={styles.row}>
            <InputField containerStyle={{flex:1}} label="Date of Birth" placeholder="YYYY-MM-DD" value={formData.dob || ''} onChangeText={t => handleChange('dob', t)} />
            <InputField containerStyle={{flex:1}} label="Sex" placeholder="Male/Female" value={formData.sex || ''} onChangeText={t => handleChange('sex', t)} />
        </View>
        <InputField label="Place of Birth" value={formData.place_of_birth || ''} onChangeText={t => handleChange('place_of_birth', t)} />
        <InputField label="Name of Mother" value={formData.mother_name || ''} onChangeText={t => handleChange('mother_name', t)} />
        <InputField label="Name of Father" value={formData.father_name || ''} onChangeText={t => handleChange('father_name', t)} />
        <InputField label="Name of Guardian" value={formData.guardian_name || ''} onChangeText={t => handleChange('guardian_name', t)} />
    </>
);

const Step2 = ({ formData, handleChange }) => (
    <>
        <Text style={styles.sectionTitle}>Measurements & ID Numbers</Text>
        <View style={styles.row}>
            <InputField containerStyle={{flex:1}} label="Weight (kg)" value={formData.weight_kg || ''} onChangeText={t => handleChange('weight_kg', t)} keyboardType="numeric" />
            <InputField containerStyle={{flex:1}} label="Height (cm)" value={formData.height_cm || ''} onChangeText={t => handleChange('height_cm', t)} keyboardType="numeric" />
        </View>
        <InputField label="NHTS No." value={formData.nhts_no || ''} onChangeText={t => handleChange('nhts_no', t)} />
        <InputField label="PhilHealth No." value={formData.philhealth_no || ''} onChangeText={t => handleChange('philhealth_no', t)} />

        <Text style={styles.sectionTitle}>Mother's Immunization Status (Td)</Text>
        <View style={styles.grid}>
            {['Td1', 'Td2', 'Td3', 'Td4', 'Td5'].map(v => (
                <InputField containerStyle={styles.gridInput} key={v} label={v} placeholder="YYYY-MM-DD" value={formData[`mother_immunization_${v}`] || ''} onChangeText={t => handleChange(`mother_immunization_${v}`, t)} />
            ))}
        </View>

        <Text style={styles.sectionTitle}>Exclusive Breastfeeding</Text>
        <View style={styles.checkboxGrid}>
            {['1st Month', '2nd Month', '3rd Month', '4th Month', '5th Month', '6th Month'].map(month => <Checkbox key={month} label={month} value={!!formData[`breastfeeding_${month}`]} onValueChange={v => handleChange(`breastfeeding_${month}`, v)} />)}
        </View>

        <InputField label="Vitamin A (Date Given)" placeholder="YYYY-MM-DD" value={formData.vitamin_a_date || ''} onChangeText={t => handleChange('vitamin_a_date', t)} />
    </>
);

export default function AddChildModal({ onClose, onSave, mode = 'add', initialData = null }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [childId, setChildId] = useState('Loading...');
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData(initialData.health_details || {});
            setChildId(initialData.child_id);
        } else {
            const generateNewId = async () => {
                const { count } = await supabase.from('child_records').select('*', { count: 'exact', head: true });
                setChildId(`C-${String((count || 0) + 1).padStart(3, '0')}`);
            };
            generateNewId();
        }
    }, [mode, initialData]);

    const handleChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    const handleSave = async () => {
        setLoading(true);
        // ... (Logic to save or submit update request for child record)
        addNotification(mode === 'edit' ? 'Update request sent!' : 'Child added!', 'success');
        await logActivity(mode === 'edit' ? 'Update Child Request' : 'Add Child', `ID: ${childId}`);
        onSave();
        onClose();
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}><BackArrowIcon /></TouchableOpacity>
                <Text style={styles.headerTitle}>{mode === 'edit' ? 'Edit Child Record' : 'New Child Record'}</Text>
                <Text style={styles.stepIndicator}>Step {step} of 2</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.profileSection}>
                    <View style={styles.avatarPlaceholder}>
                        {childId.startsWith('C-') ? <QRCode value={childId} size={80} /> : <ProfileIcon />}
                    </View>
                    <Text style={styles.patientId}>Child ID: {childId}</Text>
                </View>
                {step === 1 && <Step1 formData={formData} handleChange={handleChange} />}
                {step === 2 && <Step2 formData={formData} handleChange={handleChange} />}
            </ScrollView>
            <View style={styles.footer}>
                {step > 1 && <TouchableOpacity style={styles.navButton} onPress={() => setStep(step - 1)}><Text style={styles.navButtonText}>Previous</Text></TouchableOpacity>}
                {step < 2 && <TouchableOpacity style={styles.navButton} onPress={() => setStep(step + 1)}><Text style={styles.navButtonText}>Next</Text></TouchableOpacity>}
                {step === 2 && (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Confirm & Save</Text>}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#e5e7eb' },
    headerTitle: { fontSize: 16, fontWeight: 'bold' },
    stepIndicator: { fontSize: 14, color: '#6b7280' },
    backButton: { padding: 5 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    profileSection: { alignItems: 'center', marginVertical: 10 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginBottom: 8, padding: 10 },
    patientId: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 5 },
    subSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 10 },
    inputContainer: { marginBottom: 15 },
    label: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
    input: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', fontSize: 16, marginBottom: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    inputRow: { flex: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridInput: { width: '32%', marginBottom: 10 },
    checkboxGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 12 },
    checkboxBase: { width: 22, height: 22, borderWidth: 2, borderColor: '#3b82f6', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#3b82f6' },
    checkmark: { color: 'white', fontWeight: 'bold' },
    checkboxLabel: { marginLeft: 8, fontSize: 14 },
    footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20, borderTopWidth: 1, borderColor: '#e5e7eb' },
    navButton: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: '#e5e7eb', borderRadius: 10 },
    navButtonText: { fontWeight: 'bold', color: '#374151' },
    saveButton: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: '#3b82f6', borderRadius: 10 },
    saveButtonText: { fontWeight: 'bold', color: 'white' },
});