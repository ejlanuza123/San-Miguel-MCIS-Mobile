// src/services/activityLogger.js
import { supabase } from './supabase';

/**
 * Logs an activity to the `activity_log` table in your Supabase database.
 * @param {string} action - A short title for the action (e.g., "New Patient Added").
 * @param {string} details - A brief description of what happened (e.g., "Registered patient Juan Dela Cruz").
 */
export const logActivity = async (action, details) => {
    try {
        // Get the current logged-in user to know who performed the action.
        const { data: { user } } = await supabase.auth.getUser();

        // If for some reason there's no user, don't try to log.
        if (!user) {
            console.warn("Attempted to log activity with no user session.");
            return;
        }

        // Insert a new row into your activity_log table.
        const { error } = await supabase
            .from('activity_log')
            .insert([{ 
                action, 
                details, 
                user_id: user.id 
            }]);

        if (error) {
            console.error('Error logging activity:', error.message);
        }
    } catch (error) {
        console.error('An unexpected error occurred in logActivity:', error);
    }
};