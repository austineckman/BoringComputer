import React from 'react';
import { cn } from '@/lib/utils';

interface GridCellProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  highlighted?: boolean;
  isPlaceholder?: boolean;
}

const GridCell: React.FC<GridCellProps> = ({
  className,
  children,
  onClick,
  active = false,
  highlighted = false,
  isPlaceholder = false
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'aspect-square border border-border rounded-md flex items-center justify-center relative',
        'transition-all duration-200 ease-in-out',
        {
          'cursor-pointer hover:bg-accent/50': onClick,
          'bg-accent': active,
          'ring-2 ring-primary': highlighted,
          'bg-muted/50': isPlaceholder
        },
        className
      )}
    >
      {children}
    </div>
  );
};

export const Grid5x5: React.FC<{
  className?: string;
  value: (string | null)[][];
  onChange?: (value: (string | null)[][]) => void;
  itemRenderer?: (cellValue: string | null, row: number, col: number) => React.ReactNode;
  cellClassName?: (row: number, col: number) => string | undefined;
  onCellClick?: (row: number, col: number) => void;
  readOnly?: boolean;
}> = ({
  className,
  value,
  onChange,
  itemRenderer,
  cellClassName,
  onCellClick,
  readOnly = false
}) => {
  // Ensure value is a 5x5 grid
  const gridValue = React.useMemo(() => {
    const grid: (string | null)[][] = [];
    for (let i = 0; i < 5; i++) {
      grid[i] = [];
      for (let j = 0; j < 5; j++) {
        grid[i][j] = value?.[i]?.[j] || null;
      }
    }
    return grid;
  }, [value]);

  const handleCellClick = (row: number, col: number) => {
    if (readOnly) return;
    
    if (onCellClick) {
      onCellClick(row, col);
      return;
    }
    
    if (onChange) {
      const newGrid = gridValue.map(row => [...row]);
      // Toggle between null and some marker
      newGrid[row][col] = newGrid[row][col] ? null : 'X';
      onChange(newGrid);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-5 gap-1">
        {gridValue.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => (
              <GridCell
                key={`cell-${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                active={!!cell}
                className={cellClassName?.(rowIndex, colIndex)}
              >
                {itemRenderer 
                  ? itemRenderer(cell, rowIndex, colIndex)
                  : cell && (
                    <div className="w-full h-full flex items-center justify-center">
                      {cell}
                    </div>
                  )
                }
              </GridCell>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// GridCell is also exported for more flexibility
export { GridCell };