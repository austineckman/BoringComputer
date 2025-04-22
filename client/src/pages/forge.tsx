import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';
import CraftingGrid from '@/components/crafting/CraftingGrid';
import InventoryGrid from '@/components/crafting/InventoryGrid';
import RecipeList from '@/components/crafting/RecipeList';
import DndProvider from '@/components/crafting/DndProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, Sparkles } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useToast } from '@/hooks/use-toast';
import { useCrafting } from '@/hooks/useCrafting';
import { Recipe } from '@/../../shared/types';
import forgeHeroImage from '@assets/forgehero.png';

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'basic-circuit',
    name: 'Basic Circuit',
    description: 'A simple electronic circuit board, the foundation of many devices.',
    difficulty: 'beginner',
    pattern: [
      ['copper', 'copper', 'copper'],
      ['copper', 'circuit-board', 'copper'],
      ['copper', 'copper', 'copper']
    ],
    materials: {
      'copper': 8,
      'circuit-board': 1
    },
    rewards: [
      {
        itemId: 'basic-circuit',
        quantity: 1,
        type: 'digital',
        description: 'Can be used in more advanced recipes'
      }
    ],
    unlockedAt: 1,
    imageUrl: '/images/recipes/basic-circuit.png'
  },
  {
    id: 'insulated-wire',
    name: 'Insulated Wire',
    description: 'Copper wire wrapped in cloth for insulation.',
    difficulty: 'beginner',
    pattern: [
      ['cloth', 'cloth', 'cloth'],
      ['copper', 'copper', 'copper'],
      ['cloth', 'cloth', 'cloth']
    ],
    materials: {
      'copper': 3,
      'cloth': 6
    },
    rewards: [
      {
        itemId: 'insulated-wire',
        quantity: 3,
        type: 'digital',
        description: 'Used in electrical connections'
      }
    ],
    unlockedAt: 1,
    imageUrl: '/images/recipes/insulated-wire.png'
  },
  {
    id: 'power-crystal',
    name: 'Power Crystal',
    description: 'A crystal infused with energy, capable of powering advanced devices.',
    difficulty: 'intermediate',
    pattern: [
      ['copper', 'crystal', 'copper'],
      ['crystal', 'crystal', 'crystal'],
      ['copper', 'crystal', 'copper']
    ],
    materials: {
      'copper': 4,
      'crystal': 5
    },
    rewards: [
      {
        itemId: 'power-crystal',
        quantity: 1,
        type: 'digital',
        description: 'Powers energy-intensive recipes'
      }
    ],
    unlockedAt: 5,
    imageUrl: '/images/recipes/power-crystal.png'
  }
];

const ForgePage: React.FC = () => {
  const { sounds } = useSoundEffects();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch inventory
  const { data: inventory = {} } = useQuery({
    queryKey: ['/api/inventory'],
    staleTime: 10000
  });
  
  // Setup crafting hook with inventory and recipes
  const {
    grid,
    selectedRecipe,
    selectRecipe,
    addItemToGrid,
    removeItemFromGrid,
    resetGrid,
    highlightedCells,
    canCraft,
    craft,
    craftedResults,
    clearCraftedResults
  } = useCrafting(
    inventory, 
    SAMPLE_RECIPES,
    (recipe, usedItems) => {
      // When crafting completes, remove used items from inventory
      updateInventoryMutation.mutate({ 
        action: 'craft',
        recipe: recipe.id,
        usedItems
      });
    }
  );
  
  // Mutation to update inventory
  const updateInventoryMutation = useMutation({
    mutationFn: async (data: {
      action: string,
      recipe: string,
      usedItems: Record<string, number>
    }) => {
      const res = await apiRequest('POST', '/api/crafting/craft', data);
      return await res.json();
    },
    onSuccess: () => {
      // Play completion sound
      sounds.craftComplete();
      
      // Invalidate inventory query to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      // Show completion toast if not shown already
      if (craftedResults) {
        toast({
          title: "Item Crafted!",
          description: `You have crafted ${craftedResults.recipe.name}`,
          variant: "default",
        });
      }
      
      // Reset crafting state
      clearCraftedResults();
    },
    onError: (error) => {
      toast({
        title: "Crafting Failed",
        description: error.message || "An error occurred during crafting",
        variant: "destructive",
      });
    }
  });

  return (
    <MainLayout>
      <div className="container max-w-7xl py-6 space-y-8">
        <div className="relative w-full h-64 overflow-hidden rounded-lg mb-8">
          <img 
            src={forgeHeroImage}
            alt="Gizbo's Forge" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center">
            <div className="px-8 text-white">
              <h1 className="text-4xl font-bold mb-2">Gizbo's Forge</h1>
              <p className="text-lg max-w-lg">
                Welcome to Gizbo's Forge, where raw materials become valuable resources! 
                Drag items into the crafting grid to match recipes and create new items.
              </p>
            </div>
          </div>
        </div>
        
        {craftedResults && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-400">
              Crafting Success!
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              <div className="flex items-center gap-2 mt-1">
                <span>You have crafted:</span>
                <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-700">
                  <CircleCheck className="mr-1 h-3 w-3" />
                  {craftedResults.recipe.name}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <DndProvider>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InventoryGrid
              inventory={inventory}
              selectedRecipe={selectedRecipe}
            />
            
            <CraftingGrid
              grid={grid}
              onDropItem={addItemToGrid}
              onRemoveItem={removeItemFromGrid}
              onResetGrid={resetGrid}
              highlightedCells={highlightedCells}
              selectedRecipe={selectedRecipe}
            />
            
            <RecipeList
              recipes={SAMPLE_RECIPES}
              selectedRecipe={selectedRecipe}
              onSelectRecipe={selectRecipe}
              inventory={inventory}
              canCraft={canCraft}
              onCraft={craft}
            />
          </div>
        </DndProvider>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Gizbo's Forge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                Gizbo is a wide-bellied, oil-stained ogre with a monocle who runs this forge. 
                He's known throughout the realms for his ability to transform simple materials 
                into extraordinary creations.
              </p>
              <p>
                As you progress through your quests, you'll unlock more advanced recipes. 
                Some crafted items will give you digital rewards, while others can be 
                redeemed for physical items that will be shipped to you!
              </p>
              <p>
                <strong>Tip:</strong> Pay close attention to the pattern required for each recipe. 
                The arrangement of materials matters just as much as having the right quantities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ForgePage;