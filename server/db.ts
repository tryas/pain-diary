import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

const sqlite = new Database("./data.db");
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS pain_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    pain_points TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    result TEXT DEFAULT '',
    pain_point_id TEXT DEFAULT '',
    pain_point_name TEXT DEFAULT '',
    FOREIGN KEY (entry_id) REFERENCES pain_entries(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES pain_entries(id) ON DELETE CASCADE
  );
`);

// Migrate existing DBs: add new columns if they don't exist yet
for (const col of [
  "ALTER TABLE treatments ADD COLUMN pain_point_id TEXT DEFAULT ''",
  "ALTER TABLE treatments ADD COLUMN pain_point_name TEXT DEFAULT ''",
]) {
  try { sqlite.exec(col); } catch (_) { /* column already exists */ }
}
