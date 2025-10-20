// src/components/bhw/AddAppointmentModal.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../services/supabase";
import { useNotification } from "../../context/NotificationContext";
import { logActivity } from "../../services/activityLogger";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import CalendarPickerModal from "../common/CalendarPickerModal";
import TimePickerModal from "../common/TimePickerModal";
import * as Crypto from "expo-crypto";
import { getDatabase } from "../../services/database";
import NetInfo from "@react-native-community/netinfo";

// --- ICONS ---
const BackArrowIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const CalendarIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 7V3M16 4V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function AddAppointmentModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    reason: "",
    date: "",
    time: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [allPatients, setAllPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { addNotification } = useNotification();
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  useEffect(() => {
    const fetchAllPatients = async () => {
      const netInfo = await NetInfo.fetch();
      const db = getDatabase();

      if (netInfo.isConnected) {
        // Online: Fetch from Supabase
        const { data, error } = await supabase
          .from("patients")
          .select("id, patient_id, first_name, last_name");
        if (error) console.error("Error fetching patients:", error);
        else setAllPatients(data || []);
      } else {
        // Offline: Fetch from local database
        try {
          const localPatients = await db.getAllAsync(
            "SELECT id, patient_id, first_name, last_name FROM patients ORDER BY last_name ASC"
          );
          setAllPatients(localPatients || []);
        } catch (error) {
          console.error("Error fetching local patients:", error);
          setAllPatients([]);
        }
      }
    };
    fetchAllPatients();
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return [];
    return allPatients.filter((p) => {
      const fullName = `${p.first_name || ""} ${
        p.last_name || ""
      }`.toLowerCase();
      return (
        fullName.includes(query) ||
        (p.patient_id || "").toLowerCase().includes(query)
      );
    });
  }, [searchQuery, allPatients]);

  const handlePatientSelect = (patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`;
    setFormData((prev) => ({
      ...prev,
      patient_id: patient.patient_id,
      patient_name: fullName,
    }));
    setSearchQuery(fullName);
    setIsSearching(false);
  };

  // Fixed time selection handler
  const handleTimeSelect = (time) => {
    setFormData((prev) => ({ ...prev, time: time }));
    setIsTimePickerOpen(false); // Close modal immediately after selection
  };

  // Fixed picker change handler
  const handleReasonChange = (itemValue) => {
    setFormData((prev) => ({ ...prev, reason: itemValue }));
  };

  const isFormValid =
    formData.patient_id && formData.reason && formData.date && formData.time;

  const handleSave = async () => {
    if (
      !formData.patient_id ||
      !formData.date ||
      !formData.time ||
      !formData.reason
    ) {
      addNotification("Please fill all required fields.", "error");
      return;
    }
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Generate a unique ID for the appointment
    const appointmentId = Crypto.randomUUID();

    const appointmentRecord = {
      id: appointmentId, // Add unique ID
      patient_display_id: formData.patient_id,
      patient_name: formData.patient_name,
      reason: formData.reason,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
      status: "Scheduled",
      created_by: user?.id,
      created_at: new Date().toISOString(), // Add timestamp
    };

    const netInfo = await NetInfo.fetch();
    const db = getDatabase();

    try {
      if (netInfo.isConnected) {
        // --- ONLINE LOGIC ---
        console.log("Online: Saving appointment directly to Supabase...");
        const { error } = await supabase
          .from("appointments")
          .insert([appointmentRecord]);
        if (error) throw error;
        addNotification("Appointment scheduled successfully.", "success");
      } else {
        // --- OFFLINE LOGIC ---
        console.log("Offline: Saving appointment locally...");
        await db.withTransactionAsync(async () => {
          // Insert into local appointments table
          const statement = await db.prepareAsync(
            "INSERT INTO appointments (id, patient_display_id, patient_name, reason, date, time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
          );
          await statement.executeAsync([
            appointmentRecord.id,
            appointmentRecord.patient_display_id,
            appointmentRecord.patient_name,
            appointmentRecord.reason,
            appointmentRecord.date,
            appointmentRecord.time,
            appointmentRecord.status,
            appointmentRecord.notes || "",
          ]);
          await statement.finalizeAsync();

          // Add to sync queue for later
          const syncStatement = await db.prepareAsync(
            "INSERT INTO sync_queue (action, table_name, payload) VALUES (?, ?, ?);"
          );
          await syncStatement.executeAsync([
            "create",
            "appointments",
            JSON.stringify(appointmentRecord),
          ]);
          await syncStatement.finalizeAsync();
        });
        addNotification(
          "Appointment saved locally. Will sync when online.",
          "success"
        );
      }

      await logActivity(
        "New Appointment Scheduled",
        `For ${formData.patient_name} on ${formData.date}`
      );
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save appointment:", error);
      addNotification(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Calendar Modal */}
      <Modal
        transparent={true}
        visible={isCalendarOpen}
        animationType="fade"
        onRequestClose={() => setIsCalendarOpen(false)}
      >
        <CalendarPickerModal
          onClose={() => setIsCalendarOpen(false)}
          onDateSelect={(date) =>
            setFormData((prev) => ({ ...prev, date: date }))
          }
        />
      </Modal>

      <TimePickerModal
        isVisible={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        onTimeSelect={handleTimeSelect} // Use the fixed handler
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <BackArrowIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Appointment</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Scrollable form */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Patient Search */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Type to search..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onFocus={() => setIsSearching(true)}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setFormData((prev) => ({
                    ...prev,
                    patient_name: text,
                    patient_id: "",
                  }));
                }}
              />
              {isSearching && searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  {searchResults.slice(0, 5).map((item) => (
                    <TouchableOpacity
                      keyExtractor={(item, index) =>
                        item?.id?.toString() ?? `fallback-${index}`
                      }
                      style={styles.searchResultItem}
                      onPress={() => handlePatientSelect(item)}
                    >
                      <Text>{`${item.first_name} ${item.last_name} (${item.patient_id})`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient ID</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                placeholderTextColor="#9ca3af"
                value={formData.patient_id}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Appointment Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.reason}
                  onValueChange={handleReasonChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select appointment type..." value="" />
                  <Picker.Item
                    label="Prenatal Check-up"
                    value="Prenatal Check-up"
                  />
                  <Picker.Item label="Vaccination" value="Vaccination" />
                  <Picker.Item
                    label="Postnatal Visit"
                    value="Postnatal Visit"
                  />
                </Picker>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setIsCalendarOpen(true)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !formData.date && styles.placeholderText,
                    ]}
                  >
                    {formData.date || "Select a date"}
                  </Text>
                  <CalendarIcon />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setIsTimePickerOpen(true)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !formData.time && styles.placeholderText,
                    ]}
                  >
                    {formData.time || "Select a time"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any additional notes..."
                placeholderTextColor="#9ca3af"
                multiline
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, notes: text }))
                }
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isFormValid || loading) && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Create Appointment</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  backButton: { padding: 5 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", color: "#4b5563", marginBottom: 8 },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontSize: 16,
    color: "#111827",
  },
  readOnlyInput: { backgroundColor: "#e5e7eb", color: "#6b7280" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  dateText: { fontSize: 16, color: "#111827" },
  placeholderText: { color: "#9ca3af" },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  searchResultsContainer: {
    marginTop: 5,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    maxHeight: 150,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#111827",
  },
});
