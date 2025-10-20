// src/components/bns/ChildHealthRecordsScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useHeader } from "../../context/HeaderContext";
import { useNotification } from "../../context/NotificationContext";
import AddChildModal from "./AddChildModal";
import ViewChildModal from "./ViewChildModal";
import { getDatabase } from "../../services/database";
import NetInfo from "@react-native-community/netinfo";

// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
  const statusInfo = {
    H: { backgroundColor: "#dcfce7", color: "#166534" },
    UW: { backgroundColor: "#fef3c7", color: "#b45309" },
    OW: { backgroundColor: "#ffedd5", color: "#f97316" },
    O: { backgroundColor: "#fee2e2", color: "#ef4444" },
  };
  const info = statusInfo[status] || {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    label: status,
  };
  return (
    <View style={[styles.badge, { backgroundColor: info.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: info.color }]}>{status}</Text>
    </View>
  );
};
const StatusLegend = () => (
  <View style={styles.legendContainer}>
    <View style={[styles.legendTag, { backgroundColor: "#fef3c7" }]}>
      <Text style={[styles.legendTagText, { color: "#b45309" }]}>
        Underweight
      </Text>
    </View>
    <View style={[styles.legendTag, { backgroundColor: "#dcfce7" }]}>
      <Text style={[styles.legendTagText, { color: "#166534" }]}>Normal</Text>
    </View>
    <View style={[styles.legendTag, { backgroundColor: "#ffedd5" }]}>
      <Text style={[styles.legendTagText, { color: "#f97316" }]}>
        Overweight
      </Text>
    </View>
    <View style={[styles.legendTag, { backgroundColor: "#fee2e2" }]}>
      <Text style={[styles.legendTagText, { color: "#ef4444" }]}>Obese</Text>
    </View>
  </View>
);
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text
          style={[
            styles.paginationText,
            currentPage === 1 && { color: "#9ca3af" },
          ]}
        >
          &lt; Prev
        </Text>
      </TouchableOpacity>
      <Text
        style={styles.paginationText}
      >{`Page ${currentPage} of ${totalPages}`}</Text>
      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Text
          style={[
            styles.paginationText,
            currentPage === totalPages && { color: "#9ca3af" },
          ]}
        >
          Next &gt;
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const ChildRow = ({ item, onPress }) => (
  <TouchableOpacity style={styles.patientRow} onPress={onPress}>
    <Text style={[styles.rowText, styles.idColumn]}>{item.child_id}</Text>
    <Text
      style={[styles.rowText, styles.nameColumn]}
    >{`${item.last_name}, ${item.first_name}`}</Text>
    {/* --- THIS LINE IS NEW --- */}
    <Text style={[styles.rowText, styles.ageColumn]}>
      {calculateAge(item.dob)}
    </Text>
    <View style={[styles.rowText, styles.statusColumn]}>
      <StatusBadge status={item.nutrition_status} />
    </View>
  </TouchableOpacity>
);

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  if (
    ageMonths < 0 ||
    (ageMonths === 0 && today.getDate() < birthDate.getDate())
  ) {
    ageYears--;
    ageMonths += 12;
  }
  if (ageYears > 0) {
    return `${ageYears}`;
  } else {
    return `${ageMonths} mo`;
  }
};

export default function ChildHealthRecordsScreen({ route, navigation }) {
  const [childRecords, setChildRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 5;
  const { searchTerm, setPlaceholder, setFilterOptions, setIsFilterOpen } =
    useHeader();
  const { addNotification } = useNotification();
  const [activeFilter, setActiveFilter] = useState("All");

  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [modalMode, setModalMode] = useState("add");

  const handleViewChild = (child) => {
    setSelectedChild(child);
    setIsViewModalOpen(true);
  };

  useFocusEffect(
    useCallback(() => {
      setPlaceholder("Search child by name...");
      const options = [
        {
          label: "All",
          onPress: () => {
            setActiveFilter("All");
            setCurrentPage(1);
          },
        },
        {
          label: "Healthy",
          onPress: () => {
            setActiveFilter("H");
            setCurrentPage(1);
          },
        },
        {
          label: "Underweight",
          onPress: () => {
            setActiveFilter("UW");
            setCurrentPage(1);
          },
        },
        {
          label: "Overweight",
          onPress: () => {
            setActiveFilter("OW");
            setCurrentPage(1);
          },
        },
        {
          label: "Obese",
          onPress: () => {
            setActiveFilter("O");
            setCurrentPage(1);
          },
        },
      ].map((opt) => ({
        ...opt,
        onPress: () => {
          opt.onPress();
          setIsFilterOpen(false);
        },
      }));
      setFilterOptions(options);
    }, [])
  );

  const fetchChildRecords = useCallback(async () => {
    setLoading(true);
    const db = getDatabase();

    try {
      const netInfo = await NetInfo.fetch();

      if (netInfo.isConnected) {
        // ONLINE: Fetch from Supabase first
        console.log("Online - fetching child records from Supabase");
        const { data: supabaseData, error } = await supabase
          .from("child_records")
          .select("*")
          .order("last_name");

        if (error) {
          console.error("Supabase error:", error);
          addNotification("Could not fetch latest child records.", "warning");
          // Fall back to local data
          await loadLocalData(db);
        } else if (supabaseData) {
          // Update UI with fresh Supabase data immediately
          let displayData = supabaseData;

          // Apply filters to Supabase data
          if (activeFilter !== "All") {
            displayData = displayData.filter(
              (child) => child.nutrition_status === activeFilter
            );
          }
          if (searchTerm) {
            const lowercasedQuery = searchTerm.toLowerCase();
            displayData = displayData.filter((child) => {
              const fullName = `${child.first_name || ""} ${
                child.last_name || ""
              }`.toLowerCase();
              return fullName.includes(lowercasedQuery);
            });
          }

          setChildRecords(displayData);
          setTotalRecords(displayData.length);

          // Update local cache in background
          try {
            await db.execAsync("DELETE FROM child_records;");

            const stmt = await db.prepareAsync(`
                            INSERT OR REPLACE INTO child_records 
                            (child_id, first_name, last_name, dob, sex, mother_name, nutrition_status, health_details)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                        `);

            for (const child of supabaseData) {
              const details =
                typeof child.health_details === "string"
                  ? child.health_details
                  : JSON.stringify(child.health_details || []);

              await stmt.executeAsync([
                child.child_id,
                child.first_name,
                child.last_name,
                child.dob,
                child.sex,
                child.mother_name,
                child.nutrition_status,
                details,
              ]);
            }
            await stmt.finalizeAsync();
          } catch (syncError) {
            console.warn("Cache update warning:", syncError);
          }
        }
      } else {
        // OFFLINE: Use local data only
        console.log("Offline - using local cache for child records");
        await loadLocalData(db);
      }
    } catch (e) {
      console.error("Error loading child records:", e);
      addNotification("An error occurred loading child data.", "error");
      // Try to load local data as fallback
      try {
        await loadLocalData(getDatabase());
      } catch (fallbackError) {
        console.error("Even local data failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, [addNotification, searchTerm, activeFilter]);

  // Add this helper function for local data loading
  const loadLocalData = async (db) => {
    let localData = await db.getAllAsync(
      "SELECT * FROM child_records ORDER BY last_name ASC;"
    );

    // Apply filters to local data
    if (activeFilter !== "All") {
      localData = localData.filter(
        (child) => child.nutrition_status === activeFilter
      );
    }
    if (searchTerm) {
      const lowercasedQuery = searchTerm.toLowerCase();
      localData = localData.filter((child) => {
        const fullName = `${child.first_name || ""} ${
          child.last_name || ""
        }`.toLowerCase();
        return fullName.includes(lowercasedQuery);
      });
    }

    setChildRecords(localData);
    setTotalRecords(localData.length);
  };

  // Replace the useEffect with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchChildRecords();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchChildRecords]);

  useEffect(() => {
    const scannedId = route.params?.scannedPatientId;
    if (scannedId) {
      const findAndEditChild = async () => {
        setLoading(true);
        const netInfo = await NetInfo.fetch();

        let child = null;
        let error = null;

        if (netInfo.isConnected) {
          // ONLINE: Fetch from Supabase
          const { data, error: supabaseError } = await supabase
            .from("child_records")
            .select("*")
            .eq("child_id", scannedId)
            .single();
          child = data;
          error = supabaseError;
        } else {
          // OFFLINE: Fetch from the local SQLite database
          const db = getDatabase();
          try {
            const result = await db.getFirstAsync(
              "SELECT * FROM child_records WHERE child_id = ?;",
              [scannedId]
            );
            child = result;
          } catch (dbError) {
            error = dbError;
          }
        }

        setLoading(false);
        if (error || !child) {
          addNotification(`Child ID "${scannedId}" not found.`, "error");
        } else {
          setSelectedChild(child);
          setModalMode("edit");
          setIsAddModalOpen(true);
        }
      };

      findAndEditChild();
      navigation.setParams({ scannedPatientId: null });
    }
  }, [route.params?.scannedPatientId]);

  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = childRecords.slice(startIndex, endIndex);

  return (
    <>
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <AddChildModal
          mode={modalMode}
          initialData={modalMode === "edit" ? selectedChild : null}
          onClose={() => setIsAddModalOpen(false)}
          onSave={fetchChildRecords}
        />
      </Modal>
      <Modal
        visible={isViewModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsViewModalOpen(false)}
      >
        <ViewChildModal
          child={selectedChild}
          onClose={() => setIsViewModalOpen(false)}
        />
      </Modal>

      <View style={styles.container}>
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Patient List</Text>
          <View style={styles.listHeader}>
            <Text style={[styles.headerText, styles.idColumn]}>ID</Text>
            <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
            <Text style={[styles.headerText, styles.ageColumn]}>Age</Text>
            <Text style={[styles.headerText, styles.statusColumn]}>Status</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <FlatList
              data={paginatedRecords}
              renderItem={({ item }) => (
                <ChildRow item={item} onPress={() => handleViewChild(item)} />
              )}
              keyExtractor={(item, index) =>
                item?.id?.toString() ?? `fallback-${index}`
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>No child records found.</Text>
              }
            />
          )}
        </View>
        <View style={styles.controlsContainer}>
          <StatusLegend />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedChild(null);
              setModalMode("add");
              setIsAddModalOpen(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Add New Patient</Text>
          </TouchableOpacity>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8", paddingBottom: 80 },
  mainCard: {
    flex: 1,
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    padding: 20,
    textAlign: "center",
  },
  listHeader: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerText: { fontWeight: "bold", color: "#6b7280", fontSize: 12 },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rowText: { fontSize: 14 },
  idColumn: { flex: 1.5, fontWeight: "bold" },
  nameColumn: { flex: 3 }, // Adjusted from 4
  ageColumn: { flex: 1, textAlign: "center" }, // Added this new style
  statusColumn: { flex: 2, alignItems: "center" },
  controlsContainer: { padding: 20 },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 15,
  },
  legendTag: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 15 },
  legendTagText: { fontSize: 10, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  addButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  paginationText: { color: "#3b82f6", fontWeight: "600" },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: "bold" },
});
