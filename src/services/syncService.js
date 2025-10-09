// src/services/syncService.js
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from './database'; // <-- Use getDatabase to ensure it's initialized
import { supabase } from './supabase';

// Helper function to delete a single item from the queue
const deleteFromQueue = async (id) => {
  const db = getDatabase();
  await db.execAsync(`DELETE FROM sync_queue WHERE id = ${id};`);
};

export const syncOfflineData = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
        console.log("App is offline. Skipping sync.");
        return;
    }

    console.log("App is online. Starting sync process...");
    
    const db = getDatabase();
    // 1. Read all items from the queue into memory
    const queue = await db.getAllAsync('SELECT * FROM sync_queue ORDER BY id ASC;');

    if (queue.length === 0) {
        console.log("Sync queue is empty.");
        return;
    }
    
    console.log(`Found ${queue.length} items to sync.`);

    // 2. Loop through the items in memory (NOT inside a transaction)
    for (const item of queue) {
        try {
            const payload = JSON.parse(item.payload);
            let error = null;
            let syncResultData = null; // To hold the returned data from Supabase

            if (item.action === 'create' && item.table_name === 'patients') {
                // --- THIS IS THE NEW LOGIC FOR CREATING PATIENTS ---
                console.log(`Syncing new patient with temporary ID: ${payload.patient_id}`);
                const { data, error: rpcError } = await supabase.rpc('create_patient_with_sequential_id', { patient_data: payload });
                
                if (data && data.length > 0) {
                    syncResultData = data[0]; // The RPC returns an array
                }
                error = rpcError;

            } else if (item.action === 'create') {
                // This handles other tables like appointments
                const { data, error: insertError } = await supabase.from(item.table_name).insert([payload]).select();
                syncResultData = data ? data[0] : null;
                error = insertError;

            } else if (item.action === 'update') {
                // --- THIS IS THE NEW LOGIC FOR UPDATING ---
                // The payload must contain the 'id' of the record to update
                const { id, ...updateData } = payload; 
                if (!id) {
                    throw new Error('Update payload is missing an ID.');
                }
                const { error: updateError } = await supabase.from(item.table_name).update(updateData).eq('id', id);
                error = updateError;
            }

            if (!error) {
                // --- UPDATE LOCAL DB AFTER SYNC ---
                if (item.table_name === 'patients' && payload.patient_id?.startsWith('TEMP-')) {
                    // Update local patient ID
                    await db.runAsync('UPDATE patients SET patient_id = ? WHERE patient_id = ?;', [syncResultData.patient_id, payload.patient_id]);
                } else if (item.table_name === 'child_records' && payload.child_id?.startsWith('TEMP-')) {
                    // Update local child ID
                    await db.runAsync('UPDATE child_records SET child_id = ? WHERE child_id = ?;', [syncResultData.child_id, payload.child_id]);
                }
                
                await deleteFromQueue(item.id);
            } else {
                console.error(`Failed to sync item ${item.id}:`, error.message);
            }
        } catch (e) {
            console.error(`An unexpected error occurred while syncing item ${item.id}:`, e);
        }
    }
    console.log("Sync process finished.");
};