import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getItemDetails } from '@/lib/itemDatabase';

interface Recipe {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  resultItem: string;
  resultQuantity: number;
  materials: { [key: string]: number };
}

interface RecipeListProps {
  recipes: Recipe[];
  inventory: { type: string; quantity: number }[];
  onSelectRecipe: (recipeId: number) => void;
  selectedRecipeId?: number;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  inventory,
  onSelectRecipe,
  selectedRecipeId
}) => {
  // Function to check if the user has all the materials for a recipe
  const hasAllMaterials = (materials: { [key: string]: number }) => {
    return Object.entries(materials).every(([itemId, requiredQty]) => {
      const inventoryItem = inventory.find(item => item.type === itemId);
      return inventoryItem && inventoryItem.quantity >= requiredQty;
    });
  };

  // Create a map of inventory items for quick lookup
  const inventoryMap = inventory.reduce((acc, item) => {
    acc[item.type] = item.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Recipes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {recipes.map((recipe) => {
              const canCraft = hasAllMaterials(recipe.materials);
              const resultItemDetails = getItemDetails(recipe.resultItem);
              
              return (
                <div
                  key={recipe.id}
                  className={`
                    p-4 border rounded-md cursor-pointer transition-colors
                    ${selectedRecipeId === recipe.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700'}
                  `}
                  onClick={() => onSelectRecipe(recipe.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <img
                        src={resultItemDetails?.imagePath || `/items/${recipe.resultItem}.png`}
                        alt={recipe.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-item.png';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{recipe.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={canCraft ? 'secondary' : 'outline'} className={canCraft ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}>
                          {canCraft ? 'Available' : 'Missing materials'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {recipe.description}
                  </p>
                  <div className="mt-3">
                    <h4 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-2">Materials Required:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(recipe.materials).map(([itemId, requiredQty]) => {
                        const itemDetails = getItemDetails(itemId);
                        const availableQty = inventoryMap[itemId] || 0;
                        const hasEnough = availableQty >= requiredQty;
                        
                        return (
                          <div
                            key={itemId}
                            className={`
                              flex items-center gap-2 text-sm p-1 rounded
                              ${hasEnough
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'}
                            `}
                          >
                            <div className="w-6 h-6 flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center">
                              <img
                                src={itemDetails?.imagePath || `/items/${itemId}.png`}
                                alt={itemDetails?.name || itemId}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-item.png';
                                }}
                              />
                            </div>
                            <span>
                              {availableQty}/{requiredQty} {itemDetails?.name || itemId}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {recipes.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No recipes available
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecipeList;