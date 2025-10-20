import React, { useEffect } from "react";
import { StyleSheet, Image, ImageBackground } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const SplashScreen = ({ navigation }) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1500 });
    scale.value = withTiming(1, { duration: 1500 });

    const timer = setTimeout(() => {
      navigation.replace("GetStarted");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation, scale, opacity]);

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* <Animated.View style={animatedStyle}> */}
      <Image source={require("../assets/logo.jpg")} style={styles.logo} />
      {/* </Animated.View> */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2dd4bf",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 180, height: 180, borderRadius: 90 },
});

export default SplashScreen;
