import { QuestRepository } from "./quest-repository";
import { ComponentKitRepository } from "./component-kit-repository";

// Create singleton instances for all repositories
export const questRepository = new QuestRepository();
export const componentKitRepository = new ComponentKitRepository();

// Export all repositories in a single object for convenience
export const repositories = {
  quests: questRepository,
  componentKits: componentKitRepository,
};