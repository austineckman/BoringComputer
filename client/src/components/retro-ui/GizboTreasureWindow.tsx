import React, { useState, useEffect } from 'react';
import { X, Minimize, Maximize, Gavel, PlusCircle, Edit, Coins, Clock, Trophy, Skull } from 'lucide-react';

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

interface GizboTreasureWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

const GizboTreasureWindow: React.FC<GizboTreasureWindowProps> = ({ onClose, onMinimize }) => {
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAuction, setNewAuction] = useState({
    itemId: '',
    startingBid: 10,
    durationHours: 24
  });

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

  // Create new auction
  const handleCreateAuction = async () => {
    if (!newAuction.itemId || !newAuction.startingBid) return;

    try {
      const selectedItem = items.find(item => item.id === newAuction.itemId);
      if (!selectedItem) return;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + newAuction.durationHours);

      const auctionData = {
        itemId: newAuction.itemId,
        itemName: selectedItem.name,
        itemDescription: selectedItem.description,
        itemImagePath: selectedItem.imagePath,
        itemRarity: selectedItem.rarity,
        startingBid: newAuction.startingBid,
        currentBid: newAuction.startingBid,
        bidIncrement: Math.max(1, Math.floor(newAuction.startingBid * 0.1)),
        expiresAt: expiresAt.toISOString(),
        status: 'active' as const
      };

      const response = await fetch('/api/bmah/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auctionData),
      });

      if (response.ok) {
        const createdAuction = await response.json();
        setAuctions(prev => [createdAuction, ...prev]);
        setNewAuction({ itemId: '', startingBid: 10, durationHours: 24 });
        setShowCreateForm(false);
        window.sounds?.success();
      }
    } catch (error) {
      console.error('Error creating auction:', error);
      window.sounds?.error();
    }
  };

  // Format time remaining
  const formatTimeLeft = (expiresAt: string): { text: string; isExpired: boolean } => {
    const timeLeft = new Date(expiresAt).getTime() - Date.now();
    const isExpired = timeLeft <= 0;

    if (isExpired) return { text: 'EXPIRED', isExpired: true };

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days}d ${hours}h`, isExpired: false };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, isExpired: false };
    return { text: `${minutes}m`, isExpired: false };
  };

  // Get rarity styling
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'uncommon': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '🌟';
      case 'epic': return '💜';
      case 'rare': return '💙';
      case 'uncommon': return '💚';
      default: return '🤍';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-amber-900/80 to-orange-900/80 border-4 border-amber-600/60 rounded-lg shadow-2xl p-6 w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏴‍☠️</div>
          <p className="text-amber-200 text-lg">Loading Gizbo's treasure vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-amber-900/90 to-orange-900/90 border-4 border-amber-600/60 rounded-lg shadow-2xl w-full h-full flex flex-col overflow-hidden">
      {/* Window Header */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-700 border-b-2 border-amber-500 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-3xl mr-3">🏴‍☠️</div>
          <div>
            <h1 className="text-xl font-bold text-amber-100">Gizbo's Treasure Redistribution</h1>
            <p className="text-amber-200/80 text-sm italic">"Got payments to make, savvy?"</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMinimize}
            className="w-6 h-6 bg-amber-600 hover:bg-amber-500 rounded border border-amber-400 flex items-center justify-center"
          >
            <Minimize size={12} className="text-black" />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-red-600 hover:bg-red-500 rounded border border-red-400 flex items-center justify-center"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Gizbo's Introduction */}
        <div className="bg-amber-950/50 border-2 border-amber-600/40 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="text-4xl mr-4">👑</div>
            <div>
              <h2 className="text-amber-400 font-bold text-lg mb-2">Captain Gizbo's Fair Distribution Notice</h2>
              <p className="text-amber-200/90 leading-relaxed mb-3">
                "Ahoy there, ye scurvy dogs! These treasures be fairly redistributed loot from me pirate tax collection routes. 
                Every mission ye complete puts rare booty into circulation - and I take me fair cut, naturally!"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-amber-900/30 border border-amber-600/30 rounded p-3">
                  <div className="text-amber-300 font-bold mb-1">💰 The System</div>
                  <p className="text-amber-200/80">Rare items from successful missions get taxed into Gizbo's vault, then auctioned fairly.</p>
                </div>
                <div className="bg-amber-900/30 border border-amber-600/30 rounded p-3">
                  <div className="text-amber-300 font-bold mb-1">⚔️ Fair Chance</div>
                  <p className="text-amber-200/80">Every scallywag gets equal opportunity at the rarest treasures.</p>
                </div>
                <div className="bg-amber-900/30 border border-amber-600/30 rounded p-3">
                  <div className="text-amber-300 font-bold mb-1">🏴‍☠️ Payment Due</div>
                  <p className="text-amber-200/80">Gold goes to Gizbo's coffers - he's got debts to settle, savvy?</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Coins className="text-amber-400 mr-2" size={20} />
            <span className="text-amber-200 font-medium">{auctions.length} Treasures Available</span>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-black font-bold rounded-lg border-2 border-amber-500 transition-all"
            onMouseEnter={() => window.sounds?.hover()}
          >
            <PlusCircle size={16} className="mr-2" />
            Add New Treasure
          </button>
        </div>

        {/* Create Auction Form */}
        {showCreateForm && (
          <div className="bg-gradient-to-b from-amber-900/40 to-orange-900/40 border-2 border-amber-600/50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center">
              <Gavel className="mr-2" />
              Add Treasure to Auction
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-amber-300 font-medium mb-2">💎 Choose Treasure</label>
                <select
                  value={newAuction.itemId}
                  onChange={(e) => setNewAuction(prev => ({ ...prev, itemId: e.target.value }))}
                  className="w-full bg-amber-950/50 border-2 border-amber-600/40 rounded text-amber-100 p-2 focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Select from vault...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {getRarityEmoji(item.rarity)} {item.name} ({item.rarity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-amber-300 font-medium mb-2">💰 Starting Bid (Doubloons)</label>
                <input
                  type="number"
                  min="1"
                  value={newAuction.startingBid}
                  onChange={(e) => setNewAuction(prev => ({ ...prev, startingBid: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-amber-950/50 border-2 border-amber-600/40 rounded text-amber-100 p-2 focus:border-amber-500 focus:outline-none"
                  placeholder="Minimum bid amount"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-medium mb-2">⏱️ Duration</label>
                <select
                  value={newAuction.durationHours}
                  onChange={(e) => setNewAuction(prev => ({ ...prev, durationHours: parseInt(e.target.value) }))}
                  className="w-full bg-amber-950/50 border-2 border-amber-600/40 rounded text-amber-100 p-2 focus:border-amber-500 focus:outline-none"
                >
                  <option value={1}>⚡ 1 Hour (Quick Sale)</option>
                  <option value={6}>🌅 6 Hours</option>
                  <option value={12}>🌞 12 Hours</option>
                  <option value={24}>🌕 24 Hours</option>
                  <option value={48}>📅 48 Hours</option>
                  <option value={72}>📆 72 Hours</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded border border-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAuction}
                disabled={!newAuction.itemId}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-black font-bold rounded border-2 border-amber-500 disabled:border-gray-500 flex items-center"
              >
                🏴‍☠️ Launch Auction
              </button>
            </div>
          </div>
        )}

        {/* Auction Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.length > 0 ? (
            auctions.map(auction => {
              const timeInfo = formatTimeLeft(auction.expiresAt);
              
              return (
                <div 
                  key={auction.id}
                  className="bg-gradient-to-b from-amber-900/40 to-orange-900/40 border-2 border-amber-600/50 rounded-lg p-4 hover:scale-105 transition-all shadow-lg"
                >
                  {/* Treasure Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">💎</span>
                      <span className="text-amber-400 font-bold text-sm">GIZBO'S TREASURE</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${getRarityStyle(auction.itemRarity)}`}>
                      {getRarityEmoji(auction.itemRarity)} {auction.itemRarity.toUpperCase()}
                    </span>
                  </div>

                  {/* Item Details */}
                  <div className="flex items-start space-x-3 mb-4">
                    {auction.itemImagePath ? (
                      <img
                        src={auction.itemImagePath}
                        alt={auction.itemName}
                        className="w-16 h-16 object-contain rounded border-2 border-amber-600/50 bg-amber-950/30 p-1"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded border-2 border-amber-600/50 bg-amber-950/30 flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-amber-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-100 text-lg">{auction.itemName}</h3>
                      <p className="text-sm text-amber-200/80 line-clamp-2">{auction.itemDescription}</p>
                    </div>
                  </div>

                  {/* Bidding Info */}
                  <div className="bg-amber-950/40 border border-amber-600/30 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-300 flex items-center">
                        <Coins size={14} className="mr-1" /> Current Bid:
                      </span>
                      <span className="text-amber-100 font-bold text-lg">{auction.currentBid} doubloons</span>
                    </div>
                    
                    {auction.highestBidder && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-300 flex items-center">
                          <span className="mr-1">👑</span> Leading Bidder:
                        </span>
                        <span className="text-amber-100 text-sm font-medium">{auction.highestBidder}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-300 flex items-center">
                        <Clock size={14} className="mr-1" /> Time Left:
                      </span>
                      <span className={`text-sm font-bold ${timeInfo.isExpired ? 'text-red-400' : 'text-green-400'}`}>
                        {timeInfo.text}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-300 flex items-center">
                        <span className="mr-1">⚔️</span> Status:
                      </span>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${
                        auction.status === 'active' ? 'text-green-400 bg-green-500/20' : 
                        auction.status === 'ended' ? 'text-red-400 bg-red-500/20' : 'text-gray-400 bg-gray-500/20'
                      }`}>
                        {auction.status === 'active' ? '🏴‍☠️ ACTIVE' : 
                         auction.status === 'ended' ? '💀 ENDED' : '❌ CANCELLED'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded text-black font-medium text-sm border border-amber-500 flex items-center justify-center">
                      <Edit size={14} className="mr-1" />
                      ⚙️ Adjust
                    </button>
                    <button className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium text-sm border border-red-500 flex items-center justify-center">
                      <X size={14} className="mr-1" />
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-amber-200/60">
              <div className="text-8xl mb-6">🏴‍☠️</div>
              <h3 className="text-2xl font-bold text-amber-400 mb-3">Gizbo's Vault is Empty!</h3>
              <p className="text-lg mb-3 text-center">No treasures be ready for auction, matey!</p>
              <p className="text-sm text-center max-w-md mb-4">
                Complete some missions to generate rare loot for Gizbo to tax and redistribute. 
                The best treasures await fair bidding!
              </p>
              <div className="text-center text-amber-300/80">
                <p className="text-sm italic">"Once ye pirates start completin' missions, I'll be taxin' the good stuff for everyone's benefit!"</p>
                <p className="text-sm mt-1 font-bold">- Captain Gizbo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GizboTreasureWindow;