import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { supabase } from '../services/supabase';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- (ICONS remain the same) ---
const UserIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12ZM12 15C8.68629 15 6 17.6863 6 21H18C18 17.6863 15.3137 15 12 15Z" fill="#9ca3af"/>
  </Svg>
);
const EmailIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#9ca3af"/>
  </Svg>
);
const LockIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M12 1.25C9.0967 1.25 6.75 3.5967 6.75 6.5V9.25H6C4.20507 9.25 2.75 10.7051 2.75 12.5V20C2.75 21.7949 4.20507 23.25 6 23.25H18C19.7949 23.25 21.25 21.7949 21.25 20V12.5C21.25 10.7051 19.7949 9.25 18 9.25H17.25V6.5C17.25 3.5967 14.9033 1.25 12 1.25ZM8.25 6.5C8.25 4.42893 9.92893 2.75 12 2.75C14.0711 2.75 15.75 4.42893 15.75 6.5V9.25H8.25V6.5Z" fill="#9ca3af"/>
  </Svg>
);
const BackArrowIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const RegisterScreen = ({ navigation }) => {
    const [patientId, setPatientId] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // NEW: State for the confirm password field
    const [loading, setLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('');

    useEffect(() => {
        const trimmedId = patientId.trim();
        if (trimmedId.length < 1) {
            setVerificationStatus('');
            setIsVerified(false);
            setFullName('');
            return;
        }
        setVerificationStatus('checking');
        const handler = setTimeout(async () => {
            const { data, error } = await supabase
                .from('patients')
                .select('first_name, middle_name, last_name')
                .eq('patient_id', trimmedId)
                .maybeSingle(); 
            if (data) {
                const constructedFullName = `${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`.trim().replace(/\s+/g, ' ');
                setVerificationStatus('verified');
                setIsVerified(true);
                setFullName(constructedFullName);
            } else {
                setVerificationStatus('not_found');
                setIsVerified(false);
                setFullName('');
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [patientId]);

    const handleSignUp = async () => {
        if (!isVerified) {
            Alert.alert("Verification Needed", "Patient ID not found. Please check the ID and try again.");
            return;
        }
        setLoading(true);
        
        // Step 1: Sign up the user in the auth system
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role: 'USER/MOTHER/GUARDIAN' }
            }
        });

        if (authError) {
            Alert.alert("Registration Error", authError.message);
            setLoading(false);
            return;
        }

        // Step 2: If sign-up was successful, call the new database function to link the records.
        if (authData.user) {
            // CHANGED: Instead of .update(), we now use .rpc() to call our secure function
            const { error: rpcError } = await supabase.rpc('link_patient_to_user', { 
                patient_id_to_link: patientId.trim(),
                user_id_to_set: authData.user.id
            });

            if (rpcError) {
                Alert.alert("Linking Error", "Your account was created, but we couldn't link it. Please contact support.");
            } else {
                Alert.alert("Registration Successful", "Please check your email to verify your account.");
                navigation.goBack();
            }
        }
        
        setLoading(false);
    };

    const VerificationIndicator = () => {
        if (verificationStatus === 'checking') return <Text style={styles.checkingText}>Checking ID in records...</Text>;
        if (verificationStatus === 'verified') return <Text style={styles.verifiedText}>✓ Patient Found! You can now register.</Text>;
        if (verificationStatus === 'not_found') return <Text style={styles.notFoundText}>✗ Patient ID not found in records.</Text>;
        return <Text style={styles.checkingText}> </Text>;
    };

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.background} resizeMode="cover">
            <SafeAreaView style={styles.container}>
                <Animated.View style={styles.card} entering={FadeInUp.duration(800)}>
                    <Text style={styles.title}>Sign Up</Text>
                    <View style={styles.inputContainer}>
                        <UserIcon />
                        <TextInput style={styles.input} placeholder="Patient ID No." value={patientId} onChangeText={setPatientId} autoCapitalize="none" />
                    </View>
                    <VerificationIndicator />
                    <View style={styles.inputContainer}>
                        <UserIcon />
                        <TextInput style={[styles.input, styles.readOnlyInput]} placeholder="Full Name (auto-filled)" value={fullName} editable={false} />
                    </View>
                    <View style={styles.inputContainer}>
                        <EmailIcon />
                        <TextInput style={styles.input} placeholder="Email Address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                    </View>
                    <View style={styles.inputContainer}>
                        <LockIcon />
                        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                    </View>
                    <View style={styles.inputContainer}>
                        <LockIcon />
                        <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                    </View>
                    <TouchableOpacity style={[styles.button, !isVerified && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading || !isVerified}>
                        <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.linkText}>Already have an account? Sign In</Text>
                    </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <BackArrowIcon />
                </TouchableOpacity>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
    card: { backgroundColor: 'white', borderRadius: 20, width: '85%', padding: 25, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 15, width: '100%', marginTop: 15 },
    input: { flex: 1, paddingVertical: 12, paddingLeft: 10, fontSize: 16, color: '#111827' },
    readOnlyInput: { color: '#6b7280' },
    button: { backgroundColor: '#2563eb', paddingVertical: 15, borderRadius: 10, alignItems: 'center', width: '100%', marginTop: 20 },
    buttonDisabled: { backgroundColor: '#9ca3af' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    linkText: { color: '#2563eb', marginTop: 20, fontWeight: '600' },
    backButton: { position: 'absolute', bottom: 80, padding: 12, backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: 30, },
    checkingText: { height: 18, fontSize: 12, color: '#6b7280', alignSelf: 'flex-start', marginLeft: 5, marginTop: 2 },
    verifiedText: { height: 18, fontSize: 12, color: '#16a34a', fontWeight: '600', alignSelf: 'flex-start', marginLeft: 5, marginTop: 2 },
    notFoundText: { height: 18, fontSize: 12, color: '#dc2626', fontWeight: '600', alignSelf: 'flex-start', marginLeft: 5, marginTop: 2 },
});

export default RegisterScreen;
