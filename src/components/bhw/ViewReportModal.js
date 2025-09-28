// src/components/bhw/ViewReportModal.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../context/AuthContext';
import Svg, { Path } from 'react-native-svg';


// --- ICONS & HELPER COMPONENTS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const FileIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><Path d="M13 2v7h7" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const StatCard = ({ value, label, color }) => (
    <View style={styles.statCard}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);
const Section = ({ title, children }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);
const InfoRow = ({ label, value, valueColor = '#16a34a' }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text>
    </View>
);

export default function BhwViewReportScreen({ route, navigation }) {
    const { quarter, allData } = route.params;
    const { profile } = useAuth();

    const stats = useMemo(() => {
        const totalAppointments = allData.appointments.length;
        const completed = allData.appointments.filter(a => a.status === 'Completed').length;
        const successRate = totalAppointments > 0 ? Math.round((completed / totalAppointments) * 100) : 0;
        
        // --- ADDED LOGIC ---
        // This filters the patients list to count how many are marked as 'HIGH RISK'
        const highRiskCount = allData.patients.filter(p => p.risk_level === 'HIGH RISK').length;

        return {
            totalAppointments,
            completed,
            successRate,
            totalPatients: allData.patients.length,
            highRiskCount, // --- ADDED VALUE ---
        };
    }, [allData]);

    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
            Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        return `${header}\n${rows.join('\n')}`;
    };

    // This function now handles sharing a SINGLE file and checks for data first
    const handleShareFile = async (data, fileName) => {
        const csvData = convertToCSV(data);
        if (!csvData) {
            Alert.alert("No Data", `There is no data to export for ${fileName}.`);
            return;
        }
        try {
            const uri = FileSystem.documentDirectory + `${fileName.replace(/ /g, '_')}.csv`;
            
            // CORRECTED: The encoding option is removed, as UTF8 is the default.
            await FileSystem.writeAsStringAsync(uri, csvData);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: `Share ${fileName}` });
            } else {
                Alert.alert("Sharing not available", "Sharing is not available on this device.");
            }
        } catch (error) {
            Alert.alert("Error", "Could not generate or share the report file.");
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* FIXED: Header is now styled correctly like the mockup */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><BackArrowIcon /></TouchableOpacity>
                <Text style={styles.headerTitle}>Case Report</Text>
                <View style={{ width: 28 }} />
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Section title={quarter.name}>
                    <Text style={styles.summaryText}>Summary of Prenatal Check-ups for Q{quarter.id}</Text>
                    <Text style={styles.dateText}>Issued on {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                </Section>
                <Section title="Case Information">
                    <InfoRow label="Case ID" value={`RPT-${quarter.year}-${quarter.id}`} valueColor="#374151" />
                    <InfoRow label="Status" value="Completed" />
                    <InfoRow label="Assigned To" value={`${profile?.first_name || ''} ${profile?.last_name || ''}`} valueColor="#374151" />
                    <InfoRow label="Department" value="Maternal Health" valueColor="#374151" />
                </Section>
                <Section title="Summary">
                    <Text style={styles.paragraph}>This report covers maternal health activities during Q{quarter.id} {quarter.year}. A total of <Text style={{fontWeight: 'bold'}}>{stats.totalPatients}</Text> patients were involved, achieving a <Text style={{fontWeight: 'bold'}}>{stats.successRate}%</Text> completion rate for appointments.</Text>
                </Section>
                <Section title="Attachments">
                    <TouchableOpacity style={styles.attachmentRow} onPress={() => handleShareFile(allData.patients, "Maternity_Patient_Report")}>
                        <FileIcon /><Text style={styles.attachmentText}>maternity_report.csv</Text><Text style={styles.viewText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachmentRow} onPress={() => handleShareFile(allData.appointments, "Appointments_Summary")}>
                        <FileIcon /><Text style={styles.attachmentText}>appointments_summary.csv</Text><Text style={styles.viewText}>View</Text>
                    </TouchableOpacity>
                </Section>
                <Section title="Statistics">
                    <View style={styles.statsContainer}>
                        <StatCard value={stats.totalAppointments} label="Total Appts." color="#3b82f6" />
                        <StatCard value={stats.completed} label="Completed" color="#10b981" />
                        <StatCard value={stats.highRiskCount} label="High Risk" color="#ef4444" />                         
                        <StatCard value={`${stats.successRate}%`} label="Success Rate" color="#f59e0b" />
                    </View>
                </Section>

                {/* FIXED: Added the Actions section with a functional Share button */}
                <Section title="Actions">
                    <TouchableOpacity style={styles.shareButton} onPress={() => handleShareFile(allData.patients, "Full_Patient_Report")}>
                        <Text style={styles.shareButtonText}>Download Full Report</Text>
                    </TouchableOpacity>
                </Section>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#dbeafe',marginBottom: 0, marginTop: -40 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 5 },
    scrollContent: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
    summaryText: { fontSize: 16, color: '#374151', marginTop: 4 },
    dateText: { fontSize: 14, color: '#6b7280', marginTop: 10, borderTopWidth: 1, borderColor: '#f3f4f6', paddingTop: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    infoLabel: { color: '#6b7280', fontSize: 14 },
    infoValue: { fontWeight: 'bold', fontSize: 14 },
    paragraph: { fontSize: 14, lineHeight: 22, color: '#374151' },
    attachmentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    attachmentText: { flex: 1, marginLeft: 12, color: '#374151', fontSize: 14 },
    viewText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 14 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    statCard: { alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: 'bold' },
    statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    shareButton: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    shareButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});