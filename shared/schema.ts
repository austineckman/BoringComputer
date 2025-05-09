import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for authentication and user management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash").notNull(),
  roles: text("roles").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table - stores user projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  platform: text("platform").notNull(), // arduino, esp32, raspberrypi, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isPublic: boolean("is_public").default(false),
  thumbnail: text("thumbnail"), // URL to thumbnail image
});

// Circuit schema for storing circuit designs
export const circuits = pgTable("circuits", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  designData: jsonb("design_data").notNull(), // Stores component positions, connections, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Code files associated with projects
export const codeFiles = pgTable("code_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  language: text("language").notNull(), // c, cpp, python, etc.
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Components library table - predefined components
export const components = pgTable("components", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // resistor, led, microcontroller, etc.
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  properties: jsonb("properties"), // pins, values, etc.
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isBuiltIn: boolean("is_built_in").default(true),
});

// Simulation results
export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  status: text("status").notNull(), // pending, running, completed, failed
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
  duration: integer("duration"), // in milliseconds
  logs: text("logs").array(),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Circuit = typeof circuits.$inferSelect;
export type CodeFile = typeof codeFiles.$inferSelect;
export type Component = typeof components.$inferSelect;
export type Simulation = typeof simulations.$inferSelect;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCircuitSchema = createInsertSchema(circuits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCodeFileSchema = createInsertSchema(codeFiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertComponentSchema = createInsertSchema(components).omit({ id: true, createdAt: true });
export const insertSimulationSchema = createInsertSchema(simulations).omit({ id: true, createdAt: true });

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertCircuit = z.infer<typeof insertCircuitSchema>;
export type InsertCodeFile = z.infer<typeof insertCodeFileSchema>;
export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;