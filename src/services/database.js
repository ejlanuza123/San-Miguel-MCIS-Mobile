// src/services/database.js
import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  if (db) {
    return db;
  }

  try {
    // For Expo SDK 54+, use the new API
    console.log('Opening database with Expo SQLite...');
    
    // Method 1: Direct database opening
    db = SQLite.openDatabaseSync('bhs-mcis.db');
    console.log('Database opened successfully with openDatabaseSync');

    // Initialize tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY NOT NULL, 
        patient_id TEXT UNIQUE, 
        first_name TEXT, 
        last_name TEXT, 
        age INTEGER, 
        risk_level TEXT,
        medical_history TEXT,
        is_synced INTEGER DEFAULT 0 
      );
      
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY NOT NULL, 
        patient_display_id TEXT, 
        patient_name TEXT, 
        reason TEXT, 
        date TEXT, 
        time TEXT, 
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS child_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supabase_id TEXT UNIQUE, -- store UUID here instead
        child_id TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        dob TEXT,
        sex TEXT,
        mother_name TEXT,
        nutrition_status TEXT,
        health_details TEXT
    );
      
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT\,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('All tables created successfully');
    return db;

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export default db;