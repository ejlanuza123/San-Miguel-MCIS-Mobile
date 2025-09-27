// src/components/bhw/CalendarPickerModal.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// This is the interactive calendar component
const Calendar = ({ onDateSelect, disableWeekends }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('days'); // 'days' or 'years'

    const changeMonth = (amount) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + amount);
        setCurrentDate(newDate);
    };

    const changeYear = (year) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(year);
        setCurrentDate(newDate);
        setViewMode('days'); // Switch back to day view after selecting a year
    };
    
    // Generate a list of years for the picker
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 20 }, (_, i) => currentYear - 10 + i); // Years from currentYear-10 to currentYear+9
    }, []);

    const calendarGrid = useMemo(() => {
        // ... (this logic remains the same)
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDay) || day > daysInMonth) {
                    week.push({ day: null });
                } else {
                    week.push({ day: day++, fullDate: new Date(year, month, day - 1) });
                }
            }
            grid.push(week);
            if (day > daysInMonth) break;
        }
        return grid;
    }, [currentDate]);

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth(-1)}><Text style={styles.arrow}>&lt;</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode(viewMode === 'days' ? 'years' : 'days')}>
                    <Text style={styles.monthTitle}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeMonth(1)}><Text style={styles.arrow}>&gt;</Text></TouchableOpacity>
            </View>
            
            {viewMode === 'days' ? (
                <>
                    <View style={styles.daysHeader}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => 
                            <Text key={`day-header-${index}-${day}`} style={styles.dayHeaderText}>{day}</Text>
                        )}
                    </View>
                    <View>
                        {calendarGrid.map((week, weekIndex) => (
                            <View key={`week-${weekIndex}-${currentDate.getMonth()}-${currentDate.getFullYear()}`} style={styles.weekRow}>
                                {week.map((dayObj, dayIndex) => {
                                    // Use a more unique key that includes date information
                                    const key = dayObj.day 
                                        ? `day-${currentDate.getFullYear()}-${currentDate.getMonth()}-${dayObj.day}`
                                        : `empty-${weekIndex}-${dayIndex}`;
                                        
                                    if (!dayObj.day) return <View key={key} style={styles.dayCell} />;
                                    
                                    const { day, fullDate } = dayObj;
                                    const isWeekend = fullDate.getDay() === 0 || fullDate.getDay() === 6;
                                    
                                    return (
                                        <TouchableOpacity 
                                            key={key} 
                                            style={styles.dayCell} 
                                            disabled={disableWeekends && isWeekend} 
                                            onPress={() => onDateSelect(fullDate)}
                                        >
                                            <Text style={[styles.dayText, (disableWeekends && isWeekend) && styles.weekendText]}>
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </>
            ) : (
                <View style={styles.yearPickerContainer}>
                    <FlatList
                        data={years}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.yearItem} onPress={() => changeYear(item)}>
                                <Text style={[styles.yearText, item === currentDate.getFullYear() && styles.selectedYearText]}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item.toString()}
                        numColumns={4}
                    />
                </View>
            )}
        </View>
    );
};

export default function CalendarPickerModal({ onClose, onDateSelect, disableWeekends = true }) {
    // ... (this part remains the same)
    const handleDateSelection = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        onDateSelect(`${year}-${month}-${day}`);
        onClose();
    };

    return (
        <Modal transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Animated.View style={styles.modalContainer} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
                    <Calendar onDateSelect={handleDateSelection} disableWeekends={disableWeekends} />
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContainer: { backgroundColor: 'white', borderRadius: 15, padding: 20, width: '100%', minHeight: 400 },
    calendarContainer: { flex: 1 },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    monthTitle: { fontSize: 16, fontWeight: 'bold' },
    arrow: { fontSize: 24, color: '#3b82f6' },
    daysHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
    dayHeaderText: { width: 32, textAlign: 'center', color: '#6b7280', fontWeight: 'bold' },
    weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
    dayCell: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    dayText: { fontSize: 14 },
    weekendText: { color: '#d1d5db' },
    yearPickerContainer: { flex: 1 },
    yearItem: { flex: 1, alignItems: 'center', paddingVertical: 15 },
    yearText: { fontSize: 16 },
    selectedYearText: { fontWeight: 'bold', color: '#3b82f6' },
    cancelButton: { marginTop: 15, alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 16 },
    cancelButtonText: { color: '#3b82f6', fontWeight: '600' }
});