import { Router } from "express";
import passport from "passport";
import { z } from "zod";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { hashPassword } from "../auth";

const router = Router();

// Login route - authenticate user with passport
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: Error, user: Express.User, info: { message: string }) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: info?.message || "Authentication failed" });
    }
    
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        level: user.level,
        inventory: user.inventory
        // Don't include sensitive information like password
      });
    });
  })(req, res, next);
});

// Register route - create new user account
router.post("/register", async (req, res, next) => {
  try {
    // Validate request body against schema
    const registerSchema = insertUserSchema.pick({
      username: true,
      password: true
    });
    
    const result = registerSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: "Invalid registration data", 
        errors: result.error.flatten().fieldErrors 
      });
    }
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(req.body.password);
    
    // Create new user
    const newUser = await storage.createUser({
      username: req.body.username,
      password: hashedPassword,
      roles: ["user"],
      level: 1,
      inventory: {
        "cloth": 0,
        "copper": 0,
        "techscrap": 0,
        "crystal": 0
      },
      xp: 0,
      xpToNextLevel: 300,
      completedQuests: [],
    });
    
    // Log the user in automatically
    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
      
      return res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
        level: newUser.level,
        inventory: newUser.inventory
      });
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    
    res.json({ message: "Logout successful" });
  });
});

// Get current user
router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as Express.User;
  
  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    level: user.level,
    inventory: user.inventory
  });
});

export default router;