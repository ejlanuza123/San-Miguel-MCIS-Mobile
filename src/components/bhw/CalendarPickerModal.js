// src/components/bhw/CalendarPickerModal.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const Calendar = ({ onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (amount) => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + amount);
            return d;
        });
    };

    const calendarGrid = useMemo(() => {
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
                <Text style={styles.monthTitle}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                <TouchableOpacity onPress={() => changeMonth(1)}><Text style={styles.arrow}>&gt;</Text></TouchableOpacity>
            </View>
            <View style={styles.daysHeader}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <Text 
                key={`header-${i}`}  // <-- fixed: unique header keys
                style={styles.dayHeaderText}
                >
                {day}
                </Text>
            ))}
            </View>

            <View>
            {calendarGrid.map((week, weekIndex) => (
                <View key={`week-${currentDate.getMonth()}-${currentDate.getFullYear()}-${weekIndex}`} style={styles.weekRow}>
                {week.map((dayObj, dayIndex) => {
                    const key = `cell-${currentDate.getMonth()}-${currentDate.getFullYear()}-${weekIndex}-${dayIndex}`;

                    if (!dayObj.day) return <View key={key} style={styles.dayCell} />;
                    
                    const { day, fullDate } = dayObj;
                    const isWeekend = fullDate.getDay() === 0 || fullDate.getDay() === 6;

                    return (
                    <TouchableOpacity
                        key={key}
                        style={styles.dayCell}
                        disabled={isWeekend}
                        onPress={() => onDateSelect(fullDate)}
                    >
                        <Text style={[styles.dayText, isWeekend && styles.weekendText]}>{day}</Text>
                    </TouchableOpacity>
                    );
                })}
                </View>
            ))}
            </View>
        </View>
    );
};

export default function CalendarPickerModal({ onClose, onDateSelect }) {
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
                    <Calendar onDateSelect={handleDateSelection} />
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContainer: { backgroundColor: 'white', borderRadius: 15, padding: 20, width: '100%' },
    calendarContainer: {},
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    monthTitle: { fontSize: 16, fontWeight: 'bold' },
    arrow: { fontSize: 24, color: '#3b82f6' },
    daysHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5 },
    dayHeaderText: { width: 32, textAlign: 'center', color: '#6b7280', fontWeight: 'bold' },
    weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
    dayCell: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    dayText: { fontSize: 14 },
    weekendText: { color: '#d1d5db' },
    cancelButton: { marginTop: 15, alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 16 },
    cancelButtonText: { color: '#3b82f6', fontWeight: '600' }
});