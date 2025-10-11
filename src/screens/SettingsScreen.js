// src/screens/SettingsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

// --- START: NEW COLOR LOGIC ---
const getRoleColors = (role) => {
  if (role === "BNS") {
    return {
      primary: "#10b981", // Emerald Green
      dark: "#059669", // Dark Emerald
      light: "#34d399", // Light Emerald
      headerGradient: ["#10b981", "#059669"],
      iconFill: "#059669",
      iconBg: "#d1fae5",
      // Keep Logout as standard red for danger
      logoutGradient: ["#ef4444", "#b91c1c"],
      logoutShadow: "#ef4444",
    };
  }
  if (role === "USER/MOTHER/GUARDIAN") {
    return {
      primary: "#db2777", // Rose Pink
      dark: "#831843", // Dark Rose
      light: "#fbcfe8", // Light Pink
      headerGradient: ["#db2777", "#831843"],
      iconFill: "#831843",
      iconBg: "#fce7f3",
      logoutGradient: ["#db2777", "#9d174d"], // Rose Gradient for Logout
      logoutShadow: "#db2777",
    };
  }
  // Default BHW (Blue)
  return {
    primary: "#2563eb",
    dark: "#1e3a8a",
    light: "#93c5fd",
    headerGradient: ["#2563eb", "#1e3a8a"],
    iconFill: "#3b82f6",
    iconBg: "#eff6ff",
    logoutGradient: ["#ef4444", "#b91c1c"],
    logoutShadow: "#ef4444",
  };
};

// --- ICONS ---
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
const ProfileIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </Svg>
);
const BellIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </Svg>
);
const HelpIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </Svg>
);
// (PrivacyIcon, AboutIcon, LanguageIcon updated similarly)
const PrivacyIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
  </Svg>
);
const AboutIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <Path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </Svg>
);
const LanguageIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
    <Path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
  </Svg>
);
const ArrowRightIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SettingsItem = ({ icon, label, onPress, colors }) => (
  // We use the optional chaining operator (?) here to ensure it doesn't crash
  // if 'colors' is undefined (though it shouldn't be).
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={[styles.itemIcon, { backgroundColor: colors?.iconBg }]}>
      {React.cloneElement(icon, { color: colors?.iconFill })}
    </View>
    <Text style={styles.itemLabel}>{label}</Text>
    <ArrowRightIcon />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const navigation = useNavigation();
  const colors = getRoleColors(profile?.role || "BHW");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.preferences?.in_app_notifications ?? true
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    const { data, error } = await supabase
      .from("profiles")
      .update({
        preferences: { ...profile.preferences, in_app_notifications: value },
      })
      .eq("id", profile.id)
      .select()
      .single();
    if (!error) setProfile(data);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={colors.headerGradient} // Dynamic Header Gradient
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSummary}>
          <Image
            source={{
              uri:
                profile?.avatar_url ||
                `https://ui-avatars.com/api/?name=${
                  profile?.first_name || "U"
                }`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.profileName}>{`${profile?.first_name || ""} ${
            profile?.last_name || ""
          }`}</Text>
        </View>

        <SettingsItem
          icon={<ProfileIcon />}
          label="Profile"
          onPress={() => navigation.navigate("ProfileView")}
        />

        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.item}>
          <View style={styles.itemIcon}>
            <BellIcon />
          </View>
          <Text style={styles.itemLabel}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
            thumbColor={notificationsEnabled ? "#3b82f6" : "#f4f3f4"}
          />
        </View>

        <SettingsItem icon={<HelpIcon />} label="Help" onPress={() => {}} />
        <SettingsItem
          icon={<PrivacyIcon />}
          label="Privacy Policy"
          onPress={() => navigation.navigate("PrivacyPolicy")}
        />
        <SettingsItem
          icon={<AboutIcon />}
          label="About"
          onPress={() => navigation.navigate("About")}
        />
        <SettingsItem
          icon={<LanguageIcon />}
          label="Language Preferences"
          onPress={() => {}}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={signOut} activeOpacity={0.8}>
          <LinearGradient
            colors={["#ef4444", "#b91c1c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

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
  scrollContent: { padding: 20 },
  profileSummary: { alignItems: "center", marginBottom: 25 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#e5e7eb",
    elevation: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 12,
  },

  // SECTION
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginTop: 30,
    marginBottom: 10,
    paddingLeft: 2,
  },

  // ITEMS
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    // backgroundColor: "#eff6ff", // Removed static background
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: "500", color: "#111827" },

  // FOOTER
  footer: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  logoutButton: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#ef4444",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
