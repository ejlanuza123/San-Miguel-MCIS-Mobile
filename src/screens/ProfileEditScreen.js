import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import { useNotification } from "../context/NotificationContext";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const getRoleColors = (role) => {
  if (role === "BNS") {
    return {
      primary: "#6ee7b7", // Very Light Emerald Green
      dark: "#34d399", // Very Light Dark Emerald
      headerGradient: ["#34d399", "#6ee7b7"],
      editIconBg: "#34d399",
      avatarBorder: "#34d399",
      saveButtonGradient: ["#6ee7b7", "#34d399"],
    };
  }
  if (role === "USER/MOTHER/GUARDIAN") {
    return {
      primary: "#f9a8d4", // Very Light Rose Pink
      dark: "#f472b6", // Very Light Dark Rose
      headerGradient: ["#f472b6", "#f9a8d4"],
      editIconBg: "#f472b6",
      avatarBorder: "#f472b6",
      saveButtonGradient: ["#f9a8d4", "#f472b6"],
    };
  }
  // Default BHW (Very Light Blue)
  return {
    primary: "#93c5fd", // Very Light Blue
    dark: "#60a5fa", // Very Light Dark Blue
    headerGradient: ["#60a5fa", "#93c5fd"],
    editIconBg: "#60a5fa",
    avatarBorder: "#60a5fa",
    saveButtonGradient: ["#93c5fd", "#60a5fa"],
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

const EditIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </Svg>
);

const InputField = ({ label, value, onChangeText, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  </View>
);

export default function ProfileEditScreen({ navigation }) {
  const { profile, setProfile, user } = useAuth();
  const { addNotification } = useNotification();
  const colors = getRoleColors(profile?.role || "BHW");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(profile?.avatar_url || null);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    contact_no: profile?.contact_no || "",
    assigned_purok: profile?.assigned_purok || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    setIsSaving(true);
    let avatar_url = profile?.avatar_url;

    if (avatar && avatar !== profile?.avatar_url) {
      // ... (Image Upload Logic) ...
      const fileExt = avatar.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const formDataUpload = new FormData();
      formDataUpload.append("files", {
        uri: avatar,
        name: fileName,
        type: `image/${fileExt}`,
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, formDataUpload, { upsert: true });

      if (uploadError) {
        addNotification(
          "Error uploading image: " + uploadError.message,
          "error"
        );
        setIsSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadData.path);
      avatar_url = urlData.publicUrl;
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({ ...formData, avatar_url })
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      addNotification("Error updating profile: " + error.message, "error");
    } else {
      setProfile(updatedProfile);
      addNotification("Profile updated successfully!", "success");
      navigation.goBack();
    }
    setIsSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={colors.headerGradient} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                avatar ||
                `https://ui-avatars.com/api/?name=${
                  profile?.first_name || "U"
                }`,
            }}
            style={[
              styles.avatar,
              // CORRECTED: Apply dynamic colors for border and shadow
              {
                borderColor: colors.avatarBorder,
                shadowColor: colors.avatarBorder,
              },
            ]}
          />
          <TouchableOpacity
            // CORRECTED: Apply dynamic background color for the edit icon
            style={[styles.editIcon, { backgroundColor: colors.editIconBg }]}
            onPress={handleImagePick}
          >
            <EditIcon />
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <InputField
          label="First Name"
          value={formData.first_name}
          onChangeText={(text) =>
            setFormData({ ...formData, first_name: text })
          }
        />
        <InputField
          label="Last Name"
          value={formData.last_name}
          onChangeText={(text) => setFormData({ ...formData, last_name: text })}
        />
        <InputField
          label="Contact Number"
          value={formData.contact_no}
          onChangeText={(text) =>
            setFormData({ ...formData, contact_no: text })
          }
          keyboardType="phone-pad"
        />
        <InputField
          label="Assigned Purok"
          value={formData.assigned_purok}
          onChangeText={(text) =>
            setFormData({ ...formData, assigned_purok: text })
          }
        />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          <LinearGradient
            // CORRECTED: Apply dynamic colors for the save button gradient
            colors={colors.saveButtonGradient}
            style={styles.gradientButton}
          >
            {isSaving ? ( // Use isSaving
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    elevation: 4,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },

  content: { padding: 25 },
  avatarContainer: { alignItems: "center", marginBottom: 35 },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 130 / 3.5,
    padding: 8,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
    elevation: 5,
  },

  inputContainer: { marginBottom: 18 },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  footer: { padding: 25 },
  saveButton: { borderRadius: 12, overflow: "hidden" },
  gradientButton: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 12,
    elevation: 3,
  },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
