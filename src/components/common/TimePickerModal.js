// src/components/common/TimePickerModal.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// --- Constants for the Picker ---
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;

// --- Data for the scrollable lists ---
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function TimePickerModal({ isVisible, onClose, onTimeSelect }) {
    const [hour, setHour] = useState('08');
    const [minute, setMinute] = useState('00');
    const [ampm, setAmPm] = useState('AM');

    // This function is now triggered ONLY when the scroll animation stops.
    const onScrollEndHour = (e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        // Ensure index is within bounds to prevent errors
        if (HOURS[index]) {
            setHour(HOURS[index]);
        }
    };
    
    const onScrollEndMinute = (e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        if (MINUTES[index]) {
            setMinute(MINUTES[index]);
        }
    };

    const handleConfirm = () => {
        let finalHour = parseInt(hour, 10);
        if (ampm === 'PM' && finalHour !== 12) finalHour += 12;
        if (ampm === 'AM' && finalHour === 12) finalHour = 0;

        // Time Restriction Logic: 8:00 AM (8) to 4:59 PM (16). 5:00 PM (17) is invalid.
        if (finalHour < 8 || finalHour >= 17) {
            Alert.alert(
                "Invalid Time",
                "Please select a time between 8:00 AM and 5:00 PM.",
                [{ text: "OK" }]
            );
            return;
        }

        const formattedTime = `${String(finalHour).padStart(2, '0')}:${minute}`;
        onTimeSelect(formattedTime);
        onClose();
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemWrapper}>
            <Text style={styles.itemText}>{item}</Text>
        </View>
    );

    return (
        <Modal transparent={true} visible={isVisible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Animated.View style={styles.modalContainer} entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
                    <View style={styles.pickerContainer}>
                        <FlatList
                            data={HOURS}
                            renderItem={renderItem}
                            keyExtractor={item => `h-${item}`}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            // FIXED: Switched to a more reliable scroll end event
                            onMomentumScrollEnd={onScrollEndHour}
                            // This makes the list start at 08:00 AM
                            initialScrollIndex={7} 
                            getItemLayout={(data, index) => ({
                                length: ITEM_HEIGHT,
                                offset: ITEM_HEIGHT * index,
                                index,
                            })}
                            contentContainerStyle={{ paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT }}
                        />
                        <Text style={styles.separator}>:</Text>
                        <FlatList
                            data={MINUTES}
                            renderItem={renderItem}
                            keyExtractor={item => `m-${item}`}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            onMomentumScrollEnd={onScrollEndMinute}
                            getItemLayout={(data, index) => ({
                                length: ITEM_HEIGHT,
                                offset: ITEM_HEIGHT * index,
                                index,
                            })}
                            contentContainerStyle={{ paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT }}
                        />
                        <View style={styles.ampmContainer}>
                            <TouchableOpacity onPress={() => setAmPm('AM')} style={[styles.ampmButton, ampm === 'AM' && styles.activeAmPmButton]}>
                                <Text style={[styles.ampmText, ampm === 'AM' && styles.activeAmPmText]}>AM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setAmPm('PM')} style={[styles.ampmButton, ampm === 'PM' && styles.activeAmPmButton]}>
                                <Text style={[styles.ampmText, ampm === 'PM' && styles.activeAmPmText]}>PM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                     <View style={styles.selectionIndicator} pointerEvents="none" />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={onClose}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirm}><Text style={styles.buttonText}>OK</Text></TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContainer: { backgroundColor: 'white', borderRadius: 20, width: '100%', maxWidth: 320, padding: 20, elevation: 10, alignItems: 'center' },
    pickerContainer: { flexDirection: 'row', height: ITEM_HEIGHT * VISIBLE_ITEMS, alignItems: 'center' },
    selectionIndicator: { position: 'absolute', top: 20 + ITEM_HEIGHT, left: 20, right: 20, height: ITEM_HEIGHT, backgroundColor: '#f3f4f6', borderRadius: 10, zIndex: -1 },
    itemWrapper: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
    itemText: { fontSize: 28, fontWeight: '600', color: '#374151' },
    separator: { fontSize: 28, fontWeight: 'bold', color: '#d1d5db' },
    ampmContainer: { marginLeft: 10 },
    ampmButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, marginVertical: 4 },
    activeAmPmButton: { backgroundColor: '#3b82f6' },
    ampmText: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
    activeAmPmText: { color: 'white' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignSelf: 'stretch', marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderColor: '#f3f4f6' },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10 },
});