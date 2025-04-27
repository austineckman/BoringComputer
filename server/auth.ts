import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Type definitions for Express
declare global {
  namespace Express {
    // Define user type for passport
    interface User {
      id: number;
      username: string;
      email: string | null;
      roles: string[] | null;
      level: number | null;
      inventory: Record<string, number> | null;
      // Add any other properties you need from User type
    }
  }
}

const scryptAsync = promisify(scrypt);

// Helper functions for password hashing and verification
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  // Check if this is a hashed password (contains a dot separator for hash.salt)
  if (stored.includes('.')) {
    // Handle hashed password
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } else {
    // Handle plain text password (direct comparison for backward compatibility)
    return supplied === stored;
  }
}

// Persistent mock user for development
const mockUser = {
  id: 999,
  username: "devuser",
  email: "dev@example.com",
  roles: ["admin", "user"],
  level: 10,
  inventory: {
    "copper": 10,
    "crystal": 5,
    "techscrap": 3,
    "circuit_board": 2,
    "cloth": 8
  },
  titles: [],
  activeTitle: null
};

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // For development purposes, temporarily skip authentication
  const BYPASS_AUTH = process.env.NODE_ENV === 'development';
  
  if (!req.isAuthenticated()) {
    if (BYPASS_AUTH) {
      // Use the persistent mock user
      (req as any).user = mockUser;
      console.log("⚠️ Development mode: Authentication bypassed with mock user");
      return next();
    }
    
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // For development purposes, temporarily skip admin check
  const BYPASS_AUTH = process.env.NODE_ENV === 'development';
  
  if (!req.isAuthenticated()) {
    if (BYPASS_AUTH) {
      // Use the same persistent mock user for admin routes
      (req as any).user = mockUser;
      console.log("⚠️ Development mode: Admin authentication bypassed with mock admin user");
      return next();
    }
    
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Skip admin role check in development mode
  if (BYPASS_AUTH) {
    return next();
  }
  
  // Check if user has admin role
  const user = req.user as User;
  if (!user.roles?.includes('admin')) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

// Setup authentication for the Express app
export function setupAuth(app: any): void {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "quest-giver-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
      store: storage.sessionStore,
    })
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for username/password auth
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Check password
        if (!user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}