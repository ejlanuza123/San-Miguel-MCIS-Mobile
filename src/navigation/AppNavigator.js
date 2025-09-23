import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import { View, Text } from 'react-native';

// Import Screens
import BhwDashboardScreen from '../screens/BhwDashboardScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

// Placeholder screens for the other tabs
const PlaceholderScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.name} Screen</Text>
    </View>
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- ICONS for the Tab Bar ---
const HomeIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8h5z"/></Svg> );
const PatientIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></Svg> );
const AppointmentIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></Svg> );
const InventoryIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 2h6v6h-6V4z"/></Svg> );
const ReportsIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></Svg> );

// This is the main tab navigator for logged-in users
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#2563eb',
                tabBarInactiveTintColor: 'gray',
                tabBarShowLabel: false,
                // --- MODIFIED: Styles for a clean, floating navigation bar ---
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 45, // Adjust this value to move it up or down
                    left: 20,
                    right: 20,
                    backgroundColor: 'white',
                    borderRadius: 10,
                    height: 45,
                    borderTopWidth: 0, // Removes the top border line
                    // Adds a subtle shadow for better appearance
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                },
                tabBarIcon: ({ color }) => {
                    const size = 28;
                    if (route.name === 'Dashboard') return <HomeIcon color={color} size={size} />;
                    if (route.name === 'Patient') return <PatientIcon color={color} size={size} />;
                    if (route.name === 'Appointment') return <AppointmentIcon color={color} size={size} />;
                    if (route.name === 'Inventory') return <InventoryIcon color={color} size={size} />;
                    if (route.name === 'Reports') return <ReportsIcon color={color} size={size} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={BhwDashboardScreen} />
            <Tab.Screen name="Patient" component={PlaceholderScreen} />
            <Tab.Screen name="Appointment" component={PlaceholderScreen} />
            <Tab.Screen name="Inventory" component={PlaceholderScreen} />
            <Tab.Screen name="Reports" component={PlaceholderScreen} />
        </Tab.Navigator>
    );
}

// This is the root navigator for the authenticated part of the app
const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    );
};

export default AppNavigator;