// src/services/database.js
import * as SQLite from 'expo-sqlite';

let db = null;

export const migrateDatabase = async () => {
  try {
    const db = getDatabase();
    
    const result = await db.getAllAsync(`PRAGMA table_info(child_records)`);
    const existingColumns = result.map(col => col.name);
    
    console.log('Existing child_records columns:', existingColumns);
    
    // Add missing columns if needed
    const missingColumns = [
      'place_of_birth', 'father_name', 'guardian_name', 'nhts_no', 
      'philhealth_no', 'bmi', 'last_checkup', 'created_at'
    ].filter(col => !existingColumns.includes(col));
    
    for (const column of missingColumns) {
      console.log(`Adding missing column: ${column} to child_records`);
      let columnType = 'TEXT';
      if (column === 'bmi' || column === 'weight_kg' || column === 'height_cm') {
        columnType = 'REAL';
      }
      
      await db.execAsync(`ALTER TABLE child_records ADD COLUMN ${column} ${columnType}`);
    }
    
    // Check and update column types if needed
    const columnTypes = await db.getAllAsync(`PRAGMA table_info(child_records)`);
    const weightColumn = columnTypes.find(col => col.name === 'weight_kg');
    const heightColumn = columnTypes.find(col => col.name === 'height_cm');
    
    // If weight_kg or height_cm are TEXT, convert them to REAL
    if (weightColumn && heightColumn.type === 'TEXT') {
      console.log('Converting weight_kg from TEXT to REAL');
      await db.execAsync(`
        CREATE TABLE child_records_temp AS SELECT * FROM child_records;
        DROP TABLE child_records;
        CREATE TABLE child_records (
          id TEXT PRIMARY KEY,
          child_id TEXT UNIQUE,
          first_name TEXT,
          last_name TEXT,
          dob TEXT,
          sex TEXT,
          place_of_birth TEXT,
          mother_name TEXT,
          father_name TEXT,
          guardian_name TEXT,
          nhts_no TEXT,
          philhealth_no TEXT,
          weight_kg REAL,
          height_cm REAL,
          bmi REAL,
          nutrition_status TEXT,
          last_checkup TEXT,
          health_details TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP   
        );
        INSERT INTO child_records SELECT * FROM child_records_temp;
        DROP TABLE child_records_temp;
      `);
    }
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
  }
};

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
        id TEXT PRIMARY KEY, 
        patient_id TEXT UNIQUE, 
        first_name TEXT, 
        last_name TEXT, 
        age INTEGER, 
        risk_level TEXT DEFAULT 'NORMAL',
        contact_no TEXT,
        purok TEXT,          
        street TEXT,         
        medical_history TEXT,
        is_synced INTEGER DEFAULT 0 
      );
      
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY NOT NULL, 
        patient_display_id TEXT, 
        patient_name TEXT, 
        reason TEXT, 
        date TEXT, 
        time TEXT, 
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS child_records (
        id TEXT PRIMARY KEY,
        child_id TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        dob TEXT,
        sex TEXT,
        place_of_birth TEXT,
        mother_name TEXT,
        father_name TEXT,
        guardian_name TEXT,
        nhts_no TEXT,
        philhealth_no TEXT,
        weight_kg REAL,
        height_cm REAL,
        bmi REAL,
        nutrition_status TEXT,
        last_checkup TEXT,
        health_details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP   
      );
      
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sync_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_read INTEGER DEFAULT 0
      );
    `);

    console.log('All tables created successfully');
    await migrateDatabase();
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
