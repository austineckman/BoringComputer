import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Hammer, ShieldAlert, Gift, Sparkles } from 'lucide-react';
import { Recipe } from '@/../../shared/types';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  const { sounds } = useSoundEffects();
  
  // Handle recipe selection
  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    sounds.click();
  };
  
  // Handle craft button click
  const handleCraft = () => {
    if (canCraft) {
      onCraft();
    }
  };
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  // Check if user has required materials for a recipe
  const hasRequiredMaterials = (recipe: Recipe): boolean => {
    for (const [itemId, requiredAmount] of Object.entries(recipe.materials)) {
      const userAmount = inventory[itemId] || 0;
      if (userAmount < requiredAmount) {
        return false;
      }
    }
    return true;
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Recipes</CardTitle>
        <CardDescription>
          Select a recipe to craft
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-3">
            {recipes.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No recipes available
              </div>
            ) : (
              recipes.map((recipe) => {
                const isSelected = selectedRecipe?.id === recipe.id;
                const hasMaterials = hasRequiredMaterials(recipe);
                
                return (
                  <div
                    key={recipe.id}
                    className={cn(
                      'p-3 rounded-md border cursor-pointer transition-all',
                      isSelected
                        ? 'bg-primary/5 border-primary/50 dark:bg-primary/10'
                        : 'bg-card hover:bg-accent/5',
                      !recipe.unlocked && 'opacity-60'
                    )}
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{recipe.name}</div>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getDifficultyColor(recipe.difficulty))}
                      >
                        {recipe.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {recipe.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium">Materials:</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(recipe.materials).map(([itemId, amount]) => {
                          const userAmount = inventory[itemId] || 0;
                          const hasEnough = userAmount >= amount;
                          
                          return (
                            <Badge
                              key={itemId}
                              variant="outline"
                              className={cn(
                                'text-xs',
                                hasEnough
                                  ? 'border-green-400 dark:border-green-600'
                                  : 'border-red-400 dark:border-red-600'
                              )}
                            >
                              {itemId} ×{amount} {hasEnough ? '✓' : `(${userAmount})`}
                            </Badge>
                          );
                        })}
                      </div>
                      
                      <div className="text-xs font-medium">Rewards:</div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.rewards.map((reward, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1 text-amber-400" />
                            {reward.itemId} ×{reward.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        
        <Button
          onClick={handleCraft}
          disabled={!canCraft}
          className="w-full"
          size="lg"
        >
          {canCraft ? (
            <>
              <Hammer className="mr-2 h-4 w-4" />
              Craft Item
            </>
          ) : (
            <>
              <ShieldAlert className="mr-2 h-4 w-4" />
              {selectedRecipe ? 'Missing Materials' : 'Select a Recipe'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeList;