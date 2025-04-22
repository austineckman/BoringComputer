import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, CircleCheck, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Recipe } from '@/../../shared/types';

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe | null) => void;
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
  const { sounds } = useSoundEffects();
  
  // Handle recipe selection
  const handleSelectRecipe = (recipe: Recipe) => {
    sounds.click();
    onSelectRecipe(selectedRecipe?.id === recipe.id ? null : recipe);
  };
  
  // Handle craft button click
  const handleCraft = () => {
    sounds.craftComplete();
    onCraft();
  };
  
  // Check if user has enough materials for a recipe
  const hasEnoughMaterials = (recipe: Recipe): boolean => {
    return Object.entries(recipe.materials).every(([itemId, requiredAmount]) => {
      const availableAmount = inventory[itemId] || 0;
      return availableAmount >= requiredAmount;
    });
  };
  
  // Get recipe difficulty badge color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'expert':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Recipes</CardTitle>
        <CardDescription>
          Select a recipe to craft
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id}
                className={cn(
                  'p-3 border rounded-md cursor-pointer transition-all',
                  {
                    'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20': 
                      selectedRecipe?.id === recipe.id,
                    'hover:bg-gray-50 dark:hover:bg-gray-800': 
                      selectedRecipe?.id !== recipe.id,
                    'opacity-70': !hasEnoughMaterials(recipe)
                  }
                )}
                onClick={() => handleSelectRecipe(recipe)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{recipe.name}</h3>
                  <Badge className={cn('text-xs', getDifficultyColor(recipe.difficulty))}>
                    {recipe.difficulty}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {recipe.description}
                </p>
                
                <div className="mt-3">
                  <h4 className="text-xs font-medium mb-1">Required Materials:</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(recipe.materials).map(([itemId, amount]) => {
                      const available = inventory[itemId] || 0;
                      const hasEnough = available >= amount;
                      
                      return (
                        <Badge 
                          key={itemId}
                          variant={hasEnough ? 'secondary' : 'outline'}
                          className={cn(
                            'flex items-center text-xs',
                            hasEnough ? 
                              'text-green-600 dark:text-green-400' : 
                              'text-red-500 dark:text-red-400'
                          )}
                        >
                          {hasEnough && <CircleCheck className="mr-1 h-3 w-3" />}
                          {itemId}: {available}/{amount}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-xs font-medium mb-1">Rewards:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.rewards.map((reward, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="flex items-center text-xs bg-green-50 dark:bg-green-900/20"
                      >
                        <Sparkles className="mr-1 h-3 w-3 text-amber-500" />
                        {reward.itemId} x{reward.quantity}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {recipe.unlockedAt > 1 && (
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Unlocked at level {recipe.unlockedAt}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {selectedRecipe && (
          <div className="mt-4 flex">
            <Button
              className="w-full"
              disabled={!canCraft}
              onClick={handleCraft}
              variant={canCraft ? 'default' : 'outline'}
            >
              {canCraft ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Craft {selectedRecipe.name}
                </>
              ) : (
                'Missing Materials'
              )}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeList;