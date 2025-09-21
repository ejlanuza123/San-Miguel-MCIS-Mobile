import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const RoleSelectionScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Please select your role.</Text>
                
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => navigation.navigate('Login', { role: 'BHW' })}
                >
                    <Text style={styles.buttonText}>Barangay Health Worker</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('Login', { role: 'BNS' })}
                >
                    <Text style={styles.buttonText}>Barangay Nutrition Scholar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 16,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default RoleSelectionScreen;