// src/services/syncService.js
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from './database';
import { supabase } from './supabase';

// Helper function to delete a single item from the queue
const deleteFromQueue = async (id) => {
  const db = getDatabase();
  try {
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', id);
  } catch (error) {
    console.error('Failed to delete from sync queue:', error);
  }
};

// Add this function to show sync notifications
const showSyncNotification = async (action, tableName, payload, success = true) => {
  const db = getDatabase();

  if (!success) return;

  let message = '';

  try {
    if (tableName === 'patients' && action === 'create') {
      const firstName = payload?.first_name?.toString() || 'Unknown';
      const lastName = payload?.last_name?.toString() || '';
      const patientId = payload?.patient_id?.toString() || 'Unknown ID';
      message = `Patient ${firstName} ${lastName} (${patientId}) successfully synced to server`;
    } else if (tableName === 'appointments' && action === 'create') {
      const patientName = payload?.patient_name?.toString() || 'Unknown Patient';
      const date = payload?.date?.toString() || 'Unknown Date';
      const time = payload?.time?.toString() || '';
      const timeDisplay = time ? ` at ${time}` : '';
      message = `Appointment for ${patientName} on ${date}${timeDisplay} successfully synced to server`;
    } else if (tableName === 'child_records' && action === 'create') {
        const firstName = (payload?.first_name ?? 'Unknown').toString();
        const lastName = (payload?.last_name ?? '').toString();
        const childId = (payload?.child_id ?? 'Unknown ID').toString();
      message = `Child record for ${firstName} ${lastName} (${childId}) successfully synced to server`;
    } else {
      message = `${tableName} ${action} operation successfully synced to server`;
    }

    // ✅ Safety check: ensure a valid message
    if (typeof message !== 'string' || message.trim().length === 0) {
      message = 'Unknown sync notification'; // fallback text
    }

    await db.runAsync(
      `INSERT INTO sync_notifications (message, type, created_at) VALUES (?, ?, datetime('now'))`,
      message.trim(),
      'success'
    );

    console.log('Sync notification stored:', message);
  } catch (error) {
    console.error('Failed to store sync notification:', error, message);
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
    
    try {
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
                    
                    try {
                        const { data, error: insertError } = await supabase.from('patients').insert([payload]).select();
                        syncResultData = data ? data[0] : null;
                        error = insertError;
                    } catch (networkError) {
                        console.error('Network error during patient sync:', networkError);
                        error = networkError;
                        continue;
                    }

                } else if (item.action === 'create' && item.table_name === 'appointments') {
                    console.log(`Syncing new appointment: ${payload.patient_name}`);
                    
                    // Create a clean payload for appointments
                    const syncPayload = { ...payload };
                    
                    // Remove created_by if it's null/undefined to avoid schema issues
                    if (!syncPayload.created_by || syncPayload.created_by === null || syncPayload.created_by === undefined) {
                        delete syncPayload.created_by;
                    }
                    
                    // Remove patient_id if it's null/undefined (since it's a foreign key)
                    if (!syncPayload.patient_id || syncPayload.patient_id === null || syncPayload.patient_id === undefined) {
                        delete syncPayload.patient_id;
                    }
                    
                    // Ensure date fields are properly formatted
                    if (syncPayload.date) {
                        syncPayload.date = syncPayload.date.toString();
                    }
                    if (syncPayload.time) {
                        syncPayload.time = syncPayload.time.toString();
                    }
                    
                    console.log('Syncing appointment payload:', syncPayload);
                    
                    try {
                        const { data, error: insertError } = await supabase
                            .from('appointments')
                            .insert([syncPayload])
                            .select();
                        
                        syncResultData = data ? data[0] : null;
                        error = insertError;
                    } catch (networkError) {
                        console.error('Network error during appointment sync:', networkError);
                        error = networkError;
                        continue;
                    }

                } else if (item.action === 'create' && item.table_name === 'child_records') {
                    console.log(`Syncing new child record: ${payload.child_id}`);
                    
                    // Create a clean payload with safe data handling
                    const syncPayload = { ...payload };
                    
                    // Remove user_id entirely if it's null/undefined to avoid schema cache error
                    if (!syncPayload.user_id || syncPayload.user_id === null || syncPayload.user_id === undefined) {
                        delete syncPayload.user_id;
                    }
                    
                    // Ensure numeric fields are properly typed with null safety
                    syncPayload.weight_kg = syncPayload.weight_kg ? parseFloat(syncPayload.weight_kg) : null;
                    syncPayload.height_cm = syncPayload.height_cm ? parseFloat(syncPayload.height_cm) : null;
                    syncPayload.bmi = syncPayload.bmi ? parseFloat(syncPayload.bmi) : null;
                    
                    console.log('Syncing child record payload:', syncPayload);
                    
                    try {
                        const { data, error: insertError } = await supabase
                            .from('child_records')
                            .insert([syncPayload])
                            .select();
                        
                        syncResultData = data ? data[0] : null;
                        error = insertError;
                    } catch (networkError) {
                        console.error('Network error during child record sync:', networkError);
                        error = networkError;
                        continue;
                    }

                } else if (item.action === 'create') {
                    try {
                        const { data, error: insertError } = await supabase.from(item.table_name).insert([payload]).select();
                        syncResultData = data ? data[0] : null;
                        error = insertError;
                    } catch (networkError) {
                        console.error(`Network error during ${item.table_name} sync:`, networkError);
                        error = networkError;
                        continue;
                    }

                } else if (item.action === 'update') {
                    const { id, ...updateData } = payload; 
                    if (!id) {
                        console.error('Update payload is missing an ID:', payload);
                        continue;
                    }
                    try {
                        const { error: updateError } = await supabase.from(item.table_name).update(updateData).eq('id', id);
                        error = updateError;
                    } catch (networkError) {
                        console.error(`Network error during ${item.table_name} update:`, networkError);
                        error = networkError;
                        continue;
                    }
                }

                if (!error) {
                    // Update local DB after sync
                    if (item.table_name === 'patients' && payload.patient_id?.startsWith('P-')) {
                        // Update with final patient_id from server if different
                        if (syncResultData && syncResultData.patient_id !== payload.patient_id) {
                            await db.runAsync('UPDATE patients SET patient_id = ? WHERE patient_id = ?;', 
                                syncResultData.patient_id,
                                payload.patient_id
                            );
                        }
                        await db.runAsync('UPDATE patients SET is_synced = 1 WHERE patient_id = ?;', 
                            (syncResultData?.patient_id || payload.patient_id) 
                        );
                    } else if (item.table_name === 'child_records' && syncResultData) {
                        // Update child_records with server-generated ID if needed
                        if (syncResultData.id !== payload.id) {
                            await db.runAsync('UPDATE child_records SET id = ? WHERE child_id = ?;', 
                                syncResultData.id,
                                payload.child_id
                            );
                        }
                    } else if (item.table_name === 'appointments' && syncResultData) {
                        // Update appointments with server-generated ID if needed
                        if (syncResultData.id !== payload.id) {
                            await db.runAsync('UPDATE appointments SET id = ? WHERE patient_display_id = ? AND date = ?;', 
                                syncResultData.id, 
                                payload.patient_display_id, 
                                payload.date
                            );
                        }
                    }
                    
                    await deleteFromQueue(item.id);
                    syncedCount++;
                    
                    // Show sync success notification with error handling
                    try {
                        await showSyncNotification(item.action, item.table_name, payload, true);
                    } catch (notifError) {
                        console.error('Failed to create sync notification:', notifError);
                        // Don't fail the entire sync if notification fails
                    }
                    
                } else {
                    console.error(`Failed to sync item ${item.id}:`, error.message);
                    
                    // Handle network errors specifically
                    if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
                        console.log('Network error detected, stopping sync to retry later');
                        break; // Stop the sync loop to retry later
                    }
                }
            } catch (e) {
                console.error(`An unexpected error occurred while syncing item ${item.id}:`, e);
                
                // If it's a network error, stop the sync process
                if (e.message?.includes('Network') || e.message?.includes('fetch')) {
                    console.log('Network error detected, stopping sync process');
                    break;
                }
            }
        }
        
        console.log(`Sync process finished. ${syncedCount} items synced successfully.`);
    } catch (error) {
        console.error('Error during sync process:', error);
    }
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
            if (addNotification && notif.message) {
                addNotification(notif.message, notif.type || 'success');
                console.log('Showing sync notification:', notif.message);
            }
            // Mark as read
            await db.runAsync('UPDATE sync_notifications SET is_read = 1 WHERE id = ?', notif.id);
        }
        
        return notifications.length;
    } catch (error) {
        console.error('Error checking sync notifications:', error);
        return 0;
    }
};