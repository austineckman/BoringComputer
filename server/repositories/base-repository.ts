import { db } from "../db";

/**
 * Base repository class with common database operations
 */
export class BaseRepository<T, InsertT> {
  constructor(
    protected table: any,
    protected relations: any = {}
  ) {}

  /**
   * Find all records
   */
  async findAll() {
    return db.select().from(this.table);
  }

  /**
   * Find a record by ID
   */
  async findById(id: number | string) {
    return db.query[this.table.name].findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
      with: this.relations,
    });
  }

  /**
   * Create a new record
   */
  async create(data: InsertT) {
    const [inserted] = await db.insert(this.table).values(data).returning();
    return inserted as T;
  }

  /**
   * Update a record
   */
  async update(id: number | string, data: Partial<InsertT>) {
    const [updated] = await db
      .update(this.table)
      .set(data)
      .where((fields: any, { eq }) => eq(fields.id, id))
      .returning();
    return updated as T;
  }

  /**
   * Delete a record
   */
  async delete(id: number | string) {
    const [deleted] = await db
      .delete(this.table)
      .where((fields: any, { eq }) => eq(fields.id, id))
      .returning();
    return deleted as T;
  }
}