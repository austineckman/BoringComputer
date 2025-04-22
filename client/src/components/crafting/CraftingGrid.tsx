import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CraftingCell from './CraftingCell';
import { GRID_SIZE, CraftingGridPattern } from '@/hooks/useCrafting';

interface CraftingGridProps {
  grid: CraftingGridPattern;
  patternToMatch?: CraftingGridPattern;
  onDropItem: (row: number, col: number, itemId: string) => void;
  onRemoveItem: (row: number, col: number) => void;
  title?: string;
  canCraft?: boolean;
}

const CraftingGrid: React.FC<CraftingGridProps> = ({
  grid,
  patternToMatch,
  onDropItem,
  onRemoveItem,
  title = 'Crafting Grid',
  canCraft = false
}) => {
  // Helper function to determine if a cell should be highlighted
  const shouldHighlightCell = (row: number, col: number): boolean => {
    if (!patternToMatch) return false;
    
    // Highlight if this cell has an item in the pattern
    return !!patternToMatch[row][col] && grid[row][col] === patternToMatch[row][col];
  };
  
  return (
    <Card className={`h-full transition-colors ${canCraft ? 'shadow-md shadow-green-200 dark:shadow-green-900/30' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center justify-between">
          {title}
          {canCraft && (
            <span className="text-sm font-normal text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
              Ready to craft!
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-5 gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {grid.flatMap((row, rowIndex) => 
              row.map((cellItem, colIndex) => (
                <CraftingCell
                  key={`cell-${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  itemId={cellItem}
                  onDropItem={onDropItem}
                  onRemoveItem={onRemoveItem}
                  highlighted={shouldHighlightCell(rowIndex, colIndex)}
                  pattern={false}
                />
              ))
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {patternToMatch ? (
              <span>Follow the pattern to create this item</span>
            ) : (
              <span>Drag items from your inventory to craft</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CraftingGrid;