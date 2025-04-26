import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Key, Loader2, PackageOpen, ShoppingBag } from "lucide-react";
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

  // Single large bag with 32 slots (8x4)
  const slotsPerRow = 8;
  const totalSlots = 32;
  const itemsArray = Array.isArray(inventoryItems) ? inventoryItems : [];
  const itemCount = itemsArray.length;

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

  // Render main inventory slots
  const renderInventorySlots = () => {
    return Array.from({ length: totalSlots }).map((_, slotIndex) => {
      const item = itemsArray[slotIndex];
      const itemDetails = item ? getItemDetails(item.type) : null;
    
      return (
        <div 
          key={`slot-${slotIndex}`} 
          className={`
            relative w-12 h-12 rounded-md
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
          
          {/* Enhanced WoW-style Tooltip - positioned in a fixed manner to avoid clipping */}
          {item && hoveredItem === item.id && (
            <div className="fixed z-[9999] p-3 border-2 
              rounded-md shadow-2xl pointer-events-none"
              style={{ 
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                borderColor: itemDetails?.rarity 
                  ? getRarityTextColor(itemDetails.rarity)
                  : '#FFFFFF',
                top: '30%',
                left: '50%',
                transform: 'translateX(-50%)'
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

  // Render keyring slots
  const renderKeyringSlots = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <div 
        key={`keyring-${index}`} 
        className="relative w-10 h-10 rounded-md bg-black/20 border-2 border-amber-700
          after:content-[''] after:absolute after:inset-0 after:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3C%2Fsvg%3E')] after:opacity-50"
      />
    ));
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
    <div className="p-3 text-white relative">
      <h2 className="text-xl font-bold mb-3 text-center text-amber-300 drop-shadow-md">Adventure Bag</h2>
      
      {/* Main Bag */}
      <div 
        className="rounded-lg overflow-hidden"
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
              <h3 className="text-lg font-bold text-amber-200">Adventurer's Backpack</h3>
            </div>
            <span className="text-xs text-amber-200 bg-black/30 px-2 py-1 rounded-full">
              {itemCount} / {totalSlots} slots
            </span>
          </div>
          
          {itemsArray.length > 0 ? (
            <div className="p-4" style={{ backgroundColor: 'rgba(20, 20, 20, 0.7)' }}>
              <div className="grid grid-cols-8 gap-2 mb-4">
                {renderInventorySlots()}
              </div>
              
              {/* Keyring Section */}
              <div className="mt-4 border-t border-amber-900/30 pt-3">
                <div className="flex items-center mb-2">
                  <Key className="w-4 h-4 mr-2 text-amber-500" />
                  <h4 className="text-sm font-semibold text-amber-500">Keyring</h4>
                </div>
                <div className="flex gap-2 ml-2">
                  {renderKeyringSlots()}
                </div>
              </div>
            </div>
          ) : renderEmptyState()}
        </div>
      </div>
    </div>
  );
};

export default InventoryWindow;