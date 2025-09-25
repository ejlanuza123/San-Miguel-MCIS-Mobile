import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../../services/supabase';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native'; // 1. Import useFocusEffect
import { useHeader } from '../../context/HeaderContext';

// --- ICONS ---
const SearchIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24"><Path fill="#9e9e9e" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></Svg>;
const FilterIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></Svg>;
const AddUserIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24"><Path fill="white" d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></Svg>;

// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
    // Corrected status mapping
    const statusInfo = {
        'NORMAL': { backgroundColor: '#dcfce7', color: '#166534', label: 'Normal' },
        'MID RISK': { backgroundColor: '#fef3c7', color: '#b45309', label: 'Mid Risk' },
        'HIGH RISK': { backgroundColor: '#fee2e2', color: '#991b1b', label: 'High Risk' },
    };
    const info = statusInfo[status] || { backgroundColor: '#e5e7eb', color: '#374151', label: status };
    return (
        <View style={[styles.badge, { backgroundColor: info.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: info.color }]}>{info.label}</Text>
        </View>
    );
};

// This is the new colored tag legend
const StatusLegend = () => (
    <View style={styles.legendContainer}>
        <View style={[styles.legendTag, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.legendTagText, { color: '#166534' }]}>Normal</Text>
        </View>
        <View style={[styles.legendTag, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.legendTagText, { color: '#b45309' }]}>Mid Risk</Text>
        </View>
        <View style={[styles.legendTag, { backgroundColor: '#fee2e2' }]}>
            <Text style={[styles.legendTagText, { color: '#991b1b' }]}>High Risk</Text>
        </View>
    </View>
);

const PatientRow = ({ item }) => (
    <View style={styles.patientRow}>
        <Text style={[styles.rowText, styles.idColumn]}>{item.patient_id}</Text>
        <Text style={[styles.rowText, styles.nameColumn]}>{item.last_name}</Text>
        <Text style={[styles.rowText, styles.nameColumn]}>{item.first_name}</Text>
        <Text style={[styles.rowText, styles.ageColumn]}>{item.age}</Text>
        <View style={[styles.rowText, styles.statusColumn]}><StatusBadge status={item.risk_level} /></View>
    </View>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <View style={styles.paginationContainer}>
            <TouchableOpacity onPress={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                <Text style={[styles.paginationText, currentPage === 1 && styles.disabledText]}>
                {"< Prev"}
                </Text>
            </TouchableOpacity>
            <Text style={styles.paginationText}>{`${currentPage} / ${totalPages}`}</Text>
            <TouchableOpacity onPress={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                <Text style={[styles.paginationText, currentPage === totalPages && styles.disabledText]}>{"Next >"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};


// --- MAIN SCREEN COMPONENT ---
const PatientManagementScreen = () => {
    const [allPatients, setAllPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { searchTerm, setPlaceholder, setFilterOptions, setIsFilterOpen } = useHeader();

 
    useFocusEffect(
        useCallback(() => {
            setPlaceholder('Search patients by name...');
            
            // Define the options for the dropdown
            const options = [
                { label: 'All', onPress: () => setActiveFilter('All') },
                { label: 'Normal', onPress: () => setActiveFilter('NORMAL') },
                { label: 'Mid Risk', onPress: () => setActiveFilter('MID RISK') },
                { label: 'High Risk', onPress: () => setActiveFilter('HIGH RISK') },
            ].map(opt => ({
                ...opt,
                onPress: () => {
                    opt.onPress(); // Update the local state
                    setIsFilterOpen(false); // Close the dropdown
                }
            }));
            
            // Provide the options to the header
            setFilterOptions(options);

        }, [])
    );

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        let { data, error } = await supabase.from('patients').select('*').order('last_name', { ascending: true });
        if (error) console.error("Error fetching patients:", error);
        else setAllPatients(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const filteredPatients = useMemo(() => {
        let patients = allPatients;

        // 1. Filter by active risk level
        if (activeFilter !== 'All') {
            patients = patients.filter(p => p.risk_level === activeFilter);
        }

        // 2. Filter by search term
        if (searchTerm) {
            patients = patients.filter(p => 
                (p.first_name && p.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.last_name && p.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        return patients;
    }, [allPatients, searchTerm, activeFilter]);

    const paginatedPatients = useMemo(() => {
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage;
        return filteredPatients.slice(from, to);
    }, [filteredPatients, currentPage]);

    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    

    return (
        // --- MODIFIED: Removed SafeAreaView and Header. Content is now wrapped in a single View. ---
        <View style={styles.container}>
            <View style={styles.mainCard}>
                <Text style={styles.cardTitle}>Patient List</Text>
                <View style={styles.listHeader}>
                    <Text style={[styles.headerText, styles.idColumn]}>ID</Text>
                    <Text style={[styles.headerText, styles.nameColumn]}>Last Name</Text>
                    <Text style={[styles.headerText, styles.nameColumn]}>First Name</Text>
                    <Text style={[styles.headerText, styles.ageColumn]}>Age</Text>
                    <Text style={[styles.headerText, styles.statusColumn]}>Status</Text>
                </View>
                {loading ? (
                    <Text style={styles.loadingText}>Loading Patients...</Text>
                ) : (
                    <FlatList
                        data={paginatedPatients}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <PatientRow item={item} />}
                    />
                )}
            </View>
            <View style={styles.controlsContainer}>
                <View style={styles.filterContainer}>
                <StatusLegend />
                </View>
                <TouchableOpacity style={styles.addButton}>
                    <AddUserIcon />
                    <Text style={styles.addButtonText}>Add New Patient</Text>
                </TouchableOpacity>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8',
        paddingBottom: 80
     },
    mainCard: { 
        flex: 1, 
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: 20, // Space for the fixed header
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    },
    cardTitle: { fontSize: 20, fontWeight: 'bold', padding: 15, textAlign: 'center' },
    listHeader: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerText: { fontWeight: 'bold', color: '#6b7280', fontSize: 12 },
    patientRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    rowText: { fontSize: 14 },
    idColumn: { flex: 1.5, fontWeight: 'bold' },
    nameColumn: { flex: 2 },
    ageColumn: { flex: 1, textAlign: 'center' },
    statusColumn: { flex: 2, alignItems: 'center' },
    badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    loadingText: { textAlign: 'center', marginTop: 20, color: '#6b7280' },
    
    controlsContainer: { padding: 20 },
    legendContainer: {
    marginBottom: 15,
    },
        legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 15,
    },
    legendTag: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    legendTagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    
    addButton: { flexDirection: 'row', backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10 },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    paginationText: { color: '#3b82f6', fontWeight: '600' },
    disabledText: { color: '#9ca3af' },
});

export default PatientManagementScreen;