// src/components/bhw/BhwReportsScreen.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../services/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useHeader } from "../../context/HeaderContext";

export default function BhwReportsScreen({ navigation }) {
  const [allData, setAllData] = useState({
    patients: [],
    inventory: [],
    appointments: [],
  });
  const [loading, setLoading] = useState(true);
  const { searchTerm, setPlaceholder, setFilterOptions, setIsFilterOpen } =
    useHeader();
  const [activeFilter, setActiveFilter] = useState("All");

  useFocusEffect(
    useCallback(() => {
      setPlaceholder("Search reports by quarter...");
      setFilterOptions([]); // No filters needed for this screen yet
    }, [])
  );

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const [patientsRes, inventoryRes, appointmentsRes] = await Promise.all([
        supabase.from("patients").select("*"),
        supabase.from("inventory").select("*"),
        supabase.from("appointments").select("*"),
      ]);
      setAllData({
        patients: patientsRes.data || [],
        inventory: inventoryRes.data || [],
        appointments: appointmentsRes.data || [],
      });
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const quarterlyReports = useMemo(() => {
    const year = new Date().getFullYear();
    const getQuarterData = (q) => {
      const months = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [9, 10, 11],
      ][q - 1];
      return {
        patients: allData.patients.filter((p) =>
          months.includes(new Date(p.created_at).getMonth())
        ),
        inventory: allData.inventory.filter((i) =>
          months.includes(new Date(i.created_at).getMonth())
        ),
        appointments: allData.appointments.filter((a) =>
          months.includes(new Date(a.created_at).getMonth())
        ),
      };
    };
    return [1, 2, 3, 4].map((q) => ({
      id: q,
      year, // Add this line
      name: `BHW Report - ${year} ${q}${
        q === 1 ? "st" : q === 2 ? "nd" : q === 3 ? "rd" : "th"
      } Quarter`,
      summary: `Summary of activities for Q${q}`,
      data: getQuarterData(q),
    }));
  }, [allData]);

  const filteredReports = useMemo(() => {
    if (!searchTerm) return quarterlyReports;
    return quarterlyReports.filter((r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quarterlyReports, searchTerm]);

  const renderReportCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("BhwViewReport", {
          quarter: item,
          allData: item.data,
        })
      }
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSummary}>{item.summary}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          Issued on: {new Date().toLocaleDateString()}
        </Text>
        <Text style={styles.viewText}>View</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#3b82f6" />
    );
  }

  return (
    <FlatList
      data={filteredReports}
      renderItem={renderReportCard}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No reports found.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80 },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  cardSummary: { fontSize: 14, color: "#6b7280", marginTop: 8 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardDate: { fontSize: 12, color: "#9ca3af" },
  viewText: { fontSize: 14, fontWeight: "bold", color: "#3b82f6" },
  emptyText: { textAlign: "center", marginTop: 50, color: "#6b7280" },
});

