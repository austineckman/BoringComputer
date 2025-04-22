import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import InventoryItem from './InventoryItem';

interface InventoryItem {
  type: string;
  quantity: number;
}

interface InventoryGridProps {
  items: InventoryItem[];
  onItemUse?: (itemId: string) => void;
  title?: string;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  onItemUse,
  title = 'Inventory'
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-4 gap-2">
            {items.map((item, index) => (
              <InventoryItem
                key={`${item.type}-${index}`}
                itemId={item.type}
                quantity={item.quantity}
                onUse={onItemUse}
              />
            ))}
            
            {items.length === 0 && (
              <div className="col-span-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No items in inventory
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;