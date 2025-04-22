import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import CraftingCell from './CraftingCell';
import { Recipe } from '@shared/types';
import { useSoundEffects } from '@/hooks/useSoundEffects';

// Type for cell coordinates
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
  
  // Reset the grid and play sound
  const handleReset = () => {
    onResetGrid();
    sounds.click();
  };
  
  // Check if a cell is highlighted
  const isCellHighlighted = (row: number, col: number): boolean => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };
  
  // Render a pattern overlay for the selected recipe
  const renderPatternOverlay = () => {
    if (!selectedRecipe || !selectedRecipe.pattern) {
      return null;
    }
    
    return (
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-2 pointer-events-none opacity-20">
        {selectedRecipe.pattern.map((row, rowIndex) =>
          row.map((item, colIndex) => (
            <CraftingCell
              key={`pattern-${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              itemId={item}
              onDropItem={onDropItem}
              onRemoveItem={onRemoveItem}
              pattern={true}
            />
          ))
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Crafting Grid</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!grid.some(row => row.some(cell => cell !== ''))}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Grid
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md bg-gray-50 dark:bg-gray-900 p-4">
          {/* Pattern overlay */}
          {renderPatternOverlay()}
          
          {/* Crafting grid */}
          <div className="grid grid-cols-5 grid-rows-5 gap-2 relative z-10">
            {grid.map((row, rowIndex) =>
              row.map((item, colIndex) => (
                <CraftingCell
                  key={`grid-${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  itemId={item}
                  onDropItem={onDropItem}
                  onRemoveItem={onRemoveItem}
                  highlighted={isCellHighlighted(rowIndex, colIndex)}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CraftingGrid;