import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, AlertCircle } from 'lucide-react';
import CraftingGrid from '@/components/crafting/CraftingGrid';
import InventoryGrid from '@/components/crafting/InventoryGrid';
import RecipeList from '@/components/crafting/RecipeList';
import DndProvider from '@/components/crafting/DndProvider';
import { useCrafting } from '@/hooks/useCrafting';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import forgeHeroBg from '@assets/forgehero.png';
import { Recipe, RecipeReward } from '@/../../shared/types';
import { useSoundEffects } from '@/hooks/useSoundEffects';

// Sample mock recipes until API is ready
const mockRecipes: Recipe[] = [
  {
    id: 'simple-circuit',
    name: 'Simple Circuit',
    description: 'A basic electronic circuit that can power small devices.',
    unlocked: true,
    unlockedAt: 1,
    difficulty: 'beginner',
    materials: {
      'copper': 2,
      'techscrap': 1
    },
    pattern: [
      ['', '', '', '', ''],
      ['', 'copper', 'copper', '', ''],
      ['', '', 'techscrap', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']
    ],
    rewards: [
      { 
        itemId: 'circuit-board',
        quantity: 1,
        type: 'item'
      },
      {
        itemId: 'xp',
        quantity: 25,
        type: 'xp'
      }
    ]
  },
  {
    id: 'reinforced-fabric',
    name: 'Reinforced Fabric',
    description: 'A stronger fabric material woven with special techniques.',
    unlocked: true,
    unlockedAt: 2,
    difficulty: 'intermediate',
    materials: {
      'cloth': 3,
      'crystal': 1
    },
    pattern: [
      ['', '', '', '', ''],
      ['', 'cloth', 'cloth', '', ''],
      ['', 'cloth', 'crystal', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']
    ],
    rewards: [
      { 
        itemId: 'reinforced-fabric',
        quantity: 1,
        type: 'item'
      },
      {
        itemId: 'xp',
        quantity: 40,
        type: 'xp'
      }
    ]
  },
  {
    id: 'advanced-power-core',
    name: 'Advanced Power Core',
    description: 'A high-energy power core that can run advanced machinery.',
    unlocked: true,
    unlockedAt: 5,
    difficulty: 'advanced',
    materials: {
      'copper': 4,
      'crystal': 2,
      'techscrap': 3
    },
    pattern: [
      ['', '', '', '', ''],
      ['', 'techscrap', 'copper', 'techscrap', ''],
      ['', 'copper', 'crystal', 'copper', ''],
      ['', 'techscrap', 'crystal', 'techscrap', ''],
      ['', '', '', '', '']
    ],
    rewards: [
      { 
        itemId: 'power-core',
        quantity: 1,
        type: 'item'
      },
      {
        itemId: 'xp',
        quantity: 75,
        type: 'xp'
      }
    ]
  }
];

const ForgePage: React.FC = () => {
  const { sounds } = useSoundEffects();
  const [showResults, setShowResults] = useState(false);
  
  // Use the crafting hook
  const {
    grid,
    recipes = mockRecipes, // Use mock recipes until API is available
    inventory,
    selectedRecipe,
    highlightedCells,
    canCraft,
    isLoading,
    onDropItem,
    onRemoveItem,
    onResetGrid,
    onSelectRecipe,
    onCraft
  } = useCrafting();
  
  // Handle craft button click
  const handleCraft = () => {
    if (canCraft) {
      onCraft();
      setShowResults(true);
      sounds.craftComplete();
    }
  };
  
  // Close the results dialog
  const closeResults = () => {
    setShowResults(false);
  };
  
  return (
    <>
      <div 
        className="bg-cover bg-center h-64 flex items-center justify-center mb-8"
        style={{ backgroundImage: `url(${forgeHeroBg})` }}
      >
        <div className="text-center p-6 bg-black/50 rounded-lg backdrop-blur-sm">
          <h1 className="text-4xl font-bold text-white mb-2">Gizbo's Forge</h1>
          <p className="text-xl text-white">Transform your resources into powerful tools and artifacts</p>
        </div>
      </div>
      
      <Container>
        {/* Introduction alert */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Welcome to Gizbo's Forge!</AlertTitle>
          <AlertDescription>
            Select a recipe from the list, then drag items from your inventory to the crafting grid
            to match the pattern. When the pattern matches, click the Craft button to create new items!
          </AlertDescription>
        </Alert>
        
        {/* Crafting interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DndProvider>
            <div className="lg:col-span-2 space-y-6">
              {/* Crafting grid */}
              <CraftingGrid 
                grid={grid} 
                onDropItem={onDropItem} 
                onRemoveItem={onRemoveItem} 
                onResetGrid={onResetGrid}
                highlightedCells={highlightedCells}
                selectedRecipe={selectedRecipe}
              />
              
              {/* Inventory */}
              <InventoryGrid
                inventory={inventory as Record<string, number>}
                selectedRecipe={selectedRecipe}
              />
            </div>
          </DndProvider>
          
          {/* Recipe list */}
          <div>
            <RecipeList
              recipes={recipes}
              selectedRecipe={selectedRecipe}
              onSelectRecipe={onSelectRecipe}
              isLoading={isLoading}
              inventory={inventory as Record<string, number>}
              canCraft={canCraft}
              onCraft={handleCraft}
            />
          </div>
        </div>
        
        {/* Crafting results dialog */}
        <Dialog open={showResults} onOpenChange={closeResults}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                Crafting Complete!
              </DialogTitle>
            </DialogHeader>
            
            {selectedRecipe && (
              <div className="space-y-4">
                <p>You successfully crafted a <strong>{selectedRecipe.name}</strong>!</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Rewards:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.rewards.map((reward: RecipeReward, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="flex items-center gap-1 p-2"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        {reward.itemId} x{reward.quantity}
                        {reward.type === 'xp' && <span className="text-green-500">XP</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={closeResults}>Continue Crafting</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default ForgePage;