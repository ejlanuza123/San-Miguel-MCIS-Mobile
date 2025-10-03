// src/services/syncService.js
import NetInfo from '@react-native-community/netinfo';
import db from './database';
import { supabase } from './supabase';

export const syncOfflineData = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
        console.log("App is offline. Skipping sync.");
        return;
    }

    console.log("App is online. Starting sync process...");
    
    // Get all pending actions from the sync queue
    db.transaction(tx => {
        tx.executeSql(
            'SELECT * FROM sync_queue;',
            [],
            async (_, { rows: { _array: queue } }) => {
                if (queue.length === 0) {
                    console.log("Sync queue is empty.");
                    return;
                }

                for (const item of queue) {
                    const payload = JSON.parse(item.payload);
                    let error = null;

                    if (item.action === 'create') {
                        // Attempt to insert the record into Supabase
                        const { error: insertError } = await supabase.from(item.table_name).insert([payload]);
                        error = insertError;
                    }
                    // You can add logic for 'update' and 'delete' here as well

                    if (!error) {
                        // If sync was successful, remove the item from the local queue
                        tx.executeSql('DELETE FROM sync_queue WHERE id = ?;', [item.id]);
                        console.log(`Synced item ${item.id} from ${item.table_name}`);
                    } else {
                        console.error(`Failed to sync item ${item.id}:`, error.message);
                    }
                }
            }
        );
    });
};