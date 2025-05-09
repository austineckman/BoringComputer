import { db } from "./db";
import { circuitProjects, arduinoComponents, userSimulatorSettings } from "@shared/schema";
import { sql } from "drizzle-orm";

async function createCircuitTables() {
  try {
    console.log("Creating Arduino circuit simulator tables...");

    // Create circuit_projects table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS circuit_projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        circuit JSONB NOT NULL,
        code TEXT NOT NULL,
        thumbnail TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log("Created circuit_projects table");

    // Create arduino_components table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS arduino_components (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        icon_path TEXT NOT NULL,
        pins JSONB NOT NULL,
        properties JSONB DEFAULT '{}',
        example_code TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Created arduino_components table");

    // Create user_simulator_settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_simulator_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        preferences JSONB DEFAULT '{"theme":"default","fontSize":14,"autosave":true,"livePreview":true,"highlightSyntax":true}',
        recent_projects JSONB DEFAULT '[]',
        saved_templates JSONB DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log("Created user_simulator_settings table");

    console.log("Successfully created all Arduino circuit simulator tables");
  } catch (error) {
    console.error("Error creating Arduino circuit simulator tables:", error);
    throw error;
  }
}

createCircuitTables()
  .then(() => {
    console.log("Tables created successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to create tables:", error);
    process.exit(1);
  });