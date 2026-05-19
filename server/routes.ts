import type { Express } from "express";
import { createServer } from "node:http";
import type { Server } from "node:http";
import multer from "multer";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import {
  insertPainEntrySchema,
  insertTreatmentSchema,
  insertPainSnapshotSchema,
  attachments as attachmentsTable,
} from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Entries ──────────────────────────────────────────────────────────────
  app.get("/api/entries", (_req, res) => res.json(storage.getAllEntries()));

  app.get("/api/entries/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const entry = storage.getEntry(id);
    if (!entry) return res.status(404).json({ message: "Not found" });
    res.json(entry);
  });

  app.post("/api/entries", (req, res) => {
    const result = insertPainEntrySchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Validation error", errors: result.error.errors });
    res.status(201).json(storage.createEntry(result.data));
  });

  app.patch("/api/entries/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const partial = insertPainEntrySchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ message: "Validation error", errors: partial.error.errors });
    const updated = storage.updateEntry(id, partial.data);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });

  app.delete("/api/entries/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    if (!storage.deleteEntry(id)) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  // ── Snapshots (динамика боли) ─────────────────────────────────────────────
  app.get("/api/entries/:id/snapshots", (req, res) => {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) return res.status(400).json({ message: "Invalid id" });
    res.json(storage.getSnapshots(entryId));
  });

  app.post("/api/entries/:id/snapshots", (req, res) => {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) return res.status(400).json({ message: "Invalid id" });
    const result = insertPainSnapshotSchema.safeParse({ ...req.body, entryId });
    if (!result.success) return res.status(400).json({ message: "Validation error", errors: result.error.errors });
    res.status(201).json(storage.createSnapshot(result.data));
  });

  app.delete("/api/snapshots/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    if (!storage.deleteSnapshot(id)) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  // ── Treatments ───────────────────────────────────────────────────────────
  app.get("/api/entries/:id/treatments", (req, res) => {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) return res.status(400).json({ message: "Invalid id" });
    res.json(storage.getTreatments(entryId));
  });

  app.post("/api/entries/:id/treatments", (req, res) => {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) return res.status(400).json({ message: "Invalid id" });
    const result = insertTreatmentSchema.safeParse({ ...req.body, entryId });
    if (!result.success) return res.status(400).json({ message: "Validation error", errors: result.error.errors });
    res.status(201).json(storage.createTreatment(result.data));
  });

  app.patch("/api/treatments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const updated = storage.updateTreatment(id, req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  });

  app.delete("/api/treatments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    if (!storage.deleteTreatment(id)) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  // ── Attachments ──────────────────────────────────────────────────────────
  app.get("/api/entries/:id/attachments", (req, res) => {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) return res.status(400).json({ message: "Invalid id" });
    const list = storage.getAttachments(entryId).map(({ data: _data, ...meta }) => meta);
    res.json(list);
  });

  app.get("/api/attachments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const att = db.select().from(attachmentsTable).where(eq(attachmentsTable.id, id)).get();
    if (!att) return res.status(404).json({ message: "Not found" });
    res.json(att);
  });

  app.post("/api/entries/:id/attachments", upload.single("file"), (req, res) => {
    const entryId = parseInt(req.params.id);
    if (isNaN(entryId)) return res.status(400).json({ message: "Invalid id" });
    if (!req.file) return res.status(400).json({ message: "No file" });
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const att = storage.createAttachment({
      entryId,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: base64,
      createdAt: new Date().toISOString(),
    });
    const { data: _data, ...meta } = att;
    res.status(201).json(meta);
  });

  app.delete("/api/attachments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    if (!storage.deleteAttachment(id)) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  });

  return httpServer;
}
