// src/components/bhw/BhwAppointmentScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useHeader } from '../../context/HeaderContext';
import { useNotification } from '../../context/NotificationContext'; // <-- FIXED: Added missing import

// Import all your modals
import AddAppointmentModal from './AddAppointmentModal'; // <-- FIXED: Added missing import
import ViewAppointmentModal from './ViewAppointmentModal';

// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
    // Standardized colors and labels for consistency
    const statusInfo = {
        Scheduled: { backgroundColor: '#e0f2fe', color: '#0c4a6e', label: 'Scheduled' },
        Completed: { backgroundColor: '#dcfce7', color: '#166534', label: 'Confirmed' }, // Changed to Confirmed
        Cancelled: { backgroundColor: '#fee2e2', color: '#991b1b', label: 'Cancelled' }, // Changed to Cancelled
        Missed: { backgroundColor: '#fef3c7', color: '#b45309', label: 'Missed' },
    };
    const info = statusInfo[status] || { backgroundColor: '#e5e7eb', color: '#374151', label: status };
    return (
        <View style={[badgeStyles.badge, { backgroundColor: info.backgroundColor }]}>
            <Text style={[badgeStyles.badgeText, { color: info.color }]}>{info.label}</Text>
        </View>
    );
};

const StatusLegend = () => (
    <View style={styles.legendContainer}>
        <View style={[styles.legendTag, { backgroundColor: '#dcfce7' }]}><Text style={[styles.legendTagText, { color: '#166534' }]}>Confirmed</Text></View>
        <View style={[styles.legendTag, { backgroundColor: '#fef3c7' }]}><Text style={[styles.legendTagText, { color: '#b45309' }]}>Missed</Text></View>
        <View style={[styles.legendTag, { backgroundColor: '#ffedd5' }]}><Text style={[styles.legendTagText, { color: '#9a3412' }]}>Reschedule</Text></View>
    </View>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <View style={styles.paginationContainer}>
            <TouchableOpacity onPress={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                <Text style={[styles.paginationText, currentPage === 1 && { color: '#9ca3af' }]}>&lt; Prev</Text>
            </TouchableOpacity>
            <Text style={styles.paginationText}>{`Page ${currentPage} of ${totalPages}`}</Text>
            <TouchableOpacity onPress={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                <Text style={[styles.paginationText, currentPage === totalPages && { color: '#9ca3af' }]}>Next &gt;</Text>
            </TouchableOpacity>
        </View>
    );
};

export default function BhwAppointmentScreen() {
    const [allAppointments, setAllAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 5;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    
    const { searchTerm, setPlaceholder, setFilterOptions, setIsFilterOpen } = useHeader();
    const { addNotification } = useNotification();
    const [activeFilter, setActiveFilter] = useState('All');

    useFocusEffect(
        useCallback(() => {
            setPlaceholder('Search by patient name...');
            const options = [
                { label: 'All', onPress: () => setActiveFilter('All') },
                { label: 'Scheduled', onPress: () => setActiveFilter('Scheduled') },
                { label: 'Completed', onPress: () => setActiveFilter('Completed') },
                { label: 'Cancelled', onPress: () => setActiveFilter('Cancelled') },
                { label: 'Missed', onPress: () => setActiveFilter('Missed') },
            ].map(opt => ({...opt, onPress: () => { opt.onPress(); setIsFilterOpen(false); }}));
            setFilterOptions(options);
        }, [])
    );

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        // Start building the query
        let query = supabase
            .from('appointments')
            // This is the key fix: It now JOINS with the patients table and fetches all patient data (*)
            .select('*, patients(*)', { count: 'exact' }) 
            // This filter ensures we ONLY get appointments for PATIENTS (P-ID)
            .like('patient_display_id', 'P-%'); 

        if (activeFilter !== 'All') {
            query = query.eq('status', activeFilter);
        }
        if (searchTerm) {
            query = query.ilike('patient_name', `%${searchTerm}%`);
        }
        
        query = query.order('date', { ascending: false }).order('time', { ascending: false }).range(from, to);

        const { data, error, count } = await query;

        if (error) {
            addNotification('Error fetching appointments: ' + error.message, 'error');
        } else {
            setAllAppointments(data || []);
            setTotalRecords(count || 0);
        }
        setLoading(false);
    }, [currentPage, activeFilter, searchTerm, addNotification]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleViewAppointment = (item) => {
        setSelectedAppointment(item);
        setIsViewModalOpen(true);
    };

    const renderAppointment = ({ item }) => (
        <TouchableOpacity style={styles.appointmentRow} onPress={() => handleViewAppointment(item)}>
            <Text style={[styles.rowText, styles.idColumn]}>{item.patient_display_id}</Text>
            <Text style={[styles.rowText, styles.nameColumn]}>{item.patient_name.split(' ')[0]}</Text>
            <Text style={[styles.rowText, styles.appointmentColumn]}>{item.reason}</Text>
            {/* CORRECTED: Displaying the age from the joined patients table */}
            <Text style={[styles.rowText, styles.ageColumn]}>{item.patients?.age || 'N/A'}</Text>
            <View style={[styles.rowText, styles.statusColumn]}><StatusBadge status={item.status} /></View>
        </TouchableOpacity>
    );
    
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    return (
        <>
            {/* FIXED: Replaced AnimatePresence with standard React Native Modal for animations */}
            <Modal
                transparent={true}
                visible={isAddModalOpen}
                animationType="slide"
                onRequestClose={() => setIsAddModalOpen(false)}
            >
                <AddAppointmentModal onClose={() => setIsAddModalOpen(false)} onSave={fetchAppointments} />
            </Modal>

            <Modal
                transparent={true}
                visible={isViewModalOpen}
                animationType="fade"
                onRequestClose={() => setIsViewModalOpen(false)}
            >
                <ViewAppointmentModal appointment={selectedAppointment} onClose={() => setIsViewModalOpen(false)} />
            </Modal>

            <View style={styles.container}>
                <View style={styles.mainCard}>
                    <Text style={styles.cardTitle}>Appointment List</Text>
                    <View style={styles.listHeader}>
                        <Text style={[styles.headerText, styles.idColumn]}>ID</Text>
                        <Text style={[styles.headerText, styles.nameColumn]}>First Name</Text>
                        <Text style={[styles.headerText, styles.appointmentColumn]}>Appointment</Text>
                        <Text style={[styles.headerText, styles.ageColumn]}>Age</Text>
                        <Text style={[styles.headerText, styles.statusColumn]}>Status</Text>
                    </View>
                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#3b82f6" />
                    ) : (
                        <FlatList
                            data={allAppointments}
                            renderItem={renderAppointment}
                            keyExtractor={(item) => item.id.toString()}
                            ListEmptyComponent={<Text style={styles.emptyText}>No appointments found.</Text>}
                        />
                    )}
                </View>

                <View style={styles.controlsContainer}>
                    <StatusLegend />
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalOpen(true)}>
                        <Text style={styles.addButtonText}>Add New Appointment</Text>
                    </TouchableOpacity>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </View>
            </View>
        </>
    );
}

// Styles remain the same as the previous response
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8', paddingBottom: 80 },
    mainCard: { flex: 1, backgroundColor: 'white', marginHorizontal: 20, marginTop: 20, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, overflow: 'hidden' },
    cardTitle: { fontSize: 22, fontWeight: 'bold', padding: 20, textAlign: 'center' },
    listHeader: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerText: { fontWeight: 'bold', color: '#6b7280', fontSize: 12 },
    appointmentRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    rowText: { fontSize: 13 },
    idColumn: { flex: 1.5, fontWeight: 'bold' },
    nameColumn: { flex: 2 },
    appointmentColumn: { flex: 3 },
    ageColumn: { flex: 1, textAlign: 'center' },
    statusColumn: { flex: 2.5, alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 30, color: '#6b7280' },
    controlsContainer: { padding: 20 },
    legendContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 15 },
    legendTag: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
    legendTagText: { fontSize: 12, fontWeight: '600' },
    addButton: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
    addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    paginationText: { color: '#3b82f6', fontWeight: '600' },
});

const badgeStyles = StyleSheet.create({
    badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
});