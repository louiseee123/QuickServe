"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertRequestSchema = exports.insertUserSchema = exports.documentRequests = exports.documents = exports.users = exports.paymentStatus = exports.requestStatus = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
exports.requestStatus = ["pending_approval", "pending_payment", "denied", "processing", "ready_for_pickup", "completed", "cancelled"];
exports.paymentStatus = ["unpaid", "paid"];
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    role: (0, pg_core_1.text)("role", { enum: ["admin", "user"] }).notNull().default("user"),
});
// Represents a single document that can be requested
exports.documents = (0, pg_core_1.pgTable)("documents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    price: (0, pg_core_1.integer)("price").notNull(),
    processingTimeDays: (0, pg_core_1.integer)("processing_time_days").notNull(), // Estimated time in days to process
});
// Represents a single request made by a student, which can contain multiple document items
exports.documentRequests = (0, pg_core_1.pgTable)("document_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    studentId: (0, pg_core_1.text)("student_id").notNull(),
    studentName: (0, pg_core_1.text)("student_name").notNull(),
    yearLevel: (0, pg_core_1.text)("year_level").notNull(),
    course: (0, pg_core_1.text)("course").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    purpose: (0, pg_core_1.text)("purpose").notNull(),
    // Stores the list of requested documents, their details, price, and processing time at the time of request
    documents: (0, pg_core_1.jsonb)("documents").$type().notNull(),
    totalAmount: (0, pg_core_1.integer)("total_amount").notNull(),
    estimatedCompletionDays: (0, pg_core_1.integer)("estimated_completion_days").notNull(),
    status: (0, pg_core_1.text)("status", { enum: exports.requestStatus }).notNull().default("pending_payment"),
    paymentStatus: (0, pg_core_1.text)("payment_status", { enum: exports.paymentStatus }).notNull().default("unpaid"),
    queueNumber: (0, pg_core_1.integer)("queue_number"),
    rejectionReason: (0, pg_core_1.text)("rejection_reason"),
    requestedAt: (0, pg_core_1.timestamp)("requested_at").notNull().defaultNow(),
    processingStartedAt: (0, pg_core_1.timestamp)("processing_started_at"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    userId: (0, pg_core_1.text)("user_id").references(() => exports.users.id),
});
// Zod schema for inserting a user (validation)
exports.insertUserSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z.string().min(6, { message: "Password must be at least 6 characters" }),
});
// Zod schema for inserting a document request (validation)
exports.insertRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documentRequests, {
    documents: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        details: zod_1.z.string().optional(),
        price: zod_1.z.number().nonnegative(), // Allow 0 for free documents
        processingTimeDays: zod_1.z.number().min(1), // Must be at least 1 day
    })).min(1, "At least one document must be selected"),
    totalAmount: zod_1.z.number().nonnegative(), // Allow 0 for free requests
    estimatedCompletionDays: zod_1.z.number().min(1), // Must be at least 1 day
    userId: zod_1.z.string(),
}).omit({
    id: true,
    status: true,
    paymentStatus: true,
    queueNumber: true,
    requestedAt: true,
    rejectionReason: true,
    processingStartedAt: true,
    completedAt: true
});
