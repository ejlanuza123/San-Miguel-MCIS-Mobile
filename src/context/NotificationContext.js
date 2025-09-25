// src/context/NotificationContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { Layout, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Notification from '../components/layout/Notification'; // We will create this next

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
                    <Animated.View key={n.id} layout={Layout} entering={FadeInUp} exiting={FadeOutUp}>
                        <Notification notification={n} onClear={removeNotification} />
                    </Animated.View>
                ))}
            </View>
        </NotificationContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Position notifications below the header
        right: 10,
        left: 10,
        zIndex: 1000,
        alignItems: 'center',
    }
});