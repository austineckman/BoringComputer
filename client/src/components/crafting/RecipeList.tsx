import React from 'react';
import { CraftingRecipe } from '@/shared/schema';
import ResourceItem from '@/components/ui/resource-item';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

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
  inventory
}) => {
  const { sounds } = useSoundEffects();

  const handleRecipeClick = (recipe: CraftingRecipe) => {
    sounds.click();
    onSelectRecipe(recipe);
  };

  // Check if player has all required resources for a recipe
  const canCraftRecipe = (recipe: CraftingRecipe): boolean => {
    for (const [itemId, quantity] of Object.entries(recipe.requiredItems)) {
      const available = inventory[itemId] || 0;
      if (available < quantity) {
        return false;
      }
    }
    return true;
  };

  // Sort recipes: available first, then by difficulty
  const sortedRecipes = [...recipes].sort((a, b) => {
    const canCraftA = canCraftRecipe(a);
    const canCraftB = canCraftRecipe(b);
    
    if (canCraftA && !canCraftB) return -1;
    if (!canCraftA && canCraftB) return 1;
    
    // Sort by difficulty after availability
    const difficultyOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
    return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
  });

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Recipe Guide</CardTitle>
        <CardDescription>Select a recipe to start crafting</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="px-4 pb-4 space-y-3">
            {sortedRecipes.map((recipe) => {
              const isSelected = selectedRecipe?.id === recipe.id;
              const isCraftable = canCraftRecipe(recipe);
              
              return (
                <div
                  key={recipe.id}
                  className={cn(
                    'recipe-item p-3 rounded-lg border-2 cursor-pointer transition-all',
                    isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700',
                    !isCraftable && 'opacity-70',
                    'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                  )}
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ResourceItem
                        type={recipe.resultItem as any}
                        quantity={recipe.resultQuantity}
                        size="sm"
                        interactive={false}
                      />
                      <h4 className="font-medium ml-2">{recipe.name}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isCraftable ? "success" : "secondary"}>
                        {isCraftable ? 'Available' : 'Missing Resources'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {recipe.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(recipe.requiredItems).map(([itemId, quantity]) => (
                      <div key={itemId} className="inline-flex items-center mr-2">
                        <ResourceItem
                          type={itemId as any}
                          quantity={quantity}
                          size="sm"
                          interactive={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {recipes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recipes available. Complete quests to unlock new recipes.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecipeList;