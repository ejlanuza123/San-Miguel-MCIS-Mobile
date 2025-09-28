// src/components/bns/AddBnsAppointmentModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, FlatList, Modal } from 'react-native';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../context/NotificationContext';
import { logActivity } from '../../services/activityLogger';
import CalendarPickerModal from './CalendarPickerModal';

const CalendarIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M8 7V3M16 4V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Svg>;

export default function AddBnsAppointmentModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({ patient_id: '', patient_name: '', reason: '', date: '', time: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [allChildren, setAllChildren] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        const fetchAllChildren = async () => {
            const { data } = await supabase.from('child_records').select('id, child_id, first_name, last_name');
            setAllChildren(data || []);
        };
        fetchAllChildren();
    }, []);

    const searchResults = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query) return [];
        return allChildren.filter(p => {
            const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
            return fullName.includes(query) || (p.child_id || '').toLowerCase().includes(query);
        });
    }, [searchQuery, allChildren]);

    const handlePatientSelect = (child) => {
        const fullName = `${child.first_name} ${child.last_name}`;
        setFormData(prev => ({ ...prev, patient_id: child.child_id, patient_name: fullName }));
        setSearchQuery(fullName);
        setIsSearching(false);
    };
    
    const handleSave = async () => {
        if (!formData.patient_id) {
            addNotification('You must select a child from the search list.', 'error');
            return;
        }
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('appointments').insert([{
            patient_display_id: formData.patient_id,
            patient_name: formData.patient_name,
            reason: formData.reason,
            date: formData.date,
            time: formData.time,
            notes: formData.notes,
            status: 'Scheduled',
            created_by: user?.id
        }]);

        if (error) {
            addNotification(`Error: ${error.message}`, 'error');
        } else {
            await logActivity('New BNS Appointment', `For ${formData.patient_name} on ${formData.date}`);
            addNotification('New appointment scheduled successfully.', 'success');
            onSave();
            onClose();
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={{flex: 1}}>
             {/* ... UI for the modal form ... */}
        </SafeAreaView>
    );
}
// ... (Add styles for the modal form)