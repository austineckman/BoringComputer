import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CraftingCell from './CraftingCell';
import { CraftingGridPattern } from '@/../../shared/types';

interface CraftingGridProps {
  grid: CraftingGridPattern;
  onDropItem: (row: number, col: number, itemId: string) => void;
  onRemoveItem: (row: number, col: number) => void;
  title?: string;
  patternToMatch?: CraftingGridPattern | null;
  canCraft?: boolean;
}

const CraftingGrid: React.FC<CraftingGridProps> = ({
  grid,
  onDropItem,
  onRemoveItem,
  title = 'Crafting Grid',
  patternToMatch = null,
  canCraft = false,
}) => {
  // Determine if a cell should be highlighted based on the pattern to match
  const shouldHighlightCell = (row: number, col: number): boolean => {
    if (!patternToMatch || !canCraft) return false;
    
    // Only highlight if there's a pattern and it matches
    return Boolean(patternToMatch[row][col]);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          {title}
        </CardTitle>
        <CardDescription>
          {patternToMatch 
            ? 'Arrange your items to match the recipe pattern' 
            : 'Drag resources here to create an item'}
        </CardDescription>
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