// src\components\bhw\PatientManagementScreen.js
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native'; // 1. Import useFocusEffect
import { useHeader } from '../../context/HeaderContext';
import AddPatientModal from './AddPatientModal';
import ViewPatientModal from './ViewPatientModal';
import { useNotification } from '../../context/NotificationContext';
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from '../../services/database';

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

const PatientRow = ({ item, onPress }) => (
    <TouchableOpacity style={styles.patientRow} onPress={onPress}>
        {/* ... content of the row ... */}
        <Text style={[styles.rowText, styles.idColumn]}>{item.patient_id}</Text>
        <Text style={[styles.rowText, styles.nameColumn]}>{`${item.last_name}, ${item.first_name}`}</Text>
        <Text style={[styles.rowText, styles.ageColumn]}>{item.age}</Text>
        <View style={[styles.rowText, styles.statusColumn]}>
            <StatusBadge status={item.risk_level} />
        </View>
    </TouchableOpacity>
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
export default function PatientManagementScreen({ route, navigation }) {
    const [allPatients, setAllPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 5;
    
    const { searchTerm, setPlaceholder, setFilterOptions, setIsFilterOpen } = useHeader();
    const { addNotification } = useNotification();
    
    // State for modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // Default to 'add'
    const listRef = useRef(null);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
        };

    const paginatedPatients = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allPatients.slice(startIndex, endIndex);
        }, [allPatients, currentPage]);


    const handleViewPatient = (patient) => {
        setSelectedPatient(patient);
        setIsViewModalOpen(true);
    };

    useFocusEffect(
        useCallback(() => {
            setPlaceholder('Search patients by name...');
            const options = [
                { label: 'All', onPress: () => { setActiveFilter('All'); setCurrentPage(1); } },
                { label: 'Normal', onPress: () => { setActiveFilter('NORMAL'); setCurrentPage(1); } },
                { label: 'Mid Risk', onPress: () => { setActiveFilter('MID RISK'); setCurrentPage(1); } },
                { label: 'High Risk', onPress: () => { setActiveFilter('HIGH RISK'); setCurrentPage(1); } },
            ].map(opt => ({...opt, onPress: () => { opt.onPress(); setIsFilterOpen(false); }}));
            setFilterOptions(options);
        }, [setPlaceholder, setFilterOptions, setIsFilterOpen])
    );

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        const db = getDatabase();

        try {
            const netInfo = await NetInfo.fetch();
            
            if (netInfo.isConnected) {
                // ONLINE: Fetch from Supabase first
                console.log("Online - fetching from Supabase");
                const { data: supabaseData, error: supabaseError } = await supabase
                    .from('patients')
                    .select('*')
                    .order('last_name', { ascending: true });

                if (supabaseError) {
                    console.error("Supabase error:", supabaseError);
                    addNotification('Could not fetch latest patient data.', 'warning');
                    // Fall back to local data
                    await loadLocalData(db);
                } else if (supabaseData) {
                    // Update UI with fresh Supabase data immediately
                    let displayData = supabaseData;
                    
                    // Apply filters to Supabase data
                    if (activeFilter !== 'All') {
                        displayData = displayData.filter(patient => patient.risk_level === activeFilter);
                    }
                    if (searchTerm) {
                        const lowercasedQuery = searchTerm.toLowerCase();
                        displayData = displayData.filter(patient => {
                            const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
                            return fullName.includes(lowercasedQuery);
                        });
                    }
                    
                    setAllPatients(displayData);
                    setTotalRecords(displayData.length);
                    
                    // Update local cache in background
                    try {
                        await db.execAsync('DELETE FROM patients;');
                        
                        const stmt = await db.prepareAsync(
                            'INSERT OR REPLACE INTO patients (id, patient_id, first_name, last_name, age, risk_level, contact_no, purok, street, medical_history, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
                        );
                        
                        for (const patient of supabaseData) {
                            const historyString = typeof patient.medical_history === 'string' 
                                ? patient.medical_history 
                                : JSON.stringify(patient.medical_history || []);

                            await stmt.executeAsync([
                                patient.id, 
                                patient.patient_id, 
                                patient.first_name, 
                                patient.last_name, 
                                patient.age, 
                                patient.risk_level, 
                                patient.contact_no, 
                                patient.purok, 
                                patient.street, 
                                historyString, 
                                1 // is_synced = true
                            ]);
                        }
                        await stmt.finalizeAsync();
                    } catch (syncError) {
                        console.warn("Cache update warning:", syncError);
                    }
                }
            } else {
                // OFFLINE: Use local data only
                console.log("Offline - using local cache");
                await loadLocalData(db);
            }
        } catch (e) {
            console.error("Error loading patients:", e);
            addNotification('An error occurred while loading data.', 'error');
            // Try to load local data as fallback
            try {
                await loadLocalData(getDatabase());
            } catch (fallbackError) {
                console.error("Even local data failed:", fallbackError);
            }
        } finally {
            setLoading(false);
        }
    }, [addNotification, searchTerm, activeFilter]);

    // Add this helper function for local data loading
    const loadLocalData = async (db) => {
        let localData = await db.getAllAsync('SELECT * FROM patients ORDER BY last_name ASC;');

        // Apply filters to local data
        if (activeFilter !== 'All') {
            localData = localData.filter(patient => patient.risk_level === activeFilter);
        }
        if (searchTerm) {
            const lowercasedQuery = searchTerm.toLowerCase();
            localData = localData.filter(patient => {
                const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
                return fullName.includes(lowercasedQuery);
            });
        }
        
        setAllPatients(localData);
        setTotalRecords(localData.length);
    };

    // Fix the useEffect with proper debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPatients();
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [fetchPatients]);


    
    // --- THIS IS THE CRITICAL LOGIC FOR THE QR SCAN ---
    useEffect(() => {
        const scannedId = route.params?.scannedPatientId;
        if (scannedId) {
            const findAndEditPatient = async () => {
                setLoading(true);
                const netInfo = await NetInfo.fetch();

                let patient = null;
                let error = null;

                if (netInfo.isConnected) {
                    // ONLINE: Fetch from Supabase (your existing logic)
                    const { data, error: supabaseError } = await supabase.from('patients').select('*').eq('patient_id', scannedId).single();
                    patient = data;
                    error = supabaseError;
                } else {
                    // OFFLINE: Fetch from the local SQLite database
                    const db = getDatabase();
                    try {
                        const result = await db.getFirstAsync('SELECT * FROM patients WHERE patient_id = ?;', [scannedId]);
                        patient = result;
                    } catch (dbError) {
                        error = dbError;
                    }
                }

                setLoading(false);
                if (error || !patient) {
                    addNotification(`Patient ID "${scannedId}" not found.`, 'error');
                } else {
                    setSelectedPatient(patient);
                    setModalMode('edit');
                    setIsAddModalOpen(true);
                }
            };

            findAndEditPatient();
            navigation.setParams({ scannedPatientId: null });
        }
    }, [route.params?.scannedPatientId]);

    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    return (
        <>
            <Modal visible={isAddModalOpen} animationType="slide" onRequestClose={() => setIsAddModalOpen(false)}>
                <AddPatientModal 
                    mode={modalMode}
                    initialData={modalMode === 'edit' ? selectedPatient : null}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={fetchPatients}
                />
            </Modal>
            <Modal visible={isViewModalOpen} animationType="fade" transparent={true} onRequestClose={() => setIsViewModalOpen(false)}>
                <ViewPatientModal patient={selectedPatient} onClose={() => setIsViewModalOpen(false)} />
            </Modal>
            
            <View style={styles.container}>
                <View style={styles.mainCard}>
                    <Text style={styles.cardTitle}>Patient List</Text>
                    <View style={styles.listHeader}>
                        <Text style={[styles.headerText, styles.idColumn]}>ID</Text>
                        <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
                        <Text style={[styles.headerText, styles.ageColumn]}>Age</Text>
                        <Text style={[styles.headerText, styles.statusColumn]}>Status</Text>
                    </View>
                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#3b82f6" />
                    ) : (
                        <FlatList
                        ref={listRef}
                        data={paginatedPatients}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <PatientRow item={item} onPress={() => handleViewPatient(item)} />
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>No patients found.</Text>}
                        />
                    )}
                </View>
                <View style={styles.controlsContainer}>
                    <StatusLegend />
                    <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={() => {
                            setSelectedPatient(null);
                            setModalMode('add'); // Set mode to 'add' for new patient
                            setIsAddModalOpen(true);
                        }}
                    >
                        <AddUserIcon />
                        <Text style={styles.addButtonText}>Add New Patient</Text>
                    </TouchableOpacity>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </View>
            </View>
        </>
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

