import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';

import { HeaderProvider } from '../context/HeaderContext';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileViewScreen from '../screens/ProfileViewScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';

import FixedHeader from '../components/layout/FixedHeader'; // Import the header
import BhwDashboardScreen from '../components/bhw/BhwDashboardScreen';
import BhwAppointmentScreen from '../components/bhw/BhwAppointmentScreen';
import BhwInventoryScreen from '../components/bhw/BhwInventoryScreen';
import BhwReportsScreen from '../components/bhw/BhwReportsScreen'; 
import BhwViewReportScreen from '../components/bhw/ViewReportModal';
import QRScannerScreen from '../screens/QRScannerScreen';
import PatientManagementScreen from '../components/bhw/PatientManagementScreen'; // Import the screen

const PlaceholderScreen = ({ route }) => ( <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>{route.name} Screen</Text></View> );

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

// --- ICONS for the Tab Bar ---
const HomeIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8h5z"/></Svg> );
const PatientIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></Svg> );
const AppointmentIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></Svg> );
const InventoryIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 2h6v6h-6V4z"/></Svg> );
const ReportsIcon = ({ color }) => ( <Svg width={28} height={28} viewBox="0 0 24 24"><Path fill={color} d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></Svg> );

// --- This Stack contains all BHW screens that will share the same fixed header ---
const BhwStack = () => (
    <Stack.Navigator 
        screenOptions={{ 
            header: () => <FixedHeader />,
            contentStyle: { backgroundColor: '#f0f4f8' },
        }}
    >
        <Stack.Screen name="BhwDashboard" component={BhwDashboardScreen} />
        {/* --- ADDED PatientManagementScreen to the stack with the fixed header --- */}
        <Stack.Screen name="PatientManagement" component={PatientManagementScreen} />
        <Stack.Screen name="BhwAppointment" component={BhwAppointmentScreen} />
        <Stack.Screen name="BhwInventory" component={BhwInventoryScreen} />
        <Stack.Screen name="BhwReports" component={BhwReportsScreen} />
        <Stack.Screen name="BhwViewReport" component={BhwViewReportScreen} />
    </Stack.Navigator>
);

function MainTabs() {
    return (
        <HeaderProvider>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: '#2563eb',
                    tabBarInactiveTintColor: 'gray',
                    tabBarShowLabel: false,
                    tabBarStyle: { position: 'absolute', bottom: 15, left: 20, right: 20, elevation: 5, backgroundColor: 'white', borderRadius: 15, height: 60, borderTopWidth: 0 },
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
                <Tab.Screen name="Dashboard" component={BhwStack} />
                {/* --- THIS LINE IS CORRECTED --- */}
                <Tab.Screen 
                    name="Patient" 
                    component={BhwStack} 
                    initialParams={{ screen: 'PatientManagement' }}
                    listeners={({ navigation, route }) => ({
                        tabPress: (e) => {
                            e.preventDefault();
                            navigation.navigate('Patient', { screen: 'PatientManagement', params: route.params });
                        },
                    })}
                />                
                <Tab.Screen 
                    name="Appointment" 
                    component={BhwStack} 
                    initialParams={{ screen: 'BhwAppointment' }} 
                />
                <Tab.Screen 
                    name="Inventory" 
                    component={BhwStack} 
                    initialParams={{ screen: 'BhwInventory' }} 
                />
                <Tab.Screen name="Reports" component={BhwStack} initialParams={{ screen: 'BhwReports' }} />
            </Tab.Navigator>
        </HeaderProvider>    
    );
}



const AppNavigator = () => {
    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="Main" component={MainTabs} />
            <RootStack.Screen 
                name="QRScanner" 
                component={QRScannerScreen} 
                options={{ presentation: 'fullScreenModal' }} 
            />
            <RootStack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
            <RootStack.Screen name="ProfileView" component={ProfileViewScreen} options={{ presentation: 'modal' }} />
            <RootStack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ presentation: 'modal' }} />
        </RootStack.Navigator>
    );
};

export default AppNavigator;