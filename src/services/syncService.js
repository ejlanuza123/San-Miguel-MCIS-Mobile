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

            if (item.action === 'create') {
                const { error: insertError } = await supabase.from(item.table_name).insert([payload]);
                error = insertError;
            }
            // Add 'update' and 'delete' logic here if needed

            // 3. If the Supabase action was successful, delete it from the local queue
            if (!error) {
                await deleteFromQueue(item.id);
                console.log(`Synced and deleted item ${item.id} from table ${item.table_name}`);
            } else {
                // If it fails, log the error but leave it in the queue to try again later
                console.error(`Failed to sync item ${item.id}:`, error.message);
            }
        } catch (e) {
            console.error(`An unexpected error occurred while syncing item ${item.id}:`, e);
        }
    }
    console.log("Sync process finished.");
};