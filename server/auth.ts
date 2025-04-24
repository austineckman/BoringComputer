import { Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Declare user on Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Promisify scrypt
const scryptAsync = promisify(scrypt);

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare passwords
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware to check if user is authenticated
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // Check if a session token exists in cookies
  const sessionToken = req.cookies?.sessionToken;
  if (!sessionToken) {
    console.log("No session token found");
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    // Get userId from session token
    // For simplicity, we'll use a basic mapping of tokens to user IDs
    // In a real app, use a proper session system (e.g., connect-pg-simple)
    // For now, sessionToken format is: 00000{userId}-uuid
    const userId = parseInt(sessionToken.split("-")[0].replace(/^0+/, ""));
    if (isNaN(userId)) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Authenticating user ID:", userId);

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Helper to generate a session token
export function generateSessionToken(userId: number): string {
  // Format: 00000{userId}-{random UUID}
  const paddedId = userId.toString().padStart(5, "0");
  const randomPart = randomBytes(16).toString("hex").slice(0, 8) + "-" + 
                     randomBytes(4).toString("hex") + "-" + 
                     randomBytes(4).toString("hex") + "-" + 
                     randomBytes(12).toString("hex");
  return `${paddedId}-${randomPart}`;
}