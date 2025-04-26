import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Key, Loader2, PackageOpen } from "lucide-react";
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
  // State for the currently selected item
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
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

  // Show loading state while data is being fetched
  if (inventoryLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  // Helper function to find item details
  const getItemDetails = (itemId: string): ItemDetails | null => {
    if (!allItems) return null;
    return (allItems as ItemDetails[]).find((item) => item.id === itemId) || null;
  };

  // Create array of inventory items
  const itemsArray = Array.isArray(inventoryItems) ? inventoryItems : [];
  const itemCount = itemsArray.length;
  const totalSlots = 32; // Fixed 32-slot bag

  // Get the selected item details for the tooltip
  const selectedItem = selectedItemId ? 
    itemsArray.find(item => item.id === selectedItemId) : null;
  
  const selectedItemDetails = selectedItem ? 
    getItemDetails(selectedItem.type) : null;

  // Handle item click
  const handleItemClick = (itemId: string, quantity: number) => {
    openItemDetails(itemId, quantity);
  };

  // WoW-style rarity class generator
  const getRarityClass = (rarity: string): string => {
    const classes: Record<string, string> = {
      common: 'border-gray-400',
      uncommon: 'border-green-500 shadow-[0_0_5px_0_rgba(30,255,0,0.3)]',
      rare: 'border-blue-500 shadow-[0_0_5px_0_rgba(0,112,221,0.4)]',
      epic: 'border-purple-500 shadow-[0_0_8px_0_rgba(163,53,238,0.5)]',
      legendary: 'border-amber-500 shadow-[0_0_10px_0_rgba(255,215,0,0.6)]',
    };
    return classes[rarity] || 'border-gray-400';
  };

  // Get color for rarity text
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#A335EE';
      case 'rare': return '#0070DD';
      case 'uncommon': return '#1EFF00';
      default: return '#FFFFFF';
    }
  };

  return (
    <div className="inventory-window flex flex-col text-white h-full" style={{
      backgroundImage: `url(${bagBackground})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
    }}>
      {/* Main container with proper padding */}
      <div className="flex-1 p-5 overflow-hidden flex flex-col">
        
        {/* Header area with slot counter */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-300 drop-shadow-md">Inventory</h2>
          <div className="text-xs text-amber-200 bg-black/30 px-2 py-1 rounded-full">
            {itemCount} / {totalSlots} slots
          </div>
        </div>
        
        {/* Item tooltip - Fixed position at the top */}
        {selectedItemId && selectedItemDetails && (
          <div 
            className="mb-4 p-4 border-2 rounded-md w-full max-w-md mx-auto"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              borderColor: getRarityColor(selectedItemDetails.rarity),
              boxShadow: `0 0 10px ${getRarityColor(selectedItemDetails.rarity)}40`
            }}
          >
            <div className="flex items-start">
              {selectedItemDetails.imagePath && (
                <img 
                  src={selectedItemDetails.imagePath}
                  alt={selectedItemDetails.name}
                  className="w-12 h-12 mr-3 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
              
              <div className="flex-1">
                <h3 
                  className="font-bold text-base"
                  style={{ color: getRarityColor(selectedItemDetails.rarity) }}
                >
                  {selectedItemDetails.name}
                </h3>
                
                <p className="text-xs text-gray-400 italic mb-2">
                  {selectedItemDetails.rarity.charAt(0).toUpperCase() + selectedItemDetails.rarity.slice(1)}
                </p>
                
                {selectedItemDetails.description && (
                  <p className="text-sm text-white mb-2">{selectedItemDetails.description}</p>
                )}
                
                {selectedItemDetails.flavorText && (
                  <p className="text-xs text-gray-400 italic mt-2">"{selectedItemDetails.flavorText}"</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Main inventory grid area with proper background */}
        <div className="flex-1 bg-black/70 rounded-lg p-4 mb-4">
          {itemsArray.length > 0 ? (
            <div className="grid grid-cols-8 gap-2">
              {/* Render filled slots */}
              {itemsArray.map((item) => {
                const itemDetails = getItemDetails(item.type);
                return (
                  <div
                    key={item.id}
                    className={`
                      relative w-12 h-12 rounded-md bg-black/40
                      ${itemDetails?.rarity ? getRarityClass(itemDetails.rarity) : 'border-gray-700'}
                      border-2 cursor-pointer hover:brightness-125 transition-all
                      transform hover:scale-105
                    `}
                    onClick={() => handleItemClick(item.type, item.quantity)}
                    onMouseEnter={() => setSelectedItemId(item.id)}
                    onMouseLeave={() => setSelectedItemId(null)}
                  >
                    {itemDetails?.imagePath && (
                      <img
                        src={itemDetails.imagePath}
                        alt={itemDetails.name || 'Item'}
                        className="w-full h-full object-contain p-1.5"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                    <div className="absolute bottom-0 right-0.5 bg-black/80 text-white text-xs px-1 rounded-sm font-bold">
                      {item.quantity}
                    </div>
                  </div>
                );
              })}
              
              {/* Render empty slots to fill the grid */}
              {Array.from({ length: totalSlots - itemsArray.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="
                    w-12 h-12 rounded-md bg-black/20 border-2 border-gray-700
                    after:content-[''] after:absolute after:inset-0 
                    after:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3C%2Fsvg%3E')]
                    after:opacity-50
                  "
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <PackageOpen className="h-16 w-16 text-amber-300/50" />
              <p className="text-amber-200 text-center">Your bags are empty. Start quests to collect items!</p>
            </div>
          )}
        </div>
        
        {/* Keyring Section */}
        <div className="bg-black/70 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Key className="w-4 h-4 mr-2 text-amber-500" />
            <h4 className="text-sm font-semibold text-amber-500">Keyring</h4>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`keyring-${index}`}
                className="
                  relative w-10 h-10 rounded-md bg-black/20 border-2 border-amber-700
                  after:content-[''] after:absolute after:inset-0 
                  after:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ffffff10%22%2F%3E%3C%2Fsvg%3E')]
                  after:opacity-50
                "
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryWindow;