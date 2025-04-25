import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, X, AlertTriangle, Check } from "lucide-react";

// Define interfaces locally
interface ItemDetails {
  id: string;
  name: string; 
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
  category?: string;
}

// Define server recipe interface
interface ServerRecipe {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  unlocked: boolean;
  pattern: (string | null)[][];
  requiredItems: Record<string, number>;
  resultItem: string;
  resultQuantity: number;
}

// Client-side recipe interface
interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  unlocked: boolean;
  inputs: {
    itemId: string;
    quantity: number;
    position: [number, number];
  }[];
  output: {
    itemId: string;
    quantity: number;
  };
}

interface CraftingGridItem {
  itemId: string | null;
  quantity: number;
  itemDetails?: ItemDetails;
}

const CraftingWindow: React.FC = () => {
  // Initialize a 3x3 crafting grid with empty cells
  const [craftingGrid, setCraftingGrid] = useState<CraftingGridItem[][]>(
    Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => ({ itemId: null, quantity: 0 }))
    )
  );
  
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [craftMessage, setCraftMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Fetch inventory items
  const { 
    data: inventoryItems, 
    isLoading: inventoryLoading 
  } = useQuery({
    queryKey: ["/api/inventory"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch all item details
  const { 
    data: allItems, 
    isLoading: itemsLoading 
  } = useQuery<ItemDetails[]>({
    queryKey: ["/api/items"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch all recipes
  const {
    data: serverRecipes,
    isLoading: recipesLoading
  } = useQuery<ServerRecipe[]>({
    queryKey: ["/api/crafting/recipes"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Transform server recipes to client format
  const recipes: Recipe[] = React.useMemo(() => {
    if (!serverRecipes) return [];
    
    return serverRecipes.map(recipe => {
      // Extract inputs from pattern and requiredItems
      const inputs: { itemId: string; quantity: number; position: [number, number] }[] = [];
      
      if (recipe.pattern) {
        for (let row = 0; row < recipe.pattern.length; row++) {
          for (let col = 0; col < recipe.pattern[row].length; col++) {
            const itemId = recipe.pattern[row][col];
            if (itemId) {
              // Find quantity from requiredItems
              const quantity = recipe.requiredItems[itemId] || 1; 
              
              inputs.push({
                itemId,
                quantity, 
                position: [row, col]
              });
            }
          }
        }
      }
      
      return {
        id: recipe.id.toString(),
        name: recipe.name,
        description: recipe.description,
        difficulty: recipe.difficulty,
        unlocked: recipe.unlocked,
        inputs,
        output: {
          itemId: recipe.resultItem,
          quantity: recipe.resultQuantity
        }
      };
    });
  }, [serverRecipes]);

  // Craft mutation
  const craftMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      // Convert the crafting grid into a 2D array of item IDs
      const gridPattern = craftingGrid.map(row => 
        row.map(cell => cell.itemId)
      );
      
      const res = await apiRequest("POST", "/api/crafting/craft", { 
        recipeId: parseInt(recipeId, 10),
        gridPattern 
      });
      return await res.json();
    },
    onSuccess: () => {
      // Clear grid
      setCraftingGrid(Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => ({ itemId: null, quantity: 0 }))
      ));
      
      // Show success message
      setCraftMessage({
        text: "Item crafted successfully!",
        type: "success"
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      
      // Clear message after a delay
      setTimeout(() => {
        setCraftMessage(null);
      }, 3000);
    },
    onError: (error: Error) => {
      setCraftMessage({
        text: `Crafting failed: ${error.message}`,
        type: "error"
      });
    }
  });

  // Helper function to get item details for a given item ID
  const getItemDetails = (itemId: string | null) => {
    if (!itemId || !allItems) return null;
    return allItems.find(item => item.id === itemId);
  };

  // Helper function to get inventory quantity for an item
  const getInventoryQuantity = (itemId: string) => {
    if (!inventoryItems || !Array.isArray(inventoryItems)) return 0;
    const item = inventoryItems.find((item: any) => item.type === itemId);
    return item ? item.quantity : 0;
  };

  const handleItemClick = (row: number, col: number) => {
    // Handle removing items from the grid
    const updatedGrid = [...craftingGrid];
    updatedGrid[row][col] = { itemId: null, quantity: 0 };
    setCraftingGrid(updatedGrid);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    // Clear the grid first
    const newGrid = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => ({ itemId: null, quantity: 0 }))
    );
    
    // Place items according to recipe
    recipe.inputs.forEach(input => {
      const [row, col] = input.position;
      const itemDetails = getItemDetails(input.itemId);
      
      // Create a new grid cell with the item
      newGrid[row][col] = { 
        itemId: input.itemId, 
        quantity: input.quantity,
        itemDetails
      };
    });
    
    // Update the grid and selected recipe
    setCraftingGrid(newGrid);
    setSelectedRecipeId(recipe.id);
  };

  const handleCraftClick = () => {
    if (!selectedRecipeId) {
      setCraftMessage({
        text: "Select a recipe first",
        type: "info"
      });
      return;
    }
    
    // Check if player has the required items
    const recipe = recipes?.find(r => r.id === selectedRecipeId);
    if (!recipe) return;
    
    // Check inventory quantities
    for (const input of recipe.inputs) {
      const inventoryQuantity = getInventoryQuantity(input.itemId);
      if (inventoryQuantity < input.quantity) {
        setCraftMessage({
          text: `Not enough ${getItemDetails(input.itemId)?.name || input.itemId}`,
          type: "error"
        });
        return;
      }
    }
    
    // All checks passed, craft the item
    craftMutation.mutate(selectedRecipeId);
  };

  if (inventoryLoading || itemsLoading || recipesLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Rarity colors for the UI
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-300',
      uncommon: 'bg-green-300',
      rare: 'bg-blue-300',
      epic: 'bg-purple-300',
      legendary: 'bg-yellow-300',
    };
    return colors[rarity] || 'bg-gray-300';
  };

  return (
    <div className="p-4 flex h-full">
      {/* Left side - Recipes */}
      <div className="w-1/3 pr-4 border-r border-gray-300 overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Recipes</h2>
        {recipesLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-border" />
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="space-y-2">
            {recipes.map((recipe) => {
              const outputItem = getItemDetails(recipe.output.itemId);
              
              return (
                <div 
                  key={recipe.id}
                  className={`p-2 border rounded cursor-pointer hover:bg-gray-100 transition-colors ${selectedRecipeId === recipe.id ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="flex items-center">
                    {outputItem?.imagePath && (
                      <div className={`w-10 h-10 ${getRarityColor(outputItem.rarity)} rounded-md mr-3 flex items-center justify-center`}>
                        <img 
                          src={outputItem.imagePath} 
                          alt={outputItem.name} 
                          className="w-8 h-8 object-contain pixelated-image"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm">{recipe.name}</div>
                      <div className="text-xs text-gray-600">{recipe.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>No recipes available</p>
            <p className="text-xs mt-1">Complete quests to unlock recipes</p>
          </div>
        )}
      </div>
      
      {/* Right side - Crafting grid and result */}
      <div className="w-2/3 pl-4 flex flex-col">
        <h2 className="text-lg font-bold mb-3">Crafting</h2>
        
        {/* Crafting Grid */}
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-1 w-fit border-2 border-gray-400 p-2 bg-gray-100">
            {craftingGrid.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                const itemDetails = cell.itemId ? getItemDetails(cell.itemId) : null;
                
                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center relative"
                    onClick={() => handleItemClick(rowIndex, colIndex)}
                  >
                    {cell.itemId && itemDetails && (
                      <>
                        <img 
                          src={itemDetails.imagePath} 
                          alt={itemDetails.name} 
                          className="w-12 h-12 object-contain pixelated-image"
                        />
                        {cell.quantity > 1 && (
                          <div className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded">
                            {cell.quantity}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
        
        {/* Crafting Output */}
        <div className="mt-4">
          {selectedRecipeId && (
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <div className="w-20 h-20 bg-gray-800 border-2 border-yellow-400 rounded-md flex items-center justify-center">
                  {(() => {
                    const recipe = recipes?.find(r => r.id === selectedRecipeId);
                    if (!recipe) return null;
                    
                    const outputItem = getItemDetails(recipe.output.itemId);
                    if (!outputItem) return null;
                    
                    return (
                      <>
                        <img 
                          src={outputItem.imagePath} 
                          alt={outputItem.name} 
                          className="w-16 h-16 object-contain pixelated-image"
                        />
                        {recipe.output.quantity > 1 && (
                          <div className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded">
                            {recipe.output.quantity}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              
              <button 
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                onClick={handleCraftClick}
                disabled={craftMutation.isPending}
              >
                {craftMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                ) : "Craft"}
              </button>
            </div>
          )}
        </div>
        
        {/* Crafting Messages */}
        {craftMessage && (
          <div className={`mt-4 p-2 rounded ${
            craftMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
            craftMessage.type === 'error' ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            <div className="flex items-center">
              {craftMessage.type === 'success' && <Check className="h-4 w-4 mr-2" />}
              {craftMessage.type === 'error' && <AlertTriangle className="h-4 w-4 mr-2" />}
              {craftMessage.type === 'info' && <X className="h-4 w-4 mr-2" />}
              <span>{craftMessage.text}</span>
            </div>
          </div>
        )}
        
        {/* Inventory */}
        <div className="mt-auto">
          <h3 className="text-sm font-bold mb-1 border-t border-gray-300 pt-2">Inventory</h3>
          <div className="grid grid-cols-8 gap-1">
            {inventoryItems && Array.isArray(inventoryItems) && inventoryItems.map((item: any) => {
              const itemDetails = getItemDetails(item.type);
              
              return (
                <div 
                  key={item.id} 
                  className={`relative w-8 h-8 border border-gray-400 ${
                    itemDetails?.rarity ? getRarityColor(itemDetails.rarity) : 'bg-gray-100'
                  } rounded`}
                >
                  {itemDetails?.imagePath && (
                    <img 
                      src={itemDetails.imagePath} 
                      alt={itemDetails.name} 
                      className="w-full h-full object-contain p-1 pixelated-image" 
                    />
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-[8px] px-0.5 rounded-sm">
                    {item.quantity}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftingWindow;