// src/screens/QRScannerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';

// --- ICONS ---
const BackArrowIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const FlashIcon = ({ active }) => (
  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      stroke={active ? '#3b82f6' : '#333'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function QRScannerScreen({route}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState('off'); // "off" | "on" | "auto"
  const [hasFlash, setHasFlash] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    requestPermission();
  }, []);

  // Check if device has flash capability
  const checkFlashAvailability = async () => {
    // For expo-camera, we need to check camera capabilities
    // This is a simple workaround - you might need to implement
    // a more robust check based on your specific needs
    setHasFlash(true); // Assume it has flash for now
  };

  useEffect(() => {
    checkFlashAvailability();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
        if (scanned) {
            return;
        }
        setScanned(true);
        Vibration.vibrate();

        // 1. Determine the destination TAB and SCREEN names
        const returnScreen = route.params?.returnScreen;
        let tabName = 'Patient'; // This is the name of the Tab in your WorkerTabs
        let screenName = 'PatientManagement'; // This is the screen inside the BhwStack

        // If the return screen was a BNS screen, change the destination
        if (returnScreen === 'BnsDashboard' || returnScreen === 'ChildHealthRecords') {
            screenName = 'ChildHealthRecords';
        }

        // 2. Navigate to the parent tab, and pass the target screen as a parameter
        // This is the correct way to navigate to a nested screen from a modal.
        navigation.navigate('Main', {
            screen: tabName, // Go to the 'Patient' tab
            params: {
                screen: screenName, // THEN go to the 'PatientManagement' screen...
                params: {
                    scannedPatientId: data // ...and pass the scanned ID to it.
                }
            }
        });
    };

  const toggleFlash = () => {
    setFlashMode(current => current === 'off' ? 'on' : 'off');
  };

  if (!permission) {
    return (
      <View style={styles.centerText}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.centerText}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera.</Text>
        <Button onPress={requestPermission} title={'Grant Permission'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        enableTorch={flashMode === 'on'}  // ✅ Correct way
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.overlay}>
        {/* --- Header --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <BackArrowIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Scanner</Text>
          <TouchableOpacity
            onPress={toggleFlash}
            style={styles.iconButton}
            disabled={!hasFlash} // Disable if no flash available
          >
            <FlashIcon active={flashMode === 'on'} />
          </TouchableOpacity>
        </View>

        {/* --- QR Frame --- */}
        <View style={styles.content}>
          <View style={styles.scanBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>Position QR code within the frame</Text>
          {!hasFlash && (
            <Text style={styles.warningText}>Flash not available on this device</Text>
          )}
        </View>

        <View style={styles.footer} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centerText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  overlay: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#f0f4f8',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  iconButton: { padding: 10 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanBox: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: 'white' },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  instructionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  warningText: {
    color: 'yellow',
    fontSize: 14,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  footer: { height: 80 },
});