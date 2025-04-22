import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/../../shared/types';
import { Check, ChevronRight } from 'lucide-react';
import { getItemDetails } from '@/lib/itemDatabase';

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe) => void;
  inventory: Record<string, number>;
  canCraft: boolean;
  onCraft: () => void;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  inventory,
  canCraft,
  onCraft
}) => {
  // Helper to check if user has enough materials for a recipe
  const hasEnoughMaterials = (recipe: Recipe): boolean => {
    return Object.entries(recipe.materials).every(([itemId, requiredAmount]) => {
      const available = inventory[itemId] || 0;
      return available >= requiredAmount;
    });
  };
  
  // Helper to get difficulty badge style
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'expert':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>Recipes</span>
          {selectedRecipe && (
            <Button
              size="sm"
              className="ml-2"
              variant={canCraft ? "success" : "secondary"}
              disabled={!canCraft}
              onClick={onCraft}
            >
              {canCraft ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Craft Item
                </>
              ) : (
                'Missing Materials'
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recipes.map((recipe) => {
              const hasEnough = hasEnoughMaterials(recipe);
              const isSelected = selectedRecipe?.id === recipe.id;
              
              return (
                <div 
                  key={recipe.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                  } ${
                    hasEnough ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'opacity-70'
                  }`}
                  onClick={() => onSelectRecipe(recipe)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <img 
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-16 h-16 object-contain rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-base">{recipe.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(recipe.difficulty)}`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{recipe.description}</p>
                      
                      {isSelected && (
                        <div className="mt-2 space-y-1">
                          <h4 className="text-xs font-medium">Materials:</h4>
                          <div className="grid grid-cols-2 gap-1">
                            {Object.entries(recipe.materials).map(([itemId, amount]) => {
                              const available = inventory[itemId] || 0;
                              const hasItem = available >= amount;
                              const item = getItemDetails(itemId);
                              
                              return (
                                <div 
                                  key={`${recipe.id}-${itemId}`}
                                  className={`text-xs flex items-center ${hasItem ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                                >
                                  <img 
                                    src={item.imagePath} 
                                    alt={item.name} 
                                    className="w-4 h-4 mr-1 opacity-80"
                                  />
                                  {item.name}: {available}/{amount}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 self-center" />
                  </div>
                </div>
              );
            })}
            
            {recipes.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <h3 className="font-medium mb-1">No Recipes Available</h3>
                <p className="text-sm">Complete more quests to unlock new recipes for crafting!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecipeList;