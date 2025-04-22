import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CraftingCell from './CraftingCell';
import { Recipe } from '@/../../shared/types';

interface CraftingGridProps {
  grid: string[][];
  onDropItem: (row: number, col: number, itemId: string) => void;
  onRemoveItem: (row: number, col: number) => void;
  onResetGrid: () => void;
  highlightedCells: [number, number][];
  selectedRecipe: Recipe | null;
}

const CraftingGrid: React.FC<CraftingGridProps> = ({
  grid,
  onDropItem,
  onRemoveItem,
  onResetGrid,
  highlightedCells,
  selectedRecipe
}) => {
  // Check if a cell is highlighted for pattern matching
  const isCellHighlighted = (row: number, col: number): boolean => {
    return highlightedCells.some(([r, c]) => r === row && c === col);
  };
  
  // Create a 5x5 grid of crafting cells
  const renderGrid = () => {
    const rows = [];
    
    for (let row = 0; row < 5; row++) {
      const cells = [];
      
      for (let col = 0; col < 5; col++) {
        cells.push(
          <CraftingCell
            key={`${row}-${col}`}
            row={row}
            col={col}
            itemId={grid[row][col]}
            onDropItem={onDropItem}
            onRemoveItem={onRemoveItem}
            highlighted={isCellHighlighted(row, col)}
          />
        );
      }
      
      rows.push(
        <div key={row} className="flex gap-1">
          {cells}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-1">
        {rows}
      </div>
    );
  };
  
  // If a recipe is selected, also show the pattern for reference
  const renderPatternReference = () => {
    if (!selectedRecipe) return null;
    
    const pattern = selectedRecipe.pattern;
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;
    
    const rows = [];
    
    for (let row = 0; row < patternHeight; row++) {
      const cells = [];
      
      for (let col = 0; col < patternWidth; col++) {
        cells.push(
          <CraftingCell
            key={`pattern-${row}-${col}`}
            row={row}
            col={col}
            itemId={pattern[row][col]}
            onDropItem={() => {}} // No-op for pattern reference
            onRemoveItem={() => {}} // No-op for pattern reference
            pattern={true}
          />
        );
      }
      
      rows.push(
        <div key={`pattern-row-${row}`} className="flex gap-1">
          {cells}
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Recipe Pattern:</h3>
        <div className="flex flex-col gap-1">
          {rows}
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          Crafting Grid
        </CardTitle>
        <CardDescription>
          Drag items from your inventory to this grid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          {renderGrid()}
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={onResetGrid}
              size="sm"
            >
              Clear Grid
            </Button>
          </div>
          
          {renderPatternReference()}
        </div>
      </CardContent>
    </Card>
  );
};

export default CraftingGrid;