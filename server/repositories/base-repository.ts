import { db } from '../db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Base repository class that provides common CRUD operations
 * for any database table. This is used to create specialized
 * repositories for each model.
 * 
 * @typeparam T The Drizzle schema table type
 * @typeparam TInsert The insert type for the table
 * @typeparam TSelect The select type for the table
 */
export class BaseRepository<T, TInsert, TSelect> {
  /**
   * The table this repository operates on
   */
  protected table: T;
  
  /**
   * Constructor for BaseRepository
   * 
   * @param tableName The name of the table in the schema
   */
  constructor(tableName: string) {
    this.table = this.getTableByName(tableName) as T;
  }
  
  /**
   * Helper method to get a table from the schema by name
   * 
   * @param tableName The name of the table in the schema
   * @returns The table object from the schema
   */
  private getTableByName(tableName: string): any {
    return (schema as any)[tableName];
  }
  
  /**
   * Find a record by its ID
   * 
   * @param id The ID of the record to find
   * @returns The record or undefined if not found
   */
  async findById(id: any): Promise<TSelect | undefined> {
    const [record] = await db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).id, id));
      
    return record;
  }
  
  /**
   * Find all records in the table
   * 
   * @returns Array of all records
   */
  async findAll(): Promise<TSelect[]> {
    return await db
      .select()
      .from(this.table as any);
  }
  
  /**
   * Create a new record
   * 
   * @param data The data for the new record
   * @returns The created record
   */
  async create(data: TInsert): Promise<TSelect> {
    const [record] = await db
      .insert(this.table as any)
      .values(data as any)
      .returning();
      
    return record;
  }
  
  /**
   * Update a record by ID
   * 
   * @param id The ID of the record to update
   * @param data The data to update
   * @returns The updated record
   */
  async update(id: any, data: Partial<TInsert>): Promise<TSelect | undefined> {
    const [record] = await db
      .update(this.table as any)
      .set(data as any)
      .where(eq((this.table as any).id, id))
      .returning();
      
    return record;
  }
  
  /**
   * Delete a record by ID
   * 
   * @param id The ID of the record to delete
   * @returns The deleted record
   */
  async delete(id: any): Promise<TSelect | undefined> {
    const [record] = await db
      .delete(this.table as any)
      .where(eq((this.table as any).id, id))
      .returning();
      
    return record;
  }
  
  /**
   * Find records that match a condition
   * 
   * @param field The field to match on
   * @param value The value to match
   * @returns Array of matching records
   */
  async findBy(field: string, value: any): Promise<TSelect[]> {
    return await db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any)[field], value));
  }
}