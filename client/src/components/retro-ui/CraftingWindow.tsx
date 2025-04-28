import React, { useState, useRef, useEffect, createContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, AlertTriangle, Check, Flame, Hammer, Sparkles, ChevronRight, Filter, Trash2 } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import forgeBackground from "@assets/forgebg.png";

// Create a context for sharing usedItems state across components
interface CraftingContextType {
  usedItems: Record<string, number>;
  getInventoryQuantity: (itemId: string) => number;
}

const CraftingContext = createContext<CraftingContextType>({ 
  usedItems: {},
  getInventoryQuantity: () => 0
});

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

interface DragItem {
  type: string;
  itemId: string;
  quantity: number;
  source: 'inventory' | 'grid';
  position?: [number, number];
}

// Draggable inventory item component
const DraggableInventoryItem: React.FC<{
  item: any;
  itemDetails: ItemDetails | null;
  index: number;
}> = ({ item, itemDetails, index }) => {
  // Get access to the usedItems state from the context
  const { usedItems } = React.useContext(CraftingContext);
  
  // Calculate the effective quantity (accounting for items in the crafting grid)
  const usedQuantity = usedItems[item.type] || 0;
  const effectiveQuantity = Math.max(0, item.quantity - usedQuantity);
  
  // Disable dragging if all items of this type are used
  const canDrag = effectiveQuantity > 0;
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'INVENTORY_ITEM',
    item: {
      type: 'INVENTORY_ITEM',
      itemId: item.type,
      quantity: 1, // We always drag just 1 item at a time
      source: 'inventory' as const,
    },
    canDrag, // Disable dragging if no items left
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getRarityClasses = (rarity: string) => {
    const classes: Record<string, string> = {
      common: 'border-gray-400 bg-black/60',
      uncommon: 'border-green-500 shadow-[0_0_8px_1px_rgba(30,255,0,0.4)] bg-green-950/40',
      rare: 'border-blue-500 shadow-[0_0_8px_1px_rgba(0,112,221,0.5)] bg-blue-950/40',
      epic: 'border-purple-500 shadow-[0_0_10px_2px_rgba(163,53,238,0.5)] bg-purple-950/40',
      legendary: 'border-yellow-500 shadow-[0_0_10px_2px_rgba(255,215,0,0.6)] bg-amber-950/40',
    };
    return classes[rarity] || 'border-gray-400 bg-black/60';
  };

  return (
    <div 
      ref={drag}
      className={`relative w-12 h-12 border ${
        itemDetails?.rarity ? getRarityClasses(itemDetails.rarity) : 'border-gray-600 bg-black/40'
      } rounded ${
        effectiveQuantity > 0 ? 'cursor-grab' : 'cursor-not-allowed'
      } ${isDragging ? 'opacity-50' : effectiveQuantity === 0 ? 'opacity-40' : 'opacity-100'}`}
    >
      {itemDetails?.imagePath && (
        <img 
          src={itemDetails.imagePath} 
          alt={itemDetails.name || 'Item'} 
          className="w-full h-full object-contain p-1" 
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
      )}
      <div className={`absolute bottom-0 right-0 bg-black/80 ${
        effectiveQuantity === 0 ? 'text-red-400' : 'text-amber-300'
      } text-xs px-1 rounded-tl font-pixel`}>
        {effectiveQuantity < item.quantity 
          ? `${effectiveQuantity}/${item.quantity}` 
          : item.quantity}
      </div>
    </div>
  );
};

// Droppable crafting grid cell component
const CraftingGridCell: React.FC<{
  rowIndex: number;
  colIndex: number;
  cell: CraftingGridItem;
  onDrop: (item: DragItem, rowIndex: number, colIndex: number) => void;
  onRemove: (rowIndex: number, colIndex: number) => void;
}> = ({ rowIndex, colIndex, cell, onDrop, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item: DragItem) => {
      onDrop(item, rowIndex, colIndex);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Make grid items draggable too
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'INVENTORY_ITEM',
    item: cell.itemId ? {
      type: 'INVENTORY_ITEM',
      itemId: cell.itemId,
      quantity: cell.quantity,
      source: 'grid' as const,
      position: [rowIndex, colIndex],
    } : null,
    canDrag: !!cell.itemId,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const cellRef = useRef<HTMLDivElement>(null);
  
  // Set the drag ref on the cell content if there's an item, otherwise on the cell itself
  const dragDropRef = cell.itemId ? drag(drop(cellRef)) : drop(cellRef);

  return (
    <div
      ref={dragDropRef}
      className={`w-16 h-16 relative border-2 ${
        isOver ? 'border-amber-500 bg-black/40 scale-105' : 'border-gray-700 bg-black/30'
      } rounded-md flex items-center justify-center transition-all duration-100 ${
        cell.itemId ? 'cursor-grab' : 'cursor-default'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={() => cell.itemId && onRemove(rowIndex, colIndex)}
    >
      {!cell.itemId && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3C%2Fsvg%3E')] opacity-30"></div>
      )}
      
      {cell.itemId && cell.itemDetails && (
        <>
          <img 
            src={cell.itemDetails.imagePath} 
            alt={cell.itemDetails.name} 
            className="w-12 h-12 object-contain" 
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
          {/* We don't show quantity on grid cells */}
        </>
      )}
    </div>
  );
};

// Animation for crafting success
const CraftingSuccess: React.FC<{ 
  position: { x: number, y: number }, 
  isVisible: boolean,
  onAnimationEnd: () => void
}> = ({ position, isVisible, onAnimationEnd }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 2000); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationEnd]);

  if (!isVisible) return null;

  return (
    <div 
      className="absolute pointer-events-none z-50"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative">
        <Sparkles className="text-amber-400 w-12 h-12 animate-ping" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-amber-300 font-bold text-xl animate-bounce">
            ✓
          </div>
        </div>
      </div>
    </div>
  );
};

// Main CraftingWindow component
const CraftingWindow: React.FC = () => {
  // Initialize a 3x3 crafting grid with empty cells
  const [craftingGrid, setCraftingGrid] = useState<CraftingGridItem[][]>(
    Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => ({ itemId: null, quantity: 0 }))
    )
  );
  
  // Track items placed in grid to manage inventory
  const [usedItems, setUsedItems] = useState<Record<string, number>>({});
  
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [craftMessage, setCraftMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  
  // Animation state
  const [craftSuccess, setCraftSuccess] = useState({
    isVisible: false,
    position: { x: 0, y: 0 }
  });
  
  const outputRef = useRef<HTMLDivElement>(null);

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
              // For grid positions, quantity is always 1
              // The total quantity needed is stored in requiredItems
              inputs.push({
                itemId,
                quantity: 1, // Grid positions always have quantity 1
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

  // Filter recipes by difficulty if filter is active
  const filteredRecipes = React.useMemo(() => {
    if (!difficultyFilter) return recipes;
    return recipes.filter(recipe => recipe.difficulty === difficultyFilter);
  }, [recipes, difficultyFilter]);

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
      // Show success animation
      if (outputRef.current) {
        const rect = outputRef.current.getBoundingClientRect();
        setCraftSuccess({
          isVisible: true,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          }
        });
      }
      
      // Clear grid
      setCraftingGrid(Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => ({ itemId: null, quantity: 0 }))
      ));
      
      // Show success message
      setCraftMessage({
        text: "Item crafted successfully!",
        type: "success"
      });
      
      // Clear used items tracking
      setUsedItems({});
      
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

  // Helper function to get inventory quantity for an item, accounting for items already used in the grid
  const getInventoryQuantity = (itemId: string) => {
    if (!inventoryItems || !Array.isArray(inventoryItems)) return 0;
    const item = inventoryItems.find((item: any) => item.type === itemId);
    const baseQuantity = item ? item.quantity : 0;
    
    // Subtract any items that are already used in the crafting grid
    const usedQuantity = usedItems[itemId] || 0;
    
    return Math.max(0, baseQuantity - usedQuantity);
  };

  // Helper to update used items tracking
  const trackUsedItem = (itemId: string | null, add: boolean) => {
    if (!itemId) return; // Skip null items
    
    setUsedItems(prev => {
      const newUsed = { ...prev };
      if (add) {
        // Add item to used items
        newUsed[itemId] = (newUsed[itemId] || 0) + 1;
      } else {
        // Remove item from used items
        newUsed[itemId] = Math.max(0, (newUsed[itemId] || 0) - 1);
        if (newUsed[itemId] === 0) {
          delete newUsed[itemId]; // Clean up zero entries
        }
      }
      return newUsed;
    });
  };
  
  // Handle drop on crafting grid
  const handleItemDrop = (item: DragItem, row: number, col: number) => {
    // Create a copy of the current grid
    const updatedGrid = [...craftingGrid.map(r => [...r])];
    
    // If the item is coming from another grid cell, clear that cell and return item to inventory
    if (item.source === 'grid' && item.position) {
      const [sourceRow, sourceCol] = item.position;
      if (sourceRow !== row || sourceCol !== col) { // Only clear if not the same cell
        const removedItemId = updatedGrid[sourceRow][sourceCol].itemId;
        trackUsedItem(removedItemId, false); // Return item to inventory
        
        updatedGrid[sourceRow][sourceCol] = { itemId: null, quantity: 0 };
      }
    }
    
    // Get the current item in the target cell (if any)
    const currentItemId = updatedGrid[row][col].itemId;
    if (currentItemId) {
      // Return the current item to inventory
      trackUsedItem(currentItemId, false);
    }
    
    // Add the item to the target cell
    const itemDetails = getItemDetails(item.itemId);
    updatedGrid[row][col] = {
      itemId: item.itemId,
      quantity: 1, // Grid cells always have quantity 1
      itemDetails
    };
    
    // If from inventory, track as used
    if (item.source === 'inventory') {
      trackUsedItem(item.itemId, true);
    }
    
    // Update the grid
    setCraftingGrid(updatedGrid);
    
    // Check if this matches any recipe
    const matchingRecipe = recipes.find(recipe => {
      const pattern = Array(3).fill(null).map(() => Array(3).fill(null));
      
      // Fill the pattern based on our grid
      updatedGrid.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          pattern[rowIdx][colIdx] = cell.itemId;
        });
      });
      
      // Check if this matches the recipe pattern
      for (const input of recipe.inputs) {
        const [r, c] = input.position;
        if (pattern[r][c] !== input.itemId) {
          return false;
        }
      }
      
      // Also check that empty cells in the recipe are empty in our pattern
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const hasInput = recipe.inputs.some(input => 
            input.position[0] === r && input.position[1] === c
          );
          
          if (!hasInput && pattern[r][c] !== null) {
            return false;
          }
        }
      }
      
      return true;
    });
    
    if (matchingRecipe) {
      setSelectedRecipeId(matchingRecipe.id);
    }
  };

  // Handle removing items from the grid
  const handleRemoveItem = (row: number, col: number) => {
    const updatedGrid = [...craftingGrid.map(r => [...r])];
    const removedItemId = updatedGrid[row][col].itemId;
    
    // Return the item to inventory
    trackUsedItem(removedItemId, false);
    
    // Clear the cell
    updatedGrid[row][col] = { itemId: null, quantity: 0 };
    setCraftingGrid(updatedGrid);
  };
  
  // Clear the entire crafting grid
  const handleClearGrid = () => {
    // Return all items to inventory
    craftingGrid.forEach(row => {
      row.forEach(cell => {
        if (cell.itemId) {
          trackUsedItem(cell.itemId, false);
        }
      });
    });
    
    // Reset the grid
    setCraftingGrid(Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => ({ itemId: null, quantity: 0 }))
    ));
    
    setSelectedRecipeId(null);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    // First, return all items currently in the grid to inventory
    craftingGrid.forEach(row => {
      row.forEach(cell => {
        if (cell.itemId) {
          trackUsedItem(cell.itemId, false);
        }
      });
    });
    
    // Clear the grid
    const newGrid = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => ({ itemId: null, quantity: 0 }))
    );
    
    // Place items according to recipe
    recipe.inputs.forEach(input => {
      const [row, col] = input.position;
      const itemDetails = getItemDetails(input.itemId);
      
      // Create a new grid cell with the item
      // Grid cells always have a quantity of 1
      newGrid[row][col] = { 
        itemId: input.itemId, 
        quantity: 1, // Always 1 for grid positions
        itemDetails
      };
      
      // Mark item as used in inventory
      trackUsedItem(input.itemId, true);
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
    
    // Find the original server recipe to get total quantities needed
    const serverRecipe = serverRecipes?.find(
      (sr: any) => sr.id.toString() === selectedRecipeId
    );
    
    if (!serverRecipe) {
      console.error("Could not find server recipe:", selectedRecipeId);
      return;
    }
    
    // Check inventory quantities against total requirements (not grid positions)
    for (const [itemId, quantity] of Object.entries(serverRecipe.requiredItems)) {
      const inventoryQuantity = getInventoryQuantity(itemId);
      if (inventoryQuantity < quantity) {
        setCraftMessage({
          text: `Not enough ${getItemDetails(itemId)?.name || itemId}`,
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
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  // Get difficulty colors
  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'text-green-400 bg-green-900/20 border-green-900/50',
      medium: 'text-yellow-400 bg-yellow-900/20 border-yellow-900/50',
      hard: 'text-red-400 bg-red-900/20 border-red-900/50',
    };
    return colors[difficulty] || 'text-gray-400 bg-gray-900/20 border-gray-900/50';
  };

  // Provide context values
  const contextValue: CraftingContextType = {
    usedItems,
    getInventoryQuantity
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <CraftingContext.Provider value={contextValue}>
        <div 
          className="w-full h-full overflow-hidden rounded-lg text-white"
          style={{
            backgroundImage: `url(${forgeBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            imageRendering: 'pixelated',
            height: '100%'
          }}
        >
        {/* Main container with semi-transparent overlay */}
        <div className="w-full h-full bg-black/40 backdrop-blur-[1px] flex flex-col">
          {/* Header with title and animated flames */}
          <div className="bg-gradient-to-r from-amber-900/90 to-amber-800/70 px-4 py-3 border-b border-amber-700/70 flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative">
                <Flame className="h-5 w-5 mr-2 text-amber-300 animate-pulse" />
                <div className="absolute inset-0 opacity-50">
                  <Flame className="h-5 w-5 mr-2 text-orange-500 animate-ping" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <h2 className="text-lg font-bold text-amber-200">Gizbo's Forge</h2>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div 
                className={`px-3 py-1 rounded-md border cursor-pointer transition-colors ${
                  difficultyFilter === 'easy' ? 'bg-green-700/50 text-white' : 'text-green-400 hover:bg-green-900/30'
                }`}
                onClick={() => setDifficultyFilter(difficultyFilter === 'easy' ? null : 'easy')}
              >
                Easy
              </div>
              <div 
                className={`px-3 py-1 rounded-md border cursor-pointer transition-colors ${
                  difficultyFilter === 'medium' ? 'bg-yellow-700/50 text-white' : 'text-yellow-400 hover:bg-yellow-900/30'
                }`}
                onClick={() => setDifficultyFilter(difficultyFilter === 'medium' ? null : 'medium')}
              >
                Medium
              </div>
              <div 
                className={`px-3 py-1 rounded-md border cursor-pointer transition-colors ${
                  difficultyFilter === 'hard' ? 'bg-red-700/50 text-white' : 'text-red-400 hover:bg-red-900/30'
                }`}
                onClick={() => setDifficultyFilter(difficultyFilter === 'hard' ? null : 'hard')}
              >
                Hard
              </div>
              {difficultyFilter && (
                <div 
                  className="px-2 py-1 rounded-md bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer text-xs text-white flex items-center"
                  onClick={() => setDifficultyFilter(null)}
                >
                  <Filter className="h-3 w-3 mr-1" /> Clear
                </div>
              )}
            </div>
          </div>
          
          {/* Three-column layout with recipes, crafting grid, and output */}
          <div className="flex flex-1 overflow-hidden p-4 gap-4">
            {/* Left column - Recipes */}
            <div className="w-1/3 bg-black/60 border border-amber-900/50 rounded-lg overflow-hidden flex flex-col">
              <div className="px-3 py-2 bg-gradient-to-r from-amber-900/80 to-amber-800/50 border-b border-amber-700/50">
                <h3 className="font-medium text-amber-200">Available Recipes</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {recipesLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                  </div>
                ) : filteredRecipes && filteredRecipes.length > 0 ? (
                  <div className="space-y-2">
                    {filteredRecipes.map((recipe) => {
                      const outputItem = getItemDetails(recipe.output.itemId);
                      
                      return (
                        <div 
                          key={recipe.id}
                          className={`p-2 border rounded cursor-pointer transition-colors ${
                            selectedRecipeId === recipe.id 
                              ? 'bg-amber-800/50 border-amber-500/80' 
                              : 'border-gray-700/50 hover:bg-gray-800/50'
                          }`}
                          onClick={() => handleRecipeClick(recipe)}
                        >
                          <div className="flex items-center">
                            {outputItem?.imagePath && (
                              <div className={`w-10 h-10 bg-black/60 rounded-md mr-3 flex items-center justify-center border ${
                                outputItem.rarity === 'legendary' ? 'border-amber-500' :
                                outputItem.rarity === 'epic' ? 'border-purple-500' :
                                outputItem.rarity === 'rare' ? 'border-blue-500' :
                                outputItem.rarity === 'uncommon' ? 'border-green-500' :
                                'border-gray-600'
                              }`}>
                                <img 
                                  src={outputItem.imagePath} 
                                  alt={outputItem.name} 
                                  className="w-8 h-8 object-contain"
                                  style={{ imageRendering: 'pixelated' }}
                                  draggable={false}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{recipe.name}</div>
                              <div className="text-xs text-gray-400">{recipe.description}</div>
                              <div className={`text-xs mt-1 inline-block px-1.5 rounded-sm border ${getDifficultyColor(recipe.difficulty)}`}>
                                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-amber-500" />
                          </div>
                          
                          {/* Show recipe ingredients */}
                          <div className="mt-2 pt-2 border-t border-gray-700/50">
                            <div className="text-xs text-gray-400 mb-1">Requires:</div>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                // For each recipe, the server already provides the total quantities needed
                                // in the requiredItems field. We can use that directly.
                                
                                // Most efficient approach: just use the requiredItems directly from the server recipe
                                // First, we need to find the original server recipe data
                                const serverRecipe = serverRecipes?.find(
                                  (sr: any) => sr.id.toString() === recipe.id
                                );
                                
                                if (!serverRecipe) {
                                  console.error("Could not find server recipe for:", recipe.id);
                                  return null;
                                }
                                
                                // Create a new array for displaying the requirements
                                // with proper typing that TS will understand
                                const displayItems = Object.entries(serverRecipe.requiredItems).map(
                                  ([itemId, quantity]: [string, number]) => {
                                    return {
                                      itemId,
                                      totalQuantity: quantity,
                                      item: getItemDetails(itemId)
                                    };
                                  }
                                );
                                
                                // Display the consolidated requirements
                                return displayItems.map((requirement, idx) => {
                                  const hasEnough = getInventoryQuantity(requirement.itemId) >= requirement.totalQuantity;
                                  
                                  return (
                                    <div 
                                      key={idx}
                                      className={`flex items-center bg-black/40 px-1.5 py-0.5 rounded ${
                                        hasEnough ? 'text-white' : 'text-red-400'
                                      }`}
                                    >
                                      {requirement.item?.imagePath && (
                                        <img 
                                          src={requirement.item.imagePath} 
                                          alt={requirement.item.name} 
                                          className="w-4 h-4 mr-1 object-contain"
                                          style={{ imageRendering: 'pixelated' }}
                                        />
                                      )}
                                      <span className="text-xs">
                                        {requirement.totalQuantity}x {requirement.item?.name || requirement.itemId}
                                      </span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    <p>No recipes available</p>
                    <p className="text-xs mt-1">Complete quests to unlock recipes</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Middle column - Crafting grid */}
            <div className="w-1/3 bg-black/60 border border-amber-900/50 rounded-lg overflow-hidden flex flex-col">
              <div className="px-3 py-2 bg-gradient-to-r from-amber-900/80 to-amber-800/50 border-b border-amber-700/50 flex items-center">
                <Hammer className="h-4 w-4 mr-2 text-amber-300" />
                <h3 className="font-medium text-amber-200">Crafting Grid</h3>
              </div>
              
              <div className="flex-1 p-6 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-2 p-3 bg-black/40 border-2 border-amber-900/70 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                  {craftingGrid.map((row, rowIndex) => (
                    row.map((cell, colIndex) => (
                      <CraftingGridCell
                        key={`${rowIndex}-${colIndex}`}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        cell={cell}
                        onDrop={handleItemDrop}
                        onRemove={handleRemoveItem}
                      />
                    ))
                  ))}
                </div>
                
                {/* Animation overlay */}
                <CraftingSuccess 
                  position={craftSuccess.position}
                  isVisible={craftSuccess.isVisible}
                  onAnimationEnd={() => setCraftSuccess({ ...craftSuccess, isVisible: false })}
                />
              </div>
              
              {/* Crafting instructions */}
              <div className="px-4 py-2 bg-black/40 text-xs text-gray-400 border-t border-amber-900/30">
                <p>Drag items from your inventory to the grid. Click items to remove them.</p>
              </div>
            </div>
            
            {/* Right column - Output and inventory */}
            <div className="w-1/3 flex flex-col gap-3">
              {/* Output section */}
              <div className="bg-black/60 border border-amber-900/50 rounded-lg overflow-hidden flex flex-col h-1/2">
                <div className="px-3 py-2 bg-gradient-to-r from-amber-900/80 to-amber-800/50 border-b border-amber-700/50">
                  <h3 className="font-medium text-amber-200">Output</h3>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-4">
                  {selectedRecipeId ? (
                    <div className="flex flex-col items-center">
                      <div className="mb-4">
                        <div 
                          ref={outputRef}
                          className="w-20 h-20 bg-black/60 border-2 border-amber-500 rounded-md flex items-center justify-center relative overflow-hidden"
                        >
                          {(() => {
                            const recipe = recipes?.find(r => r.id === selectedRecipeId);
                            if (!recipe) return null;
                            
                            const outputItem = getItemDetails(recipe.output.itemId);
                            if (!outputItem) return null;
                            
                            // Add a subtle glow based on rarity
                            const glowColor = 
                              outputItem.rarity === 'legendary' ? 'rgba(255, 215, 0, 0.3)' :
                              outputItem.rarity === 'epic' ? 'rgba(163, 53, 238, 0.3)' :
                              outputItem.rarity === 'rare' ? 'rgba(0, 112, 221, 0.3)' :
                              outputItem.rarity === 'uncommon' ? 'rgba(30, 255, 0, 0.3)' :
                              'rgba(255, 255, 255, 0.2)';
                            
                            return (
                              <>
                                <div className="absolute inset-0 animate-pulse" style={{ 
                                  boxShadow: `inset 0 0 15px ${glowColor}`,
                                  animationDuration: '2s'
                                }}></div>
                                <img 
                                  src={outputItem.imagePath} 
                                  alt={outputItem.name} 
                                  className="w-16 h-16 object-contain z-10"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                                {recipe.output.quantity > 1 && (
                                  <div className="absolute bottom-0 right-0 bg-black/80 text-amber-300 text-xs px-1 rounded-tl font-pixel z-20">
                                    {recipe.output.quantity}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Clear Crafting Table Button */}
                        <button 
                          className="px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 
                                   text-white rounded-md border border-gray-700 shadow-md transition-colors
                                   flex items-center justify-center gap-1"
                          onClick={handleClearGrid}
                          disabled={!craftingGrid.some(row => row.some(cell => cell.itemId !== null))}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Clear</span>
                        </button>
                        
                        {/* Forge Button */}
                        <button 
                          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 
                                   text-white rounded-md border border-amber-800 shadow-md transition-colors
                                   flex items-center justify-center gap-2 min-w-32"
                          onClick={handleCraftClick}
                          disabled={craftMutation.isPending}
                        >
                          {craftMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Hammer className="h-4 w-4" />
                              <span>Forge Item</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Crafting Messages */}
                      {craftMessage && (
                        <div className={`mt-3 p-2 rounded ${
                          craftMessage.type === 'success' ? 'bg-green-900/60 text-green-300 border border-green-500/30' : 
                          craftMessage.type === 'error' ? 'bg-red-900/60 text-red-300 border border-red-500/30' : 
                          'bg-blue-900/60 text-blue-300 border border-blue-500/30'
                        }`}>
                          <div className="flex items-center text-sm">
                            {craftMessage.type === 'success' && <Check className="h-4 w-4 mr-2" />}
                            {craftMessage.type === 'error' && <AlertTriangle className="h-4 w-4 mr-2" />}
                            <span>{craftMessage.text}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-amber-500/60">
                      <Hammer className="h-10 w-10 mx-auto mb-2 opacity-60" />
                      <p>Select a recipe or arrange<br />items in the crafting grid</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Inventory section */}
              <div className="bg-black/60 border border-amber-900/50 rounded-lg overflow-hidden flex flex-col h-1/2">
                <div className="px-3 py-2 bg-gradient-to-r from-amber-900/80 to-amber-800/50 border-b border-amber-700/50">
                  <h3 className="font-medium text-amber-200">Materials & Inventory</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {inventoryItems && Array.isArray(inventoryItems) && inventoryItems.map((item: any, index) => {
                      const itemDetails = getItemDetails(item.type);
                      
                      return (
                        <DraggableInventoryItem 
                          key={item.id} 
                          item={item} 
                          itemDetails={itemDetails}
                          index={index}
                        />
                      );
                    })}
                  </div>
                  
                  {(!inventoryItems || !Array.isArray(inventoryItems) || inventoryItems.length === 0) && (
                    <div className="text-center py-6 text-gray-400">
                      <p>Your inventory is empty</p>
                      <p className="text-xs mt-1">Gather materials from quests</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </CraftingContext.Provider>
    </DndProvider>
  );
};

export default CraftingWindow;