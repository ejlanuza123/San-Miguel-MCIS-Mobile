// src/components/user/ViewUserRecords.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Svg, { Path } from 'react-native-svg';
import QRCodeSVG from 'react-native-qrcode-svg';

// --- Reusable Helper Components ---

const Section = ({ title, children, style }) => (
    <View style={[styles.section, style]}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>{children}</View>
    </View>
);

const Field = ({ label, value }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
);

const HistoryList = ({ title, items }) => (
    <Section title={title}>
        {Object.entries(items || {}).map(([key, value]) => (
            <View key={key} style={styles.historyItem}>
                <Text style={styles.historyText}>{key}</Text>
                <Text style={[styles.historyValue, value ? styles.historyValueYes : styles.historyValueNo]}>
                    {value ? 'Yes' : 'No'}
                </Text>
            </View>
        ))}
    </Section>
);

// --- Tab Scene Components ---

const ProfileScene = ({ record }) => (
    <ScrollView contentContainerStyle={styles.sceneContent}>
        <View style={styles.profileHeader}>
            <View style={styles.qrContainer}>
                {record?.patient_id ? (
                    <QRCodeSVG value={record.patient_id} size={100} />
                ) : (
                    <ActivityIndicator />
                )}
            </View>
            <Text style={styles.profileId}>{record?.patient_id || 'Loading...'}</Text>
            <Text style={styles.profileName}>{`${record?.first_name || ''} ${record?.last_name || ''}`}</Text>
        </View>

        <Section title="Personal Information">
            <Field label="Date of Birth" value={record?.dob} />
            <Field label="Age" value={record?.age} />
            <Field label="Blood Type" value={record?.medical_history?.blood_type} />
        </Section>

        <Section title="Contact & Address">
            <Field label="Contact No." value={record?.contact_no} />
            <Field label="Purok" value={record?.purok} />
            <Field label="Street" value={record?.street} />
            <Field label="SMS Notifications" value={record?.sms_notifications_enabled ? 'Enabled' : 'Disabled'} />
        </Section>

        <Section title="ID Numbers">
            <Field label="PhilHealth No." value={record?.medical_history?.philhealth_no} />
            <Field label="NHTS No." value={record?.medical_history?.nhts_no} />
        </Section>
        
        <Section title="Obstetrical Score">
             {/* Assuming obstetrical_score is an object in medical_history */}
            <View style={styles.obScoreGrid}>
                <Field label="G" value={record?.medical_history?.obstetrical_score?.g} />
                <Field label="P" value={record?.medical_history?.obstetrical_score?.p} />
                <Field label="T" value={record?.medical_history?.obstetrical_score?.term} />
                <Field label="P" value={record?.medical_history?.obstetrical_score?.preterm} />
                <Field label="A" value={record?.medical_history?.obstetrical_score?.abortion} />
                <Field label="L" value={record?.medical_history?.obstetrical_score?.living} />
            </View>
        </Section>
    </ScrollView>
);

const PregnancyScene = ({ record }) => (
    <ScrollView contentContainerStyle={styles.sceneContent}>
        <Section title="Menstrual & OB History">
            <Field label="Last Menstrual Period (LMP)" value={record?.medical_history?.lmp} />
            <Field label="Expected Date of Confinement (EDC)" value={record?.medical_history?.edc} />
            <Field label="Age of Menarche" value={record?.medical_history?.age_of_menarche} />
             <Field label="Bleeding Amount" value={record?.medical_history?.bleeding_amount} />
        </Section>
        
        <Section title="Pregnancy History">
            <Text style={styles.comingSoon}>Pregnancy history table coming soon.</Text>
        </Section>
    </ScrollView>
);

const MedicalScene = ({ record }) => (
    <ScrollView contentContainerStyle={styles.sceneContent}>
        <HistoryList title="Personal History" items={record?.medical_history?.personal_history} />
        <HistoryList title="Hereditary Disease History" items={record?.medical_history?.hereditary_history} />
        <HistoryList title="Social History" items={record?.medical_history?.social_history} />
        
        <Section title="Vaccination Record">
             {/* Assuming vaccinations is an object in medical_history */}
             {Object.entries(record?.medical_history?.vaccinations || {}).map(([vaccine, date]) => (
                <Field key={vaccine} label={vaccine.toUpperCase()} value={date} />
             ))}
        </Section>
    </ScrollView>
);

const TreatmentScene = ({ record }) => (
     <ScrollView contentContainerStyle={styles.sceneContent}>
        <Section title="Treatment & Records">
            <Text style={styles.comingSoon}>Individual treatment records and consultation history will be displayed here in a future update.</Text>
        </Section>
    </ScrollView>
);


// --- Main ViewUserRecords Component ---

export default function ViewUserRecords() {
    const { profile } = useAuth();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'profile', title: 'Profile' },
        { key: 'pregnancy', title: 'Pregnancy History' },
        { key: 'medical', title: 'Medical History' },
        { key: 'treatments', title: 'Treatments' },
    ]);

    useEffect(() => {
        const fetchRecord = async () => {
            if (!profile?.id) return;
            
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', profile.id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching patient record:", error);
            } else {
                setRecord(data);
            }
            setLoading(false);
        };
        fetchRecord();
    }, [profile]);

    const renderScene = ({ route }) => {
        if (loading) {
            return <ActivityIndicator size="large" color="#c026d3" style={{ marginTop: 50 }} />;
        }
        if (!record) {
             return <View style={styles.centered}><Text>No record found.</Text></View>;
        }
        switch (route.key) {
            case 'profile':
                return <ProfileScene record={record} />;
            case 'pregnancy':
                return <PregnancyScene record={record} />;
            case 'medical':
                return <MedicalScene record={record} />;
            case 'treatments':
                return <TreatmentScene record={record} />;
            default:
                return null;
        }
    };
    
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={props => (
                    <TabBar
                        {...props}
                        indicatorStyle={{ backgroundColor: '#c026d3' }}
                        style={{ backgroundColor: 'white', elevation: 1 }}
                        labelStyle={{ color: '#4b5563', fontSize: 10, fontWeight: 'bold' }}
                        scrollEnabled
                        tabStyle={{ width: 'auto' }}
                    />
                )}
            />
        </SafeAreaView>
    );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    sceneContent: { padding: 20, paddingBottom: 100 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    profileHeader: { alignItems: 'center', marginBottom: 20, padding: 20, backgroundColor: '#fdf2f8', borderRadius: 15 },
    qrContainer: { padding: 10, backgroundColor: 'white', borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    profileId: { marginTop: 10, fontWeight: 'bold', color: '#831843' },
    profileName: { fontSize: 22, fontWeight: 'bold', color: '#be185d' },
    
    section: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#fce7f3' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#9d174d', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#fce7f3' },
    sectionContent: {},
    
    fieldContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    fieldLabel: { color: '#6b7280', fontSize: 14 },
    fieldValue: { fontWeight: 'bold', color: '#374151', fontSize: 14 },

    obScoreGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    historyText: { fontSize: 14, color: '#374151' },
    historyValue: { fontSize: 14, fontWeight: 'bold' },
    historyValueYes: { color: '#16a34a' },
    historyValueNo: { color: '#ef4444' },

    comingSoon: { textAlign: 'center', color: '#6b7280', fontStyle: 'italic', paddingVertical: 20 },
});