import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CraftingCell from './CraftingCell';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Recipe } from '@/../../shared/types';

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
}

const CraftingGrid: React.FC<CraftingGridProps> = ({
  grid,
  selectedRecipe,
  highlightedCells,
  onDropItem,
  onRemoveItem,
  onResetGrid
}) => {
  const { sounds } = useSoundEffects();
  
  // Handle resetting the grid
  const handleReset = () => {
    onResetGrid();
    sounds.click();
  };
  
  // Check if a cell is highlighted
  const isHighlighted = (row: number, col: number): boolean => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };
  
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
        <div className="grid grid-cols-5 gap-2 mb-2">
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
    </Card>
  );
};

export default CraftingGrid;