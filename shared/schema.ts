import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pain entries table
export const painEntries = sqliteTable("pain_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  date: text("date").notNull(), // ISO string
  notes: text("notes").default(""),
  painPoints: text("pain_points").notNull().default("[]"),
});

export const insertPainEntrySchema = createInsertSchema(painEntries).omit({ id: true });
export type InsertPainEntry = z.infer<typeof insertPainEntrySchema>;
export type PainEntry = typeof painEntries.$inferSelect;

// Treatments table — процедуры/лечение, привязанные к записи боли
export const treatments = sqliteTable("treatments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entryId: integer("entry_id").notNull(),
  date: text("date").notNull(), // ISO string
  type: text("type").notNull(), // "medication"|"procedure"|"exercise"|"other"
  title: text("title").notNull(),
  notes: text("notes").default(""),
  result: text("result").default(""), // эффект: "helped"|"no_effect"|"worse"
  painPointId: text("pain_point_id").default(""),
  painPointName: text("pain_point_name").default(""),
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({ id: true });
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type Treatment = typeof treatments.$inferSelect;

// Attachments table — фото и документы, привязанные к записи боли
export const attachments = sqliteTable("attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entryId: integer("entry_id").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(), // base64 data URL
  createdAt: text("created_at").notNull(),
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({ id: true });
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type Attachment = typeof attachments.$inferSelect;

// TypeScript types for pain points (stored as JSON in painPoints column)
export type BodyView = "front" | "back" | "left" | "right";
export type PainIntensity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PainType = "sharp" | "aching" | "burning" | "throbbing" | "pressing" | "stabbing";

export interface PainPoint {
  id: string;
  view: BodyView;
  x: number;
  y: number;
  intensity: PainIntensity;
  painType: PainType;
  zoneId: string;
  zoneName: string;
  structures: string[];
  note: string;
}
