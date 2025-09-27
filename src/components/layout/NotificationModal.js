// src/components/layout/NotificationModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// --- ICONS ---
const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const AlertIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626"><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></Svg>;
const ClockIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="#6b7280"><Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></Svg>;
const CalendarIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="#6b7280"><Path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></Svg>;
const CheckIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="#16a34a"><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></Svg>;
const TrashIcon = () => <Svg width="18" height="18" viewBox="0 0 24 24" fill="#9ca3af"><Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></Svg>;

const getIconForType = (type) => {
    if (type.includes('stock_alert')) return <AlertIcon />;
    if (type.includes('due_soon')) return <ClockIcon />;
    if (type.includes('appointment')) return <CalendarIcon />;
    return <CheckIcon />; // Default icon
};

const NotificationItem = ({ item, onDelete, onPress }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <View style={styles.iconContainer}>{getIconForType(item.type)}</View>
        <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
            <Text style={styles.itemMessage}>{item.message}</Text>
        </View>
        <View style={styles.metaContainer}>
            <Text style={styles.itemTime}>{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            <TouchableOpacity onPress={onDelete} style={{padding: 5}}><TrashIcon /></TouchableOpacity>
        </View>
    </TouchableOpacity>
);

export default function NotificationModal({ isVisible, onClose, notifications, onMarkAllRead, onDeleteAll, onDeleteOne, onNotificationPress }) {
    return (
        <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}><BackArrowIcon /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity onPress={onMarkAllRead}><Text style={styles.markReadText}>Mark all as read</Text></TouchableOpacity>
                </View>
                <FlatList
                    data={notifications}
                    renderItem={({ item }) => (
                        <NotificationItem 
                            item={item}
                            onPress={() => onNotificationPress(item)}
                            onDelete={() => onDeleteOne(item.id)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet.</Text>}
                    contentContainerStyle={{ padding: 10 }}
                />
                <View style={styles.footer}>
                    <TouchableOpacity onPress={onDeleteAll} style={styles.footerButton}>
                        <Text style={styles.footerButtonText}>Delete All Notifications</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#e5e7eb' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    markReadText: { color: '#3b82f6', fontWeight: '600' },
    itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#f3f4f6' },
    iconContainer: { marginRight: 15 },
    textContainer: { flex: 1 },
    itemTitle: { fontWeight: 'bold', fontSize: 16, color: '#111827' },
    itemMessage: { color: '#6b7280', fontSize: 14 },
    metaContainer: { alignItems: 'flex-end' },
    itemTime: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280' },
    footer: { padding: 15, borderTopWidth: 1, borderColor: '#e5e7eb' },
    footerButton: { padding: 15, borderRadius: 10, backgroundColor: '#fee2e2' },
    footerButtonText: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center' },
});