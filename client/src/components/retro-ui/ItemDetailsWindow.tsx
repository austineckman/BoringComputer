import React from "react";
import { getQueryFn } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Hammer, ShoppingCart, Crosshair, Percent } from "lucide-react";
import bagBackground from "@assets/bagbkg.png";

// Define ItemDetails interface locally to avoid import issues
interface ItemDetails {
  id: string;
  name: string; 
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
  category?: string;
}

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
  } = useQuery<ItemDetails>({
    queryKey: ["/api/items", itemId],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-amber-200" />
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
    common: "#9d9d9d", // Gray
    uncommon: "#1eff00", // Green
    rare: "#0070dd", // Blue
    epic: "#a335ee", // Purple
    legendary: "#ff8000", // Orange-gold
  };
  
  const rarityColor = rarityColors[item.rarity] || "#9d9d9d";
  
  // Calculate the border and glow effects
  const rarityBorderClasses: Record<string, string> = {
    common: 'border-gray-400',
    uncommon: 'border-green-500 shadow-[0_0_8px_0_rgba(30,255,0,0.5)]',
    rare: 'border-blue-500 shadow-[0_0_8px_0_rgba(0,112,221,0.6)]',
    epic: 'border-purple-500 shadow-[0_0_12px_0_rgba(163,53,238,0.7)]',
    legendary: 'border-yellow-500 shadow-[0_0_15px_0_rgba(255,128,0,0.8)]',
  };
  
  const rarityBorder = rarityBorderClasses[item.rarity] || 'border-gray-400';

  // Generate random item stats based on rarity
  const generateStats = () => {
    // Higher rarity means better stats
    const rarityMultiplier = {
      common: 1,
      uncommon: 1.5,
      rare: 2.5,
      epic: 4,
      legendary: 6
    }[item.rarity] || 1;
    
    // Generate some random but deterministic stats based on item ID
    const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseStats = {
      craftingBonus: Math.floor((hash % 10) * rarityMultiplier),
      questRewardBoost: Math.floor(((hash % 13) + 5) * rarityMultiplier),
      rarityValue: Math.floor(((hash % 7) + 3) * rarityMultiplier * 10),
      tradeValue: Math.floor(((hash % 11) + 7) * rarityMultiplier * 5)
    };
    
    return baseStats;
  };
  
  const stats = generateStats();

  return (
    <div className="overflow-auto text-white h-full" style={{
      backgroundImage: `url(${bagBackground})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated'
    }}>
      <div className="p-5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div className="mb-6">
          <div className="flex items-start space-x-4">
            {/* Item image with border based on rarity */}
            <div className={`w-28 h-28 rounded-md flex items-center justify-center ${rarityBorder} border-2 bg-black/50`}>
              <img 
                src={item.imagePath} 
                alt={item.name} 
                className="w-24 h-24 object-contain p-1" 
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            <div className="flex-1">
              {/* Item name and rarity */}
              <h2 className="text-2xl font-bold mb-1" style={{ color: rarityColor }}>
                {item.name}
              </h2>
              <p className="font-semibold mb-2" style={{ color: rarityColor }}>
                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
              </p>
              
              {/* Bindings and item type */}
              <p className="text-gray-300 text-sm">Binds when picked up</p>
              <p className="text-gray-300 text-sm">Quest Material</p>
              
              {/* Quantity */}
              <div className="mt-2 bg-black/50 px-3 py-1 rounded inline-flex items-center">
                <span className="text-amber-200 font-semibold">Quantity: {quantity}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Item description */}
        <div className="mb-5 p-4 rounded bg-black/40 border border-gray-700">
          <p className="text-white mb-3">{item.description}</p>
          <p className="text-gray-400 italic">&quot;{item.flavorText}&quot;</p>
        </div>
        
        {/* Item stats */}
        <div className="mb-5 p-4 rounded bg-black/40 border border-gray-700">
          <h3 className="text-lg font-semibold text-amber-200 mb-3 border-b border-amber-900/50 pb-2">
            Item Statistics
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Hammer className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-green-400">+{stats.craftingBonus}% Crafting Speed</span>
            </div>
            <div className="flex items-center">
              <Crosshair className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-blue-400">+{stats.questRewardBoost}% Quest Rewards</span>
            </div>
            <div className="flex items-center">
              <Percent className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-purple-400">Rarity Value: {stats.rarityValue}</span>
            </div>
            <div className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-yellow-400">Trade Value: {stats.tradeValue} gold</span>
            </div>
          </div>
        </div>
        
        {/* Crafting uses */}
        {item.craftingUses && item.craftingUses.length > 0 && (
          <div className="mb-5 p-4 rounded bg-black/40 border border-gray-700">
            <h3 className="text-lg font-semibold text-amber-200 mb-3 border-b border-amber-900/50 pb-2">
              <Hammer className="inline-block w-5 h-5 mr-2 text-amber-200" />
              Crafting Uses
            </h3>
            <ul className="space-y-2">
              {item.craftingUses.map((use: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-200">{use}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Item source */}
        <div className="mt-auto p-3 bg-black/60 rounded text-center border-t border-amber-900/30">
          <p className="text-xs text-gray-400">Source: Quests, Crafting, Trading</p>
          <p className="text-xs text-gray-500 mt-1">Item ID: {item.id}</p>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsWindow;