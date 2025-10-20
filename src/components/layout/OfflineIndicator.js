import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { syncOfflineData, checkSyncNotifications } from '../../services/syncService';
import { useNotification } from '../../context/NotificationContext';

export default function OfflineIndicator() {
  const isOffline = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const { addNotification } = useNotification();
  
  const [showOnlineIndicator, setShowOnlineIndicator] = useState(false);

  useEffect(() => {
    let timer;
    if (isOffline) {
      setShowOnlineIndicator(false);
    } else {
      // When coming online, sync data and check notifications
      const syncData = async () => {
        try {
          console.log('Device came online, syncing data...');
          await syncOfflineData();
          await checkSyncNotifications(addNotification);
        } catch (error) {
          console.error('Error during auto-sync:', error);
        }
      };
      
      syncData();
      
      setShowOnlineIndicator(true);
      timer = setTimeout(() => {
        setShowOnlineIndicator(false);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [isOffline, addNotification]);

  if (isOffline) {
    return (
      <View style={[styles.container, { top: insets.top + 5 }]}>
        <Animated.View style={[styles.indicator, { backgroundColor: '#71717a' }]}>
          <Text style={styles.text}>You are currently offline</Text>
        </Animated.View>
      </View>
    );
  }

  if (showOnlineIndicator) {
    return (
      <View style={[styles.container, { top: insets.top + 5 }]}>
        <Animated.View 
          style={[styles.indicator, { backgroundColor: '#22c55e' }]}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(1000)}
        >
          <Text style={styles.text}>Internet Connected - Syncing data...</Text>
        </Animated.View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  indicator: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});