import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, X, AlertTriangle, Check } from "lucide-react";

// Define interfaces
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

interface LootBoxConfig {
  id: string;
  name: string;
  description: string;
  rarity: string;
  itemDropTable: {
    itemId: string;
    weight: number;
    minQuantity: number;
    maxQuantity: number;
  }[];
  minRewards: number;
  maxRewards: number;
  image: string;
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
  // State for the selected loot box
  const [selectedLootBox, setSelectedLootBox] = useState<LootBox | null>(null);
  // State for the portal - where the loot box will be placed
  const [lockpickPortal, setLockpickPortal] = useState<LootBox | null>(null);
  // State for rewards after opening a loot box
  const [pickingResults, setPickingResults] = useState<{ success: boolean; message: string; rewards: Reward[] | null }>({
    success: false,
    message: "",
    rewards: null,
  });
  // State for animation
  const [isPickingLock, setIsPickingLock] = useState(false);
  // State for showing results modal
  const [showResults, setShowResults] = useState(false);

  // Fetch user's loot boxes
  const { data: lootBoxes, isLoading: isLoadingLootBoxes, error: lootBoxError } = useQuery({
    queryKey: ["/api/lootboxes/user"],
    queryFn: getQueryFn(),
  });

  // Fetch all items for displaying rewards
  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ["/api/items"],
    queryFn: getQueryFn(),
  });

  // Mutation for opening a loot box
  const openLootBoxMutation = useMutation({
    mutationFn: async (lootBoxId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/lootboxes/${lootBoxId}/open`,
        {}
      );
      return response.json();
    },
    onSuccess: (data) => {
      setPickingResults(data);
      setShowResults(true);
      // Invalidate the loot boxes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/lootboxes/user"] });
      // Invalidate the inventory query to show new items
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });

      // Reset the portal after successful opening
      setLockpickPortal(null);
    },
    onError: (error) => {
      setPickingResults({
        success: false,
        message: `Error opening loot box: ${error.message}`,
        rewards: null,
      });
      setShowResults(true);
    },
    onSettled: () => {
      setIsPickingLock(false);
    },
  });

  // Function to handle loot box selection and placement in the portal
  const handleLootBoxSelect = (lootBox: LootBox) => {
    setSelectedLootBox(lootBox);
    // Automatically place the selected loot box in the portal
    setLockpickPortal(lootBox);
  };

  // Function to remove the loot box from the portal
  const clearPortal = () => {
    setLockpickPortal(null);
  };

  // Function to attempt to pick the lock
  const attemptPickLock = () => {
    if (!lockpickPortal) {
      setPickingResults({
        success: false,
        message: "Please select a loot box first",
        rewards: null,
      });
      setShowResults(true);
      return;
    }

    setIsPickingLock(true);
    openLootBoxMutation.mutate(lockpickPortal.id);
  };

  // Helper function to get item details by ID
  const getItemDetails = (itemId: string): ItemDetails | undefined => {
    return items?.find((item: ItemDetails) => item.id === itemId);
  };

  // Render functions
  const renderLootBoxList = () => {
    if (isLoadingLootBoxes) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (lootBoxError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p>Error loading loot boxes</p>
        </div>
      );
    }

    if (!lootBoxes || lootBoxes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No loot boxes in inventory</p>
        </div>
      );
    }

    // Only show unopened loot boxes
    const unopenedLootBoxes = lootBoxes.filter((box: LootBox) => !box.opened);

    if (unopenedLootBoxes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No unopened loot boxes in inventory</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 overflow-y-auto p-2 h-full">
        {unopenedLootBoxes.map((lootBox: LootBox) => (
          <div
            key={lootBox.id}
            className={`flex flex-col items-center p-2 rounded border cursor-pointer transition-all duration-200 ${
              selectedLootBox?.id === lootBox.id
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary/50"
            }`}
            onClick={() => handleLootBoxSelect(lootBox)}
          >
            <div className="relative w-16 h-16 mb-1">
              <img
                src={lootBox.image || "/placeholder-lootbox.png"}
                alt={lootBox.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs font-medium truncate w-full text-center">{lootBox.name}</span>
            <span className="text-[10px] text-gray-500 capitalize">{lootBox.rarity}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderLockpickPortal = () => {
    return (
      <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 justify-center">
        <h3 className="text-sm font-medium mb-2">Lockpicking Portal</h3>
        {lockpickPortal ? (
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <img
                src={lockpickPortal.image || "/placeholder-lootbox.png"}
                alt={lockpickPortal.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs mt-1">{lockpickPortal.name}</span>
            <button
              onClick={clearPortal}
              className="text-[10px] text-red-500 mt-1 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Select a loot box from your inventory
          </p>
        )}
      </div>
    );
  };

  const renderPotentialRewards = () => {
    if (!lockpickPortal) {
      return (
        <div className="border rounded-lg p-4 h-40 overflow-y-auto">
          <h3 className="text-sm font-medium mb-2">Potential Rewards</h3>
          <p className="text-xs text-gray-500">
            Select a loot box to see potential rewards
          </p>
        </div>
      );
    }

    return (
      <div className="border rounded-lg p-4 h-40 overflow-y-auto">
        <h3 className="text-sm font-medium mb-2">Potential Rewards</h3>
        <p className="text-xs mb-2">
          This {lockpickPortal.name} ({lockpickPortal.rarity}) may contain:
        </p>
        <ul className="text-xs space-y-1">
          {lockpickPortal.rarity === "common" && (
            <>
              <li>• Common materials (high chance)</li>
              <li>• Uncommon materials (low chance)</li>
            </>
          )}
          {lockpickPortal.rarity === "uncommon" && (
            <>
              <li>• Common materials (medium chance)</li>
              <li>• Uncommon materials (high chance)</li>
              <li>• Rare materials (low chance)</li>
            </>
          )}
          {lockpickPortal.rarity === "rare" && (
            <>
              <li>• Uncommon materials (medium chance)</li>
              <li>• Rare materials (high chance)</li>
              <li>• Epic materials (low chance)</li>
            </>
          )}
          {lockpickPortal.rarity === "epic" && (
            <>
              <li>• Rare materials (medium chance)</li>
              <li>• Epic materials (high chance)</li>
              <li>• Legendary materials (very low chance)</li>
            </>
          )}
          {lockpickPortal.rarity === "legendary" && (
            <>
              <li>• Epic materials (medium chance)</li>
              <li>• Legendary materials (high chance)</li>
              <li>• Unique items (possible)</li>
            </>
          )}
        </ul>
      </div>
    );
  };

  const renderPickingResults = () => {
    if (!showResults) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background border rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              {pickingResults.success ? "Success!" : "Error"}
            </h3>
            <button onClick={() => setShowResults(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mb-4">{pickingResults.message}</p>

          {pickingResults.success && pickingResults.rewards && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">You received:</h4>
              <div className="grid grid-cols-2 gap-2">
                {pickingResults.rewards.map((reward, index) => {
                  const item = getItemDetails(reward.type);
                  return (
                    <div
                      key={`${reward.type}-${index}`}
                      className="flex items-center p-2 border rounded"
                    >
                      <div className="relative w-10 h-10 mr-2">
                        <img
                          src={item?.imagePath || "/placeholder-item.png"}
                          alt={item?.name || reward.type}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium">
                          {item?.name || reward.type}
                        </p>
                        <p className="text-xs">x{reward.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowResults(false)}
            className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background border rounded-lg shadow-md w-[600px] h-[450px] flex flex-col overflow-hidden">
      {/* Window Header */}
      <div className="bg-slate-800 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/assets/Untitled design - 2025-04-26T171551.402.png"
            alt="PickLock"
            className="w-5 h-5 mr-2"
          />
          <span className="font-bold">PickLock.exe</span>
        </div>
        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Window Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Loot Box Inventory */}
        <div className="w-1/2 border-r p-2 flex flex-col h-full">
          <h2 className="text-sm font-bold mb-2">Your Loot Boxes</h2>
          <div className="flex-1 overflow-hidden">
            {renderLootBoxList()}
          </div>
        </div>

        {/* Right Side - Lockpicking Portal & Potential Rewards */}
        <div className="w-1/2 p-4 flex flex-col h-full">
          {/* Lockpicking Portal */}
          {renderLockpickPortal()}

          {/* Spacer */}
          <div className="h-4"></div>

          {/* Potential Rewards */}
          {renderPotentialRewards()}

          {/* Spacer */}
          <div className="h-4"></div>

          {/* Action Button */}
          <button
            onClick={attemptPickLock}
            disabled={!lockpickPortal || isPickingLock}
            className={`py-2 px-4 rounded text-white ${
              !lockpickPortal || isPickingLock
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isPickingLock ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Picking Lock...</span>
              </div>
            ) : (
              "Attempt Picking Lock"
            )}
          </button>
        </div>
      </div>

      {/* Results Modal */}
      {renderPickingResults()}
    </div>
  );
};

export default LockpickWindow;