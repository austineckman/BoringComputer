import React from "react";
import { getQueryFn } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { ItemDetails as ItemDetailsType } from "@/types"; 
import { Loader2 } from "lucide-react";

interface ItemDetailsWindowProps {
  itemId: string;
  quantity: number;
}

const ItemDetailsWindow: React.FC<ItemDetailsWindowProps> = ({ itemId, quantity }) => {
  // Fetch item details
  const {
    data: item,
    isLoading,
    error,
  } = useQuery<ItemDetailsType>({
    queryKey: ["/api/items", itemId],
    queryFn: () => getQueryFn()(`/api/items/${itemId}`),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading item details</p>
      </div>
    );
  }

  // Calculate the rarity color
  const rarityColors: Record<string, string> = {
    common: "text-gray-400",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-amber-400",
  };
  
  const rarityColor = rarityColors[item.rarity] || "text-gray-400";

  return (
    <div className="p-4 flex flex-col h-full overflow-auto">
      <div className="flex mb-4">
        <div className="w-24 h-24 bg-gray-800 rounded-md flex items-center justify-center mr-4">
          <img 
            src={item.imagePath} 
            alt={item.name} 
            className="w-20 h-20 object-contain pixelated-image"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">{item.name}</h2>
          <p className={`${rarityColor} font-semibold`}>
            {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
          </p>
          <p className="mt-1">Quantity: {quantity}</p>
        </div>
      </div>
      
      <div className="border-t border-gray-300 pt-3 mb-3">
        <p className="text-sm mb-2">{item.description}</p>
        <p className="text-xs italic text-gray-500">{item.flavorText}</p>
      </div>
      
      {item.craftingUses && item.craftingUses.length > 0 && (
        <div className="border-t border-gray-300 pt-3">
          <h3 className="text-sm font-bold mb-2">Crafting Uses:</h3>
          <ul className="text-xs">
            {item.craftingUses.map((use: string, index: number) => (
              <li key={index} className="mb-1">• {use}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-auto pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-500">Item ID: {item.id}</p>
      </div>
    </div>
  );
};

export default ItemDetailsWindow;