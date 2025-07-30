import React, { useState, useEffect } from 'react';
import { Clock, Coins, Timer, User, Gavel, Star } from 'lucide-react';

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
  const [selectedAuction, setSelectedAuction] = useState<AuctionListing | null>(null);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [userGold, setUserGold] = useState<number>(0);

  // Create mock auctions from real game items for demonstration
  const createMockAuctions = (gameItems: GameItem[]): AuctionListing[] => {
    if (gameItems.length === 0) return [];
    
    const mockAuctions: AuctionListing[] = [];
    const selectedItems = gameItems.slice(0, 6); // Take first 6 items
    
    selectedItems.forEach((item, index) => {
      const basePrice = item.rarity === 'legendary' ? 50000 : 
                       item.rarity === 'epic' ? 25000 : 
                       item.rarity === 'rare' ? 10000 : 
                       item.rarity === 'uncommon' ? 5000 : 1000;
      
      const currentBid = basePrice + (Math.random() * basePrice * 0.5);
      
      mockAuctions.push({
        id: `auction-${index + 1}`,
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        itemImagePath: item.imagePath,
        itemRarity: item.rarity,
        startingBid: basePrice,
        currentBid: Math.floor(currentBid),
        bidIncrement: Math.floor(basePrice * 0.1),
        expiresAt: new Date(Date.now() + (Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
        status: 'active',
        highestBidder: Math.random() > 0.5 ? 'Anonymous Player' : undefined,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    
    return mockAuctions;
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch items and user data
        const [itemsRes, userRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/auth/me')
        ]);

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData);
          // Create mock auctions from real items
          const mockAuctions = createMockAuctions(itemsData);
          setAuctions(mockAuctions);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserGold(userData.inventory?.gold || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle auction selection
  const selectAuction = (auction: AuctionListing) => {
    setSelectedAuction(auction);
    const item = items.find(i => i.id === auction.itemId);
    setSelectedItem(item || null);
    setBidAmount((auction.currentBid + auction.bidIncrement).toString());
  };

  // Format time remaining
  const formatTimeLeft = (expiresAt: string): { text: string; color: string } => {
    const timeLeft = new Date(expiresAt).getTime() - Date.now();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (timeLeft <= 0) return { text: 'Ended', color: 'text-red-400' };
    if (hours < 1) return { text: `${minutes}m`, color: 'text-orange-400' };
    if (hours < 6) return { text: `${hours}h ${minutes}m`, color: 'text-yellow-400' };
    return { text: `${hours}h`, color: 'text-green-400' };
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-orange-400 border-orange-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'uncommon': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  // Handle bidding
  const handleBid = async () => {
    if (!selectedAuction || !bidAmount) return;
    
    const bid = parseInt(bidAmount);
    if (bid <= selectedAuction.currentBid || bid > userGold) return;
    
    // For now, just update the UI (in real implementation, this would call an API)
    setSelectedAuction(prev => prev ? { ...prev, currentBid: bid, highestBidder: 'You' } : null);
    setAuctions(prev => prev.map(a => a.id === selectedAuction.id ? { ...a, currentBid: bid, highestBidder: 'You' } : a));
    setUserGold(prev => prev - bid + selectedAuction.currentBid); // Simplified bidding logic
  };

  if (loading) {
    return (
      <div className="bg-gray-900 text-white w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto mb-4 animate-spin" size={32} />
          <p>Loading Black Market Auction House...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-orange-400">Black Market Auction House</h1>
            <p className="text-sm text-gray-400">Rare items from across the dimensions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/images/gold-coin.png" 
                alt="Gold"
                className="w-5 h-5"
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="text-yellow-400 font-bold">{userGold.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Auction List */}
        <div className="w-2/3 border-r border-gray-700 flex flex-col">
          {/* Table Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-3">
            <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-300">
              <div className="col-span-4">Name</div>
              <div className="col-span-1 text-center">Lvl</div>
              <div className="col-span-2 text-center">Type</div>
              <div className="col-span-2 text-center">Time Left</div>
              <div className="col-span-2 text-center">Seller</div>
              <div className="col-span-1 text-center">Current Bid</div>
            </div>
          </div>

          {/* Auction Items */}
          <div className="flex-1 overflow-y-auto">
            {auctions.map((auction) => {
              const timeLeft = formatTimeLeft(auction.expiresAt);
              const isSelected = selectedAuction?.id === auction.id;
              
              return (
                <div
                  key={auction.id}
                  className={`grid grid-cols-12 gap-2 p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
                    isSelected ? 'bg-yellow-900/30 border-yellow-600' : ''
                  }`}
                  onClick={() => selectAuction(auction)}
                >
                  <div className="col-span-4 flex items-center gap-2">
                    {auction.itemImagePath ? (
                      <img
                        src={auction.itemImagePath}
                        alt={auction.itemName}
                        className="w-8 h-8 object-contain rounded border border-gray-600"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                        <Star size={16} className="text-gray-400" />
                      </div>
                    )}
                    <span className={`font-medium ${getRarityColor(auction.itemRarity).split(' ')[0]}`}>
                      {auction.itemName}
                    </span>
                  </div>
                  <div className="col-span-1 text-center text-sm">-</div>
                  <div className="col-span-2 text-center text-sm capitalize">{auction.itemRarity}</div>
                  <div className={`col-span-2 text-center text-sm ${timeLeft.color}`}>{timeLeft.text}</div>
                  <div className="col-span-2 text-center text-sm">{auction.highestBidder || 'No bids'}</div>
                  <div className="col-span-1 text-center text-sm text-yellow-400 font-bold">
                    {auction.currentBid.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Item Details & Bidding */}
        <div className="w-1/3 flex flex-col">
          {selectedItem && selectedAuction ? (
            <>
              {/* Item Details */}
              <div className="bg-gray-800 p-4 border-b border-gray-700">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-orange-400 mb-2">Hot Item!</h3>
                  {selectedItem.imagePath ? (
                    <img
                      src={selectedItem.imagePath}
                      alt={selectedItem.name}
                      className="w-24 h-24 object-contain mx-auto mb-3 rounded border-2 border-gray-600"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded border-2 border-gray-600 flex items-center justify-center mx-auto mb-3">
                      <Star size={32} className="text-gray-400" />
                    </div>
                  )}
                  <h4 className={`text-xl font-bold ${getRarityColor(selectedItem.rarity).split(' ')[0]}`}>
                    {selectedItem.name}
                  </h4>
                  <p className="text-sm text-gray-400 mt-2">{selectedItem.description}</p>
                </div>
              </div>

              {/* Bidding Section */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Seller: {selectedAuction.highestBidder || 'Anonymous'}</div>
                  <div className="text-sm text-gray-400 mb-2">
                    Time Left: <span className={formatTimeLeft(selectedAuction.expiresAt).color}>
                      {formatTimeLeft(selectedAuction.expiresAt).text}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-yellow-400 mb-4">
                    Current Bid: {selectedAuction.currentBid.toLocaleString()} 
                    <img 
                      src="/images/gold-coin.png" 
                      alt="Gold"
                      className="inline w-4 h-4 ml-1"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </div>

                {/* Bid Input */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Your Bid:</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={selectedAuction.currentBid + selectedAuction.bidIncrement}
                      max={userGold}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-400 focus:outline-none"
                      placeholder={`Min: ${(selectedAuction.currentBid + selectedAuction.bidIncrement).toLocaleString()}`}
                    />
                  </div>
                  
                  <button
                    onClick={handleBid}
                    disabled={!bidAmount || parseInt(bidAmount) <= selectedAuction.currentBid || parseInt(bidAmount) > userGold}
                    className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Gavel size={16} />
                    Place Bid
                  </button>

                  <div className="text-xs text-gray-500 text-center">
                    Minimum increment: {selectedAuction.bidIncrement.toLocaleString()} gold
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Gavel size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select an auction to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMAHWindow;