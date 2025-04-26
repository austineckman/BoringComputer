import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2, PackageOpen, ShoppingBag } from "lucide-react";
import { ItemDetails } from "@/types";
import bagBackground from "@assets/bagbkg.png";

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
  } = useQuery({
    queryKey: ["/api/inventory"],
    queryFn: getQueryFn({ on401: "throw" }) as any,
  });

  // Fetch all item details
  const { 
    data: allItems, 
    isLoading: itemsLoading 
  } = useQuery({
    queryKey: ["/api/items"],
    queryFn: getQueryFn({ on401: "throw" }) as any,
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

  // Helper function to find the item details for a given item ID
  const getItemDetails = (itemId: string) => {
    if (!allItems) return null;
    return (allItems as ItemDetails[]).find((item) => item.id === itemId);
  };

  // Group items into bags with 16 slots each (4x4)
  const itemsPerBag = 16;
  const itemsArray = Array.isArray(inventoryItems) ? inventoryItems : [];
  const bags = Math.ceil(itemsArray.length / itemsPerBag) || 1;
  const bagArray = Array.from({ length: bags }, (_, i) => i);

  // WoW-style rarity classes combining border and glow effects
  const getRarityClasses = (rarity: string) => {
    const classes: Record<string, string> = {
      common: 'border-gray-400',
      uncommon: 'border-green-500 shadow-[0_0_5px_0_rgba(30,255,0,0.3)]',
      rare: 'border-blue-500 shadow-[0_0_5px_0_rgba(0,112,221,0.4)]',
      epic: 'border-purple-500 shadow-[0_0_8px_0_rgba(163,53,238,0.5)]',
      legendary: 'border-yellow-500 shadow-[0_0_10px_0_rgba(255,215,0,0.6)]',
    };
    return classes[rarity] || 'border-gray-400';
  };

  // WoW-style rarity text colors
  const getRarityTextColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#A335EE';
      case 'rare': return '#0070DD';
      case 'uncommon': return '#1EFF00';
      default: return '#FFFFFF';
    }
  };

  // Render a single bag
  const renderBag = (bagIndex: number) => {
    // Determine bag type based on index (just for visual variety)
    const bagTypes = ['Main Bag', 'Adventure Pouch', 'Material Satchel', 'Rare Finds'];
    const bagType = bagTypes[bagIndex % bagTypes.length];
    
    // Count items in this specific bag
    const bagItemCount = itemsArray
      .slice(bagIndex * itemsPerBag, (bagIndex + 1) * itemsPerBag)
      .length;
    
    return (
      <div 
        key={`bag-${bagIndex}`} 
        className="mb-4 rounded-lg overflow-hidden"
        style={{
          backgroundImage: `url(${bagBackground})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-amber-200" />
              <h3 className="text-lg font-bold text-amber-200">{bagType}</h3>
            </div>
            <span className="text-xs text-amber-200 bg-black/30 px-2 py-1 rounded-full">
              {bagItemCount} / {itemsPerBag} slots
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 p-2 bg-black/30 rounded-lg">
            {renderBagSlots(bagIndex)}
          </div>
        </div>
      </div>
    );
  };

  // Render the slots for a single bag
  const renderBagSlots = (bagIndex: number) => {
    return Array.from({ length: itemsPerBag }).map((_, slotIndex) => {
      const itemIndex = bagIndex * itemsPerBag + slotIndex;
      const item = itemsArray[itemIndex];
      const itemDetails = item ? getItemDetails(item.type) : null;
    
      return (
        <div 
          key={`slot-${bagIndex}-${slotIndex}`} 
          className={`
            relative w-14 h-14 rounded-md
            ${item ? 'bg-black/40' : 'bg-black/20'} 
            ${item && itemDetails?.rarity ? getRarityClasses(itemDetails.rarity) : 'border-gray-700'} 
            border-2 cursor-pointer 
            hover:bg-black/60 hover:brightness-125 
            transition-all duration-200
            transform hover:scale-105
            ${!item ? 'after:content-[""] after:absolute after:inset-0 after:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3C%2Fsvg%3E")] after:opacity-50' : ''}
          `}
          onClick={() => item && handleItemClick(item.type, item.quantity)}
          onMouseEnter={() => item && setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {item && itemDetails?.imagePath && (
            <img 
              src={itemDetails.imagePath} 
              alt={itemDetails.name || 'Item'} 
              className="w-full h-full object-contain p-1.5" 
              style={{ imageRendering: 'pixelated' }}
            />
          )}
          
          {item && (
            <div className="absolute bottom-0 right-0.5 bg-black/80 text-white text-xs px-1 rounded-sm font-bold">
              {item.quantity}
            </div>
          )}
          
          {/* Enhanced WoW-style Tooltip */}
          {item && hoveredItem === item.id && (
            <div className="absolute z-50 p-3 border-2 
              rounded-md shadow-2xl -top-2 left-16 w-48 pointer-events-none"
              style={{ 
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                borderColor: itemDetails?.rarity 
                  ? getRarityTextColor(itemDetails.rarity)
                  : '#FFFFFF',
                transform: 'translateY(-100%)'
              }}
            >
              <p className="font-bold text-sm" style={{ 
                color: itemDetails?.rarity 
                  ? getRarityTextColor(itemDetails.rarity)
                  : '#FFFFFF'
              }}>
                {itemDetails?.name || item.type}
              </p>
              
              <p className="text-xs mt-1 text-gray-400 italic">
                {itemDetails?.rarity 
                  ? `${itemDetails.rarity.charAt(0).toUpperCase()}${itemDetails.rarity.slice(1)}` 
                  : 'Unknown'}
              </p>
              
              {itemDetails?.description && (
                <p className="text-xs mt-1 text-white">{itemDetails.description}</p>
              )}
              
              {itemDetails?.flavorText && (
                <p className="text-xs mt-2 text-gray-400 italic">"{itemDetails.flavorText}"</p>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black/30 rounded-lg space-y-4">
        <PackageOpen className="h-16 w-16 text-amber-300/50" />
        <p className="text-amber-200 text-center">Your bags are empty. Start quests to collect items!</p>
      </div>
    );
  };

  return (
    <div className="p-3 text-white">
      <h2 className="text-xl font-bold mb-3 text-center text-amber-300 drop-shadow-md">Adventure Bags</h2>
      
      {itemsArray.length > 0 
        ? bagArray.map(bagIndex => renderBag(bagIndex))
        : renderEmptyState()
      }
    </div>
  );
};

export default InventoryWindow;