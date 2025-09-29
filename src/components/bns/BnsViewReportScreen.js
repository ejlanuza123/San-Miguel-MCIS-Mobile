// src/components/bns/BnsViewReportScreen.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../context/AuthContext';
import Svg, { Path } from 'react-native-svg';

// --- ICONS & HELPERS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const FileIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><Path d="M13 2v7h7" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const StatCard = ({ value, label, color }) => ( <View style={styles.statCard}><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View> );
const Section = ({ title, children }) => ( <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text>{children}</View> );
const InfoRow = ({ label, value, valueColor = '#16a34a' }) => ( <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}:</Text><Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text></View> );

export default function BnsViewReportScreen({ route, navigation }) {
    const { quarter, allData } = route.params;
    const { profile } = useAuth();

    const stats = useMemo(() => {
        const totalAppointments = allData.appointments.length;
        const completed = allData.appointments.filter(a => a.status === 'Completed').length;
        const successRate = totalAppointments > 0 ? Math.round((completed / totalAppointments) * 100) : 0;
        return { totalAppointments, completed, successRate, totalChildren: allData.children.length };
    }, [allData]);

    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
        return `${header}\n${rows.join('\n')}`;
    };

    const handleShareFile = async (data, fileName) => {
        const csvData = convertToCSV(data);
        if (!csvData) {
            Alert.alert("No Data", `There is no data to export for ${fileName}.`);
            return;
        }
        try {
            const uri = FileSystem.documentDirectory + `${fileName.replace(/ /g, '_')}.csv`;
            await FileSystem.writeAsStringAsync(uri, csvData);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: `Share ${fileName}` });
            } else {
                Alert.alert("Sharing not available on this device.");
            }
        } catch (error) {
            Alert.alert("Error", "Could not generate or share the report file.");
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><BackArrowIcon /></TouchableOpacity>
                <Text style={styles.headerTitle}>Case Report</Text>
                <View style={{width: 24}}/>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Section title={quarter.name}>
                    <Text style={styles.summaryText}>Summary of Child Health Activities for Q{quarter.id}</Text>
                    <Text style={styles.dateText}>Issued on {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                </Section>
                <Section title="Case Information">
                    <InfoRow label="Case ID" value={`RPT-${quarter.year}-${quarter.id}`} valueColor="#374151" />
                    <InfoRow label="Status" value="Completed" />
                    <InfoRow label="Assigned To" value={`${profile?.first_name || ''} ${profile?.last_name || ''}`} valueColor="#374151" />
                    <InfoRow label="Department" value="Child Nutrition" valueColor="#374151" />
                </Section>
                <Section title="Attachments">
                    <TouchableOpacity style={styles.attachmentRow} onPress={() => handleShareFile(allData.children, "Child_Health_Report")}>
                        <FileIcon /><Text style={styles.attachmentText}>child_health_report.csv</Text><Text style={styles.viewText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachmentRow} onPress={() => handleShareFile(allData.inventory, "BNS_Inventory_Report")}>
                        <FileIcon /><Text style={styles.attachmentText}>bns_inventory_report.csv</Text><Text style={styles.viewText}>View</Text>
                    </TouchableOpacity>
                </Section>
                <Section title="Statistics">
                    <View style={styles.statsContainer}>
                        <StatCard value={stats.totalChildren} label="Total Children" color="#3b82f6" />
                        <StatCard value={stats.completed} label="Appts. Completed" color="#10b981" />
                        <StatCard value={`${stats.successRate}%`} label="Success Rate" color="#f59e0b" />
                    </View>
                </Section>
                 <Section title="Actions">
                    <TouchableOpacity style={styles.shareButton} onPress={() => handleShareFile(allData.children, "Full_Child_Health_Report")}>
                        <Text style={styles.shareButtonText}>Download Full Report</Text>
                    </TouchableOpacity>
                </Section>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#dbeafe' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
    summaryText: { fontSize: 16, color: '#374151', marginTop: 4 },
    dateText: { fontSize: 14, color: '#6b7280', marginTop: 10, borderTopWidth: 1, borderColor: '#f3f4f6', paddingTop: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    infoLabel: { color: '#6b7280', fontSize: 14 },
    infoValue: { fontWeight: 'bold', fontSize: 14 },
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