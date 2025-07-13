import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Coins, Eye, Skull, Timer, Gavel } from 'lucide-react';

// Import creepy auction house image
import auctionHouseImage from '@assets/hooded-figure.png';

interface AuctionItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  currentBid: number;
  minBidIncrement: number;
  timeRemaining: number; // in seconds
  imagePath?: string;
  highestBidder?: string;
}

interface ShopWindowProps {
  onClose?: () => void;
}

const ShopWindow: React.FC<ShopWindowProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [creepyMessage, setCreepyMessage] = useState<string>("Welcome to the shadows... What dark treasures seek you today?");

  // Get user's current gold from inventory
  const userGold = user?.inventory?.['gold'] || 0;

  // Fetch available game items for auctions
  const { data: gameItems } = useQuery({
    queryKey: ['/api/items'],
  });

  // Create auction items from real game items
  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([]);

  useEffect(() => {
    if (gameItems && Array.isArray(gameItems)) {
      // Create rotating auction items from available game items
      const createAuctionItem = (item: any, index: number): AuctionItem => {
        const rarityMultiplier = {
          'common': 1,
          'uncommon': 2,
          'rare': 4,
          'epic': 8,
          'legendary': 16
        };
        
        const basePrice = 50 + (index * 25);
        const rarity = item.rarity || 'common';
        const startingBid = Math.floor(basePrice * (rarityMultiplier[rarity] || 1));
        
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          rarity: rarity,
          currentBid: startingBid,
          minBidIncrement: Math.floor(startingBid * 0.1), // 10% increment
          timeRemaining: 300 + (index * 60), // 5-10 minutes
          imagePath: item.imagePath,
          highestBidder: index % 3 === 0 ? 'ShadowBidder' : undefined
        };
      };

      // Take first 6 items for auction
      const auctions = gameItems.slice(0, 6).map(createAuctionItem);
      setAuctionItems(auctions);
    }
  }, [gameItems]);

  // Timer effect for auction countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctionItems(prev => prev.map(item => ({
        ...item,
        timeRemaining: Math.max(0, item.timeRemaining - 1)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Bid mutation
  const bidMutation = useMutation({
    mutationFn: async ({ itemId, bidAmount }: { itemId: string; bidAmount: number }) => {
      // For now, simulate bidding without backend
      return { success: true, itemId, bidAmount };
    },
    onSuccess: (data) => {
      // Update auction item with new bid
      setAuctionItems(prev => prev.map(item => 
        item.id === data.itemId 
          ? { ...item, currentBid: data.bidAmount, highestBidder: user?.username || 'You' }
          : item
      ));
      
      toast({
        title: "Bid Placed!",
        description: `Your bid of ${data.bidAmount} gold has been placed in the shadows...`,
      });
      
      setCreepyMessage("Your bid echoes through the darkness... others may challenge your claim...");
      
      setTimeout(() => {
        setCreepyMessage("Welcome to the shadows... What dark treasures seek you today?");
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Bid Failed",
        description: error instanceof Error ? error.message : "The shadows reject your offer...",
        variant: "destructive"
      });
      
      setCreepyMessage("The auction spirits are displeased... your gold is insufficient...");
    }
  });

  const handleBid = (item: AuctionItem) => {
    const minBid = item.currentBid + item.minBidIncrement;
    
    if (bidAmount < minBid) {
      toast({
        title: "Bid Too Low",
        description: `Minimum bid is ${minBid} gold. The shadows demand more...`,
        variant: "destructive"
      });
      return;
    }

    if (userGold < bidAmount) {
      toast({
        title: "Insufficient Gold",
        description: `You need ${bidAmount} gold but only have ${userGold}.`,
        variant: "destructive"
      });
      setCreepyMessage("Your coin purse echoes hollow... the shadows mock your poverty...");
      return;
    }

    bidMutation.mutate({ itemId: item.id, bidAmount });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500';
      case 'uncommon': return 'text-green-400 border-green-500';
      case 'rare': return 'text-blue-400 border-blue-500';
      case 'epic': return 'text-purple-400 border-purple-500';
      case 'legendary': return 'text-yellow-400 border-yellow-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const creepyMessages = [
    "Welcome to the shadows... What dark treasures seek you today?",
    "The auction spirits whisper of rare artifacts...",
    "Gold calls to gold... what will you sacrifice for power?",
    "These items have... histories. Dark histories...",
    "Bid wisely, mortal. Others watch from the shadows..."
  ];

  const handleRandomMessage = () => {
    const randomMessage = creepyMessages[Math.floor(Math.random() * creepyMessages.length)];
    setCreepyMessage(randomMessage);
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 via-black to-red-900 p-6 font-mono text-gray-100">
      {/* Header */}
      <div className="text-center mb-6 border-b border-red-800 pb-4">
        <h2 className="text-3xl font-bold text-red-400 mb-2 tracking-wider">
          <Skull className="inline w-8 h-8 mr-2" />
          BLACK MARKET AUCTION HOUSE
          <Skull className="inline w-8 h-8 ml-2" />
        </h2>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded border border-red-800">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>Your Gold: <span className="text-yellow-400 font-bold">{userGold}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded border border-purple-800">
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Active Bids: <span className="text-purple-400 font-bold">{auctionItems.filter(item => item.highestBidder === user?.username).length}</span></span>
          </div>
        </div>
      </div>

      {/* Auction Master */}
      <div className="flex mb-6">
        <div className="w-1/3 pr-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-red-400 mb-4">The Shadow Broker</h3>
            
            {/* Auction Master Character */}
            <div 
              className="mx-auto w-24 h-24 mb-4 cursor-pointer hover:scale-110 transition-transform filter brightness-50 contrast-150"
              onClick={handleRandomMessage}
            >
              <img 
                src={auctionHouseImage} 
                alt="The Shadow Broker" 
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            {/* Creepy Message Box */}
            <div className="bg-black/80 border-2 border-red-600 rounded-lg p-3 shadow-lg shadow-red-900/50">
              <div className="text-xs text-red-300 leading-relaxed italic">
                "{creepyMessage}"
              </div>
            </div>
          </div>
        </div>

        {/* Bidding Interface */}
        <div className="w-2/3 pl-4">
          {selectedItem && (
            <div className="bg-black/60 border-2 border-purple-600 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-bold text-purple-400 mb-2">Place Your Bid</h3>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  placeholder={`Min: ${selectedItem.currentBid + selectedItem.minBidIncrement}`}
                  className="flex-1 px-3 py-2 bg-black border border-purple-500 rounded text-purple-100 placeholder-purple-300"
                />
                <button
                  onClick={() => handleBid(selectedItem)}
                  disabled={bidMutation.isPending}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold transition-colors disabled:opacity-50"
                >
                  <Gavel className="inline w-4 h-4 mr-1" />
                  {bidMutation.isPending ? 'Bidding...' : 'BID'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auction Items Grid */}
      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {auctionItems.map((item) => (
          <div 
            key={item.id}
            className={`bg-black/60 border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedItem?.id === item.id ? 'border-purple-400 shadow-purple-900/50' : getRarityColor(item.rarity)
            }`}
            onClick={() => {
              setSelectedItem(item);
              setBidAmount(item.currentBid + item.minBidIncrement);
            }}
          >
            {/* Item Image */}
            {item.imagePath && (
              <div className="text-center mb-3">
                <img 
                  src={item.imagePath} 
                  alt={item.name}
                  className="w-16 h-16 mx-auto object-contain filter brightness-75"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            )}
            
            {/* Item Info */}
            <div className="text-center">
              <h4 className={`text-sm font-bold mb-1 ${getRarityColor(item.rarity).split(' ')[0]}`}>
                {item.name}
              </h4>
              <p className="text-xs text-gray-400 mb-3 leading-tight">{item.description}</p>
              
              {/* Bid Info */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Current Bid:</span>
                  <span className="text-yellow-400 font-bold">{item.currentBid} gold</span>
                </div>
                
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">High Bidder:</span>
                  <span className="text-purple-400">{item.highestBidder || 'None'}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Time Left:</span>
                  <span className={`font-bold ${item.timeRemaining < 60 ? 'text-red-400' : 'text-blue-400'}`}>
                    <Timer className="inline w-3 h-3 mr-1" />
                    {formatTime(item.timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-red-400 border-t border-red-800 pt-4">
        <p className="opacity-75">⚠️ All sales are final... items carry the weight of their dark history ⚠️</p>
        <p className="mt-1 opacity-75">💀 The highest bidder claims their prize when time expires... 💀</p>
        <p className="mt-1 text-purple-400 opacity-75">🔮 Outbid others to secure legendary artifacts before it's too late 🔮</p>
      </div>
    </div>
  );
};

export default ShopWindow;