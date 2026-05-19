// In-memory store for pain diary entries
// Works without any backend server

import type { PainEntry } from "@shared/schema";

let entries: PainEntry[] = [];
let nextId = 1;

export const store = {
  getAll(): PainEntry[] {
    return [...entries].sort((a, b) => b.date.localeCompare(a.date));
  },

  getById(id: number): PainEntry | undefined {
    return entries.find((e) => e.id === id);
  },

  create(data: Omit<PainEntry, "id">): PainEntry {
    const entry: PainEntry = { ...data, id: nextId++ };
    entries.push(entry);
    return entry;
  },

  update(id: number, data: Partial<Omit<PainEntry, "id">>): PainEntry | undefined {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    entries[idx] = { ...entries[idx], ...data };
    return entries[idx];
  },

  delete(id: number): boolean {
    const before = entries.length;
    entries = entries.filter((e) => e.id !== id);
    return entries.length < before;
  },
};
