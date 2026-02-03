import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertLeaveSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication first
  setupAuth(app);

  // Middleware to check role
  const requireRole = (role: "MANAGER" | "EMPLOYEE") => {
    return (req: any, res: any, next: any) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.user.role !== role && req.user.role !== "MANAGER") { // Manager can access everything usually, or strict separation?
        // User asked for: "Employee Dashboard" vs "Manager Dashboard".
        // Let's implement strict checks but allow Manager to access "Employee" APIs if needed for testing/admin,
        // but for now strict based on the route intent.
        // Actually, Manager needs to see Employee data.
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    };
  };

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // === Users API ===
  app.get(api.users.list.path, requireRole("MANAGER"), async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get(api.users.get.path, requireAuth, async (req, res) => {
    // Users can only see themselves unless they are Manager
    const userId = parseInt(req.params.id);
    if (req.user!.role !== "MANAGER" && req.user!.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.patch(api.users.update.path, requireAuth, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (req.user!.role !== "MANAGER" && req.user!.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const parsed = insertUserSchema.partial().parse(req.body);
    const updated = await storage.updateUser(userId, parsed);
    res.json(updated);
  });

  // === Attendance API ===
  app.post(api.attendance.clockIn.path, requireAuth, async (req, res) => {
    // Only clock in for self
    try {
      const record = await storage.clockIn(req.user!.id);
      res.status(201).json(record);
    } catch (e) {
      res.status(400).json({ message: "Already clocked in or error" });
    }
  });

  app.post(api.attendance.clockOut.path, requireAuth, async (req, res) => {
    try {
      const record = await storage.clockOut(req.user!.id);
      res.json(record);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get(api.attendance.list.path, requireAuth, async (req, res) => {
    const queryUserId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    // Manager can view anyone, Employee only self
    if (req.user!.role !== "MANAGER" && queryUserId && queryUserId !== req.user!.id) {
       return res.status(403).json({ message: "Forbidden" });
    }
    
    // If no userId provided: Manager gets ALL, Employee gets SELF
    if (!queryUserId) {
      if (req.user!.role === "MANAGER") {
        const all = await storage.getAllAttendance();
        return res.json(all);
      } else {
        const mine = await storage.getAttendance(req.user!.id);
        return res.json(mine);
      }
    }

    const records = await storage.getAttendance(queryUserId);
    res.json(records);
  });

  app.get(api.attendance.today.path, requireAuth, async (req, res) => {
    const record = await storage.getTodayAttendance(req.user!.id);
    res.json(record || null);
  });


  // === Leaves API ===
  app.post(api.leaves.create.path, requireAuth, async (req, res) => {
    const parsed = insertLeaveSchema.parse(req.body);
    const leave = await storage.createLeave({ ...parsed, userId: req.user!.id }); // Force userId to self
    res.status(201).json(leave);
  });

  app.get(api.leaves.list.path, requireAuth, async (req, res) => {
    // Logic similar to attendance
    if (req.user!.role === "MANAGER") {
       const all = await storage.getLeaves();
       return res.json(all);
    } else {
       const mine = await storage.getLeaves(req.user!.id);
       return res.json(mine);
    }
  });

  app.patch(api.leaves.updateStatus.path, requireRole("MANAGER"), async (req, res) => {
    const leaveId = parseInt(req.params.id);
    const status = req.body.status;
    const updated = await storage.updateLeaveStatus(leaveId, status);
    res.json(updated);
  });

  // === Salaries API ===
  app.get(api.salaries.list.path, requireAuth, async (req, res) => {
    // Employees view their own salaries. Managers might want to view others?
    // Spec says "Salary: A view-only section to see monthly salary details" (Employee Dashboard).
    // "Monitoring: A summary view of all employee attendance and salary totals" (Manager Dashboard).
    
    // For now, return self
    const salaries = await storage.getSalaries(req.user!.id);
    res.json(salaries);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getAllUsers();
  if (users.length === 0) {
    console.log("Seeding database...");
    const { hashPassword } = await import("./auth");
    
    // Create Manager
    const managerPassword = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password: managerPassword,
      role: "MANAGER",
      fullName: "Admin Manager",
      title: "HR Director",
      department: "Human Resources",
      email: "admin@company.com"
    });

    // Create Employee
    const employeePassword = await hashPassword("employee123");
    const emp = await storage.createUser({
      username: "john",
      password: employeePassword,
      role: "EMPLOYEE",
      fullName: "John Doe",
      title: "Software Engineer",
      department: "Engineering",
      email: "john@company.com"
    });

    // Seed some data for employee
    await storage.createSalary({
      userId: emp.id,
      month: "January",
      year: 2024,
      amount: 500000, // $5000.00
      details: "Base Salary"
    });
    
    console.log("Database seeded!");
  }
}
