import React, { useState, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventory } from '@/hooks/useInventory';
import { useCrafting } from '@/hooks/useCrafting';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import RecipeList from '@/components/crafting/RecipeList';
import CraftingGrid from '@/components/crafting/CraftingGrid';
import InventoryGrid from '@/components/crafting/InventoryGrid';
import DndProvider from '@/components/crafting/DndProvider';
import { Recipe } from '../../shared/types';
import forgeHeroPath from '@assets/forgehero.png';

// Mock recipes until we get them from the API
const MOCK_RECIPES: Recipe[] = [
  {
    id: 1,
    name: "Basic Circuit",
    description: "A simple electronic circuit that can be used in various devices.",
    difficulty: "beginner",
    resultItem: "circuit-board",
    resultQuantity: 1,
    materials: {
      "copper": 2,
      "techscrap": 1
    },
    pattern: [
      [null, "copper", "copper", null, null],
      [null, "techscrap", null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null]
    ]
  },
  {
    id: 2,
    name: "Space Fabric",
    description: "A reinforced fabric with special properties.",
    difficulty: "beginner",
    resultItem: "cloth",
    resultQuantity: 3,
    materials: {
      "cloth": 2
    }
  },
  {
    id: 3,
    name: "Cosmic Ink Cartridge",
    description: "A cartridge filled with mysterious ink from the cosmos.",
    difficulty: "intermediate",
    resultItem: "ink",
    resultQuantity: 1,
    materials: {
      "crystal": 1,
      "techscrap": 2
    }
  }
];

const ForgePage = () => {
  const { inventory, loading: isLoadingInventory } = useInventory();
  const [activeTab, setActiveTab] = useState('crafting');
  
  // Convert inventory array to record format for easier lookup
  const inventoryRecord: Record<string, number> = {};
  if (Array.isArray(inventory)) {
    inventory.forEach((item: any) => {
      inventoryRecord[item.type] = item.quantity;
    });
  }
  
  // Add some items to the inventory for testing
  if (Object.keys(inventoryRecord).length === 0) {
    inventoryRecord["copper"] = 10;
    inventoryRecord["cloth"] = 5;
    inventoryRecord["crystal"] = 3;
    inventoryRecord["techscrap"] = 8;
    inventoryRecord["ink"] = 2;
    inventoryRecord["circuit-board"] = 1;
  }
  
  // Use our crafting hook
  const crafting = useCrafting({
    inventory: inventoryRecord,
    recipes: MOCK_RECIPES,
    onCraftSuccess: (recipeId, resultItem, quantity) => {
      console.log(`Crafted ${quantity}x ${resultItem} from recipe ${recipeId}`);
      // Here we would update the inventory
    }
  });
  
  const handleSelectRecipe = useCallback((recipeId: number) => {
    crafting.setSelectedRecipeId(recipeId);
  }, [crafting]);
  
  const isLoading = isLoadingInventory;

  return (
    <MainLayout>
      <Container>
        <div className="pt-6 pb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-amber-600">
              Gizbo's Forge
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-2">
              Craft valuable items using resources from your adventures. Gizbo the ogre offers mysterious recipes with powerful rewards!
            </p>
          </div>

          <div className="relative w-full h-64 mb-8 overflow-hidden rounded-lg bg-gray-800">
            <img
              src={forgeHeroPath}
              alt="Gizbo's Forge"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white text-xl font-bold">
              <span className="text-xs block text-amber-400">Welcome to</span>
              Gizbo's Crafting Station
            </div>
          </div>

          <Tabs defaultValue="crafting" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="crafting">Crafting Workshop</TabsTrigger>
              <TabsTrigger value="schematics">Recipe Collection</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading forge...</span>
              </div>
            ) : (
              <>
                <TabsContent value="crafting" className="space-y-6">
                  <DndProvider>
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                      <div className="lg:col-span-3">
                        <RecipeList
                          recipes={MOCK_RECIPES}
                          selectedRecipeId={crafting.selectedRecipeId}
                          onSelectRecipe={handleSelectRecipe}
                          inventory={inventoryRecord}
                        />
                      </div>
                      <div className="lg:col-span-4">
                        <div className="space-y-4">
                          <CraftingGrid
                            grid={crafting.grid}
                            patternToMatch={crafting.selectedRecipe?.pattern}
                            onDropItem={crafting.placeItemInGrid}
                            onRemoveItem={crafting.removeItemFromGrid}
                            canCraft={crafting.canCraft}
                            title="Crafting Grid"
                          />
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                              {crafting.selectedRecipe 
                                ? `Selected Recipe: ${crafting.selectedRecipe.name}` 
                                : 'No recipe selected'}
                            </div>
                            <Button 
                              onClick={crafting.craft}
                              disabled={!crafting.canCraft}
                              className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              Craft Item
                            </Button>
                          </div>
                          
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-2">Your Inventory</h3>
                            <div className="grid grid-cols-5 md:grid-cols-8 gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              {Object.entries(inventoryRecord).map(([itemId, quantity]) => (
                                <div 
                                  key={itemId} 
                                  className="flex flex-col items-center"
                                >
                                  <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-md flex items-center justify-center relative mb-1">
                                    <img 
                                      src={`/assets/${itemId}.png`} 
                                      alt={itemId}
                                      className="w-10 h-10 object-contain" 
                                    />
                                    <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-sm">
                                      {quantity}
                                    </span>
                                  </div>
                                  <span className="text-xs truncate w-full text-center">{itemId}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DndProvider>
                </TabsContent>

                <TabsContent value="schematics">
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Recipe Collection</h2>
                    <p className="mb-4">
                      The library of Gizbo's ancient recipes. Complete quests and adventures to unlock more powerful crafting schematics!
                    </p>
                    <Separator className="my-4" />
                    
                    {MOCK_RECIPES.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_RECIPES.map((recipe) => (
                          <div
                            key={recipe.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                          >
                            <h3 className="font-bold">{recipe.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {recipe.description}
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              <span className="capitalize">{recipe.difficulty}</span> • Gives {recipe.resultQuantity}x {recipe.resultItem}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No recipes discovered yet. Complete quests to unlock recipes!
                      </div>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </Container>
    </MainLayout>
  );
};

export default ForgePage;