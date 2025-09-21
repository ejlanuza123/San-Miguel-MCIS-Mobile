import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen'; // Correct path to the screen

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
        </Tab.Navigator>
    );
};

export default AppNavigator;