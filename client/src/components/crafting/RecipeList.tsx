import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CheckCircle, CircleAlert, Lock } from 'lucide-react';
import { Recipe } from '@/../../shared/types';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Badge } from '@/components/ui/badge';

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

  // Filter recipes by availability
  const sortedRecipes = React.useMemo(() => {
    return [...recipes].sort((a, b) => a.unlockedAt - b.unlockedAt);
  }, [recipes]);
  
  // Check if a recipe can be crafted with current inventory
  const canCraftRecipe = (recipe: Recipe): boolean => {
    return Object.entries(recipe.materials).every(([itemId, requiredAmount]) => {
      const available = inventory[itemId] || 0;
      return available >= requiredAmount;
    });
  };
  
  // Handle recipe selection
  const handleSelectRecipe = (recipe: Recipe) => {
    sounds.click();
    onSelectRecipe(recipe);
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          Available Recipes
        </CardTitle>
        <CardDescription>
          Select a recipe to craft
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedRecipes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recipes available
              </div>
            ) : (
              sortedRecipes.map((recipe) => {
                const isSelected = selectedRecipe?.id === recipe.id;
                const hasItems = canCraftRecipe(recipe);
                
                return (
                  <div 
                    key={recipe.id}
                    className={`
                      p-3 border rounded-md cursor-pointer transition-all
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    `}
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                        {recipe.imageUrl ? (
                          <img 
                            src={recipe.imageUrl} 
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Lock size={24} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{recipe.name}</h4>
                          <Badge variant={hasItems ? "success" : "secondary"} className="ml-auto text-[10px]">
                            {hasItems ? (
                              <><CheckCircle className="mr-1 h-3 w-3" /> Ready</>
                            ) : (
                              <><CircleAlert className="mr-1 h-3 w-3" /> Missing Items</>
                            )}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {recipe.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(recipe.materials).map(([itemId, amount]) => {
                            const available = inventory[itemId] || 0;
                            const hasEnough = available >= amount;
                            
                            return (
                              <Badge 
                                key={itemId}
                                variant="outline" 
                                className={`text-[10px] ${hasEnough ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                              >
                                {itemId}: {available}/{amount}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCraft();
                          }}
                          disabled={!canCraft}
                        >
                          Craft
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecipeList;