// src/components/bns/ViewChildModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';

// --- ICONS & HELPER COMPONENTS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const SectionHeader = ({ title }) => <Text style={styles.sectionTitle}>{title}</Text>;
const Field = ({ label, value }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
);
const CheckboxDisplay = ({ label, isChecked }) => (
    <View style={styles.checkboxContainer}>
        <View style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}>
            {isChecked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
);

export default function ViewChildModal({ child, onClose }) {
    const details = child.health_details || {};

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}><BackArrowIcon /></TouchableOpacity>
                <Text style={styles.headerTitle}>Child Health Record</Text>
                <View style={{width: 24}}/>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarPlaceholder}>
                        <QRCode value={child.child_id || 'N/A'} size={80} />
                    </View>
                    <Text style={styles.profileName}>{`${child.first_name} ${child.last_name}`}</Text>
                    <Text style={styles.patientId}>ID: {child.child_id}</Text>
                </View>

                <SectionHeader title="Child & Family Information" />
                <View style={styles.card}>
                    <View style={styles.row}><Field label="Date of Birth" value={child.dob} /><Field label="Sex" value={child.sex} /></View>
                    <Field label="Place of Birth" value={details.place_of_birth} />
                    <Field label="Mother's Name" value={child.mother_name} />
                    <Field label="Father's Name" value={details.father_name} />
                </View>

                <SectionHeader title="Nutritional Measurements" />
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Field label="Weight" value={`${child.weight_kg || 'N/A'} kg`} />
                        <Field label="Height" value={`${child.height_cm || 'N/A'} cm`} />
                    </View>
                    <Field label="Nutrition Status" value={child.nutrition_status} />
                </View>

                <SectionHeader title="Mother's Immunization Status" />
                <View style={styles.card}>
                    <View style={styles.grid}>
                        {['Td1', 'Td2', 'Td3', 'Td4', 'Td5'].map(v => <Field key={v} label={v} value={details[`mother_immunization_${v}`]} />)}
                    </View>
                </View>
                
                <SectionHeader title="Additional Health Records" />
                <View style={styles.card}>
                    <Text style={styles.subSectionTitle}>Exclusive Breastfeeding</Text>
                    <View style={styles.checkboxGrid}>
                        {['1st Month', '2nd Month', '3rd Month', '4th Month', '5th Month', '6th Month'].map(month => <CheckboxDisplay key={month} label={month} isChecked={!!details[`breastfeeding_${month}`]} />)}
                    </View>
                    <Field label="Vitamin A (Date Given)" value={details.vitamin_a_date} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#e5e7eb' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    profileSection: { alignItems: 'center', marginBottom: 15 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 8, padding: 10, elevation: 3 },
    profileName: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
    patientId: { fontSize: 14, color: '#6b7280', marginTop: 2 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
    subSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
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