/**
 * Component Registry System
 * 
 * This system allows components to register their handlers independently,
 * preventing cross-component interference and allowing for version locking.
 */

// Store component handlers with their versions
const registry = {
  components: {},
  frozen: {},
};

/**
 * Register a component handler in the registry
 * 
 * @param {string} componentType - The type of component (LED, OLED, etc)
 * @param {string} handlerName - The name of the handler function (checkWiring, update, etc)
 * @param {Function} handler - The actual handler function
 * @param {string} version - The version of this handler
 * @returns {boolean} - Whether registration was successful
 */
export function registerComponentHandler(componentType, handlerName, handler, version = '1.0.0') {
  // Initialize component in registry if not present
  if (!registry.components[componentType]) {
    registry.components[componentType] = {
      handlers: {},
      currentVersion: version
    };
  }

  // Check if this component type is frozen
  if (registry.frozen[componentType]) {
    console.warn(`Cannot register handler for ${componentType} - component is frozen at version ${registry.components[componentType].currentVersion}`);
    return false;
  }

  // Store the handler
  if (!registry.components[componentType].handlers[version]) {
    registry.components[componentType].handlers[version] = {};
  }
  
  // Add the handler to the registry
  registry.components[componentType].handlers[version][handlerName] = handler;
  
  // Update current version to the latest registered
  registry.components[componentType].currentVersion = version;
  
  console.log(`Registered ${componentType}.${handlerName} (v${version})`);
  return true;
}

/**
 * Get a component handler from the registry
 * 
 * @param {string} componentType - The type of component (LED, OLED, etc)
 * @param {string} handlerName - The name of the handler function (checkWiring, update, etc)
 * @param {string} version - Optional specific version to use
 * @returns {Function|null} - The handler function or null if not found
 */
export function getComponentHandler(componentType, handlerName, version = null) {
  // Check if component exists in registry
  if (!registry.components[componentType]) {
    console.warn(`Component type ${componentType} not found in registry`);
    return null;
  }
  
  // Determine which version to use
  const versionToUse = version || registry.components[componentType].currentVersion;
  
  // Check if version exists
  if (!registry.components[componentType].handlers[versionToUse]) {
    console.warn(`Version ${versionToUse} not found for ${componentType}`);
    return null;
  }
  
  // Check if handler exists
  if (!registry.components[componentType].handlers[versionToUse][handlerName]) {
    console.warn(`Handler ${handlerName} not found for ${componentType} (v${versionToUse})`);
    return null;
  }
  
  // Return the requested handler
  return registry.components[componentType].handlers[versionToUse][handlerName];
}

/**
 * Freeze a component at its current version
 * This prevents new handlers from being registered
 * 
 * @param {string} componentType - The type of component to freeze
 * @returns {boolean} - Whether freezing was successful
 */
export function freezeComponent(componentType) {
  if (!registry.components[componentType]) {
    console.warn(`Cannot freeze ${componentType} - not found in registry`);
    return false;
  }
  
  registry.frozen[componentType] = true;
  const version = registry.components[componentType].currentVersion;
  console.log(`Frozen ${componentType} at version ${version}`);
  return true;
}

/**
 * Unfreeze a component to allow updates
 * 
 * @param {string} componentType - The type of component to unfreeze
 * @returns {boolean} - Whether unfreezing was successful
 */
export function unfreezeComponent(componentType) {
  if (!registry.frozen[componentType]) {
    console.warn(`Component ${componentType} is not frozen`);
    return false;
  }
  
  registry.frozen[componentType] = false;
  console.log(`Unfrozen ${componentType} - now at version ${registry.components[componentType].currentVersion}`);
  return true;
}

/**
 * List all registered components and their versions
 * 
 * @returns {Object} - Registry information
 */
export function getRegistryStatus() {
  const status = {};
  
  for (const componentType in registry.components) {
    status[componentType] = {
      currentVersion: registry.components[componentType].currentVersion,
      isFrozen: !!registry.frozen[componentType],
      handlers: Object.keys(registry.components[componentType].handlers[registry.components[componentType].currentVersion])
    };
  }
  
  return status;
}

// Export the registry for debugging - but components should use the functions above
export const debugRegistry = registry;