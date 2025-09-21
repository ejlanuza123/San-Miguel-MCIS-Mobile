import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { supabase } from '../services/supabase';

const LoginScreen = ({ route }) => {
    const { role } = route.params;
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        let emailForLogin;

        if (loginIdentifier.includes('@')) {
            emailForLogin = loginIdentifier;
        } else {
            const { data, error } = await supabase.rpc('get_email_by_user_id', {
                user_id_param: loginIdentifier
            });
            if (error || !data) {
                Alert.alert("Error", "Invalid User ID. Please check and try again.");
                setLoading(false);
                return;
            }
            emailForLogin = data;
        }

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: emailForLogin,
            password: password
        });

        if (loginError) {
            Alert.alert("Login Failed", loginError.message);
            setLoading(false);
            return;
        }

        if (loginData.user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', loginData.user.id)
                .single();
            
            if (profileError || profile.role !== role) {
                Alert.alert("Role Mismatch", "This is not the role you registered with. Please select the correct role.");
                await supabase.auth.signOut();
            }
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Login as {role}</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Email or User ID No."
                    value={loginIdentifier}
                    onChangeText={setLoginIdentifier}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 18, color: 'gray', textAlign: 'center', marginBottom: 40 },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: { backgroundColor: '#2563eb', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default LoginScreen;