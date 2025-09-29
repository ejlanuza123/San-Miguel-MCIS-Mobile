// src/components/bhw/ViewBhwInventoryModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather as Icon } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

// Helper component for the status badge
const StatusBadge = ({ status }) => {
    const statusStyles = {
        'Normal': { backgroundColor: '#dcfce7', color: '#166534' },
        'Low': { backgroundColor: '#fef3c7', color: '#b45309' },
        'Critical': { backgroundColor: '#fee2e2', color: '#991b1b' },
    };
    const style = statusStyles[status] || { backgroundColor: '#e5e7eb', color: '#374151' };
    return <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}><Text style={[styles.badgeText, { color: style.color }]}>{status}</Text></View>;
};

// Helper component for displaying a field
const Field = ({ label, value, children }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {children || <Text style={styles.fieldValue}>{value || 'N/A'}</Text>}
    </View>
);

export default function ViewBhwInventoryModal({ route, navigation }) {
    const { item } = route.params; // Get item data from navigation params
    const onClose = () => navigation.goBack();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <View style={styles.modalOverlay}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <Animated.View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="package" size={24} color="#4b5563" />
                        <Text style={styles.title}>Item Details</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="x" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardBody}>
                        <Field label="Item Name" value={item.item_name} />
                        <Field label="Category" value={item.category} />
                        <Field label="Stock" value={`${item.quantity} units`} />
                        <Field label="Status"><StatusBadge status={item.status} /></Field>
                        <View style={styles.divider} />
                        <Field label="Manufacture Date" value={formatDate(item.manufacture_date)} />
                        <Field label="Expiration Date" value={formatDate(item.expiry_date)} />
                    </View>
                    <View style={styles.cardFooter}>
                         <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(17, 24, 39, 0.6)' },
    safeArea: { width: '100%', alignItems: 'center' },
    card: { width: '90%', backgroundColor: '#f9fafb', borderRadius: 20, overflow: 'hidden', elevation: 15 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: 'white' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginLeft: 10, flex: 1 },
    closeButton: { padding: 5 },
    cardBody: { paddingVertical: 10, paddingHorizontal: 20 },
    fieldContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
    fieldLabel: { fontSize: 14, color: '#6b7280' },
    fieldValue: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
    divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10 },
    badge: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 15 },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    cardFooter: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    doneButton: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 12, alignItems: 'center' },
    doneButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});