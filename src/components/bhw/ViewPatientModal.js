// src/components/bhw/ViewPatientModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';

// --- ICONS & HELPER COMPONENTS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const CheckboxDisplay = ({ label, isChecked }) => (
    <View style={styles.checkboxContainer}>
        <View style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}>
            {isChecked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
);
const Field = ({ label, value }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
);
const SectionHeader = ({ title }) => <Text style={styles.sectionTitle}>{title}</Text>;

export default function ViewPatientModal({ patient, onClose }) {
    const details = patient.medical_history || {};

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}><BackArrowIcon /></TouchableOpacity>
                <Text style={styles.headerTitle}>Maternal Patient Record</Text>
                <View style={{width: 24}}/>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarPlaceholder}>
                        {patient.patient_id ? (
                            <QRCode 
                                value={patient.patient_id}
                                size={80} // Adjust size as needed
                                backgroundColor="white" // Match the card background
                            />
                        ) : null}
                    </View>
                    <Text style={styles.profileName}>{`${patient.first_name} ${patient.last_name}`}</Text>
                    <Text style={styles.patientId}>ID: {patient.patient_id}</Text>
                </View>
                <SectionHeader title="Personal Information" />
                <View style={styles.card}>
                    <View style={styles.row}><Field label="Patient ID" value={patient.patient_id} /><Field label="Age" value={patient.age} /></View>
                    <View style={styles.row}><Field label="Date of Birth" value={details.dob} /><Field label="Blood Type" value={details.blood_type} /></View>
                    <Field label="Address" value={details.address} />
                    <Field label="Contact No." value={patient.contact_no} />
                </View>

                <SectionHeader title="Obstetrical Score" />
                <View style={styles.card}>
                    <View style={styles.grid}>
                        <Field label="G" value={details.g_score} /><Field label="P" value={details.p_score} />
                        <Field label="Term" value={details.term} /><Field label="Preterm" value={details.preterm} />
                        <Field label="Abortion" value={details.abortion} /><Field label="Living" value={details.living_children} />
                    </View>
                </View>

                <SectionHeader title="Medical History" />
                <View style={styles.card}>
                    <Text style={styles.subSectionTitle}>Personal History</Text>
                    <View style={styles.checkboxGrid}>
                        {['Diabetes Mellitus', 'Asthma', 'CVD', 'Heart Disease', 'Goiter'].map(item => <CheckboxDisplay key={item} label={item} isChecked={!!details[`ph_${item}`]} />)}
                    </View>
                    <Text style={styles.subSectionTitle}>Hereditary History</Text>
                    <View style={styles.checkboxGrid}>
                        {['Hypertension', 'Asthma', 'Heart Disease', 'Diabetes Mellitus', 'Goiter'].map(item => <CheckboxDisplay key={item} label={item} isChecked={!!details[`hdh_${item}`]} />)}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 5 },
    scrollContent: { padding: 20 },
    profileSection: {
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        elevation: 3,
        padding: 10, // Padding to make the QR code look nice
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    patientId: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
    subSectionTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 10, marginBottom: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    fieldContainer: { flex: 1, marginHorizontal: 5 },
    fieldLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
    fieldValue: { fontSize: 16, fontWeight: '500', color: '#111827' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    checkboxGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 10 },
    checkboxBase: { width: 20, height: 20, borderWidth: 2, borderColor: '#3b82f6', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#3b82f6' },
    checkmark: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    checkboxLabel: { marginLeft: 8, fontSize: 14 },
});