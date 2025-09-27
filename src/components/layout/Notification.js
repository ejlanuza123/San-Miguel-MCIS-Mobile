// src/components/layout/Notification.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { Layout, FadeInUp, FadeOutUp } from 'react-native-reanimated';

// This is the visual component for a single notification pop-up
export default function Notification({ notification, onClear }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClear(notification.id);
        }, 4000); // Auto-dismiss after 4 seconds
        return () => clearTimeout(timer);
    }, [notification.id, onClear]);

    const typeStyles = {
        success: { backgroundColor: '#dcfce7', borderColor: '#4ade80', textColor: '#166534' },
        error: { backgroundColor: '#fee2e2', borderColor: '#f87171', textColor: '#991b1b' },
        warning: { backgroundColor: '#fef3c7', borderColor: '#facc15', textColor: '#b45309' },
    };
    
    const style = typeStyles[notification.type] || typeStyles.success;

    return (
        <Animated.View 
            layout={Layout} 
            entering={FadeInUp} 
            exiting={FadeOutUp}
            style={[styles.container, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}
        >
            <Text style={[styles.message, { color: style.textColor }]}>{notification.message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '95%',
        maxWidth: 400,
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 5,
        marginVertical: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    message: {
        fontWeight: '600',
    },
});