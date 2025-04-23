export interface Recipe {
  id: string;
  name: string;
  description: string;
  resultItem: string;
  resultQuantity: number;
  pattern: (string | null)[][];
  requiredItems: Record<string, number>;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  unlocked: boolean;
  heroImage?: string; // URL to the hero image
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';