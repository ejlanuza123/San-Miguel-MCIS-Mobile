// src/screens/ProfileViewScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';


const BackArrowIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#fff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoField = ({ label, value }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
  </View>
);

export default function ProfileViewScreen({ navigation }) {
  const { user, profile } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#2563eb', '#1e3a8a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                profile?.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile?.first_name || 'U'}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.nameText}>
            {`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User'}
          </Text>
          <Text style={styles.emailText}>{user?.email || profile?.email || 'No email set'}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoField label="Contact Number" value={profile?.contact_no} />
          <InfoField label="Assigned Purok" value={profile?.assigned_purok} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <LinearGradient
            colors={['#3b82f6', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 6,
    borderRadius: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // CONTENT
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#e5e7eb',
    elevation: 5,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 15,
  },
  emailText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 3,
  },

  // INFO CARD
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 3,
  },

  // FOOTER
  footer: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
