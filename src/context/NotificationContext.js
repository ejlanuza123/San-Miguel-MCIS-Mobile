// src/context/NotificationContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import Notification from '../components/layout/Notification';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toastNotifications, setToastNotifications] = useState([]);

    // --- LOGIC FOR THE NOTIFICATION BELL ---
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

        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` },
                () => fetchNotifications()
            ).subscribe();

        return () => supabase.removeChannel(channel);
    }, [user, fetchNotifications]);
    
    // ADD THIS FUNCTION - Mark a single notification as read
    const markAsRead = async (notification) => {
        if (!user) return;
        
        console.log('Marking notification as read:', notification.id);
        
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notification.id)
            .eq('user_id', user.id);

        if (!error) {
            // Update local state immediately
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notification.id 
                        ? { ...n, is_read: true }
                        : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async () => {
        if (!user || unreadCount === 0) return;
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
            
        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    const deleteAll = async () => {
        if (!user) return;
        const { error } = await supabase.from('notifications').delete().eq('user_id', user.id);
        if (!error) {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const deleteOne = async (id) => {
        await supabase.from('notifications').delete().eq('id', id);
        // Re-fetching is okay here since it's a single, less frequent action
        fetchNotifications(); 
    };

    // --- LOGIC FOR POP-UP TOASTS ---
    const addNotification = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToastNotifications(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToastNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const value = {
        notifications,
        unreadCount,
        markAsRead, // ADD THIS - for single notification read
        markAllRead,
        deleteAll,
        deleteOne,
        addNotification, // This is for the pop-up toasts
        refetch: fetchNotifications, // Allow components to trigger a manual refresh
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <View style={styles.toastContainer}>
                {toastNotifications.map(n => (
                    <Notification key={n.id} notification={n} onClear={removeToast} />
                ))}
            </View>
        </NotificationContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        bottom: 95,
        right: 10,
        left: 10,
        zIndex: 1000,
        alignItems: 'center',
    }
});