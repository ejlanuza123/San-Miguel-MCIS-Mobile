// src/screens/AboutScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// --- ICON for Back Button ---
const BackArrowIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#1f2937"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Section = ({ title, children }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.paragraph}>{children}</Text>
  </View>
);

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.appInfoContainer}>
          <Image source={require("../assets/logo.jpg")} style={styles.logo} />
          <Text style={styles.appName}>San Miguel MCIS Mobile</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <Section title="Who are we">
          The Barangay San Miguel Maternity and Childcare Inventory System is a
          digital platform designed to modernize and streamline maternal and
          child healthcare services at the community level. Developed as both a
          web and Android application, the system integrates patient management,
          inventory tracking, appointment scheduling, automated notifications,
          and data analytics into a unified, secure environment. It empowers
          Barangay Health Workers, Barangay Nutrition Scholars, barangay
          officials, mothers, and guardians to efficiently manage health
          records, monitor the availability of essential medical supplies, and
          coordinate appointments and follow-ups, all while ensuring data
          privacy and compliance with the Philippine Data Privacy Act. By
          providing real-time access to accurate information and supporting
          offline data entry with automatic synchronization, the system
          addresses the long-standing challenges of manual record-keeping,
          inventory shortages, and fragmented communication that have
          traditionally hindered effective healthcare delivery in Barangay San
          Miguel.
        </Section>

        <Section title="Our Mission">
          The mission of the Barangay San Miguel Maternity and Childcare
          Inventory System is to enhance the quality, efficiency, and
          accessibility of maternal and child healthcare services in Barangay
          San Miguel by equipping healthcare providers and families with
          innovative digital tools that facilitate accurate data management,
          timely resource allocation, and proactive patient engagement. The
          system is committed to supporting healthcare workers in delivering
          personalized, evidence-based care, reducing administrative burdens,
          and ensuring that mothers and children receive the right services at
          the right time.
        </Section>

        <Section title="Our Vision">
          The vision of the Barangay San Miguel Maternity and Childcare
          Inventory System is to become a model of community-driven digital
          healthcare transformation, where every mother and child in Barangay
          San Miguel benefits from seamless, equitable, and secure access to
          essential health services. The system aspires to foster a healthier,
          more empowered community through technology-enabled collaboration,
          continuous improvement, and a steadfast commitment to data privacy,
          ethical standards, and inclusive care for all.
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: { padding: 20, paddingBottom: 40 },
  appInfoContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 15,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  appVersion: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
  },
});
