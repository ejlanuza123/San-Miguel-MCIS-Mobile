// src/components/bhw/AddPatientModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../context/NotificationContext';
import { logActivity } from '../../services/activityLogger';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { getDatabase } from '../../services/database';
import NetInfo from '@react-native-community/netinfo';
import * as Crypto from 'expo-crypto';
import CalendarPickerModal from './CalendarPickerModal';

// --- ICONS & HELPER COMPONENTS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const ProfileIcon = () => <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="#d1d5db"><Path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></Svg>;
const CalendarIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M8 7V3M16 4V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const Checkbox = ({ label, value, onValueChange }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={() => onValueChange(!value)}>
        <View style={[styles.checkboxBase, value && styles.checkboxChecked]}>
            {value && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
);

// --- FORM STEP COMPONENTS ---
const Step1 = ({ formData, handleChange, setIsCalendarOpen, setCalendarField }) => (
    <>
        <Text style={styles.sectionTitle}>Personal & Contact Information</Text>
        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#9ca3af" value={formData.last_name} onChangeText={t => handleChange('last_name', t)} />
        <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#9ca3af" value={formData.first_name} onChangeText={t => handleChange('first_name', t)} />
        <TextInput style={styles.input} placeholder="Middle Name" placeholderTextColor="#9ca3af" value={formData.middle_name} onChangeText={t => handleChange('middle_name', t)} />
        
        <TouchableOpacity style={styles.dateInput} onPress={() => { setCalendarField('dob'); setIsCalendarOpen(true); }}>
            <Text style={[styles.inputText, !formData.dob && styles.placeholderText]}>
                {formData.dob || 'Date of Birth (YYYY-MM-DD)'}
            </Text>
            <CalendarIcon />
        </TouchableOpacity>

        <TextInput
            style={[styles.input, styles.readOnlyInput]}
            placeholder="Age"
            placeholderTextColor="#9ca3af"
            value={formData.age}
            editable={false}
        />
        <TextInput style={styles.input} placeholder="Blood Type" placeholderTextColor="#9ca3af" value={formData.blood_type} onChangeText={t => handleChange('blood_type', t)} />
        <TextInput style={styles.input} placeholder="Contact No." placeholderTextColor="#9ca3af" value={formData.contact_no} onChangeText={t => handleChange('contact_no', t)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Address (Purok, Street)" placeholderTextColor="#9ca3af" value={formData.address} onChangeText={t => handleChange('address', t)} />

        <Text style={styles.sectionTitle}>ID Numbers</Text>
        <TextInput style={styles.input} placeholder="NHTS No." placeholderTextColor="#9ca3af" value={formData.nhts_no} onChangeText={t => handleChange('nhts_no', t)} />
        <TextInput style={styles.input} placeholder="PhilHealth No." placeholderTextColor="#9ca3af" value={formData.philhealth_no} onChangeText={t => handleChange('philhealth_no', t)} />

        <Text style={styles.sectionTitle}>Obstetrical Score</Text>
        <View style={styles.grid}>
            <TextInput style={styles.gridInput} placeholder="G" placeholderTextColor="#9ca3af" value={formData.g_score} onChangeText={t => handleChange('g_score', t)} keyboardType="numeric" />
            <TextInput style={styles.gridInput} placeholder="P" placeholderTextColor="#9ca3af" value={formData.p_score} onChangeText={t => handleChange('p_score', t)} keyboardType="numeric" />
            <TextInput style={styles.gridInput} placeholder="Term" placeholderTextColor="#9ca3af" value={formData.term} onChangeText={t => handleChange('term', t)} keyboardType="numeric" />
            <TextInput style={styles.gridInput} placeholder="Preterm" placeholderTextColor="#9ca3af" value={formData.preterm} onChangeText={t => handleChange('preterm', t)} keyboardType="numeric" />
            <TextInput style={styles.gridInput} placeholder="Abortion" placeholderTextColor="#9ca3af" value={formData.abortion} onChangeText={t => handleChange('abortion', t)} keyboardType="numeric" />
            <TextInput style={styles.gridInput} placeholder="Living" placeholderTextColor="#9ca3af" value={formData.living_children} onChangeText={t => handleChange('living_children', t)} keyboardType="numeric" />
        </View>
    </>
);

const Step2 = ({ formData, handleChange, setIsCalendarOpen, setCalendarField }) => (
    <>
        <Text style={styles.sectionTitle}>Past Menstrual Period</Text>
        <TouchableOpacity style={styles.dateInput} onPress={() => { setCalendarField('lmp'); setIsCalendarOpen(true); }}>
            <Text style={[styles.inputText, !formData.lmp && styles.placeholderText]}>
                {formData.lmp || 'LMP (YYYY-MM-DD)'}
            </Text>
            <CalendarIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateInput} onPress={() => { setCalendarField('edc'); setIsCalendarOpen(true); }}>
            <Text style={[styles.inputText, !formData.edc && styles.placeholderText]}>
                {formData.edc || 'EDC (YYYY-MM-DD)'}
            </Text>
            <CalendarIcon />
        </TouchableOpacity>
        <TextInput style={styles.input} placeholder="Age of First Period" placeholderTextColor="#9ca3af" value={formData.age_first_period} onChangeText={t => handleChange('age_first_period', t)} keyboardType="numeric" />

        <Text style={styles.sectionTitle}>OB History</Text>
        <TextInput style={styles.input} placeholder="Age of Menarche" placeholderTextColor="#9ca3af" value={formData.age_of_menarche} onChangeText={t => handleChange('age_of_menarche', t)} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Amount of Bleeding (Scanty/Moderate/Heavy)" placeholderTextColor="#9ca3af" value={formData.bleeding_amount} onChangeText={t => handleChange('bleeding_amount', t)} />
        <TextInput style={styles.input} placeholder="Duration of Menstruation (days)" placeholderTextColor="#9ca3af" value={formData.menstruation_duration} onChangeText={t => handleChange('menstruation_duration', t)} keyboardType="numeric" />
    </>
);

const Step3 = ({ formData, handleChange }) => (
    <>
        <Text style={styles.sectionTitle}>Medical & Social History</Text>
        <Text style={styles.subSectionTitle}>Personal History</Text>
        <View style={styles.checkboxGrid}>
            {['Diabetes Mellitus', 'Asthma', 'CVD', 'Heart Disease', 'Goiter'].map(item => <Checkbox key={item} label={item} value={!!formData[`ph_${item}`]} onValueChange={v => handleChange(`ph_${item}`, v)} />)}
        </View>
        <Text style={styles.subSectionTitle}>Hereditary Disease History</Text>
        <View style={styles.checkboxGrid}>
            {['Hypertension', 'Asthma', 'Heart Disease', 'Diabetes Mellitus', 'Goiter'].map(item => <Checkbox key={item} label={item} value={!!formData[`hdh_${item}`]} onValueChange={v => handleChange(`hdh_${item}`, v)} />)}
        </View>
        <Text style={styles.subSectionTitle}>Social History</Text>
        <View style={styles.checkboxGrid}>
            {['Smoker', 'Ex-smoker', 'Alcohol Drinker', 'Substance Abuse'].map(item => <Checkbox key={item} label={item} value={!!formData[`sh_${item}`]} onValueChange={v => handleChange(`sh_${item}`, v)} />)}
        </View>
    </>
);

const Step4 = ({ formData, handleChange }) => (
    <>
        <Text style={styles.sectionTitle}>Vaccination & Other History</Text>
        <Text style={styles.subSectionTitle}>Tetanus Toxoid Vaccination</Text>
        <View style={styles.grid}>
            {['TT1', 'TT2', 'TT3', 'TT4', 'TT5'].map(vaccine => (
                <TextInput key={vaccine} style={styles.gridInput} placeholderTextColor="#9ca3af" placeholder={`${vaccine} Date`} value={formData[`vaccine_${vaccine}`] || ''} onChangeText={t => handleChange(`vaccine_${vaccine}`, t)} />
            ))}
        </View>
        <Text style={styles.subSectionTitle}>Allergy & Family Planning</Text>
        <TextInput style={styles.textArea} placeholder="History of Allergy and Drugs..." placeholderTextColor="#9ca3af" multiline value={formData.allergy_history} onChangeText={t => handleChange('allergy_history', t)} />
        <TextInput style={styles.textArea} placeholder="Family Planning History..." placeholderTextColor="#9ca3af" multiline value={formData.family_planning_history} onChangeText={t => handleChange('family_planning_history', t)} />
    </>
);

export default function AddPatientModal({ onClose, onSave, mode = 'add', initialData = null }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarField, setCalendarField] = useState('');

    const handleChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    useEffect(() => {
        if (formData.dob) {
            const birthDate = new Date(formData.dob);
            if (!isNaN(birthDate.getTime())) {
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDifference = today.getMonth() - birthDate.getMonth();
                if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                handleChange('age', age.toString());
            }
        }
    }, [formData.dob]);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData(typeof initialData.medical_history === 'string' ? JSON.parse(initialData.medical_history) : initialData.medical_history || {});
            setPatientId(initialData.patient_id);
            setFormData(prev => ({
                ...prev,
                last_name: initialData.last_name, first_name: initialData.first_name,
                middle_name: initialData.middle_name, age: initialData.age?.toString(),
                contact_no: initialData.contact_no,
            }));
        } else {
            const generateId = async () => {
                setPatientId('Loading...');
                const netInfo = await NetInfo.fetch();
                if (netInfo.isConnected) {
                    const { count, error } = await supabase
                        .from('patients')
                        .select('*', { count: 'exact', head: true });
                    if (error) {
                        setPatientId(`TEMP-${Crypto.randomUUID()}`);
                    } else {
                        const newId = `P-${String((count || 0) + 1).padStart(3, '0')}`;
                        setPatientId(newId);
                    }
                } else {
                    const uniqueId = `TEMP-${Crypto.randomUUID()}`;
                    setPatientId(uniqueId);
                }
            };
            generateId();
        }
    }, [mode, initialData]);

    const handleSave = async () => {
        // ... (handleSave logic remains the same)
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
                    onDateSelect={(date) => {
                        handleChange(calendarField, date);
                        setIsCalendarOpen(false);
                    }}
                    disableWeekends={false}
                />
            </Modal>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}><BackArrowIcon /></TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {mode === 'edit' ? 'Update Patient Record' : 'New Patient Record'}
                    </Text>
                    <Text style={styles.stepIndicator}>Step {step} of 4</Text>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.profileSection}>
                        <View style={styles.avatarPlaceholder}>
                            {patientId ? (
                                <QRCode
                                    value={patientId}
                                    size={80}
                                    backgroundColor="#f3f4f6"
                                />
                            ) : (
                                <ProfileIcon />
                            )}
                        </View>
                        <Text style={styles.patientId}>Patient ID: {patientId}</Text>
                    </View>
                    {step === 1 && <Step1 formData={formData} handleChange={handleChange} setIsCalendarOpen={setIsCalendarOpen} setCalendarField={setCalendarField} />}
                    {step === 2 && <Step2 formData={formData} handleChange={handleChange} setIsCalendarOpen={setIsCalendarOpen} setCalendarField={setCalendarField} />}
                    {step === 3 && <Step3 formData={formData} handleChange={handleChange} />}
                    {step === 4 && <Step4 formData={formData} handleChange={handleChange} />}
                </ScrollView>
                <View style={styles.footer}>
                    {step > 1 && <TouchableOpacity style={styles.navButton} onPress={() => setStep(step - 1)}><Text style={styles.navButtonText}>Previous</Text></TouchableOpacity>}
                    {step < 4 && <TouchableOpacity style={styles.navButton} onPress={() => setStep(step + 1)}><Text style={styles.navButtonText}>Next</Text></TouchableOpacity>}
                    {step === 4 && (
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Confirm & Save</Text>}
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#e5e7eb' },
    headerTitle: { fontSize: 16, fontWeight: 'bold' },
    stepIndicator: { fontSize: 14, color: '#6b7280' },
    backButton: { padding: 5 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    profileSection: { alignItems: 'center', marginBottom: 10 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    patientId: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginTop: 20, marginBottom: 15, borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 5 },
    subSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginTop: 15, marginBottom: 10 },
    input: { backgroundColor: '#f9fafb', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', fontSize: 16, marginBottom: 10, color: '#111827' },
    readOnlyInput: { backgroundColor: '#e5e7eb', color: '#6b7280' },
    dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 10 },
    inputText: { fontSize: 16, color: '#111827' },
    placeholderText: { color: '#9ca3af' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    inputRow: { width: '48%' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridInput: { width: '32%', textAlign: 'center', backgroundColor: '#f9fafb', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', fontSize: 14, marginBottom: 10 },
    checkboxGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 12 },
    checkboxBase: { width: 22, height: 22, borderWidth: 2, borderColor: '#3b82f6', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#3b82f6' },
    checkmark: { color: 'white', fontWeight: 'bold' },
    checkboxLabel: { marginLeft: 10, fontSize: 14 },
    textArea: { height: 100, textAlignVertical: 'top', backgroundColor: '#f9fafb', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', fontSize: 16, marginBottom: 10 },
    footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20, borderTopWidth: 1, borderColor: '#e5e7eb' },
    navButton: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: '#e5e7eb', borderRadius: 10 },
    navButtonText: { fontWeight: 'bold', color: '#374151' },
    saveButton: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: '#3b82f6', borderRadius: 10 },
    saveButtonText: { fontWeight: 'bold', color: 'white' },
});