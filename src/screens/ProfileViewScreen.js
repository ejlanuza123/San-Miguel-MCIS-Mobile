// src/screens/ProfileViewScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const getRoleColors = (role) => {
  if (role === "BNS") {
    return {
      primary: "#6ee7b7", // Very Light Emerald Green
      dark: "#34d399", // Very Light Dark Emerald
      headerGradient: ["#6ee7b7", "#34d399"],
      buttonGradient: ["#6ee7b7", "#34d399"],
      avatarBorder: "#34d399",
      editButtonShadow: "#6ee7b7",
    };
  }
  if (role === "USER/MOTHER/GUARDIAN") {
    return {
      primary: "#f9a8d4", // Very Light Rose Pink
      dark: "#f472b6", // Very Light Dark Rose
      headerGradient: ["#f9a8d4", "#f472b6"],
      buttonGradient: ["#f9a8d4", "#f472b6"],
      avatarBorder: "#f472b6",
      editButtonShadow: "#f9a8d4",
    };
  }
  // Default BHW (Very Light Blue) - Used if profile is null
  return {
    primary: "#93c5fd", // Very Light Blue
    dark: "#60a5fa", // Very Light Dark Blue
    headerGradient: ["#93c5fd", "#60a5fa"],
    buttonGradient: ["#93c5fd", "#60a5fa"],
    avatarBorder: "#60a5fa",
    editButtonShadow: "#93c5fd",
  };
};

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
    <Text style={styles.fieldValue}>{value || "Not set"}</Text>
  </View>
);

export default function ProfileViewScreen({ navigation }) {
  const { user, profile } = useAuth();
  const colors = getRoleColors(profile?.role || "BHW");

  if (!profile || !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        // The colors prop is now guaranteed to be a valid array from getRoleColors
        colors={colors.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
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
                profile.avatar_url || // Use profile directly, it's guaranteed to exist here
                `https://ui-avatars.com/api/?name=${profile.first_name || "U"}`,
            }}
            style={[styles.avatar, { borderColor: colors.avatarBorder }]}
          />
          <Text style={styles.nameText}>
            {`${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
              "User"}
          </Text>
          <Text style={styles.emailText}>
            {user.email || profile.email || "No email set"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <InfoField label="Contact Number" value={profile.contact_no} />
          <InfoField label="Assigned Purok" value={profile.assigned_purok} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.editButton, { shadowColor: colors.editButtonShadow }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("ProfileEdit")}
        >
          <LinearGradient
            colors={colors.buttonGradient}
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
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 6,
    borderRadius: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // CONTENT
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    // borderColor: '#fff', // Now dynamic
    backgroundColor: "#e5e7eb",
    elevation: 5,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 15,
  },
  emailText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 3,
  },

  // INFO CARD
  infoCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 3,
  },

  // FOOTER
  footer: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  editButton: {
    borderRadius: 12,
    overflow: "hidden",
    // shadowColor is now dynamically set in the component logic
    shadowOpacity: 0.4, // Added opacity to show the shadow
    shadowRadius: 10, // Added radius to show the shadow
    elevation: 8, // Added elevation for Android
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 12,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
