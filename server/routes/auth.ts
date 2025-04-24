import { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { authenticate, hashPassword, comparePasswords, generateSessionToken } from "../auth";

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Modified registration schema - email is optional for MVP
const registerSchema = insertUserSchema.pick({
  username: true,
  password: true
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens")
});

export function registerAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid registration data",
          errors: result.error.format() 
        });
      }

      // Check if username exists
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(result.data.password);

      // Create user with hashed password
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
        // Initialize with empty values for required fields
        roles: [],
        inventory: {},
        completedQuests: []
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Generate session token
      const sessionToken = generateSessionToken(user.id);

      // Set session cookie
      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid login data",
          errors: result.error.format() 
        });
      }

      // Find user by username
      const user = await storage.getUserByUsername(result.data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Compare passwords
      const isPasswordValid = await comparePasswords(result.data.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Update last login timestamp
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Generate session token
      const sessionToken = generateSessionToken(user.id);

      // Set session cookie
      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout user
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    // Clear session cookie
    res.clearCookie("sessionToken");
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Get current authenticated user
  app.get("/api/auth/me", authenticate, (req: Request, res: Response) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user!;
    res.status(200).json(userWithoutPassword);
  });
}