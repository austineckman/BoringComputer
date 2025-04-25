import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { ItemDetails } from "@/types";

// Define interfaces locally since we're having import issues
interface InventoryItem {
  id: string;
  type: string;
  quantity: number;
  name?: string;
  rarity?: string;
  imagePath?: string;
}

interface InventoryWindowProps {
  openItemDetails: (itemId: string, quantity: number) => void;
}

const InventoryWindow: React.FC<InventoryWindowProps> = ({ openItemDetails }) => {
  // Fetch inventory items
  const { 
    data: inventoryItems, 
    isLoading: inventoryLoading 
  } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    queryFn: getQueryFn(),
  });

  // Fetch all item details
  const { 
    data: allItems, 
    isLoading: itemsLoading 
  } = useQuery<ItemDetails[]>({
    queryKey: ["/api/items"],
    queryFn: getQueryFn(),
  });

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = (itemId: string, quantity: number) => {
    openItemDetails(itemId, quantity);
  };

  if (inventoryLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Helper function to get the rarity color
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-300',
      uncommon: 'bg-green-300',
      rare: 'bg-blue-300',
      epic: 'bg-purple-300',
      legendary: 'bg-yellow-300',
    };
    return colors[rarity] || 'bg-gray-300';
  };

  // Helper function to find the item details for a given item ID
  const getItemDetails = (itemId: string) => {
    if (!allItems) return null;
    return allItems.find((item) => item.id === itemId);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-3">Inventory</h2>
      <div className="relative">
        <div className="grid grid-cols-8 gap-2">
          {inventoryItems && inventoryItems.map((item) => {
            const itemDetails = getItemDetails(item.type);
            return (
              <div 
                key={item.id} 
                className={`
                  relative w-12 h-12 border border-gray-400 ${
                    itemDetails?.rarity ? getRarityColor(itemDetails.rarity) : 'bg-gray-100'
                  } rounded cursor-pointer hover:shadow-md transition-shadow
                `}
                onClick={() => handleItemClick(item.type, item.quantity)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {itemDetails?.imagePath && (
                  <img 
                    src={itemDetails.imagePath} 
                    alt={itemDetails.name || 'Item'} 
                    className="w-full h-full object-contain p-1 pixelated-image" 
                  />
                )}
                <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs px-1 rounded-sm">
                  {item.quantity}
                </div>
                
                {/* Tooltip */}
                {hoveredItem === item.id && (
                  <div className="absolute z-10 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -mt-10 -ml-10 w-32 left-0 -top-0 transform -translate-y-full">
                    <p className="font-bold">{itemDetails?.name || item.type}</p>
                    <p className="text-[10px] italic truncate">
                      {itemDetails?.rarity ? `${itemDetails.rarity.charAt(0).toUpperCase()}${itemDetails.rarity.slice(1)}` : 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InventoryWindow;