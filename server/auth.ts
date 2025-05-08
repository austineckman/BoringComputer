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
  // Only support properly hashed passwords (contains a dot separator for hash.salt)
  if (!stored.includes('.')) {
    console.error('Security warning: Found unhashed password in database');
    return false; // Reject any non-hashed passwords for security
  }
  
  // Handle hashed password
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// No mock users - only use real authenticated users from the database

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
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
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        httpOnly: true, // Prevents JavaScript from reading the cookie
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'lax', // Prevents CSRF attacks
      },
      store: storage.sessionStore,
      name: 'app.sid', // Don't use the default connect.sid name (reveals Express usage)
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