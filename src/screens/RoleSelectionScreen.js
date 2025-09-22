import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Logo with zoom-in effect */}
        <Animated.Image
          entering={ZoomIn.duration(800)}
          source={require('../assets/logo.jpg')}
          style={styles.logo}
        />

        {/* Title with fade down */}
        <Animated.Text
          entering={FadeInDown.duration(800).delay(300)}
          style={styles.title}
        >
          Choose Role
        </Animated.Text>

        {/* BHW button */}
        <Animated.View entering={FadeInUp.duration(600).delay(500)}>
          <TouchableOpacity
            style={[styles.roleButton, { backgroundColor: '#e0f2fe' }]}
            onPress={() => navigation.navigate('Login', { role: 'BHW' })}
          >
            <Image source={require('../assets/bhw_icon.png')} style={styles.roleIcon} />
            <Text style={[styles.roleLabel, { color: '#0c4a6e' }]}>
              Barangay Health Worker
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* BNS button */}
        <Animated.View entering={FadeInUp.duration(600).delay(700)}>
          <TouchableOpacity
            style={[styles.roleButton, { backgroundColor: '#dcfce7' }]}
            onPress={() => navigation.navigate('Login', { role: 'BNS' })}
          >
            <Image source={require('../assets/bns_icon.png')} style={styles.roleIcon} />
            <Text style={[styles.roleLabel, { color: '#166534' }]}>
              Barangay Nutrition Scholar
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Maternal button */}
        <Animated.View entering={FadeInUp.duration(600).delay(900)}>
          <TouchableOpacity
            style={[styles.roleButton, { backgroundColor: '#fee2e2' }]}
            onPress={() => navigation.navigate('Login', { role: 'USER/MOTHER/GUARDIAN' })}
          >
            <Image source={require('../assets/maternal_icon.png')} style={styles.roleIcon} />
            <Text style={[styles.roleLabel, { color: '#991b1b' }]}>
              Maternal
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  roleButton: { 
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '85%',
  height: 70,                // 👈 fixed height so all buttons equal
  paddingHorizontal: 20, 
  borderRadius: 15, 
  marginBottom: 15,
},
roleIcon: {
width: 40,
height: 40,
borderRadius: 20,
marginRight: 15,
},
roleLabel: { 
flex: 1,                   // 👈 makes text take remaining space
fontSize: 16, 
fontWeight: 'bold',
},

});

export default RoleSelectionScreen;
