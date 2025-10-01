// src/navigation/AppNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import { HeaderProvider } from "../context/HeaderContext";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import AboutScreen from "../screens/AboutScreen";

// --- Import ALL screens for ALL roles ---
// Layout
import FixedHeader from "../components/layout/FixedHeader";
// BHW Screens
import BhwDashboardScreen from "../components/bhw/BhwDashboardScreen";
import BhwAppointmentScreen from "../components/bhw/BhwAppointmentScreen";
import BhwInventoryScreen from "../components/bhw/BhwInventoryScreen";
import BhwReportsScreen from "../components/bhw/BhwReportsScreen";
import BhwViewReportScreen from "../components/bhw/ViewReportModal";
import PatientManagementScreen from "../components/bhw/PatientManagementScreen";
import ViewBhwInventoryModal from "../components/bhw/ViewBhwInventoryModal";
// BNS Screens
import BnsDashboardScreen from "../components/bns/BnsDashboardScreen";
import ChildHealthRecordsScreen from "../components/bns/ChildHealthRecordsScreen";
import BnsAppointmentScreen from "../components/bns/BnsAppointmentScreen";
import BnsInventoryScreen from "../components/bns/BnsInventoryScreen";
import BnsReportsScreen from "../components/bns/BnsReportsScreen";
import BnsViewReportScreen from "../components/bns/BnsViewReportScreen";
import ViewBnsInventoryModal from "../components/bns/ViewBnsInventoryModal";
// NEW: Import user screens
import UserDashboardScreen from "../components/user/UserDashboardScreen";
import AppointmentScreen from "../components/user/AppointmentScreen";
import ViewUserRecords from "../components/user/ViewUserRecords";
import ScheduleAppointmentScreen from "../components/user/ScheduleAppointmentScreen";
// Shared Screens
import SettingsScreen from "../screens/SettingsScreen";
import ProfileViewScreen from "../screens/ProfileViewScreen";
import ProfileEditScreen from "../screens/ProfileEditScreen";
import QRScannerScreen from "../screens/QRScannerScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// --- ICONS for the Tab Bar ---
const HomeIcon = ({ color }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path fill={color} d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8h5z" />
  </Svg>
);
const PatientIcon = ({ color }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
    />
  </Svg>
);
const AppointmentIcon = ({ color }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"
    />
  </Svg>
);
const InventoryIcon = ({ color }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 2h6v6h-6V4z"
    />
  </Svg>
);
const ReportsIcon = ({ color }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
    />
  </Svg>
);
// NEW: Add RecordsIcon
const RecordsIcon = ({ color }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 12H9V5h10v9z"
    />
  </Svg>
);

const UserStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <FixedHeader /> }}>
    {/* This Stack's only job is to show the header above the UserTabs */}
    <Stack.Screen name="UserTabs" component={UserTabs} />
  </Stack.Navigator>
);
// --- Stacks for BHW & BNS (These are complete now) ---
const BhwStack = () => (
  <Stack.Navigator
    screenOptions={{
      header: () => <FixedHeader />,
      contentStyle: { backgroundColor: "#f0f4f8" },
    }}
  >
    <Stack.Screen name="BhwDashboard" component={BhwDashboardScreen} />
    <Stack.Screen
      name="PatientManagement"
      component={PatientManagementScreen}
    />
    <Stack.Screen name="BhwAppointment" component={BhwAppointmentScreen} />
    <Stack.Screen name="BhwInventory" component={BhwInventoryScreen} />
    <Stack.Screen name="BhwReports" component={BhwReportsScreen} />
    <Stack.Screen
      name="BhwViewReport"
      component={BhwViewReportScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const BnsStack = () => (
  <Stack.Navigator screenOptions={{ header: () => <FixedHeader /> }}>
    <Stack.Screen name="BnsDashboard" component={BnsDashboardScreen} />
    <Stack.Screen
      name="ChildHealthRecords"
      component={ChildHealthRecordsScreen}
    />
    <Stack.Screen name="BnsAppointment" component={BnsAppointmentScreen} />
    <Stack.Screen name="BnsInventory" component={BnsInventoryScreen} />
    <Stack.Screen name="BnsReports" component={BnsReportsScreen} />
    <Stack.Screen
      name="BnsViewReport"
      component={BnsViewReportScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// --- NEW: A separate Tab Navigator for the Maternal User ---
const UserTabs = () => (
  <Tab.Navigator
    screenOptions={{
      // The incorrect 'header' line has been REMOVED from here.
      headerShown: false,
      tabBarActiveTintColor: "#c026d3",
      tabBarInactiveTintColor: "gray",
      tabBarShowLabel: false,
      tabBarStyle: {
        position: "absolute",
        bottom: 15,
        left: 20,
        right: 20,
        backgroundColor: "#fce7f3", // Light pink background
        borderRadius: 15,
        height: 60,
        borderTopWidth: 0,
        elevation: 5,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={UserDashboardScreen}
      options={{ tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
    />
    <Tab.Screen
      name="Appointment"
      component={AppointmentScreen}
      options={{ tabBarIcon: ({ color }) => <AppointmentIcon color={color} /> }}
    />
    <Tab.Screen
      name="Records"
      component={ViewUserRecords}
      options={{ tabBarIcon: ({ color }) => <RecordsIcon color={color} /> }}
    />
  </Tab.Navigator>
);

// --- CHANGED: Renamed from MainTabs to WorkerTabs ---
const WorkerTabs = () => {
  const { profile } = useAuth();
  const isBns = profile?.role === "BNS";
  const UserStack = isBns ? BnsStack : BhwStack;

  return (
    <HeaderProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#2563eb",
          tabBarInactiveTintColor: "gray",
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: 15,
            left: 20,
            right: 20,
            elevation: 5,
            backgroundColor: "white",
            borderRadius: 15,
            height: 60,
            borderTopWidth: 0,
          },
          tabBarIcon: ({ color }) => {
            if (route.name === "Dashboard") return <HomeIcon color={color} />;
            if (route.name === "Patient") return <PatientIcon color={color} />;
            if (route.name === "Appointment")
              return <AppointmentIcon color={color} />;
            if (route.name === "Inventory")
              return <InventoryIcon color={color} />;
            if (route.name === "Reports") return <ReportsIcon color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={UserStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Dashboard", {
                screen: isBns ? "BnsDashboard" : "BhwDashboard",
              });
            },
          })}
        />
        <Tab.Screen
          name="Patient"
          component={UserStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Patient", {
                screen: isBns ? "ChildHealthRecords" : "PatientManagement",
              });
            },
          })}
        />
        <Tab.Screen
          name="Appointment"
          component={UserStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Appointment", {
                screen: isBns ? "BnsAppointment" : "BhwAppointment",
              });
            },
          })}
        />
        <Tab.Screen
          name="Inventory"
          component={UserStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Inventory", {
                screen: isBns ? "BnsInventory" : "BhwInventory",
              });
            },
          })}
        />
        <Tab.Screen
          name="Reports"
          component={UserStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Reports", {
                screen: isBns ? "BnsReports" : "BhwReports",
              });
            },
          })}
        />
      </Tab.Navigator>
    </HeaderProvider>
  );
};

// --- NEW: This component now acts as the MAIN ROLE SWITCHER ---
function MainApp() {
  const { profile } = useAuth();

  const renderMainComponent = () => {
    if (profile?.role === "USER/MOTHER/GUARDIAN") {
      // CHANGED: Render the UserStack instead of UserTabs directly
      return <UserStack />;
    }
    return <WorkerTabs />;
  };

  return <HeaderProvider>{renderMainComponent()}</HeaderProvider>;
}

// --- CHANGED: This is the ROOT of the logged-in experience ---
const AppNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Use the MainApp switcher to decide which UI to show */}
      <RootStack.Screen name="Main" component={MainApp} />
      {/* Modal screens are available to all roles */}
      <RootStack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ presentation: "fullScreenModal" }}
      />
      <RootStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: "modal" }}
      />
      <RootStack.Screen
        name="ProfileView"
        component={ProfileViewScreen}
        options={{ presentation: "modal" }}
      />
      <RootStack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ presentation: "modal" }}
      />
      <RootStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ presentation: "modal" }}
      />
      <RootStack.Screen
        name="About"
        component={AboutScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="ScheduleAppointment"
        component={ScheduleAppointmentScreen}
        options={{ presentation: "modal" }}
      />
      {/* These modals are better placed here, available to anyone in the app */}
      <RootStack.Screen
        name="ViewBhwInventoryModal"
        component={ViewBhwInventoryModal}
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
      <RootStack.Screen
        name="ViewBnsInventoryModal"
        component={ViewBnsInventoryModal}
        options={{ presentation: "transparentModal", animation: "fade" }}
      />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
