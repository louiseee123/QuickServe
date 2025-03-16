import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const requestStatus = ["pending", "processing", "ready", "completed"] as const;

export const documentRequests = pgTable("document_requests", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  documentType: text("document_type").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status", { enum: requestStatus }).notNull().default("pending"),
  queueNumber: integer("queue_number").notNull(),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
});

export const insertRequestSchema = createInsertSchema(documentRequests)
  .omit({ id: true, status: true, queueNumber: true, requestedAt: true })
  .extend({
    studentId: z.string().min(5, "Student ID is required"),
    studentName: z.string().min(2, "Full name is required"),
    documentType: z.string().min(1, "Document type is required"),
    purpose: z.string().min(10, "Please provide a detailed purpose"),
  });

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type DocumentRequest = typeof documentRequests.$inferSelect;
export type RequestStatus = typeof requestStatus[number];
