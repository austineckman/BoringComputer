// Centralized item database for the server
// This now uses an in-memory item database with our new architecture

import { db } from './db';
import { components } from '../shared/schema';
import { eq } from 'drizzle-orm';

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

// Function to initialize the database with components from our component table
export async function initializeItemDatabase() {
  try {
    // For our Universal Emulator, we'll use the components table
    const dbComponents = await db.select().from(components);
    console.log(`Loaded ${dbComponents.length} components from database`);
    
    // Clear existing items
    itemDatabase = {};
    
    // Add default items for demonstration (in real implementation we'd convert from components)
    const defaultItems = [
      {
        id: 'resistor',
        name: 'Resistor',
        description: 'A standard resistor component',
        flavorText: 'Resists electrical current flow',
        rarity: 'common' as const,
        craftingUses: ['circuits', 'displays', 'sensors'],
        imagePath: '/images/components/resistor.png',
        category: 'passive'
      },
      {
        id: 'led-red',
        name: 'Red LED',
        description: 'A standard red light-emitting diode',
        flavorText: 'Emits a bright red light when current flows through it',
        rarity: 'common' as const,
        craftingUses: ['displays', 'indicators'],
        imagePath: '/images/components/led-red.png',
        category: 'indicator'
      },
      {
        id: 'capacitor',
        name: 'Capacitor',
        description: 'A standard capacitor component',
        flavorText: 'Stores electrical energy in an electric field',
        rarity: 'common' as const,
        craftingUses: ['circuits', 'filters', 'timing'],
        imagePath: '/images/components/capacitor.png',
        category: 'passive'
      }
    ];
    
    // Add default items to the in-memory cache
    for (const item of defaultItems) {
      itemDatabase[item.id] = item;
    }
    
    // Add any components from the database as well (if the schema is compatible)
    for (const component of dbComponents) {
      if (component.type && component.name) {
        try {
          const itemId = component.type.toLowerCase().replace(/\s+/g, '-');
          itemDatabase[itemId] = {
            id: itemId,
            name: component.name,
            description: component.description || 'No description available',
            flavorText: 'A circuit component',
            rarity: 'common' as const,
            craftingUses: [],
            imagePath: component.imageUrl || '/images/components/default.png',
            category: component.category || 'unknown'
          };
        } catch (err) {
          console.warn('Could not convert component to item:', err);
        }
      }
    }
    
    console.log(`Item database initialized with ${Object.keys(itemDatabase).length} items`);
    return itemDatabase;
  } catch (error) {
    console.error('Error initializing item database:', error);
    // Return default items even if database loading fails
    return {
      'resistor': {
        id: 'resistor',
        name: 'Resistor',
        description: 'A standard resistor component',
        flavorText: 'Resists electrical current flow',
        rarity: 'common' as const,
        craftingUses: ['circuits', 'displays', 'sensors'],
        imagePath: '/images/components/resistor.png',
        category: 'passive'
      }
    };
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

// Add an item to the database (create or update) - Using the components table
export async function addOrUpdateItem(item: ItemDetails): Promise<ItemDetails> {
  if (!item.id) {
    throw new Error('Item ID is required');
  }
  
  try {
    // For our Universal Emulator version, just update the in-memory cache
    const cleanItem = {
      ...item,
      flavorText: item.flavorText || '',
      craftingUses: item.craftingUses || [],
      // Convert any non-array craftingUses to array format
      ...(item.craftingUses && !Array.isArray(item.craftingUses) 
          ? { craftingUses: String(item.craftingUses).split(',').map(s => s.trim()) } 
          : {})
    };
    
    // Add to the in-memory database
    itemDatabase[item.id] = cleanItem;
    
    // In the future, we could map this to a component in the database
    console.log(`Item ${item.id} added/updated in memory cache`);
    
    return itemDatabase[item.id];
  } catch (error) {
    console.error('Error adding/updating item:', error);
    throw error;
  }
}

// Remove an item from the database
export async function removeItem(itemId: string): Promise<boolean> {
  try {
    // For our Universal Emulator version, just remove from in-memory cache
    if (itemId in itemDatabase) {
      delete itemDatabase[itemId];
      console.log(`Item ${itemId} removed from memory cache`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error removing item ${itemId}:`, error);
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