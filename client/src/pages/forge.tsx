import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventory } from '@/hooks/useInventory';
import { useCrafting } from '@/hooks/useCrafting';
import { Loader2 } from 'lucide-react';
import RecipeList from '@/components/crafting/RecipeList';
import CraftingGrid from '@/components/crafting/CraftingGrid';
import InventoryGrid from '@/components/crafting/InventoryGrid';
import forgeHeroPath from '@assets/forgehero.png';

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

const ForgePage = () => {
  const { inventory, loading: isLoadingInventory } = useInventory();
  const {
    recipes: rawRecipes = [],
    selectedRecipe: rawSelectedRecipe,
    isLoadingRecipes,
    selectRecipe,
    craftItem,
    isCrafting,
  } = useCrafting();
  
  // Cast the recipes to the correct type
  const recipes = rawRecipes as unknown as CraftingRecipe[];
  const selectedRecipe = rawSelectedRecipe as unknown as CraftingRecipe | null;
  const [activeTab, setActiveTab] = useState('crafting');

  // Convert inventory array to record format for easier lookup
  const inventoryRecord: Record<string, number> = {};
  if (Array.isArray(inventory)) {
    inventory.forEach((item: any) => {
      inventoryRecord[item.type] = item.quantity;
    });
  }

  const handleSelectRecipe = (recipe: any) => {
    selectRecipe(recipe.id);
  };

  const handleCraft = async (gridPattern: (string | null)[][], recipeId: number) => {
    await craftItem(gridPattern, recipeId);
  };

  const isLoading = isLoadingInventory || isLoadingRecipes;

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
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    <div className="lg:col-span-3">
                      <RecipeList
                        recipes={recipes}
                        selectedRecipe={selectedRecipe}
                        onSelectRecipe={handleSelectRecipe}
                        inventory={inventoryRecord}
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <div className="space-y-4">
                        <CraftingGrid
                          selectedRecipe={selectedRecipe}
                          inventory={inventoryRecord}
                          onCraft={handleCraft}
                          isCrafting={isCrafting}
                        />
                        <InventoryGrid
                          inventory={inventoryRecord}
                          selectedRecipeRequirements={selectedRecipe?.requiredItems}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schematics">
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Recipe Collection</h2>
                    <p className="mb-4">
                      The library of Gizbo's ancient recipes. Complete quests and adventures to unlock more powerful crafting schematics!
                    </p>
                    <Separator className="my-4" />
                    
                    {recipes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recipes.map((recipe) => (
                          <div
                            key={recipe.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                          >
                            <h3 className="font-bold">{recipe.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {recipe.description}
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              <span className="capitalize">{recipe.difficulty}</span> • Discovered {new Date(recipe.createdAt).toLocaleDateString()}
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