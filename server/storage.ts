import { users, attendance, leaves, salaries, type User, type InsertUser, type Attendance, type InsertAttendance, type Leave, type InsertLeave, type Salary, type InsertSalary } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>; // For directory/manager

  // Attendance
  getAttendance(userId: number): Promise<Attendance[]>;
  getTodayAttendance(userId: number): Promise<Attendance | undefined>;
  clockIn(userId: number): Promise<Attendance>;
  clockOut(userId: number): Promise<Attendance>;
  getAllAttendance(): Promise<Attendance[]>; // For manager

  // Leaves
  createLeave(leave: InsertLeave): Promise<Leave>;
  getLeaves(userId?: number): Promise<Leave[]>; // userId optional for manager (get all)
  updateLeaveStatus(id: number, status: "APPROVED" | "REJECTED"): Promise<Leave>;

  // Salaries
  getSalaries(userId: number): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>; // Mainly for seeding

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAttendance(userId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.userId, userId)).orderBy(desc(attendance.date));
  }

  async getTodayAttendance(userId: number): Promise<Attendance | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [record] = await db.select().from(attendance)
      .where(and(eq(attendance.userId, userId), eq(attendance.date, today)));
    return record;
  }

  async clockIn(userId: number): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const [record] = await db.insert(attendance)
      .values({ userId, date: today, clockIn: now })
      .returning();
    return record;
  }

  async clockOut(userId: number): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    // Find today's record
    const [existing] = await db.select().from(attendance)
      .where(and(eq(attendance.userId, userId), eq(attendance.date, today)));

    if (!existing) {
      throw new Error("Cannot clock out without clocking in first");
    }

    const [record] = await db.update(attendance)
      .set({ clockOut: now })
      .where(eq(attendance.id, existing.id))
      .returning();
    return record;
  }

  async getAllAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance).orderBy(desc(attendance.date));
  }

  async createLeave(leave: InsertLeave): Promise<Leave> {
    const [record] = await db.insert(leaves).values(leave).returning();
    return record;
  }

  async getLeaves(userId?: number): Promise<Leave[]> {
    if (userId) {
      return await db.select().from(leaves).where(eq(leaves.userId, userId)).orderBy(desc(leaves.createdAt));
    }
    return await db.select().from(leaves).orderBy(desc(leaves.createdAt));
  }

  async updateLeaveStatus(id: number, status: "APPROVED" | "REJECTED"): Promise<Leave> {
    const [record] = await db.update(leaves).set({ status }).where(eq(leaves.id, id)).returning();
    return record;
  }

  async getSalaries(userId: number): Promise<Salary[]> {
    return await db.select().from(salaries).where(eq(salaries.userId, userId)).orderBy(desc(salaries.year), desc(salaries.month));
  }

  async createSalary(salary: InsertSalary): Promise<Salary> {
    const [record] = await db.insert(salaries).values(salary).returning();
    return record;
  }
}

export const storage = new DatabaseStorage();
