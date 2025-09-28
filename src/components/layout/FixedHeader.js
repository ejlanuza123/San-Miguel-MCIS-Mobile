import React, { useState, useCallback,useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeader } from '../../context/HeaderContext'; // 1. Import useHeader
import { useRoute } from '@react-navigation/native';   // 2. Import useRoute
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'; // Import animation hooks
import NotificationModal from './NotificationModal';
import { supabase } from '../../services/supabase';

// --- ICONS ---
const NotificationIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></Svg>;
const SettingsIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path 
            d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" 
            stroke="#333" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <Path 
            d="M19.43 12.98L19.43 12.98C19.47 12.66 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.04L16.56 6.04C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.65 7.44 6.04L4.95 5.04C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.04 4.95 18.96L7.44 17.96C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.35 16.56 17.96L19.05 18.96C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98V12.98Z" 
            stroke="#333" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </Svg>
);
const SearchIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24"><Path fill="#9e9e9e" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></Svg>;
const QRScanIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 21h8v-8h-8v8zm2-6h4v4h-4v-4z"/></Svg>;
const FilterIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></Svg>;
const BellIcon = () => <Svg width={24} height={24} viewBox="0 0 24 24"><Path fill="#333" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></Svg>;
const FilterDropdown = ({ options, isVisible, onClose }) => {
    return (
        <Modal
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.filterOverlay} activeOpacity={1} onPress={onClose}>
                <Animated.View 
                    style={styles.filterDropdown} 
                    entering={FadeIn.duration(200)} 
                    exiting={FadeOut.duration(200)}
                    onStartShouldSetResponder={() => true} // Prevents taps from closing the modal
                >
                    {options.map((option, index) => (
                        <TouchableOpacity key={index} style={styles.filterOption} onPress={option.onPress}>
                            <Text style={styles.filterOptionText}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};
const FixedHeader = () => {
    const { profile, user } = useAuth();
    const navigation = useNavigation();
    
    const { searchTerm, setSearchTerm, placeholder, isFilterOpen, setIsFilterOpen, filterOptions } = useHeader();
    const route = useRoute();
    const showQrIcon = 
    route.name === 'BhwDashboard' || 
    route.name === 'PatientManagement' ||
    route.name === 'BnsDashboard' ||
    route.name === 'ChildHealthRecords';
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- NEW LOGIC FOR FETCHING AND SUBSCRIBING TO NOTIFICATIONS ---
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications(); // Fetch on initial load

        // Set up real-time subscription
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` },
                (payload) => {
                    fetchNotifications(); // Re-fetch when a change occurs
                }
            )
            .subscribe();

        // Cleanup subscription on component unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    // --- NEW HANDLER FUNCTIONS FOR MODAL ACTIONS ---
    const handleMarkAllRead = async () => {
        if (!user || unreadCount === 0) return; // Do nothing if there's nothing to mark

        // 1. Send the update request to the database
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        // 2. If the database update is successful, update the app's state directly
        if (!error) {
            // Update the local list of notifications to reflect the change
            setNotifications(currentNotifications => 
                currentNotifications.map(n => ({ ...n, is_read: true }))
            );
            // Manually set the unread count to 0
            setUnreadCount(0);
        } else {
            // If there was an error, you can notify the user
            console.error("Error marking notifications as read:", error);
        }
    };

    const handleDeleteAll = async () => {
        if (!user) return;
        await supabase.from('notifications').delete().eq('user_id', user.id);
        fetchNotifications(); // Refresh list
    };

    const handleDeleteOne = async (id) => {
        await supabase.from('notifications').delete().eq('id', id);
        fetchNotifications(); // Refresh list
    };
    
    const handleNotificationPress = async (notification) => {
        // Mark as read when clicked
        await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
        setIsNotifModalOpen(false); // Close modal
        // Navigate based on type
        switch (notification.type) {
            case 'inventory_alert':
                navigation.navigate('Main', { screen: 'Inventory' });
                break;
            case 'appointment_reminder':
            case 'patient_due_soon':
                navigation.navigate('Main', { screen: 'Appointment' });
                break;
            // Add more cases for other notification types
            default:
                break;
        }
    };

    return (
        <>
            <SafeAreaView style={styles.fixedHeaderContainer} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <Image source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name || 'U'}`}} style={styles.avatar} />
                        <View>
                            <Text style={styles.welcomeText}>Hi, Welcome Back</Text>
                            <Text style={styles.userName}>{profile?.first_name} {profile?.last_name}</Text>
                        </View>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={() => setIsNotifModalOpen(true)}>
                            <BellIcon />
                            {unreadCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <SettingsIcon />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.searchContainer}>
                    <SearchIcon />
                    <TextInput
                        placeholder={placeholder} // Use placeholder from context
                        style={styles.searchInput}
                        value={searchTerm} // Use value from context
                        onChangeText={setSearchTerm} // Use setter from context
                    />
                    
                    {/* 5. Conditionally render the QR icon */}
                    {showQrIcon && (
                        <TouchableOpacity onPress={() => navigation.navigate('QRScanner', { returnScreen: route.name })}>
                            <QRScanIcon />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => setIsFilterOpen(true)}>
                            <FilterIcon />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <NotificationModal 
                isVisible={isNotifModalOpen}
                onClose={() => setIsNotifModalOpen(false)}
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                onDeleteAll={handleDeleteAll}
                onDeleteOne={handleDeleteOne}
                onNotificationPress={handleNotificationPress}
            />
            <FilterDropdown 
                isVisible={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                options={filterOptions}
            />
        </>

    );
};

const styles = StyleSheet.create({
    fixedHeaderContainer: {
        backgroundColor: '#dbeafe',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 35,
    },
    profileInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    welcomeText: { fontSize: 14, color: '#6b7280' },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' },
    headerIcons: { flexDirection: 'row', gap: 15 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginHorizontal: 20,
        marginTop: -20,
        marginBottom: 10,
        gap: 10,
        elevation: 5,
    },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 16 },
    filterOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'flex-end',
    },
    filterDropdown: {
        position: 'absolute',
        top: 110, // Adjust this value to position it correctly below your header
        right: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    filterOption: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    filterOptionText: {
        fontSize: 16,
        color: '#333',
    },
    badgeContainer: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#dc2626', // Red
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
export default FixedHeader;