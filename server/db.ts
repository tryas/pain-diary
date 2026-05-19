import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

const sqlite = new Database("./data.db");
export const db = drizzle(sqlite, { schema });

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS pain_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    pain_points TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS pain_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    intensity INTEGER NOT NULL,
    pain_type TEXT NOT NULL,
    note TEXT DEFAULT '',
    FOREIGN KEY (entry_id) REFERENCES pain_entries(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    result TEXT DEFAULT '',
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
