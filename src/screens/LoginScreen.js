import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import { supabase } from "../services/supabase";
import Svg, { Path } from "react-native-svg";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated"; // <-- NEW
import { SafeAreaView } from "react-native-safe-area-context";

// --- ICONS (same as before) ---
const UserIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12ZM12 15C8.68629 15 6 17.6863 6 21H18C18 17.6863 15.3137 15 12 15Z"
      fill="#9ca3af"
    />
  </Svg>
);
const LockIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 1.25C9.0967 1.25 6.75 3.5967 6.75 6.5V9.25H6C4.20507 9.25 2.75 10.7051 2.75 12.5V20C2.75 21.7949 4.20507 23.25 6 23.25H18C19.7949 23.25 21.25 21.7949 21.25 20V12.5C21.25 10.7051 19.7949 9.25 18 9.25H17.25V6.5C17.25 3.5967 14.9033 1.25 12 1.25ZM8.25 6.5C8.25 4.42893 9.92893 2.75 12 2.75C14.0711 2.75 15.75 4.42893 15.75 6.5V9.25H8.25V6.5Z"
      fill="#9ca3af"
    />
  </Svg>
);
const EyeIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z"
      fill="#9ca3af"
    />
  </Svg>
);
const BackArrowIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ErrorModal = ({ visible, onClose, message }) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Animated.View
        style={styles.modalContainer}
        entering={FadeInUp.duration(300)}
      >
        <Text style={styles.modalTitle}>Login Error</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const LoginScreen = ({ route, navigation }) => {
  const { role } = route.params;
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    let emailForLogin;

    if (role === "USER/MOTHER/GUARDIAN") {
      emailForLogin = loginIdentifier;
    } else {
      if (loginIdentifier.includes("@")) {
        emailForLogin = loginIdentifier;
      } else {
        const { data, error } = await supabase.rpc("get_email_by_user_id", {
          user_id_param: loginIdentifier,
        });
        if (error || !data) {
          Alert.alert("Error", "Invalid User ID.");
          setLoading(false);
          return;
        }
        emailForLogin = data;
      }
    }

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: emailForLogin,
        password: password,
      });
    if (loginError) {
      Alert.alert("Login Failed", loginError.message);
      setLoading(false);
      return;
    }

    if (loginData.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", loginData.user.id)
        .single();

      if (profileError) {
        Alert.alert(
          "Error",
          "Could not find a user profile. Please contact an administrator."
        );
        await supabase.auth.signOut();
      } else if (profile.role !== role) {
        // --- THIS IS THE CORRECTED LOGIC ---
        const selectedRole = role.split("/")[0];
        const actualRole = profile.role.split("/")[0];

        // 1. Immediately sign out the user to prevent them from proceeding.
        await supabase.auth.signOut();

        // 2. Then, show the error alert.
        Alert.alert(
          "Role Mismatch",
          `You tried to log in as a ${selectedRole}, but this account is registered as a ${actualRole}. Please select the correct role.`
        );
      }
    }
    setLoading(false);
  };

  return (
    // --- MODIFIED: Use a React.Fragment to wrap both components ---
    <>
      <ImageBackground
        source={require("../assets/background.jpg")}
        style={styles.container}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.background}>
          <View style={styles.content}>
            <Animated.Image
              entering={FadeInUp.duration(800)}
              source={require("../assets/logo.jpg")}
              style={styles.logo}
            />
            <Animated.View
              entering={FadeInUp.duration(800).delay(300)}
              style={styles.card}
            >
              <Text style={styles.title}>Login</Text>
              <View style={styles.inputContainer}>
                <UserIcon />
                <TextInput
                  style={styles.input}
                  placeholder={
                    role === "USER/MOTHER/GUARDIAN"
                      ? "Email Address"
                      : "User ID No."
                  }
                  placeholderTextColor="#9ca3af"
                  value={loginIdentifier}
                  onChangeText={setLoginIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputContainer}>
                <LockIcon />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon />
                </TouchableOpacity>
              </View>
              {role === "USER/MOTHER/GUARDIAN" && (
                <View style={styles.signUpContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Register")}
                  >
                    <Text style={styles.linkText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotText}>Forgot password</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View entering={FadeIn.duration(900).delay(600)}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <BackArrowIcon />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
      <ErrorModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        message={errorMessage}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { width: "100%", alignItems: "center" },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    zIndex: 1,
    marginBottom: -60,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "85%",
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: "100%",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotText: {
    color: "#2563eb",
    marginTop: 15,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 30,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 30,
  },
  // --- NEW STYLES ---
  signUpContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#dc2626", // Red color for error
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
export default LoginScreen;
