import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Unlock, Info, Award, Package2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RetroButton from '@/components/retro-ui/RetroButton';
import RetroDivider from '@/components/retro-ui/RetroDivider';
import RetroIcon from '@/components/retro-ui/RetroIcon';
import { apiRequest } from '@/lib/queryClient';

// Types
interface LootBox {
  id: number;
  name: string;
  type: string;
  description: string;
  rarity: string;
  image: string;
  opened: boolean;
  userId: number;
  createdAt: string;
  openedAt: string | null;
}

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

interface Reward {
  type: string;
  quantity: number;
}

interface LockpickWindowProps {
  onClose: () => void;
}

const LockpickWindow: React.FC<LockpickWindowProps> = ({ onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLootBox, setSelectedLootBox] = useState<LootBox | null>(null);
  const [openingBox, setOpeningBox] = useState(false);
  const [rewards, setRewards] = useState<Reward[] | null>(null);
  
  // Fetch lootboxes
  const { data: lootBoxes = [], isLoading: isLoadingLootBoxes, error: lootBoxesError } = useQuery({
    queryKey: ['/api/lootboxes/user'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/lootboxes/user');
      if (!response.ok) {
        throw new Error('Failed to fetch lootboxes');
      }
      return await response.json();
    }
  });
  
  // Fetch items for reward display
  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/items'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      return await response.json();
    }
  });
  
  // Open lootbox mutation
  const openLootBoxMutation = useMutation({
    mutationFn: async (lootBoxId: number) => {
      const response = await apiRequest('POST', `/api/lootboxes/${lootBoxId}/open`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to open lootbox');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      // Show rewards and play sound
      setRewards(data.rewards);
      setOpeningBox(false);
      
      // Play reward sound if available
      const audio = new Audio('/sounds/reward.mp3');
      audio.play().catch(err => console.warn('Could not play sound:', err));
      
      // Refresh lootboxes
      queryClient.invalidateQueries({ queryKey: ['/api/lootboxes/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      toast({
        title: "Lockpick successful!",
        description: `You've successfully opened the ${selectedLootBox?.name}!`,
      });
    },
    onError: (error: Error) => {
      setOpeningBox(false);
      
      // Play error sound if available
      const audio = new Audio('/sounds/error.mp3');
      audio.play().catch(err => console.warn('Could not play sound:', err));
      
      toast({
        title: "Lockpicking failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle lootbox selection
  const handleLootBoxSelect = (lootBox: LootBox) => {
    setSelectedLootBox(lootBox);
    setRewards(null);
  };
  
  // Handle lockpicking (opening the lootbox)
  const handleLockpick = () => {
    if (!selectedLootBox) return;
    
    setOpeningBox(true);
    openLootBoxMutation.mutate(selectedLootBox.id);
  };
  
  // Function to get item details from the items array
  const getItemDetails = (itemId: string) => {
    return items?.find((item: ItemDetails) => item.id === itemId);
  };
  
  // Filter unopened lootboxes
  const unopenedLootBoxes = Array.isArray(lootBoxes) 
    ? lootBoxes.filter((box: LootBox) => !box.opened) 
    : [];
  
  // Render rarity color
  const getRarityColor = (rarity: string) => {
    switch(rarity.toLowerCase()) {
      case 'common': return 'text-gray-200';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      case 'welcome': return 'text-cyan-400';
      case 'quest': return 'text-orange-400';
      case 'event': return 'text-pink-400';
      default: return 'text-gray-200';
    }
  };
  
  return (
    <div className="bg-[#c0c0c0] border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] border-2 p-1 text-black shadow-md min-w-[800px] min-h-[500px] flex flex-col">
      <div className="bg-[#000080] text-white p-1 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <RetroIcon icon={<Unlock className="h-4 w-4" />} />
          <span className="font-bold text-sm">lockpick.exe</span>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-red-800 text-white px-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-2 flex flex-grow">
        {/* Left Panel - Lootbox Inventory */}
        <div className="border-2 border-inset p-2 w-1/3 bg-[#f0f0f0] overflow-y-auto">
          <h3 className="font-bold mb-2 text-sm">Your Lootboxes</h3>
          <RetroDivider />
          
          {isLoadingLootBoxes ? (
            <div className="text-center p-4">Loading...</div>
          ) : lootBoxesError ? (
            <div className="text-center p-4 text-red-600">Error loading lootboxes</div>
          ) : unopenedLootBoxes.length === 0 ? (
            <div className="text-center p-4 text-gray-600">
              <Package2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No unopened lootboxes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unopenedLootBoxes.map((lootBox: LootBox) => (
                <div 
                  key={lootBox.id}
                  onClick={() => handleLootBoxSelect(lootBox)}
                  className={`p-2 border-2 cursor-pointer flex items-center gap-2 ${
                    selectedLootBox?.id === lootBox.id 
                      ? 'bg-[#000080] text-white border-inset' 
                      : 'bg-[#d4d0c8] border-outset hover:bg-[#d0d0d0]'
                  }`}
                >
                  <img 
                    src={lootBox.image || '/placeholder-lootbox.png'} 
                    alt={lootBox.name} 
                    className="w-8 h-8 object-contain"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-sm">{lootBox.name}</div>
                    <div className={`text-xs ${selectedLootBox?.id === lootBox.id ? 'text-gray-200' : getRarityColor(lootBox.rarity)}`}>
                      {lootBox.rarity.charAt(0).toUpperCase() + lootBox.rarity.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col ml-2">
          {/* Top Right - Lockpicking Portal */}
          <div className="border-2 border-inset p-2 bg-[#f0f0f0] mb-2 flex flex-col justify-center items-center h-[250px]">
            {selectedLootBox ? (
              <div className="text-center w-full">
                <img 
                  src={selectedLootBox.image || '/placeholder-lootbox.png'} 
                  alt={selectedLootBox.name}
                  className="w-32 h-32 object-contain mx-auto"
                />
                <h3 className="font-bold mt-2">{selectedLootBox.name}</h3>
                <p className={`text-sm mb-4 ${getRarityColor(selectedLootBox.rarity)}`}>
                  {selectedLootBox.rarity.charAt(0).toUpperCase() + selectedLootBox.rarity.slice(1)}
                </p>
                <p className="text-sm text-gray-700 mb-4">{selectedLootBox.description}</p>
                
                <RetroButton 
                  onClick={handleLockpick}
                  disabled={openingBox}
                  className="mx-auto"
                >
                  {openingBox ? 'Picking Lock...' : 'Attempt Picking Lock'}
                </RetroButton>
              </div>
            ) : (
              <div className="text-center">
                <Package2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Select a lootbox to begin lockpicking</p>
              </div>
            )}
          </div>
          
          {/* Bottom Right - Rewards */}
          <div className="border-2 border-inset p-2 bg-[#f0f0f0] flex-1 overflow-y-auto">
            <div className="flex items-center gap-1 mb-2">
              <Award className="h-4 w-4" />
              <h3 className="font-bold text-sm">Rewards</h3>
            </div>
            <RetroDivider />
            
            {rewards ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
                {rewards.map((reward, index) => {
                  const itemDetails = getItemDetails(reward.type);
                  return (
                    <div key={index} className="border-2 border-outset p-2 bg-[#e8e8e8] text-center">
                      <img 
                        src={itemDetails?.imagePath || '/placeholder-item.png'} 
                        alt={reward.type}
                        className="w-12 h-12 object-contain mx-auto"
                      />
                      <div className="font-bold text-sm mt-1">{itemDetails?.name || reward.type}</div>
                      <div className={`text-xs ${getRarityColor(itemDetails?.rarity || 'common')}`}>
                        {itemDetails?.rarity || 'Common'}
                      </div>
                      <div className="text-xs mt-1">x{reward.quantity}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="text-gray-600">
                  <Info className="h-8 w-8 mx-auto mb-2" />
                  <p>Open a lootbox to see rewards</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockpickWindow;