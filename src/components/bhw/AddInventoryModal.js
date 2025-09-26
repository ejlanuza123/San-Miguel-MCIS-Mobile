// src/components/bhw/AddInventoryModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../context/NotificationContext';
import { logActivity } from '../../services/activityLogger';

export default function AddInventoryModal({ onClose, onSave, mode = 'add', initialData = null }) {
    const [formData, setFormData] = useState({});
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);

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
        const dataToSave = { ...formData, quantity: parseInt(formData.quantity, 10) };

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
        <SafeAreaView style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{mode === 'edit' ? 'Edit Item' : 'Add New Item'}</Text>
            <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Item Name" value={formData.item_name || ''} onChangeText={t => handleChange('item_name', t)} />
                <TextInput style={styles.input} placeholder="Category (e.g., Medicines)" value={formData.category || ''} onChangeText={t => handleChange('category', t)} />
                <TextInput style={styles.input} placeholder="Quantity" value={String(formData.quantity || '')} onChangeText={t => handleChange('quantity', t)} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Unit (e.g., bottles, boxes)" value={formData.unit || ''} onChangeText={t => handleChange('unit', t)} />
                <TextInput style={styles.input} placeholder="Expiration Date (YYYY-MM-DD)" value={formData.expiration_date || ''} onChangeText={t => handleChange('expiration_date', t)} />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onClose}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={loading}>
                    <Text style={[styles.buttonText, styles.saveButtonText]}>{loading ? 'Saving...' : 'Save Item'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    form: { flex: 1 },
    input: { backgroundColor: '#f3f4f6', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#e5e7eb' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    button: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', backgroundColor: '#e5e7eb' },
    buttonText: { fontWeight: 'bold', fontSize: 16, color: '#374151' },
    saveButton: { backgroundColor: '#3b82f6' },
    saveButtonText: { color: 'white' },
});