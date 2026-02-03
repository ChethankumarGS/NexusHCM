import { pgTable, text, serial, integer, boolean, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["MANAGER", "EMPLOYEE"]);
export const leaveStatusEnum = pgEnum("leave_status", ["PENDING", "APPROVED", "REJECTED"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("EMPLOYEE").notNull(),
  fullName: text("full_name").notNull(),
  title: text("title"),
  department: text("department"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(), // YYYY-MM-DD
  clockIn: timestamp("clock_in"),
  clockOut: timestamp("clock_out"),
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  month: text("month").notNull(), // e.g., "October"
  year: integer("year").notNull(),
  amount: integer("amount").notNull(), // in cents or base currency unit
  details: text("details"), // JSON string or text description of breakdown
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  attendance: many(attendance),
  leaves: many(leaves),
  salaries: many(salaries),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
}));

export const leavesRelations = relations(leaves, ({ one }) => ({
  user: one(users, {
    fields: [leaves.userId],
    references: [users.id],
  }),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
  user: one(users, {
    fields: [salaries.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertLeaveSchema = createInsertSchema(leaves).omit({ id: true, createdAt: true, status: true }); // Status handled by backend
export const insertSalarySchema = createInsertSchema(salaries).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type Salary = typeof salaries.$inferSelect;
export type InsertSalary = z.infer<typeof insertSalarySchema>;
