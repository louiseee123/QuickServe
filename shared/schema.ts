import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const requestStatus = ["pending_approval", "denied", "pending", "processing", "ready", "completed"] as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
});

export const documentRequests = pgTable("document_requests", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  yearLevel: text("year_level").notNull(),
  course: text("course").notNull(),
  email: text("email").notNull(),
  documentType: text("document_type").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status", { enum: requestStatus }).notNull().default("pending_approval"),
  queueNumber: integer("queue_number").notNull(),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({ username: true, password: true })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
  });

export const insertRequestSchema = createInsertSchema(documentRequests)
  .omit({ id: true, status: true, queueNumber: true, requestedAt: true, userId: true })
  .extend({
    studentId: z.string().min(5, "Student ID is required"),
    studentName: z.string().min(2, "Full name is required"),
    yearLevel: z.string().min(1, "Year level is required"),
    course: z.string().min(1, "Course/Program is required"),
    email: z.string().email("Invalid email address"),
    documentType: z.string().min(1, "Document type is required"),
    purpose: z.string().min(10, "Please provide a detailed purpose"),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type DocumentRequest = typeof documentRequests.$inferSelect;
export type RequestStatus = typeof requestStatus[number];