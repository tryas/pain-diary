/**
 * IndexedDB storage layer for Pain Diary.
 * All data lives on the device — no server needed.
 */

const DB_NAME = "pain-diary";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("entries")) {
        const entries = db.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
        entries.createIndex("date", "date");
      }
      if (!db.objectStoreNames.contains("snapshots")) {
        const snap = db.createObjectStore("snapshots", { keyPath: "id", autoIncrement: true });
        snap.createIndex("entryId", "entryId");
      }
      if (!db.objectStoreNames.contains("treatments")) {
        const tr = db.createObjectStore("treatments", { keyPath: "id", autoIncrement: true });
        tr.createIndex("entryId", "entryId");
      }
      if (!db.objectStoreNames.contains("attachments")) {
        const att = db.createObjectStore("attachments", { keyPath: "id", autoIncrement: true });
        att.createIndex("entryId", "entryId");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  db: IDBDatabase,
  stores: string | string[],
  mode: IDBTransactionMode,
  fn: (tx: IDBTransaction) => IDBRequest<T> | Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(stores, mode);
    t.onerror = () => reject(t.error);
    const result = fn(t);
    if (result instanceof IDBRequest) {
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    } else {
      result.then(resolve).catch(reject);
    }
  });
}

function getAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return tx(db, store, "readonly", (t) => t.objectStore(store).getAll());
}

function getAllByIndex<T>(db: IDBDatabase, store: string, index: string, key: IDBValidKey): Promise<T[]> {
  return tx(db, store, "readonly", (t) => t.objectStore(store).index(index).getAll(key));
}

function getOne<T>(db: IDBDatabase, store: string, id: number): Promise<T> {
  return tx(db, store, "readonly", (t) => t.objectStore(store).get(id));
}

function putOne<T>(db: IDBDatabase, store: string, item: T): Promise<number> {
  return tx(db, store, "readwrite", (t) => t.objectStore(store).put(item)) as Promise<number>;
}

function deleteOne(db: IDBDatabase, store: string, id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, "readwrite");
    const req = t.objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface IDBEntry {
  id?: number;
  title: string;
  date: string;
  notes: string;
  painPoints: string; // JSON
}
export interface IDBSnapshot {
  id?: number;
  entryId: number;
  date: string;
  intensity: number;
  painType: string;
  note: string;
}
export interface IDBTreatment {
  id?: number;
  entryId: number;
  date: string;
  type: string;
  title: string;
  notes: string;
  result: string;
}
export interface IDBAttachment {
  id?: number;
  entryId: number;
  filename: string;
  mimeType: string;
  size: number;
  data: string; // base64 data URL
  createdAt: string;
}

// Entries
export const idb = {
  async getEntries(): Promise<IDBEntry[]> {
    const db = await openDB();
    const all = await getAll<IDBEntry>(db, "entries");
    return all.sort((a, b) => b.date.localeCompare(a.date));
  },
  async getEntry(id: number): Promise<IDBEntry | undefined> {
    const db = await openDB();
    return getOne<IDBEntry>(db, "entries", id);
  },
  async createEntry(data: Omit<IDBEntry, "id">): Promise<IDBEntry> {
    const db = await openDB();
    const id = await putOne(db, "entries", data);
    return { ...data, id };
  },
  async updateEntry(id: number, data: Partial<Omit<IDBEntry, "id">>): Promise<IDBEntry> {
    const db = await openDB();
    const existing = await getOne<IDBEntry>(db, "entries", id);
    const updated = { ...existing, ...data, id };
    await putOne(db, "entries", updated);
    return updated;
  },
  async deleteEntry(id: number): Promise<void> {
    const db = await openDB();
    await deleteOne(db, "entries", id);
    // Cascade delete
    const snaps = await getAllByIndex<IDBSnapshot>(db, "snapshots", "entryId", id);
    for (const s of snaps) if (s.id) await deleteOne(db, "snapshots", s.id);
    const treats = await getAllByIndex<IDBTreatment>(db, "treatments", "entryId", id);
    for (const t of treats) if (t.id) await deleteOne(db, "treatments", t.id);
    const atts = await getAllByIndex<IDBAttachment>(db, "attachments", "entryId", id);
    for (const a of atts) if (a.id) await deleteOne(db, "attachments", a.id);
  },

  // Snapshots
  async getSnapshots(entryId: number): Promise<IDBSnapshot[]> {
    const db = await openDB();
    const all = await getAllByIndex<IDBSnapshot>(db, "snapshots", "entryId", entryId);
    return all.sort((a, b) => a.date.localeCompare(b.date));
  },
  async createSnapshot(data: Omit<IDBSnapshot, "id">): Promise<IDBSnapshot> {
    const db = await openDB();
    const id = await putOne(db, "snapshots", data);
    return { ...data, id };
  },
  async deleteSnapshot(id: number): Promise<void> {
    const db = await openDB();
    return deleteOne(db, "snapshots", id);
  },

  // Treatments
  async getTreatments(entryId: number): Promise<IDBTreatment[]> {
    const db = await openDB();
    const all = await getAllByIndex<IDBTreatment>(db, "treatments", "entryId", entryId);
    return all.sort((a, b) => b.date.localeCompare(a.date));
  },
  async createTreatment(data: Omit<IDBTreatment, "id">): Promise<IDBTreatment> {
    const db = await openDB();
    const id = await putOne(db, "treatments", data);
    return { ...data, id };
  },
  async deleteTreatment(id: number): Promise<void> {
    const db = await openDB();
    return deleteOne(db, "treatments", id);
  },

  // Attachments
  async getAttachments(entryId: number): Promise<IDBAttachment[]> {
    const db = await openDB();
    return getAllByIndex<IDBAttachment>(db, "attachments", "entryId", entryId);
  },
  async getAttachment(id: number): Promise<IDBAttachment | undefined> {
    const db = await openDB();
    return getOne<IDBAttachment>(db, "attachments", id);
  },
  async createAttachment(data: Omit<IDBAttachment, "id">): Promise<IDBAttachment> {
    const db = await openDB();
    const id = await putOne(db, "attachments", data);
    return { ...data, id };
  },
  async deleteAttachment(id: number): Promise<void> {
    const db = await openDB();
    return deleteOne(db, "attachments", id);
  },
};
