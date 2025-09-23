import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { CameraView } from 'expo-camera';

const QRScannerScreen = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        // In the future, you will navigate to a patient's detail screen with this data
        alert(`QR code with data ${data} has been scanned!`);
        // Example: navigation.navigate('PatientDetails', { patientId: data });
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
});

export default QRScannerScreen;