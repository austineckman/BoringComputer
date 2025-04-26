import { QuestRepository } from './quest-repository';
import { ComponentKitRepository } from './component-kit-repository';

// Create repository instances
export const questRepository = new QuestRepository();
export const componentKitRepository = new ComponentKitRepository();

// Export repository classes
export { QuestRepository, ComponentKitRepository };