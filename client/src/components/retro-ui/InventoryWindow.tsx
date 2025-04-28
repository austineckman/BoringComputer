import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Key, Loader2, PackageOpen, ShoppingBag } from "lucide-react";
import { ItemDetails } from "@/types";
import bagBackground from "@assets/bagbkg.png";
import inventoryExeLogo from "@assets/Untitled design - 2025-04-28T130514.365.png";

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
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleItemClick = (itemId: string, quantity: number) => {
    openItemDetails(itemId, quantity);
    setSelectedItem(itemId);
  };

  if (inventoryLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
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

  // Enhanced RPG-style rarity classes with stronger glow effects
  const getRarityClasses = (rarity: string) => {
    const classes: Record<string, string> = {
      common: 'border-gray-400 bg-black/60',
      uncommon: 'border-green-500 shadow-[0_0_8px_1px_rgba(30,255,0,0.4)] bg-green-950/40',
      rare: 'border-blue-500 shadow-[0_0_8px_1px_rgba(0,112,221,0.5)] bg-blue-950/40',
      epic: 'border-purple-500 shadow-[0_0_10px_2px_rgba(163,53,238,0.5)] bg-purple-950/40',
      legendary: 'border-yellow-500 shadow-[0_0_10px_2px_rgba(255,215,0,0.6)] bg-amber-950/40',
    };
    return classes[rarity] || 'border-gray-400 bg-black/60';
  };

  // Enhanced RPG-style rarity text colors
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
      const isHovered = item && hoveredItem === item.id;
      const isSelected = item && selectedItem === item.id;
    
      return (
        <div 
          key={`slot-${slotIndex}`} 
          className={`
            relative w-14 h-14 rounded
            ${item ? 'bg-black/40' : 'bg-black/20'} 
            ${item && itemDetails?.rarity ? getRarityClasses(itemDetails.rarity) : 'border-gray-700/50'} 
            ${isSelected ? 'border-white border-2 scale-105' : 'border border-gray-700/80'} 
            cursor-pointer 
            hover:brightness-125 
            transition-all duration-200
            ${isHovered ? 'scale-105 z-10' : ''}
            ${!item ? 'after:content-[""] after:absolute after:inset-0 after:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3C%2Fsvg%3E")] after:opacity-30' : ''}
          `}
          onClick={() => item && handleItemClick(item.type, item.quantity)}
          onMouseEnter={() => item && setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {item && itemDetails?.imagePath && (
            <img 
              src={itemDetails.imagePath} 
              alt={itemDetails.name || 'Item'} 
              className="w-full h-full object-contain p-2" 
              style={{ imageRendering: 'pixelated' }}
            />
          )}
          
          {item && (
            <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-1 py-0.5 rounded font-bold">
              {item.quantity}
            </div>
          )}
        </div>
      );
    });
  };

  // Render keyring slots with improved styling
  const renderKeyringSlots = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <div 
        key={`keyring-${index}`} 
        className="relative w-12 h-12 rounded bg-black/40 border border-amber-700/70
          after:content-[''] after:absolute after:inset-0 after:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3C%2Fsvg%3E')] after:opacity-30"
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

  // Render item details panel (shown when an item is hovered)
  const renderItemDetails = () => {
    if (!hoveredItem) return null;
    
    const hoveredItemData = itemsArray.find(item => item.id === hoveredItem);
    if (!hoveredItemData) return null;
    
    const itemDetails = getItemDetails(hoveredItemData.type);
    if (!itemDetails) return null;
    
    return (
      <div className="bg-black/80 border border-gray-700 rounded-lg p-4 h-full">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 rounded ${getRarityClasses(itemDetails.rarity || 'common')} flex items-center justify-center p-2`}>
            {itemDetails.imagePath && (
              <img 
                src={itemDetails.imagePath} 
                alt={itemDetails.name} 
                className="w-full h-full object-contain" 
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>
          
          <div className="flex-1">
            <h3 
              className="text-lg font-semibold mb-0.5" 
              style={{ color: getRarityTextColor(itemDetails.rarity || 'common') }}
            >
              {itemDetails.name}
            </h3>
            
            <p className="text-xs text-gray-400">
              {itemDetails.rarity 
                ? `${itemDetails.rarity.charAt(0).toUpperCase()}${itemDetails.rarity.slice(1)}` 
                : 'Common'} Item
            </p>
            
            <p className="text-xs text-white mt-1">
              Quantity: <span className="text-amber-300">{hoveredItemData.quantity}</span>
            </p>
          </div>
        </div>
        
        {itemDetails.description && (
          <div className="mb-3">
            <p className="text-sm text-white">{itemDetails.description}</p>
          </div>
        )}
        
        {itemDetails.flavorText && (
          <div className="border-t border-gray-700 pt-2 mt-2">
            <p className="text-sm text-gray-400 italic">"{itemDetails.flavorText}"</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="w-full h-full overflow-hidden rounded-lg text-white"
      style={{
        backgroundImage: `url(${bagBackground})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    >
      {/* Main container with semi-transparent overlay */}
      <div className="w-full h-full bg-black/40 backdrop-blur-[1px] flex flex-col">
        {/* Header with logo and slots counter */}
        <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/50 px-4 py-3 border-b border-amber-700/50 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={inventoryExeLogo} 
              alt="Inventory.exe" 
              className="h-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div className="bg-black/40 text-xs text-amber-200 px-3 py-1 rounded-full border border-amber-800/40">
            {itemCount} / {totalSlots} slots
          </div>
        </div>
        
        {/* Two-column layout with items grid and details panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main inventory grid (left side) */}
          <div className="flex-1 overflow-auto p-4">
            {itemsArray.length > 0 ? (
              <div className="grid grid-cols-8 gap-1.5">
                {renderInventorySlots()}
              </div>
            ) : renderEmptyState()}
            
            {/* Keyring Section */}
            <div className="mt-6 pt-4 border-t border-amber-900/30">
              <div className="flex items-center mb-2">
                <div className="flex-1 h-px bg-gradient-to-r from-amber-700/0 via-amber-700/50 to-amber-700/0"></div>
                <div className="flex items-center bg-amber-900/40 px-2 py-1 rounded-md mx-2 border border-amber-700/50">
                  <Key className="w-4 h-4 mr-2 text-amber-300" />
                  <h4 className="text-sm font-semibold text-amber-300">Keyring</h4>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-700/0 via-amber-700/50 to-amber-700/0"></div>
              </div>
              <div className="flex justify-center gap-3 mt-3">
                {renderKeyringSlots()}
              </div>
            </div>
          </div>
          
          {/* Item details panel (right side), only shown when an item is hovered */}
          <div className="w-72 p-3 border-l border-amber-900/30">
            {hoveredItem ? renderItemDetails() : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                <p className="text-center">Hover over an item<br />to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryWindow;