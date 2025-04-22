import { db } from './db';
import { items } from '../shared/schema';
import { itemDatabase } from './itemDatabase';

/**
 * Seeds the items table with data from our existing itemDatabase
 */
export async function seedItems() {
  try {
    // First check if we need to seed at all
    const existingItems = await db.select({ count: { count: items.id } }).from(items);
    const count = Number(existingItems[0]?.count?.count || 0);

    if (count > 0) {
      console.log(`Items table already has ${count} items, skipping seed`);
      return;
    }

    console.log('Seeding items table...');
    
    // Convert the itemDatabase to an array of items ready for insertion
    const itemsToInsert = Object.entries(itemDatabase).map(([id, details]) => ({
      id,
      name: details.name,
      description: details.description,
      flavorText: details.flavorText,
      rarity: details.rarity,
      craftingUses: details.craftingUses,
      imagePath: details.imagePath,
      category: 'resource'
    }));

    // Insert all items
    const result = await db.insert(items).values(itemsToInsert);
    console.log(`Successfully seeded ${itemsToInsert.length} items into the database`);
    
    return result;
  } catch (error) {
    console.error('Error seeding items:', error);
    throw error;
  }
}