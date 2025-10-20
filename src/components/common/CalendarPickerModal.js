// src/components/bns/CalendarPickerModal.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Main Calendar Component ---
const Calendar = ({ onDateSelect, disableWeekends, mode }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
    const [yearOffset, setYearOffset] = useState(0);
    const yearsPerPage = 12;

    const today = useMemo(() => new Date(), []);
    const todayDate = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()), [today]);

    const years = useMemo(() => {
        const startYear = 1900;
        const endYear = today.getFullYear() + 10;
        return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    }, [today]);

    const months = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);

    const changeMonth = (amount) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + amount);
        setCurrentDate(newDate);
    };
    const changeYear = (year) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(year);
        setCurrentDate(newDate);
        setViewMode('months');
    };
    const changeMonthFromPicker = (monthIndex) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(monthIndex);
        setCurrentDate(newDate);
        setViewMode('days');
    };

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];
        let dayCounter = 1;

        for (let i = 0; i < 6; i++) {
            if (dayCounter > daysInMonth) break;
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || dayCounter > daysInMonth) {
                    week.push(null);
                } else {
                    week.push(new Date(year, month, dayCounter++));
                }
            }
            grid.push(week);
        }
        return grid;
    }, [currentDate]);

    const isPrevMonthDisabled = useMemo(() => {
        if (mode === 'appointment') {
            const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return prevMonth < currentMonthStart;
        }
        return false; // allow past months for non-appointment modes
    }, [currentDate, today, mode]);

    // FIXED: Only restrict dates in appointment mode
    const isDateDisabled = (date) => {
        // For appointment mode: disable past dates and optionally weekends
        if (mode === 'appointment') {
            const isPastDate = date < todayDate;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            return isPastDate || (disableWeekends && isWeekend);
        }
        // For ALL other modes (birthday, events, forms, etc.): NO RESTRICTIONS AT ALL
        return false;
    };

    const handleNextYears = () => {
        if (yearOffset + yearsPerPage < years.length) {
            setYearOffset(prev => prev + yearsPerPage);
        }
    };

    const handlePrevYears = () => {
        if (yearOffset - yearsPerPage >= 0) {
            setYearOffset(prev => prev - yearsPerPage);
        }
    };

    const renderDaysView = () => (
        <>
            <View style={styles.daysHeader}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <Text key={i} style={styles.dayHeaderText}>{day}</Text>
                ))}
            </View>
            {calendarGrid.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.weekRow}>
                    {week.map((date, dayIndex) => {
                        if (!date) return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.dayCell} />;
                        const isToday = date.toDateString() === today.toDateString();
                        const isDisabled = isDateDisabled(date);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        return (
                            <TouchableOpacity
                                key={date.toISOString()}
                                style={[
                                    styles.dayCell,
                                    isToday && styles.todayCell,
                                    isDisabled && styles.disabledCell,
                                    isWeekend && styles.weekendCell
                                ]}
                                disabled={isDisabled}
                                onPress={() => onDateSelect(date)}
                            >
                                <Text style={[
                                    styles.dayText,
                                    isToday && styles.todayText,
                                    isDisabled && styles.disabledText,
                                    isWeekend && styles.weekendText
                                ]}>
                                    {date.getDate()}
                                </Text>
                                {mode === 'appointment' && !isDisabled && <View style={styles.selectableIndicator} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </>
    );

    const renderMonthsView = () => (
        <View style={styles.monthGrid}>
            {months.map((month, index) => (
                <TouchableOpacity
                    key={month}
                    style={[styles.monthItem, index === currentDate.getMonth() && styles.selectedMonthItem]}
                    onPress={() => changeMonthFromPicker(index)}
                >
                    <Text style={[styles.monthText, index === currentDate.getMonth() && styles.selectedMonthText]}>
                        {month}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderYearsView = () => {
        const pagedYears = years.slice(yearOffset, yearOffset + yearsPerPage);
        return (
            <View style={styles.yearPickerContainer}>
                <View style={styles.yearNavContainer}>
                    <TouchableOpacity onPress={handlePrevYears} disabled={yearOffset === 0}>
                        <Text style={[styles.yearNavArrow, yearOffset === 0 && styles.disabledArrow]}>{'<'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.yearRangeText}>
                        {pagedYears[0]} - {pagedYears[pagedYears.length - 1]}
                    </Text>

                    <TouchableOpacity onPress={handleNextYears} disabled={yearOffset + yearsPerPage >= years.length}>
                        <Text style={[styles.yearNavArrow, yearOffset + yearsPerPage >= years.length && styles.disabledArrow]}>{'>'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.yearGrid}>
                    {pagedYears.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.yearItem,
                                styles.yearItemSmall, // Added this style
                                item === currentDate.getFullYear() && styles.selectedYearItem
                            ]}
                            onPress={() => changeYear(item)}
                        >
                            <Text
                                style={[
                                    styles.yearText,
                                    item === currentDate.getFullYear() && styles.selectedYearText
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderView = () => {
        switch (viewMode) {
            case 'years': return renderYearsView();
            case 'months': return renderMonthsView();
            default: return renderDaysView();
        }
    };

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth(-1)} disabled={isPrevMonthDisabled}>
                    <Text style={[styles.arrow, isPrevMonthDisabled && styles.disabledArrow]}>&lt;</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <TouchableOpacity onPress={() => setViewMode('months')}>
                        <Text style={styles.monthTitle}>{currentDate.toLocaleString('default', { month: 'long' })}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewMode('years')}>
                        <Text style={styles.yearTitle}>{currentDate.getFullYear()}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <Text style={styles.arrow}>&gt;</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.calendarBody}>{renderView()}</View>
        </View>
    );
};

// --- Main Modal Component ---
export default function CalendarPickerModal({ onClose, onDateSelect, disableWeekends, mode = 'appointment' }) {
    // FIXED: Only disable weekends by default for appointment mode
    const effectiveDisableWeekends = disableWeekends ?? (mode === 'appointment');

    const handleDateSelection = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        onDateSelect(`${year}-${month}-${day}`);
        onClose();
    };

    return (
        <Modal transparent={true} animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <Animated.View
                    style={styles.modalContainer}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    onStartShouldSetResponder={() => true}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Date</Text>
                    </View>
                    <Calendar 
                        onDateSelect={handleDateSelection} 
                        disableWeekends={effectiveDisableWeekends} 
                        mode={mode} 
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: SCREEN_WIDTH - 40,
        maxWidth: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10
    },
    modalHeader: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center'
    },
    calendarContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        height: 380
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    headerTitleContainer: {
        alignItems: 'center'
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3b82f6',
        marginBottom: 2
    },
    yearTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280'
    },
    arrow: {
        fontSize: 24,
        color: '#3b82f6',
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    disabledArrow: {
        color: '#d1d5db'
    },
    calendarBody: {
        flex: 1
    },
    daysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10
    },
    dayHeaderText: {
        width: 36,
        textAlign: 'center',
        color: '#6b7280',
        fontWeight: '600',
        fontSize: 12
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 4
    },
    dayCell: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        position: 'relative'
    },
    todayCell: {
        backgroundColor: '#dbeafe'
    },
    disabledCell: {
        opacity: 0.4
    },
    weekendCell: {
        // Optional weekend styling
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151'
    },
    todayText: {
        color: '#1d4ed8',
        fontWeight: 'bold'
    },
    disabledText: {
        color: '#9ca3af'
    },
    weekendText: {
        color: '#ef4444'
    },
    selectableIndicator: {
        position: 'absolute',
        bottom: 2,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#3b82f6'
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20
    },
    monthItem: {
        width: '30%',
        alignItems: 'center',
        paddingVertical: 15,
        margin: 5,
        borderRadius: 10,
        backgroundColor: '#f3f4f6'
    },
    selectedMonthItem: {
        backgroundColor: '#3b82f6'
    },
    monthText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151'
    },
    selectedMonthText: {
        color: 'white',
        fontWeight: 'bold'
    },
    yearItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical: 2,
        borderRadius: 10,
        marginHorizontal: 6,
        marginBottom: 8
    },
    selectedYearItem: {
        backgroundColor: '#3b82f6'
    },
    yearText: {
        fontSize: 16,
        color: '#374151',
        textAlign: 'center'
    },
    selectedYearText: {
        color: 'white',
        fontWeight: 'bold'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: '#f1f5f9'
    },
    cancelButtonText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 14
    },

    // --- Year picker styles ---
    yearPickerContainer: {
        alignItems: 'center',
        paddingVertical: 10
    },
    yearNavContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 10
    },
    yearNavArrow: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3b82f6',
        paddingHorizontal: 15
    },
    yearRangeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937'
    },
    yearGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 10
    },
    yearItemSmall: {
        minWidth: 68,
        alignItems: 'center',
        justifyContent: 'center'
    }
});