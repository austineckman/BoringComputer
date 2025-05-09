import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { 
  User, InsertUser, 
  Project, InsertProject, 
  Circuit, InsertCircuit,
  CodeFile, InsertCodeFile,
  Component, InsertComponent,
  Simulation, InsertSimulation,
  users, projects, circuits, codeFiles, components, simulations
} from '@shared/schema';

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Circuit operations
  getCircuit(id: number): Promise<Circuit | undefined>;
  getCircuitsByProject(projectId: number): Promise<Circuit[]>;
  createCircuit(circuit: InsertCircuit): Promise<Circuit>;
  updateCircuit(id: number, circuit: Partial<Circuit>): Promise<Circuit | undefined>;
  deleteCircuit(id: number): Promise<boolean>;
  
  // Code file operations
  getCodeFile(id: number): Promise<CodeFile | undefined>;
  getCodeFilesByProject(projectId: number): Promise<CodeFile[]>;
  createCodeFile(codeFile: InsertCodeFile): Promise<CodeFile>;
  updateCodeFile(id: number, codeFile: Partial<CodeFile>): Promise<CodeFile | undefined>;
  deleteCodeFile(id: number): Promise<boolean>;
  
  // Component operations
  getComponent(id: number): Promise<Component | undefined>;
  getComponentsByCategory(category: string): Promise<Component[]>;
  getAllComponents(): Promise<Component[]>;
  createComponent(component: InsertComponent): Promise<Component>;
  
  // Simulation operations
  getSimulation(id: number): Promise<Simulation | undefined>;
  getSimulationsByProject(projectId: number): Promise<Simulation[]>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  updateSimulation(id: number, simulation: Partial<Simulation>): Promise<Simulation | undefined>;
}

// Implementation using the database
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.count > 0;
  }

  // Circuit operations
  async getCircuit(id: number): Promise<Circuit | undefined> {
    const [circuit] = await db.select().from(circuits).where(eq(circuits.id, id));
    return circuit;
  }

  async getCircuitsByProject(projectId: number): Promise<Circuit[]> {
    return await db.select().from(circuits).where(eq(circuits.projectId, projectId));
  }

  async createCircuit(circuit: InsertCircuit): Promise<Circuit> {
    const [newCircuit] = await db.insert(circuits).values(circuit).returning();
    return newCircuit;
  }

  async updateCircuit(id: number, circuit: Partial<Circuit>): Promise<Circuit | undefined> {
    const [updatedCircuit] = await db
      .update(circuits)
      .set(circuit)
      .where(eq(circuits.id, id))
      .returning();
    return updatedCircuit;
  }

  async deleteCircuit(id: number): Promise<boolean> {
    const result = await db.delete(circuits).where(eq(circuits.id, id));
    return result.count > 0;
  }

  // Code file operations
  async getCodeFile(id: number): Promise<CodeFile | undefined> {
    const [codeFile] = await db.select().from(codeFiles).where(eq(codeFiles.id, id));
    return codeFile;
  }

  async getCodeFilesByProject(projectId: number): Promise<CodeFile[]> {
    return await db.select().from(codeFiles).where(eq(codeFiles.projectId, projectId));
  }

  async createCodeFile(codeFile: InsertCodeFile): Promise<CodeFile> {
    const [newCodeFile] = await db.insert(codeFiles).values(codeFile).returning();
    return newCodeFile;
  }

  async updateCodeFile(id: number, codeFile: Partial<CodeFile>): Promise<CodeFile | undefined> {
    const [updatedCodeFile] = await db
      .update(codeFiles)
      .set(codeFile)
      .where(eq(codeFiles.id, id))
      .returning();
    return updatedCodeFile;
  }

  async deleteCodeFile(id: number): Promise<boolean> {
    const result = await db.delete(codeFiles).where(eq(codeFiles.id, id));
    return result.count > 0;
  }

  // Component operations
  async getComponent(id: number): Promise<Component | undefined> {
    const [component] = await db.select().from(components).where(eq(components.id, id));
    return component;
  }

  async getComponentsByCategory(category: string): Promise<Component[]> {
    return await db.select().from(components).where(eq(components.category, category));
  }

  async getAllComponents(): Promise<Component[]> {
    return await db.select().from(components);
  }

  async createComponent(component: InsertComponent): Promise<Component> {
    const [newComponent] = await db.insert(components).values(component).returning();
    return newComponent;
  }

  // Simulation operations
  async getSimulation(id: number): Promise<Simulation | undefined> {
    const [simulation] = await db.select().from(simulations).where(eq(simulations.id, id));
    return simulation;
  }

  async getSimulationsByProject(projectId: number): Promise<Simulation[]> {
    return await db.select().from(simulations).where(eq(simulations.projectId, projectId));
  }

  async createSimulation(simulation: InsertSimulation): Promise<Simulation> {
    const [newSimulation] = await db.insert(simulations).values(simulation).returning();
    return newSimulation;
  }

  async updateSimulation(id: number, simulation: Partial<Simulation>): Promise<Simulation | undefined> {
    const [updatedSimulation] = await db
      .update(simulations)
      .set(simulation)
      .where(eq(simulations.id, id))
      .returning();
    return updatedSimulation;
  }
}

// Create and export a database storage instance
export const storage = new DatabaseStorage();