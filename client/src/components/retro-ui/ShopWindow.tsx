import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Coins, ShoppingBag, User, Key } from 'lucide-react';

// Import shopkeeper character image
import shopkeeperImage from '@assets/hooded-figure.png';

interface ShopWindowProps {
  onClose?: () => void;
}

const ShopWindow: React.FC<ShopWindowProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogue, setDialogue] = useState<string>("Welcome to my humble shop, traveler! I have the finest Keys in all the land.");

  // Get user's current gold from inventory
  const userGold = user?.inventory?.['gold'] || 0;
  const userKeys = user?.inventory?.['key'] || 0;

  // Shop item configuration
  const shopItem = {
    id: 'key',
    name: 'Mystical Key',
    description: 'A magical key that can unlock hidden treasures and secret passages throughout the realm.',
    price: 100,
    stock: 999, // Unlimited stock
    icon: <Key className="w-8 h-8 text-yellow-400" />
  };

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest('POST', '/api/shop/purchase', {
        itemId,
        quantity,
        totalCost: shopItem.price * quantity
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful!",
        description: `You bought ${data.quantity} ${shopItem.name}(s) for ${data.totalCost} gold.`,
      });
      
      // Update local cache
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Shopkeeper response
      setDialogue("Excellent choice! May these keys serve you well on your adventures!");
      
      setTimeout(() => {
        setDialogue("Welcome to my humble shop, traveler! I have the finest Keys in all the land.");
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Not enough gold or other error occurred.",
        variant: "destructive"
      });
      
      // Shopkeeper response
      setDialogue("I'm afraid you don't have enough gold for that, friend. Come back when your purse is heavier!");
      
      setTimeout(() => {
        setDialogue("Welcome to my humble shop, traveler! I have the finest Keys in all the land.");
      }, 3000);
    }
  });

  const handlePurchase = (quantity: number = 1) => {
    if (userGold < shopItem.price * quantity) {
      toast({
        title: "Insufficient Gold",
        description: `You need ${shopItem.price * quantity} gold but only have ${userGold}.`,
        variant: "destructive"
      });
      setDialogue("Your coin purse seems a bit light, friend. Come back when you have more gold!");
      return;
    }

    setIsLoading(true);
    purchaseMutation.mutate({ itemId: shopItem.id, quantity });
    setIsLoading(false);
  };

  const shopkeeperDialogues = [
    "Welcome to my humble shop, traveler! I have the finest Keys in all the land.",
    "These mystical keys can unlock secrets you never imagined...",
    "I've been collecting these keys for decades. Each one has a story to tell.",
    "The price is fair for such magical artifacts, don't you think?",
    "Keys... they open more than just doors. They open possibilities."
  ];

  const handleShopkeeperClick = () => {
    const randomDialogue = shopkeeperDialogues[Math.floor(Math.random() * shopkeeperDialogues.length)];
    setDialogue(randomDialogue);
  };

  return (
    <div className="h-full bg-gradient-to-b from-amber-50 to-amber-100 p-6 font-mono">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-800 mb-2">🗝️ The Keymaster's Shop 🗝️</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-amber-700">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4" />
            <span>Your Gold: {userGold}</span>
          </div>
          <div className="flex items-center gap-1">
            <Key className="w-4 h-4" />
            <span>Your Keys: {userKeys}</span>
          </div>
        </div>
      </div>

      {/* Shop Layout */}
      <div className="flex h-96">
        {/* Shopkeeper Side */}
        <div className="w-1/2 pr-4 border-r-2 border-amber-300">
          <div className="text-center">
            <h3 className="text-lg font-bold text-amber-800 mb-4">The Keymaster</h3>
            
            {/* Shopkeeper Character */}
            <div 
              className="mx-auto w-32 h-32 mb-4 cursor-pointer hover:scale-105 transition-transform"
              onClick={handleShopkeeperClick}
            >
              <img 
                src={shopkeeperImage} 
                alt="The Keymaster" 
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            {/* Dialogue Box */}
            <div className="bg-white border-2 border-amber-400 rounded-lg p-4 shadow-lg">
              <div className="text-sm text-amber-900 leading-relaxed">
                "{dialogue}"
              </div>
            </div>
          </div>
        </div>

        {/* Shop Items Side */}
        <div className="w-1/2 pl-4">
          <h3 className="text-lg font-bold text-amber-800 mb-4 text-center">Shop Inventory</h3>
          
          {/* Item Card */}
          <div className="bg-white border-2 border-amber-400 rounded-lg p-4 shadow-lg">
            <div className="text-center mb-4">
              {shopItem.icon}
              <h4 className="text-lg font-bold text-amber-800 mt-2">{shopItem.name}</h4>
              <p className="text-sm text-amber-700 mt-1">{shopItem.description}</p>
            </div>
            
            <div className="border-t border-amber-300 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-amber-800 font-bold">Price:</span>
                <div className="flex items-center gap-1 text-amber-800 font-bold">
                  <Coins className="w-4 h-4" />
                  <span>{shopItem.price} Gold</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-amber-800">In Stock:</span>
                <span className="text-amber-800 font-bold">∞ (Unlimited)</span>
              </div>
              
              {/* Purchase Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handlePurchase(1)}
                  disabled={isLoading || userGold < shopItem.price}
                  className={`w-full py-2 px-4 rounded font-bold transition-colors ${
                    userGold >= shopItem.price
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Buy 1 Key'}
                </button>
                
                <button
                  onClick={() => handlePurchase(5)}
                  disabled={isLoading || userGold < shopItem.price * 5}
                  className={`w-full py-2 px-4 rounded font-bold transition-colors ${
                    userGold >= shopItem.price * 5
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Buy 5 Keys (500 Gold)'}
                </button>
                
                <button
                  onClick={() => handlePurchase(10)}
                  disabled={isLoading || userGold < shopItem.price * 10}
                  className={`w-full py-2 px-4 rounded font-bold transition-colors ${
                    userGold >= shopItem.price * 10
                      ? 'bg-amber-700 hover:bg-amber-800 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Buy 10 Keys (1000 Gold)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-amber-600">
        <p>💰 Collect gold by completing quests and exploring the realm! 💰</p>
        <p className="mt-1">🗝️ Keys can unlock special loot crates and hidden secrets! 🗝️</p>
      </div>
    </div>
  );
};

export default ShopWindow;