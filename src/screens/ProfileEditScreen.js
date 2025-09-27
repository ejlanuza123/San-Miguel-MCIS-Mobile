// src/screens/ProfileEditScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { useNotification } from '../context/NotificationContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';

const BackArrowIcon = () => <Svg width="24" height="24" viewBox="0 0 24 24" fill="none"><Path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></Svg>;
const EditIcon = () => <Svg width="20" height="20" viewBox="0 0 24 24" fill="white"><Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></Svg>;

const InputField = ({ label, value, onChangeText, ...props }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput style={styles.input} value={value} onChangeText={onChangeText} {...props} />
    </View>
);

export default function ProfileEditScreen({ navigation }) {
    const { profile, setProfile, user } = useAuth();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(profile?.avatar_url || null);
    const [formData, setFormData] = useState({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        contact_no: profile?.contact_no || '',
        assigned_purok: profile?.assigned_purok || '',
    });

    const handleImagePick = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        let avatar_url = profile?.avatar_url; // Start with the existing URL

        // If a new avatar was selected, upload it
        if (avatar && avatar !== profile?.avatar_url) {
            const fileExt = avatar.split('.').pop();
            const fileName = `${user.id}.${fileExt}`;
            const formDataUpload = new FormData();
            formDataUpload.append('files', {
                uri: avatar,
                name: fileName,
                type: `image/${fileExt}`
            });

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, formDataUpload, { upsert: true });

            if (uploadError) {
                addNotification('Error uploading image: ' + uploadError.message, 'error');
                setLoading(false);
                return;
            }
            // Get the new public URL
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
            avatar_url = urlData.publicUrl;
        }

        // Update the profile with new text data and the new avatar URL
        const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update({ ...formData, avatar_url })
            .eq('id', profile.id)
            .select()
            .single();

        if (error) {
            addNotification('Error updating profile: ' + error.message, 'error');
        } else {
            setProfile(updatedProfile);
            addNotification('Profile updated successfully!', 'success');
            navigation.goBack();
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><BackArrowIcon /></TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{width: 24}}/>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatar || `https://ui-avatars.com/api/?name=${profile?.first_name || 'U'}`}} style={styles.avatar} />
                    <TouchableOpacity style={styles.editIcon} onPress={handleImagePick}>
                        <EditIcon />
                    </TouchableOpacity>
                </View>
                
                <InputField label="First Name" value={formData.first_name} onChangeText={text => setFormData({...formData, first_name: text})} />
                <InputField label="Last Name" value={formData.last_name} onChangeText={text => setFormData({...formData, last_name: text})} />
                <InputField label="Contact Number" value={formData.contact_no} onChangeText={text => setFormData({...formData, contact_no: text})} keyboardType="phone-pad" />
                <InputField label="Assigned Purok" value={formData.assigned_purok} onChangeText={text => setFormData({...formData, assigned_purok: text})} />
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="white"/> : <Text style={styles.saveButtonText}>Save</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#e5e7eb' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 15, fontSize: 16 },
    footer: { padding: 20 },
    saveButton: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center' },
    saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});