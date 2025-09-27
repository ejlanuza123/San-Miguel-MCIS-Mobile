// src/context/NotificationContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Notification from '../components/layout/Notification'; // Use a default import

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <View style={styles.container}>
                {notifications.map(n => (
                    <Notification key={n.id} notification={n} onClear={removeNotification} />
                ))}
            </View>
        </NotificationContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 85, // Position notifications below the header
        right: 10,
        left: 10,
        zIndex: 1000,
        alignItems: 'center',
    }
});