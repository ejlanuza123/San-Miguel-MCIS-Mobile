// src/screens/PrivacyPolicyScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

// --- Section Component (without icon) ---
const Section = ({ title, children }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.paragraph}>{children}</Text>
  </View>
);

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>Last Updated: October 3, 2025</Text>

        <Section title="1. Policy Statement">
          This Data Privacy Policy outlines how the Barangay San Miguel Maternal
          and Childcare Inventory System (“the System”) collects, uses, stores,
          shares, and protects your personal data, in accordance with Republic
          Act No. 10173 or the Data Privacy Act of 2012 of the Philippines.
        </Section>

        <Section title="2. Collection of Personal Data">
          The System collects personal data necessary for the delivery of
          healthcare services, including but not limited to: Full name, age,
          sex, birthdate, address, and contact details; Medical histories,
          prenatal and postnatal records, immunization status, and other
          relevant health information; Guardian or parent information necessary
          for child health management. All personal information collected shall
          be limited to what is strictly necessary to achieve healthcare
          delivery and program objectives.
        </Section>

        <Section title="3. Use and Processing of Personal Data">
          All collected data is used solely for: Registration and management of
          maternal and child healthcare records; Scheduling and notification of
          appointments, vaccinations, and healthcare activities; Inventory
          management of medicines and supplies; Analytics and reporting to
          support barangay health planning and resource allocation. Data will
          not be used for any purpose other than those stated above without
          prior consent.
        </Section>

        <Section title="4. Storage and Protection of Personal Data">
          Personal data is stored securely in the System and protected with
          appropriate organizational, physical, and technical measures; Access
          is restricted to authorized personnel such as Barangay Health Workers
          (BHWs), Barangay Nutrition Scholars (BNS), and barangay officials; The
          System uses encryption, authentication, and access controls to prevent
          unauthorized use, alteration, or disclosure.
        </Section>

        <Section title="5. Data Sharing and Disclosure">
          Personal data will not be shared with third parties outside Barangay
          San Miguel's health administration unless required by law or with
          explicit consent from the individual; Data may be shared among
          authorized healthcare personnel exclusively for legitimate healthcare
          or administrative purposes.
        </Section>

        <Section title="6. Retention and Disposal">
          Personal and health-related information will be retained only as long
          as necessary for the purposes stated or as required by applicable
          laws; Secure disposal or anonymization will be carried out after the
          retention period.
        </Section>

        <Section title="7. Rights of Data Subjects">
          Under the Data Privacy Act, you have the right to: Be informed about
          the collection and processing of your personal data; Access your
          personal and health records in the System; Request corrections to your
          information if found to be inaccurate or outdated; Request the removal
          or blocking of your data if it is inaccurate, outdated, or collected
          without proper authorization; Withdraw consent for processing, subject
          to applicable limitations.
        </Section>

        <Section title="8. Consent">
          By providing your information or by availing of barangay healthcare
          services, you consent to the collection, use, processing, and storage
          of your data as described in this Policy in accordance with RA 10173.
        </Section>

        <Section title="9. Changes to the Policy">
          This Policy may be updated from time to time to comply with amendments
          in the law or to improve system practices. Significant changes will be
          posted and communicated through official barangay channels.
        </Section>

        <Section title="10. Inquiries and Complaints">
          For questions, concerns, or complaints regarding your data privacy,
          you may contact the Data Protection Officer or the Barangay San Miguel
          Health Office.
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
  content: { padding: 20 },
  date: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 25,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
  },
});
