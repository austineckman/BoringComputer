import { freezeComponent, getRegistryStatus, unfreezeComponent } from './ComponentRegistry';

// Import component handlers to ensure they get registered
import './LEDHandlers';
import './OLEDHandlers';

/**
 * Initialize the component registry and freeze stable components
 */
export function initializeRegistry() {
  console.log('Initializing component registry...');
  
  // Freeze components that are working properly
  // This prevents them from being modified when working on other components
  freezeComponent('LED');
  
  // Log the registry status
  console.log('Registry initialized with the following components:');
  console.log(getRegistryStatus());
  
  return getRegistryStatus();
}

/**
 * Unfreeze a component during development
 * 
 * @param {string} componentType - The component type to unfreeze
 */
export function unfreezeForDevelopment(componentType) {
  console.log(`Unfreezing component ${componentType} for development`);
  unfreezeComponent(componentType);
  return getRegistryStatus();
}

// Automatically initialize the registry when imported
initializeRegistry();

export default {
  initializeRegistry,
  unfreezeForDevelopment,
  getRegistryStatus
};