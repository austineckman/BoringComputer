import React, { useState, useEffect } from 'react';
import { X, Minimize, Plus, Clock, Zap, Wrench, DollarSign } from 'lucide-react';

interface AuctionListing {
  id: string;
  itemId: string;
  itemName: string;
  itemDescription: string;
  itemImagePath?: string;
  itemRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  startingBid: number;
  currentBid: number;
  bidIncrement: number;
  expiresAt: string;
  status: 'active' | 'ended' | 'cancelled';
  highestBidder?: string;
  createdAt: string;
  updatedAt: string;
}

interface GameItem {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
  category?: string;
}

interface BMAHWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

const BMAHWindow: React.FC<BMAHWindowProps> = ({ onClose, onMinimize }) => {
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch auctions and items in parallel
        const [auctionsRes, itemsRes] = await Promise.all([
          fetch('/api/bmah/auctions'),
          fetch('/api/items')
        ]);

        if (auctionsRes.ok) {
          const auctionsData = await auctionsRes.json();
          setAuctions(auctionsData);
        }

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format time remaining
  const formatTimeLeft = (expiresAt: string): { text: string; isExpired: boolean } => {
    const timeLeft = new Date(expiresAt).getTime() - Date.now();
    const isExpired = timeLeft <= 0;

    if (isExpired) return { text: 'ENDED', isExpired: true };

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days}d ${hours}h`, isExpired: false };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, isExpired: false };
    return { text: `${minutes}m`, isExpired: false };
  };

  // Get rarity styling
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'epic': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'rare': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'uncommon': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-white w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Scraplight Cartel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Gizbo's Info */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          {/* Gizbo Character Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            {/* Placeholder for Gizbo's image */}
            <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg border-2 border-dashed border-orange-300 flex items-center justify-center mb-4">
              <div className="text-center">
                <Wrench className="text-orange-500 mx-auto mb-2" size={32} />
                <p className="text-orange-600 font-medium">Gizbo Sparkwrench</p>
                <p className="text-gray-500 text-sm">Portrait Coming Soon</p>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Gizbo Sparkwrench</h2>
              <p className="text-gray-600 text-sm">Leader of the Scraplight Cartel</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="text-yellow-500" size={16} />
                <span className="text-gray-700">Chaotic Good Inventor</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wrench className="text-blue-500" size={16} />
                <span className="text-gray-700">Reality-Breaking Gadgets</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="text-green-500" size={16} />
                <span className="text-gray-700">Highest Bidder Wins</span>
              </div>
            </div>
          </div>

          {/* Gizbo's Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-orange-800 mb-2 flex items-center">
              <Wrench className="mr-2" size={16} />
              From Gizbo's Workshop
            </h3>
            <p className="text-orange-700 text-sm leading-relaxed mb-3">
              "Hey there, fellow tinkerer! Welcome to the Scraplight Cartel's finest collection of reality-bending relics and dimension-cracking components."
            </p>
            <p className="text-orange-700 text-sm leading-relaxed mb-3">
              "These beauties fell from the sky when the Great Collapse tore apart the dimensions. I've been scavenging the best parts, and now it's time to share the wealth!"
            </p>
            <p className="text-orange-700 text-sm leading-relaxed font-medium">
              "Remember: If you can fix it, you can own it. Best inventions go to the highest bidder. Let's break reality together!"
            </p>
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-orange-600 text-xs italic">- Gizbo Sparkwrench, First of His Name, Last of His Patience</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Cartel Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Auctions</span>
                <span className="font-medium">{auctions.filter(a => a.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rare Finds</span>
                <span className="font-medium">{auctions.filter(a => ['rare', 'epic', 'legendary'].includes(a.itemRarity)).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Items</span>
                <span className="font-medium">{items.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Auction Listings */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Current Auctions</h2>
            <p className="text-gray-600">Dimension-cracking relics ready for bidding</p>
          </div>

          {/* Auction Grid */}
          {auctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map(auction => {
                const timeInfo = formatTimeLeft(auction.expiresAt);
                
                return (
                  <div 
                    key={auction.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all p-4"
                  >
                    {/* Item Image */}
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      {auction.itemImagePath ? (
                        <img
                          src={auction.itemImagePath}
                          alt={auction.itemName}
                          className="w-full h-full object-contain rounded-lg"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <div className="text-gray-400">
                          <Wrench size={32} />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-900 text-sm">{auction.itemName}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(auction.itemRarity)}`}>
                            {auction.itemRarity}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs line-clamp-2">{auction.itemDescription}</p>
                      </div>

                      {/* Bid Info */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs">Current Bid</span>
                          <span className="font-bold text-green-600">{auction.currentBid} scrap</span>
                        </div>
                        
                        {auction.highestBidder && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs">Leading Bidder</span>
                            <span className="text-gray-800 text-xs font-medium">{auction.highestBidder}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-xs flex items-center">
                            <Clock size={12} className="mr-1" />
                            Time Left
                          </span>
                          <span className={`text-xs font-bold ${timeInfo.isExpired ? 'text-red-500' : 'text-blue-600'}`}>
                            {timeInfo.text}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                        Place Bid
                      </button>
                    </div>
                  </div>
                );
              })
            }
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Workshop's Empty!</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Gizbo's still out scavenging for rare components from the dimensional rifts. 
                Check back soon for reality-bending relics!
              </p>
              <p className="text-sm text-gray-500 italic">
                "The best inventions take time to find!" - Gizbo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMAHWindow;