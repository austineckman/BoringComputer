import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CraftingCell from './CraftingCell';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getItemDetails } from '@/lib/itemDatabase';
import { Badge } from '@/components/ui/badge';

interface CraftingGridProps {
  grid: (string | null)[][];
  patternGrid?: (string | null)[][];
  onUpdateGrid: (newGrid: (string | null)[][]) => void;
  resultItem?: string | null;
  resultQuantity?: number;
  canCraft?: boolean;
  onCraft?: () => void;
}

const CraftingGrid: React.FC<CraftingGridProps> = ({
  grid,
  patternGrid,
  onUpdateGrid,
  resultItem = null,
  resultQuantity = 0,
  canCraft = false,
  onCraft,
}) => {
  const { sounds } = useSoundEffects();
  
  // Number of rows/columns in the grid
  const gridSize = grid.length;
  
  // Handle dropping an item into a grid cell
  const handleDropItem = (row: number, col: number, itemId: string) => {
    const newGrid = [...grid.map(r => [...r])];
    newGrid[row][col] = itemId;
    onUpdateGrid(newGrid);
  };
  
  // Handle removing an item from a grid cell
  const handleRemoveItem = (row: number, col: number) => {
    const newGrid = [...grid.map(r => [...r])];
    newGrid[row][col] = null;
    onUpdateGrid(newGrid);
  };
  
  // Handle crafting by calling the provided onCraft callback
  const handleCraft = () => {
    if (!canCraft || !onCraft) return;
    sounds.craft();
    onCraft();
  };
  
  // Check if a cell should be highlighted (matches the pattern)
  const isCellHighlighted = (row: number, col: number): boolean => {
    if (!patternGrid) return false;
    return patternGrid[row][col] !== null && grid[row][col] === patternGrid[row][col];
  };
  
  // Get item details for the result item if we have one
  const resultItemDetails = resultItem ? getItemDetails(resultItem) : null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Gizbo's Forge</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {/* Crafting Grid */}
          <div>
            <h3 className="text-sm font-medium mb-3">Crafting Grid</h3>
            <div className="grid grid-cols-5 gap-1">
              {grid.map((row, rowIndex) => (
                row.map((cell, colIndex) => (
                  <CraftingCell
                    key={`grid-${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    itemId={cell}
                    onDropItem={handleDropItem}
                    onRemoveItem={handleRemoveItem}
                    highlighted={isCellHighlighted(rowIndex, colIndex)}
                  />
                ))
              ))}
            </div>
          </div>
          
          {/* Pattern Grid (if available) */}
          {patternGrid && (
            <div>
              <h3 className="text-sm font-medium mb-3">Recipe Pattern</h3>
              <div className="grid grid-cols-5 gap-1">
                {patternGrid.map((row, rowIndex) => (
                  row.map((cell, colIndex) => (
                    <CraftingCell
                      key={`pattern-${rowIndex}-${colIndex}`}
                      row={rowIndex}
                      col={colIndex}
                      itemId={cell}
                      onDropItem={() => {}} // No-op for pattern grid
                      onRemoveItem={() => {}} // No-op for pattern grid
                      pattern={true}
                    />
                  ))
                ))}
              </div>
            </div>
          )}
          
          {/* Result Section */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Result</h3>
              <Badge 
                variant={canCraft ? "secondary" : "outline"} 
                className={canCraft ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "text-gray-500"}
              >
                {canCraft ? "Ready to Craft" : "Missing Items"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Result Item Display */}
              <div className="w-20 h-20 border-2 border-amber-300 dark:border-amber-700 rounded-md p-2 bg-amber-50 dark:bg-amber-900/20">
                {resultItem ? (
                  <div className="relative w-full h-full">
                    <img
                      src={resultItemDetails?.imagePath || `/items/${resultItem}.png`}
                      alt={resultItemDetails?.name || resultItem}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-item.png';
                      }}
                    />
                    {resultQuantity > 1 && (
                      <div className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl-md">
                        x{resultQuantity}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    ?
                  </div>
                )}
              </div>
              
              {/* Result Details */}
              <div className="flex-1">
                {resultItem ? (
                  <>
                    <h4 className="font-medium">{resultItemDetails?.name || resultItem}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {resultItemDetails?.description || "No description available"}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a recipe or create a valid pattern to see result
                  </p>
                )}
              </div>
            </div>
            
            {/* Craft Button */}
            <button
              className={`
                w-full mt-4 py-2 rounded-md font-medium transition-colors
                ${canCraft 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
              `}
              onClick={handleCraft}
              disabled={!canCraft}
            >
              Craft Item
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CraftingGrid;