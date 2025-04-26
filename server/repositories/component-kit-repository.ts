import { BaseRepository } from './base-repository';
import * as schema from '@shared/schema';
import { db } from '../db';
import { and, eq, inArray, lt, lte, gte, desc, asc } from 'drizzle-orm';

/**
 * Repository for component kit related operations
 */
export class ComponentKitRepository extends BaseRepository<
  typeof schema.componentKits,
  typeof schema.componentKits.$inferInsert,
  typeof schema.componentKits.$inferSelect
> {
  constructor() {
    super('componentKits');
  }
  
  /**
   * Get all component kits with their components
   */
  async getAllKitsWithComponents() {
    const kits = await this.findAll();
    const kitsWithComponents = [];
    
    for (const kit of kits) {
      const components = await this.getKitComponents(kit.id);
      kitsWithComponents.push({
        ...kit,
        components
      });
    }
    
    return kitsWithComponents;
  }
  
  /**
   * Get a specific component kit with its components
   * 
   * @param kitId The ID of the kit to retrieve
   */
  async getKitWithComponents(kitId: string) {
    const kit = await this.findById(kitId);
    
    if (!kit) {
      return null;
    }
    
    const components = await this.getKitComponents(kitId);
    
    return {
      ...kit,
      components
    };
  }
  
  /**
   * Get all components for a specific component kit
   * 
   * @param kitId The ID of the kit to get components for
   */
  async getKitComponents(kitId: string) {
    return await db
      .select()
      .from(schema.kitComponents)
      .where(eq(schema.kitComponents.kitId, kitId));
  }
  
  /**
   * Add a component to a kit
   * 
   * @param kitId The ID of the kit to add a component to
   * @param componentData The component data to add
   */
  async addComponentToKit(kitId: string, componentData: Omit<typeof schema.kitComponents.$inferInsert, 'id'>) {
    // Check if the kit exists
    const kit = await this.findById(kitId);
    
    if (!kit) {
      throw new Error(`Component kit with ID ${kitId} not found`);
    }
    
    // Create the component
    const [component] = await db
      .insert(schema.kitComponents)
      .values({
        ...componentData,
        kitId
      })
      .returning();
      
    return component;
  }
  
  /**
   * Update a component
   * 
   * @param componentId The ID of the component to update
   * @param componentData The updated component data
   */
  async updateComponent(componentId: number, componentData: Partial<Omit<typeof schema.kitComponents.$inferInsert, 'id'>>) {
    const [component] = await db
      .update(schema.kitComponents)
      .set(componentData)
      .where(eq(schema.kitComponents.id, componentId))
      .returning();
      
    return component;
  }
  
  /**
   * Delete a component
   * 
   * @param componentId The ID of the component to delete
   */
  async deleteComponent(componentId: number) {
    const [component] = await db
      .delete(schema.kitComponents)
      .where(eq(schema.kitComponents.id, componentId))
      .returning();
      
    return component;
  }
  
  /**
   * Get components that can be reused across kits
   * (components with isReusable = true)
   */
  async getReusableComponents() {
    // Since there's no isReusable field in the schema,
    // We'll consider all components reusable for now
    // In a future enhancement, we could add an isReusable field to the schema
    return await db
      .select()
      .from(schema.kitComponents);
  }
  
  /**
   * Search for components by name or description
   * 
   * @param searchTerm The search term to look for
   */
  async searchComponents(searchTerm: string) {
    // This is a simplistic implementation that would need to be
    // enhanced with proper full-text search capabilities in a real app
    const components = await db
      .select()
      .from(schema.kitComponents);
      
    return components.filter(component => 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (component.description && component.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  /**
   * Get the total count of components across all kits
   */
  async getTotalComponentCount() {
    const components = await db
      .select()
      .from(schema.kitComponents);
      
    return components.length;
  }
  
  /**
   * Add a component from one kit to another kit
   * (for reusing components across kits)
   * 
   * @param componentId The ID of the component to copy
   * @param toKitId The ID of the kit to copy to
   */
  async copyComponentToKit(componentId: number, toKitId: string) {
    // Get the component
    const [component] = await db
      .select()
      .from(schema.kitComponents)
      .where(eq(schema.kitComponents.id, componentId));
      
    if (!component) {
      throw new Error(`Component with ID ${componentId} not found`);
    }
    
    // Check if the destination kit exists
    const toKit = await this.findById(toKitId);
    
    if (!toKit) {
      throw new Error(`Component kit with ID ${toKitId} not found`);
    }
    
    // Create a new component in the destination kit
    const { id, ...componentWithoutId } = component;
    
    const [newComponent] = await db
      .insert(schema.kitComponents)
      .values({
        ...componentWithoutId,
        kitId: toKitId
      })
      .returning();
      
    return newComponent;
  }
}