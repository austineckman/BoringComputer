import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSoundEffects } from '@/hooks/useSoundEffects';

// Temporary interface until we can import from schema.ts
interface CraftingRecipe {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  createdAt: string;
  image?: string;
  pattern: (string | null)[][];
  requiredItems: Record<string, number>;
  resultItem: string;
  resultQuantity: number;
  unlocked: boolean;
}

interface RecipeListProps {
  recipes: CraftingRecipe[];
  selectedRecipe: CraftingRecipe | null;
  onSelectRecipe: (recipe: CraftingRecipe) => void;
  inventory: Record<string, number>;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  inventory,
}) => {
  const { sounds } = useSoundEffects();

  // Check if player has enough resources to craft recipe
  const canCraftRecipe = (recipe: CraftingRecipe): boolean => {
    if (!recipe.requiredItems) return true;

    for (const [itemId, quantity] of Object.entries(recipe.requiredItems)) {
      const available = inventory[itemId] || 0;
      if (available < quantity) return false;
    }
    return true;
  };

  // Memoize which recipes can be crafted to avoid recalculation
  const craftableRecipes = useMemo(() => {
    return recipes.map(recipe => ({
      ...recipe,
      canCraft: canCraftRecipe(recipe),
    }));
  }, [recipes, inventory]);

  const handleSelectRecipe = (recipe: CraftingRecipe) => {
    sounds.click();
    onSelectRecipe(recipe);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Recipe Collection</CardTitle>
      </CardHeader>
      <CardContent>
        {recipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recipes discovered yet. Complete quests to unlock recipes!
          </div>
        ) : (
          <ScrollArea className="h-[460px] pr-3">
            <div className="space-y-3">
              {craftableRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${
                    selectedRecipe?.id === recipe.id
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800'
                  }`}
                  onClick={() => handleSelectRecipe(recipe)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{recipe.name}</h3>
                    <Badge variant={recipe.canCraft ? "secondary" : "outline"}>
                      {recipe.canCraft ? 'Craftable' : 'Missing Items'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {recipe.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(recipe.requiredItems).map(([itemId, quantity]) => (
                      <Badge 
                        key={itemId}
                        variant="outline" 
                        className={`text-xs ${
                          (inventory[itemId] || 0) < quantity
                            ? 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400'
                            : 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400'
                        }`}
                      >
                        {itemId}: {inventory[itemId] || 0}/{quantity}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Result: {recipe.resultQuantity}x {recipe.resultItem}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeList;