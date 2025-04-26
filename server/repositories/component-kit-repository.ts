import { eq } from "drizzle-orm";
import { db } from "../db";
import { BaseRepository } from "./base-repository";
import {
  componentKits,
  kitComponents,
  ComponentKit,
  InsertComponentKit,
  KitComponent,
  InsertKitComponent
} from "@shared/schema";

/**
 * Repository for component kits and their components
 */
export class ComponentKitRepository extends BaseRepository<ComponentKit, InsertComponentKit> {
  constructor() {
    super(componentKits, {
      components: true,
      quests: true,
    });
  }

  /**
   * Get all component kits with their components
   */
  async getAllKitsWithComponents() {
    return db.query.componentKits.findMany({
      with: {
        components: true,
        quests: true,
      },
    });
  }

  /**
   * Get a specific kit with its components
   */
  async getKitWithComponents(kitId: string) {
    return db.query.componentKits.findFirst({
      where: eq(componentKits.id, kitId),
      with: {
        components: true,
        quests: true,
      },
    });
  }

  /**
   * Add a component to a kit
   */
  async addComponent(component: InsertKitComponent): Promise<KitComponent> {
    const [created] = await db.insert(kitComponents).values(component).returning();
    return created;
  }

  /**
   * Get components by kit ID
   */
  async getComponentsByKitId(kitId: string) {
    return db.query.kitComponents.findMany({
      where: eq(kitComponents.kitId, kitId),
    });
  }

  /**
   * Find component by ID
   */
  async getComponentById(componentId: number) {
    return db.query.kitComponents.findFirst({
      where: eq(kitComponents.id, componentId),
      with: {
        kit: true,
      }
    });
  }

  /**
   * Update a component
   */
  async updateComponent(id: number, data: Partial<InsertKitComponent>) {
    const [updated] = await db
      .update(kitComponents)
      .set(data)
      .where(eq(kitComponents.id, id))
      .returning();
    return updated;
  }

  /**
   * Delete a component
   */
  async deleteComponent(id: number) {
    const [deleted] = await db
      .delete(kitComponents)
      .where(eq(kitComponents.id, id))
      .returning();
    return deleted;
  }
}