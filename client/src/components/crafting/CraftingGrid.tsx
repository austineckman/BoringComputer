import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import CraftingCell from './CraftingCell';
import { Button } from '@/components/ui/button';
import { Eraser, Sparkles } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Recipe } from '@/../../shared/types';
import { getItemDetails } from '@/lib/itemDatabase';

interface CellPos {
  row: number;
  col: number;
}

interface CraftingGridProps {
  grid: string[][];
  selectedRecipe: Recipe | null;
  highlightedCells: CellPos[];
  onDropItem: (row: number, col: number, itemId: string) => void;
  onRemoveItem: (row: number, col: number) => void;
  onResetGrid: () => void;
  canCraft?: boolean;
  onCraft?: () => void;
}

const CraftingGrid: React.FC<CraftingGridProps> = ({
  grid,
  selectedRecipe,
  highlightedCells,
  onDropItem,
  onRemoveItem,
  onResetGrid,
  canCraft = false,
  onCraft
}) => {
  const { sounds } = useSoundEffects();
  
  // Handle resetting the grid
  const handleReset = () => {
    onResetGrid();
    sounds.click();
  };
  
  // Handle crafting the item
  const handleCraft = () => {
    if (canCraft && onCraft) {
      onCraft();
      sounds.craftSuccess(); // Use craftSuccess sound effect
    }
  };
  
  // Check if a cell is highlighted
  const isHighlighted = (row: number, col: number): boolean => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };
  
  // Get result item details
  const resultItem = selectedRecipe?.resultItem ? getItemDetails(selectedRecipe.resultItem) : null;
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Crafting Grid</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            title="Clear grid"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Result item preview */}
        {selectedRecipe && resultItem && (
          <div className="mb-4 p-3 bg-secondary/20 rounded-lg flex items-center">
            <div className="w-16 h-16 rounded overflow-hidden bg-background flex-shrink-0 border">
              <img 
                src={resultItem.imagePath} 
                alt={resultItem.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="ml-3 flex-1">
              <h4 className="font-medium text-lg">{resultItem.name}</h4>
              <p className="text-sm text-muted-foreground">{resultItem.description}</p>
              <div className="text-xs mt-1">
                Craft {selectedRecipe.resultQuantity}x {resultItem.name}
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 mb-2">
          {grid.map((row, rowIndex) => (
            row.map((cellItem, colIndex) => (
              <CraftingCell
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                itemId={cellItem}
                onDropItem={onDropItem}
                onRemoveItem={onRemoveItem}
                highlighted={isHighlighted(rowIndex, colIndex)}
              />
            ))
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          {selectedRecipe 
            ? `Arrange items according to the ${selectedRecipe.name} pattern`
            : 'Select a recipe from below to see the pattern'}
        </div>
      </CardContent>
      
      {/* Craft Button */}
      {selectedRecipe && (
        <CardFooter>
          <Button 
            className={`w-full transition-all duration-300 ${canCraft ? 'shadow-lg shadow-primary/20 animate-pulse' : ''}`}
            size="lg"
            disabled={!canCraft}
            onClick={handleCraft}
            variant={canCraft ? "default" : "outline"}
          >
            <Sparkles className={`mr-2 h-4 w-4 ${canCraft ? 'text-yellow-300' : ''}`} />
            Craft Item
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CraftingGrid;