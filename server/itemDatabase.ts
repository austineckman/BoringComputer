// Centralized item database for the server
// This connects to the database for persistent storage

import { db } from './db';
import { items } from '../shared/schema';

export interface ItemDetails {
  id: string;
  name: string; 
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
  category?: string; // Optional category for filtering
}

// This will be populated from the database
export let itemDatabase: Record<string, ItemDetails> = {};

// Function to initialize the database from PostgreSQL
export async function initializeItemDatabase() {
  try {
    // Query all items from the database
    const dbItems = await db.select().from(items);
    console.log(`Loaded ${dbItems.length} items from database`);
    
    // Clear existing items
    itemDatabase = {};
    
    // Add all items to the in-memory cache
    for (const item of dbItems) {
      itemDatabase[item.id] = {
        id: item.id,
        name: item.name,
        description: item.description,
        flavorText: item.flavorText || '',
        rarity: item.rarity,
        craftingUses: item.craftingUses || [],
        imagePath: item.imagePath || '',
        category: item.category || undefined
      };
    }
    
    console.log(`Item database initialized with ${Object.keys(itemDatabase).length} items`);
    return itemDatabase;
  } catch (error) {
    console.error('Error initializing item database:', error);
    return {};
  }
}

// Call initialization on module load
initializeItemDatabase().catch(error => {
  console.error('Failed to initialize item database:', error);
});

export function getItemDetails(itemId: string): ItemDetails {
  // Return the item details or a default if the item doesn't exist
  return itemDatabase[itemId] || {
    id: itemId,
    name: itemId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: 'No description available.',
    flavorText: 'A mysterious item.',
    rarity: 'common',
    craftingUses: [],
    imagePath: '/images/resources/placeholder.png'
  };
}

// Add an item to the database (create or update)
export async function addOrUpdateItem(item: ItemDetails): Promise<ItemDetails> {
  if (!item.id) {
    throw new Error('Item ID is required');
  }
  
  try {
    // First, clean up the item data
    const cleanItem = {
      ...item,
      flavorText: item.flavorText || '',
      craftingUses: item.craftingUses || [],
      // Convert any non-array craftingUses to array format
      ...(item.craftingUses && !Array.isArray(item.craftingUses) 
          ? { craftingUses: String(item.craftingUses).split(',').map(s => s.trim()) } 
          : {})
    };
    
    // Check if item exists in the database
    const existingItem = await db.select().from(items).where(eq(items.id, item.id));
    
    if (existingItem.length > 0) {
      // Update existing item
      const [updatedItem] = await db
        .update(items)
        .set(cleanItem)
        .where(eq(items.id, item.id))
        .returning();
      
      // Update the in-memory cache
      itemDatabase[updatedItem.id] = {
        id: updatedItem.id,
        name: updatedItem.name,
        description: updatedItem.description,
        flavorText: updatedItem.flavorText || '',
        rarity: updatedItem.rarity,
        craftingUses: updatedItem.craftingUses || [],
        imagePath: updatedItem.imagePath || '',
        category: updatedItem.category || undefined
      };
      
      return itemDatabase[updatedItem.id];
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(items)
        .values(cleanItem)
        .returning();
      
      // Update the in-memory cache
      itemDatabase[newItem.id] = {
        id: newItem.id,
        name: newItem.name,
        description: newItem.description,
        flavorText: newItem.flavorText || '',
        rarity: newItem.rarity,
        craftingUses: newItem.craftingUses || [],
        imagePath: newItem.imagePath || '',
        category: newItem.category || undefined
      };
      
      return itemDatabase[newItem.id];
    }
  } catch (error) {
    console.error('Error adding/updating item in database:', error);
    throw error;
  }
}

// Remove an item from the database
export async function removeItem(itemId: string): Promise<boolean> {
  try {
    // Remove from the database
    const result = await db.delete(items).where(eq(items.id, itemId));
    
    // If successful, also remove from in-memory cache
    if (result) {
      delete itemDatabase[itemId];
      console.log(`Item ${itemId} deleted from database and cache`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error removing item ${itemId} from database:`, error);
    return false;
  }
}

// Get all items in the database
export function getAllItems(): ItemDetails[] {
  return Object.values(itemDatabase);
}

// Get items by rarity
export function getItemsByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): ItemDetails[] {
  return Object.values(itemDatabase).filter(item => item.rarity === rarity);
}

// Get items by category
export function getItemsByCategory(category: string): ItemDetails[] {
  return Object.values(itemDatabase).filter(item => item.category === category);
}