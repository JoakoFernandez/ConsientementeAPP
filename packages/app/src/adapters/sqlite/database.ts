import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("consientemente.db");
    await initializeDatabase(db);
    await migrateDatabase(db);
  }
  return db;
}

async function ensureColumn(database: SQLite.SQLiteDatabase, table: string, column: string, definition: string): Promise<void> {
  try {
    const rows: any[] = await database.getAllAsync(`PRAGMA table_info(${table})`);
    if (rows.some((r) => r.name === column)) return;
    await database.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  } catch {
    // column already exists or table not present; ignore
  }
}

async function migrateDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  // Bring older installations in line with the current schema.
  await ensureColumn(database, "patients", "bankAccounts", "TEXT");
  await ensureColumn(database, "patients", "regularSchedules", "TEXT");
  await ensureColumn(database, "patients", "regularWeekDay", "TEXT");
  await ensureColumn(database, "patients", "regularTime", "TEXT");
  await ensureColumn(database, "payments", "invoiceStatus", "TEXT DEFAULT 'PENDING'");
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      dni TEXT NOT NULL,
      name TEXT NOT NULL,
      bankAccount TEXT,
      bankAccounts TEXT,
      ageCategory TEXT NOT NULL,
      age INTEGER NOT NULL,
      parentsNames TEXT NOT NULL,
      regularWeekDay TEXT,
      regularTime TEXT,
      regularSchedules TEXT,
      paymentFrequency TEXT NOT NULL,
      paymentAmount REAL NOT NULL,
      notes TEXT DEFAULT '',
      isActive INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'SCHEDULED',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      frequency TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      invoiceStatus TEXT DEFAULT 'PENDING',
      notes TEXT DEFAULT '',
      periodStart TEXT,
      periodEnd TEXT,
      paidAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS clinic_profile (
      id TEXT PRIMARY KEY,
      clinicName TEXT NOT NULL,
      psychologistName TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}
