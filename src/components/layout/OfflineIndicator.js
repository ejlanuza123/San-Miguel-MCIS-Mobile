// src/components/layout/OfflineIndicator.js

import React, { useState, useEffect } from 'react'; // 1. Import useState and useEffect
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function OfflineIndicator() {
  const isOffline = useNetworkStatus();
  const insets = useSafeAreaInsets();
  
  // 2. Add state to control the visibility of the ONLINE indicator
  const [showOnlineIndicator, setShowOnlineIndicator] = useState(false);

  // 3. Use an effect to manage the timer
  useEffect(() => {
    let timer;
    if (isOffline) {
      // If offline, we don't need the online indicator, so ensure its state is false.
      setShowOnlineIndicator(false);
    } else {
      // If we just came online, show the indicator immediately.
      setShowOnlineIndicator(true);
      // Then, set a timer to hide it after 3 seconds (3000 milliseconds).
      timer = setTimeout(() => {
        setShowOnlineIndicator(false);
      }, 3000);
    }

    // Cleanup function: This will clear the timer if the user goes offline again
    // before the 3 seconds are up.
    return () => clearTimeout(timer);
  }, [isOffline]); // This effect runs every time the network status changes.


  // 4. Update the rendering logic
  if (isOffline) {
    // If offline, always show the persistent offline banner
    return (
      <View style={[styles.container, { top: insets.top + 5 }]}>
        <Animated.View style={[styles.indicator, { backgroundColor: '#71717a' }]}>
          <Text style={styles.text}>You are currently offline</Text>
        </Animated.View>
      </View>
    );
  }

  if (showOnlineIndicator) {
    // If online, only show the banner if `showOnlineIndicator` is true
    return (
      <View style={[styles.container, { top: insets.top + 5 }]}>
        <Animated.View 
          style={[styles.indicator, { backgroundColor: '#22c55e' }]}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(1000)} // Fade out slowly
        >
          <Text style={styles.text}>Internet Connected</Text>
        </Animated.View>
      </View>
    );
  }

  // If online and the timer has finished, render nothing.
  return null;
}

// Styles remain the same
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