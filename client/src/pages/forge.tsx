import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CraftingGrid from '@/components/crafting/CraftingGrid';
import RecipeList from '@/components/crafting/RecipeList';
import InventoryGrid from '@/components/crafting/InventoryGrid';
import DndProvider from '@/components/crafting/DndProvider';
import useCrafting from '@/hooks/useCrafting';
import { Recipe } from '@/../../shared/types';

// Import forge hero image
import forgeHeroImage from '@assets/forgehero.png';

// Mock recipes data
const mockRecipes: Recipe[] = [
  {
    id: 'basic-circuit',
    name: 'Basic Circuit',
    description: 'A simple circuit board for basic electronics.',
    difficulty: 'beginner',
    unlockedAt: 1,
    imageUrl: '/images/items/circuit-board.png',
    pattern: [
      ['', '', '', '', ''],
      ['', 'copper', 'copper', 'copper', ''],
      ['', 'copper', 'crystal', 'copper', ''],
      ['', 'copper', 'copper', 'copper', ''],
      ['', '', '', '', '']
    ],
    materials: {
      'copper': 7,
      'crystal': 1
    },
    rewards: [
      {
        itemId: 'circuit-board',
        quantity: 1,
        type: 'digital',
        description: 'A basic circuit board'
      }
    ]
  },
  {
    id: 'radio-transmitter',
    name: 'Radio Transmitter',
    description: 'Used for long-range communication.',
    difficulty: 'intermediate',
    unlockedAt: 5,
    imageUrl: '/images/items/techscrap.png',
    pattern: [
      ['', '', 'crystal', '', ''],
      ['', 'copper', 'copper', 'copper', ''],
      ['crystal', 'copper', 'circuit-board', 'copper', 'crystal'],
      ['', 'copper', 'copper', 'copper', ''],
      ['', '', 'crystal', '', '']
    ],
    materials: {
      'copper': 8,
      'crystal': 4,
      'circuit-board': 1
    },
    rewards: [
      {
        itemId: 'radio-transmitter',
        quantity: 1,
        type: 'digital',
        description: 'A radio transmitter for long-range communication'
      }
    ]
  }
];

const ForgePage: React.FC = () => {
  const { sounds } = useSoundEffects();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('crafting');

  // Fetch inventory data
  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['/api/inventory'],
    keepPreviousData: true
  });

  // Convert inventory array to record for easier access
  const inventory = React.useMemo(() => {
    if (!inventoryData) return {};
    
    return inventoryData.reduce((acc: Record<string, number>, item: any) => {
      acc[item.type] = item.quantity;
      return acc;
    }, {});
  }, [inventoryData]);

  // Set up crafting system with the useCrafting hook
  const {
    grid,
    selectedRecipe,
    canCraft,
    isCrafting,
    onDropItem,
    onRemoveItem,
    onSelectRecipe,
    onCraft
  } = useCrafting(mockRecipes, inventory);

  // Play sound when changing tabs
  const handleTabChange = (value: string) => {
    sounds.click();
    setActiveTab(value);
  };

  return (
    <MainLayout>
      <div className="container max-w-7xl py-6">
        <header className="mb-8">
          <div className="relative w-full h-[200px] mb-6 rounded-lg overflow-hidden">
            <img
              src={forgeHeroImage}
              alt="Gizbo's Forge"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-end p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                Gizbo's Forge
              </h1>
              <p className="text-sm md:text-base text-gray-200 max-w-md mt-2">
                Welcome to Gizbo's workshop! Drag and drop resources from your inventory
                to craft new items and unlock powerful equipment.
              </p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="crafting" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="crafting">Crafting Workshop</TabsTrigger>
            <TabsTrigger value="crafted">Crafted Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crafting" className="mt-6">
            {isLoadingInventory ? (
              <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <DndProvider>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CraftingGrid
                        grid={grid}
                        onDropItem={onDropItem}
                        onRemoveItem={onRemoveItem}
                        title="Crafting Table"
                        patternToMatch={selectedRecipe?.pattern}
                        canCraft={canCraft}
                      />
                      <InventoryGrid
                        inventory={inventory}
                        selectedRecipe={selectedRecipe}
                      />
                    </div>
                    
                    {selectedRecipe && (
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium mb-2">Recipe: {selectedRecipe.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedRecipe.description}</p>
                        
                        <div className="flex justify-end">
                          <Button
                            onClick={onCraft}
                            disabled={!canCraft || isCrafting}
                            className="px-4"
                          >
                            {isCrafting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Crafting...
                              </>
                            ) : (
                              'Craft Item'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <RecipeList
                      recipes={mockRecipes}
                      selectedRecipe={selectedRecipe}
                      onSelectRecipe={onSelectRecipe}
                      inventory={inventory}
                      canCraft={canCraft}
                      onCraft={onCraft}
                    />
                  </div>
                </div>
              </DndProvider>
            )}
          </TabsContent>
          
          <TabsContent value="crafted" className="mt-6">
            <div className="rounded-lg border p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">Your Crafted Items</h2>
              <Separator className="mb-4" />
              
              <div className="py-8 text-center text-muted-foreground">
                <p>You haven't crafted any items yet.</p>
                <p className="mt-2">Head over to the Crafting Workshop to get started!</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('crafting')}
                >
                  Go to Workshop
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ForgePage;