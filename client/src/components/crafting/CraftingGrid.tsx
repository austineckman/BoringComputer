import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import CraftingCell from './CraftingCell';
import { Recipe } from '@/../../shared/types';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface CraftingGridProps {
  grid: string[][];
  onDropItem: (row: number, col: number, itemId: string) => void;
  onRemoveItem: (row: number, col: number) => void;
  onResetGrid: () => void;
  highlightedCells: { row: number, col: number }[];
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
  const { sounds } = useSoundEffects();
  
  // Generate a 2D array of pattern cells to display if a recipe is selected
  const patternCells = selectedRecipe 
    ? selectedRecipe.pattern.map((row, rowIndex) => 
        row.map((cell, colIndex) => ({
          itemId: cell || '',
          row: rowIndex,
          col: colIndex
        }))
      )
    : [];
  
  // Check if a cell should be highlighted based on the highlightedCells array
  const isHighlighted = (row: number, col: number): boolean => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };
  
  // Handle reset button click
  const handleReset = () => {
    sounds.click();
    onResetGrid();
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Crafting Grid</CardTitle>
            <CardDescription>
              {selectedRecipe 
                ? `Crafting ${selectedRecipe.name}`
                : 'Select a recipe and arrange items'}
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!grid.some(row => row.some(cell => cell))}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main crafting grid */}
          <div className="grid grid-cols-5 gap-1 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
            {grid.map((row, rowIndex) => (
              <React.Fragment key={`row-${rowIndex}`}>
                {row.map((cell, colIndex) => (
                  <CraftingCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    itemId={cell}
                    onDropItem={onDropItem}
                    onRemoveItem={onRemoveItem}
                    highlighted={isHighlighted(rowIndex, colIndex)}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
          
          {/* Pattern display for the selected recipe */}
          {selectedRecipe && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Pattern:</h3>
              <div className="grid grid-cols-5 gap-1 bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-dashed">
                {patternCells.map((row, rowIndex) => (
                  <React.Fragment key={`pattern-row-${rowIndex}`}>
                    {row.map((cell, colIndex) => (
                      <CraftingCell
                        key={`pattern-cell-${rowIndex}-${colIndex}`}
                        row={rowIndex}
                        col={colIndex}
                        itemId={cell.itemId}
                        onDropItem={() => {}}
                        onRemoveItem={() => {}}
                        pattern={true}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CraftingGrid;