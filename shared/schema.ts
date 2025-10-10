
import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const requestStatus = ["pending_approval", "pending_payment", "denied", "processing", "ready_for_pickup", "completed", "cancelled"] as const;
export const paymentStatus = ["unpaid", "paid", "pending_verification"] as const;

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
});

// Represents a single document that can be requested
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  price: integer("price").notNull(),
  processingTimeDays: integer("processing_time_days").notNull(), // Estimated time in days to process
});

// Represents a single request made by a student, which can contain multiple document items
export const documentRequests = pgTable("document_requests", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  yearLevel: text("year_level").notNull(),
  course: text("course").notNull(),
  email: text("email").notNull(),
  purpose: text("purpose").notNull(),
  
  // Stores the list of requested documents, their details, price, and processing time at the time of request
  documents: jsonb("documents").$type<Array<{ name: string; details?: string; price: number; processingTimeDays: number }>>().notNull(),
  
  totalAmount: integer("total_amount").notNull(),
  estimatedCompletionDays: integer("estimated_completion_days").notNull(),

  status: text("status", { enum: requestStatus }).notNull().default("pending_payment"),
  paymentStatus: text("payment_status", { enum: paymentStatus }).notNull().default("unpaid"),
  receipt: text("receipt"),

  queueNumber: integer("queue_number"),
  rejectionReason: text("rejection_reason"),
  
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processingStartedAt: timestamp("processing_started_at"),
  completedAt: timestamp("completed_at"),

  userId: text("user_id").references(() => users.id),
});


// Zod schema for inserting a user (validation)
export const insertUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Zod schema for inserting a document request (validation)
export const insertRequestSchema = createInsertSchema(documentRequests, {
  documents: z.array(z.object({
    name: z.string(),
    details: z.string().optional(),
    price: z.number().nonnegative(), // Allow 0 for free documents
    processingTimeDays: z.number().min(1), // Must be at least 1 day
  })).min(1, "At least one document must be selected"),
  totalAmount: z.number().nonnegative(), // Allow 0 for free requests
  estimatedCompletionDays: z.number().min(1), // Must be at least 1 day
  userId: z.string(),
}).omit({ 
  id: true, 
  status: true, 
  paymentStatus: true, 
  queueNumber: true, 
  requestedAt: true, 
  rejectionReason: true, 
  processingStartedAt: true, 
  completedAt: true,
  receipt: true 
});

// TypeScript types inferred from the database schema
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Document = typeof documents.$inferSelect;
export type DocumentInsert = z.infer<typeof insertRequestSchema.shape.documents.element>;

export type DocumentRequest = typeof documentRequests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;

export type RequestStatus = typeof requestStatus[number];
export type PaymentStatus = typeof paymentStatus[number];
