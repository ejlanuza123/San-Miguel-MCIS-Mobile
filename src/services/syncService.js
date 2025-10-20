// src/services/syncService.js
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from './database';
import { supabase } from './supabase';

// Helper function to delete a single item from the queue
const deleteFromQueue = async (id) => {
  const db = getDatabase();
  await db.execAsync(`DELETE FROM sync_queue WHERE id = ${id};`);
};

// Add this function to show sync notifications
const showSyncNotification = async (action, tableName, payload, success = true) => {
    const db = getDatabase();
    
    if (success) {
        let message = '';
        
        if (tableName === 'patients' && action === 'create') {
            message = `Patient ${payload.first_name} ${payload.last_name} (${payload.patient_id}) successfully synced to server`;
        } else if (tableName === 'appointments' && action === 'create') {
            message = `Appointment for ${payload.patient_name} on ${payload.date} successfully synced to server`;
        } else {
            // Default message for other sync types
            message = `${tableName} data successfully synced to server`;
        }
        
        // Only insert if we have a valid message
        if (message) {
            await db.execAsync(
                `INSERT INTO sync_notifications (message, type, created_at) VALUES (?, ?, datetime('now'))`,
                [message, 'success']
            );
            console.log('Sync notification stored:', message);
        }
    }
};

export const syncOfflineData = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
        console.log("App is offline. Skipping sync.");
        return;
    }

    console.log("App is online. Starting sync process...");
    
    const db = getDatabase();
    const queue = await db.getAllAsync('SELECT * FROM sync_queue ORDER BY id ASC;');

    if (queue.length === 0) {
        console.log("Sync queue is empty.");
        return;
    }
    
    console.log(`Found ${queue.length} items to sync.`);

    let syncedCount = 0;

    for (const item of queue) {
        try {
            const payload = JSON.parse(item.payload);
            let error = null;
            let syncResultData = null;

            if (item.action === 'create' && item.table_name === 'patients') {
                console.log(`Syncing new patient: ${payload.patient_id}`);
                
                // For text risk_level, no validation needed
                const { data, error: insertError } = await supabase.from('patients').insert([payload]).select();
                syncResultData = data ? data[0] : null;
                error = insertError;

            } else if (item.action === 'create') {
                const { data, error: insertError } = await supabase.from(item.table_name).insert([payload]).select();
                syncResultData = data ? data[0] : null;
                error = insertError;

            } else if (item.action === 'update') {
                const { id, ...updateData } = payload; 
                if (!id) {
                    throw new Error('Update payload is missing an ID.');
                }
                const { error: updateError } = await supabase.from(item.table_name).update(updateData).eq('id', id);
                error = updateError;
            }

            if (!error) {
                // Update local DB after sync
                if (item.table_name === 'patients' && payload.patient_id?.startsWith('P-')) {
                    // Update with final patient_id from server if different
                    if (syncResultData && syncResultData.patient_id !== payload.patient_id) {
                        await db.runAsync('UPDATE patients SET patient_id = ? WHERE patient_id = ?;', [syncResultData.patient_id, payload.patient_id]);
                    }
                    await db.runAsync('UPDATE patients SET is_synced = 1 WHERE patient_id = ?;', [syncResultData?.patient_id || payload.patient_id]);
                }
                
                await deleteFromQueue(item.id);
                syncedCount++;
                
                // Show sync success notification
                await showSyncNotification(item.action, item.table_name, payload, true);
                
            } else {
                console.error(`Failed to sync item ${item.id}:`, error.message);
            }
        } catch (e) {
            console.error(`An unexpected error occurred while syncing item ${item.id}:`, e);
        }
    }
    
    console.log(`Sync process finished. ${syncedCount} items synced successfully.`);
};

// Add this function to check for pending sync notifications
export const checkSyncNotifications = async (addNotification) => {
    const db = getDatabase();
    
    try {
        const notifications = await db.getAllAsync(
            'SELECT * FROM sync_notifications WHERE is_read = 0 ORDER BY created_at DESC'
        );
        
        console.log(`Found ${notifications.length} sync notifications to show`);
        
        for (const notif of notifications) {
            if (addNotification) {
                addNotification(notif.message, notif.type);
                console.log('Showing sync notification:', notif.message);
            }
            // Mark as read
            await db.runAsync('UPDATE sync_notifications SET is_read = 1 WHERE id = ?', [notif.id]);
        }
        
        return notifications.length;
    } catch (error) {
        console.error('Error checking sync notifications:', error);
        return 0;
    }
};