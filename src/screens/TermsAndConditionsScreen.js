import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- NEW: Custom CheckBox component to replace the deprecated one ---
const CheckBox = ({ value, onValueChange, disabled }) => (
    <TouchableOpacity
        onPress={() => onValueChange(!value)}
        disabled={disabled}
        style={[styles.checkboxBase, value && styles.checkboxChecked]}
    >
        {value && <Text style={styles.checkMark}>✓</Text>}
    </TouchableOpacity>
);

const TermsAndConditionsScreen = ({ navigation }) => {
  const [agreed, setAgreed] = useState(false);
  const [canAgree, setCanAgree] = useState(false);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isScrolledToEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isScrolledToEnd) {
      setCanAgree(true);
    }
  };

  const handleAgree = async () => {
    if (agreed) {
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        navigation.replace('Auth'); // Go to the main Auth flow (Role Selection)
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.header}>Terms and Conditions</Text>
        <View style={styles.card}>
          <ScrollView style={styles.scrollView} onScroll={handleScroll} scrollEventThrottle={16}>
            <Text style={styles.heading}>1. Purpose of the System</Text>
            <Text style={styles.paragraph}>
              Welcome to the Barangay San Miguel Maternity and Childcare Inventory System. By accessing or using the System, you agree to comply with and be bound by the following terms and conditions.
            </Text>
            <Text style={styles.heading}>2. Authorized Users</Text>
            <Text style={styles.paragraph}>
              The System is accessible only to Barangay Health Workers (BHWs), Barangay Nutrition Scholars (BNS), Barangay Officials, and other authorized personnel as approved by the barangay council.
            </Text>
            <Text style={styles.heading}>3. User Responsibilities</Text>
            <Text style={styles.paragraph}>
              Provide accurate and current information when entering or updating any record in the System. Maintain the confidentiality of login credentials; accounts must not be shared.
            </Text>
          </ScrollView>
          <View style={styles.agreementContainer}>
            <CheckBox
              value={agreed}
              onValueChange={setAgreed}
              disabled={!canAgree}
            />
            <Text style={[styles.agreementText, !canAgree && styles.disabledText]}>
              Please check if you have read and agree to the terms and conditions.
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.button, (!agreed || !canAgree) && styles.buttonDisabled]} 
          disabled={!agreed || !canAgree}
          onPress={handleAgree}
        >
          <Text style={styles.buttonText}>Agree</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#2dd4bf' },
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    header: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginVertical: 20 },
    card: { flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 20, overflow: 'hidden' },
    scrollView: { flex: 1 },
    heading: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#333' },
    paragraph: { fontSize: 15, lineHeight: 24, color: '#555' },
    agreementContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee' },
    agreementText: { flex: 1, marginLeft: 10, fontSize: 14, color: '#555' },
    disabledText: { color: '#aaa' },
    button: { backgroundColor: '#2563eb', paddingVertical: 15, borderRadius: 30, marginTop: 20, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#9ca3af' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    checkboxBase: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2563eb', borderRadius: 4, marginRight: 8 },
    checkboxChecked: { backgroundColor: '#2563eb' },
    checkMark: { color: 'white', fontWeight: 'bold' }
});

export default TermsAndConditionsScreen;