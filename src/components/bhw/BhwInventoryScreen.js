// src/components/bhw/BhwInventoryScreen.js
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
import AddInventoryModal from "./AddInventoryModal";
import { useNavigation } from "@react-navigation/native";
import ViewBhwInventoryModal from "./ViewBhwInventoryModal";
// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
  const statusInfo = {
    Normal: { backgroundColor: "#dcfce7", color: "#16a34a" },
    Low: { backgroundColor: "#fef3c7", color: "#f59e0b" },
    Critical: { backgroundColor: "#fee2e2", color: "#ef4444" },
  };
  const info = statusInfo[status] || {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  };
  return (
    <View style={[styles.badge, { backgroundColor: info.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: info.color }]}>{status}</Text>
    </View>
  );
};

const StatusLegend = () => (
  <View style={styles.legendContainer}>
    <View style={[styles.legendTag, { backgroundColor: "#dcfce7" }]}>
      <Text style={[styles.legendTagText, { color: "#16a34a" }]}>Normal</Text>
    </View>
    <View style={[styles.legendTag, { backgroundColor: "#fef3c7" }]}>
      <Text style={[styles.legendTagText, { color: "#f59e0b" }]}>Low</Text>
    </View>
    <View style={[styles.legendTag, { backgroundColor: "#fee2e2" }]}>
      <Text style={[styles.legendTagText, { color: "#ef4444" }]}>Critical</Text>
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

export default function BhwInventoryScreen() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 5;

  const { searchTerm, setPlaceholder, setFilterOptions, setIsFilterOpen } =
    useHeader();
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigation = useNavigation();

  const handleViewItem = (item) => {
    navigation.navigate("ViewBhwInventoryModal", { item: item });
  };

  useFocusEffect(
    useCallback(() => {
      setPlaceholder("Search by item name...");
      const options = [
        {
          label: "All",
          onPress: () => {
            setActiveFilter("All");
            setCurrentPage(1);
          },
        },
        {
          label: "Medicines",
          onPress: () => {
            setActiveFilter("Medicines");
            setCurrentPage(1);
          },
        },
        {
          label: "Equipment",
          onPress: () => {
            setActiveFilter("Equipment");
            setCurrentPage(1);
          },
        },
        {
          label: "Supplies",
          onPress: () => {
            setActiveFilter("Supplies");
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

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase.from("inventory").select("*", { count: "exact" });
    if (activeFilter !== "All") query = query.eq("category", activeFilter);
    if (searchTerm) query = query.ilike("item_name", `%${searchTerm}%`);

    const { data, error, count } = await query
      .order("item_name", { ascending: true })
      .range(from, to);

    if (error) console.error("Error fetching inventory", error);
    else {
      setInventory(data || []);
      setTotalRecords(count || 0);
    }
    setLoading(false);
  }, [currentPage, activeFilter, searchTerm]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => handleViewItem(item)}>
      <Text style={[styles.cell, styles.itemCell]}>{item.item_name}</Text>
      <Text style={[styles.cell, styles.categoryCell]}>{item.category}</Text>
      <Text style={[styles.cell, styles.stockCell]}>{item.quantity} units</Text>
      <View style={[styles.cell, styles.statusCell]}>
        <StatusBadge status={item.status} />
      </View>
      <Text style={[styles.cell, styles.dateCell]}>
        {item.expiration_date || "---"}
      </Text>
    </TouchableOpacity>
  );

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  return (
    <>
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <AddInventoryModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={fetchInventory}
        />
      </Modal>
      <View style={styles.container}>
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Inventory</Text>
          <View style={styles.listHeader}>
            <Text style={[styles.headerText, styles.itemCell]}>Item</Text>
            <Text style={[styles.headerText, styles.categoryCell]}>
              Category
            </Text>
            <Text style={[styles.headerText, styles.stockCell]}>Stock</Text>
            <Text style={[styles.headerText, styles.statusCell]}>Status</Text>
            <Text style={[styles.headerText, styles.dateCell]}>
              Expire Date
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <FlatList
              data={inventory}
              onPress={() => handleViewItem(data)}
              renderItem={renderItem}
              keyExtractor={(item, index) =>
                item?.id?.toString() ?? `fallback-${index}`
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>No items found.</Text>
              }
            />
          )}
        </View>
        <View style={styles.controlsContainer}>
          <StatusLegend />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Text style={styles.addButtonText}>+ Add New Item</Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 20,
    textAlign: "center",
    color: "#111827",
  },
  listHeader: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerText: { fontWeight: "bold", color: "#6b7280", fontSize: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  cell: { fontSize: 12, color: "#374151" },
  itemCell: { flex: 2.5, fontWeight: "600" },
  categoryCell: { flex: 2, textAlign: "center" },
  stockCell: { flex: 1.5, textAlign: "center" },
  statusCell: { flex: 2, alignItems: "center" },
  dateCell: { flex: 2, textAlign: "center" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#6b7280" },
  controlsContainer: { padding: 20 },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 15,
  },
  legendTag: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  legendTagText: { fontSize: 12, fontWeight: "600" },
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

  // --- BADGE STYLES ARE NOW CORRECTLY PLACED HERE ---
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10, // <-- FONT SIZE IS NOW 12
    fontWeight: "600", // <-- FONT WEIGHT IS NOW SEMI-BOLD
  },
});
