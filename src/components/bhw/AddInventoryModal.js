// src/components/bhw/AddInventoryModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../context/NotificationContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logActivity } from '../../services/activityLogger';
import CalendarPickerModal from './CalendarPickerModal'; // Make sure this path is correct
import Svg, { Path } from 'react-native-svg';

const CalendarIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M8 7V3M16 4V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Svg>;

export default function AddInventoryModal({ onClose, onSave, mode = 'add', initialData = null }) {
    const [formData, setFormData] = useState({});
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State to control the calendar modal
    const [isManufactureCalendarOpen, setIsManufactureCalendarOpen] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData(initialData);
        }
    }, [mode, initialData]);

    const handleChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    const handleSave = async () => {
        if (!formData.item_name || !formData.category || !formData.quantity) {
            addNotification('Please fill all required fields.', 'error');
            return;
        }
        setLoading(true);
        let result;
        
        // This object now includes manufacture_date
        const dataToSave = { 
            item_name: formData.item_name,
            category: formData.category,
            quantity: parseInt(formData.quantity, 10),
            manufacture_date: formData.manufacture_date, // <-- ADDED
            expiry_date: formData.expiry_date,
        };

        if (mode === 'edit') {
            result = await supabase.from('inventory').update(dataToSave).eq('id', initialData.id);
        } else {
            result = await supabase.from('inventory').insert([dataToSave]);
        }

        if (result.error) {
            addNotification(`Error: ${result.error.message}`, 'error');
        } else {
            const action = mode === 'edit' ? 'BHW Inventory Updated' : 'New BHW Item Added';
            addNotification(`Item ${mode === 'edit' ? 'updated' : 'added'} successfully.`, 'success');
            await logActivity(action, `Item: ${formData.item_name}`);
            onSave();
            onClose();
        }
        setLoading(false);
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
                    onDateSelect={(date) => handleChange('expiry_date', date)}
                    disableWeekends={false} // Allow selecting weekends for expiry dates
                />
            </Modal>
            <Modal
                transparent={true}
                visible={isManufactureCalendarOpen}
                animationType="fade"
                onRequestClose={() => setIsManufactureCalendarOpen(false)}
            >
                <CalendarPickerModal
                    onClose={() => setIsManufactureCalendarOpen(false)}
                    onDateSelect={(date) => handleChange('manufacture_date', date)}
                    disableWeekends={false}
                />
            </Modal>

            <SafeAreaView style={styles.modalContainer}>
                <Text style={styles.modalTitle}>{mode === 'edit' ? 'Edit Item' : 'Add New Item'}</Text>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Item Name</Text>
                        <TextInput style={styles.input} placeholder="Enter item name" value={formData.item_name || ''} onChangeText={t => handleChange('item_name', t)} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <TextInput style={styles.input} placeholder="Medicines, Equipment, etc." value={formData.category || ''} onChangeText={t => handleChange('category', t)} />
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, {flex: 1}]}>
                            <Text style={styles.label}>Quantity</Text>
                            <TextInput style={styles.input} value={String(formData.quantity || '')} onChangeText={t => handleChange('quantity', t)} keyboardType="numeric" />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Manufacture Date</Text>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setIsManufactureCalendarOpen(true)}>
                            <Text style={styles.dateText}>{formData.manufacture_date || 'Select a date'}</Text>
                            <CalendarIcon />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Expiration Date</Text>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setIsCalendarOpen(true)}>
                            <Text style={styles.dateText}>{formData.expiry_date || 'Select a date'}</Text>
                            <CalendarIcon />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={onClose}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={loading}>
                        <Text style={[styles.buttonText, styles.saveButtonText]}>{loading ? 'Saving...' : 'Save Item'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    form: { flex: 1 },
    row: { flexDirection: 'row', gap: 10 },
    inputGroup: {
        marginBottom: 15,
    },
    label: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#4b5563', 
        marginBottom: 8 
    },
    input: { 
        backgroundColor: '#f3f4f6', 
        padding: 15, 
        borderRadius: 10, 
        fontSize: 16, 
        // marginBottom: 15, <-- REMOVED from here
        borderWidth: 1, 
        borderColor: '#e5e7eb' 
    },
    dateInput: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#f3f4f6', 
        paddingHorizontal: 15, 
        paddingVertical: 15, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#e5e7eb' 
    },
    dateText: { 
        fontSize: 16, 
        color: '#1f2937' 
    },
    buttonContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        gap: 10 
    },
    button: { 
        flex: 1, 
        padding: 15, 
        borderRadius: 10, 
        alignItems: 'center', 
        backgroundColor: '#e5e7eb' 
    },
    buttonText: { 
        fontWeight: 'bold', 
        fontSize: 16, 
        color: '#374151' 
    },
    saveButton: { 
        backgroundColor: '#3b82f6' 
    },
    saveButtonText: { 
        color: 'white' 
    },
});