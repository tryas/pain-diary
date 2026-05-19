import { db } from "./db";
import {
  painEntries, treatments, attachments,
  type PainEntry, type InsertPainEntry,
  type Treatment, type InsertTreatment,
  type Attachment, type InsertAttachment,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllEntries(): PainEntry[];
  getEntry(id: number): PainEntry | undefined;
  createEntry(data: InsertPainEntry): PainEntry;
  updateEntry(id: number, data: Partial<InsertPainEntry>): PainEntry | undefined;
  deleteEntry(id: number): boolean;

  getTreatments(entryId: number): Treatment[];
  createTreatment(data: InsertTreatment): Treatment;
  updateTreatment(id: number, data: Partial<InsertTreatment>): Treatment | undefined;
  deleteTreatment(id: number): boolean;

  getAttachments(entryId: number): Attachment[];
  createAttachment(data: InsertAttachment): Attachment;
  deleteAttachment(id: number): boolean;
}

export class DatabaseStorage implements IStorage {
  // --- Entries ---
  getAllEntries(): PainEntry[] {
    return db.select().from(painEntries).orderBy(desc(painEntries.date)).all();
  }
  getEntry(id: number): PainEntry | undefined {
    return db.select().from(painEntries).where(eq(painEntries.id, id)).get();
  }
  createEntry(data: InsertPainEntry): PainEntry {
    return db.insert(painEntries).values(data).returning().get();
  }
  updateEntry(id: number, data: Partial<InsertPainEntry>): PainEntry | undefined {
    return db.update(painEntries).set(data).where(eq(painEntries.id, id)).returning().get();
  }
  deleteEntry(id: number): boolean {
    const result = db.delete(painEntries).where(eq(painEntries.id, id)).run();
    return result.changes > 0;
  }

  // --- Treatments ---
  getTreatments(entryId: number): Treatment[] {
    return db.select().from(treatments).where(eq(treatments.entryId, entryId)).orderBy(desc(treatments.date)).all();
  }
  createTreatment(data: InsertTreatment): Treatment {
    return db.insert(treatments).values(data).returning().get();
  }
  updateTreatment(id: number, data: Partial<InsertTreatment>): Treatment | undefined {
    return db.update(treatments).set(data).where(eq(treatments.id, id)).returning().get();
  }
  deleteTreatment(id: number): boolean {
    const result = db.delete(treatments).where(eq(treatments.id, id)).run();
    return result.changes > 0;
  }

  // --- Attachments ---
  getAttachments(entryId: number): Attachment[] {
    return db.select().from(attachments).where(eq(attachments.entryId, entryId)).orderBy(desc(attachments.createdAt)).all();
  }
  createAttachment(data: InsertAttachment): Attachment {
    return db.insert(attachments).values(data).returning().get();
  }
  deleteAttachment(id: number): boolean {
    const result = db.delete(attachments).where(eq(attachments.id, id)).run();
    return result.changes > 0;
  }
}

export const storage = new DatabaseStorage();
