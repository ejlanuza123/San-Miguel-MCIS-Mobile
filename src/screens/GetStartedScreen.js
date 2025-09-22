import React, { useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const GetStartedScreen = ({ navigation }) => {
  const contentTranslateY = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  useEffect(() => {
    contentTranslateY.value = withTiming(-120, { duration: 800 });
    buttonOpacity.value = withTiming(1, { duration: 800, delay: 500 });
  }, [contentTranslateY, buttonOpacity]);

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Barangay San Miguel</Text>
        <Text style={styles.subtitle}>Health Center</Text>
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2dd4bf', justifyContent: 'center', alignItems: 'center' },
  contentContainer: { alignItems: 'center' },
  logo: { width: 150, height: 150, borderRadius: 75, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'yellow', textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 3 },
  subtitle: { fontSize: 24, fontWeight: 'bold', color: 'yellow', textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 3 },
  buttonContainer: { position: 'absolute', bottom: '20%' },
  button: { backgroundColor: '#2563eb', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default GetStartedScreen;