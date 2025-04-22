import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define interface for loot box data
interface LootBox {
  id: number;
  userId: number;
  type: string; // Changed from tier to type to match backend
  opened: boolean;
  acquiredAt: string;
  rewards?: {
    type: string;
    quantity: number;
  }[];
}

const LootBoxList = () => {
  // Fetch loot boxes for current user
  const { data: lootBoxes, isLoading, error } = useQuery<LootBox[]>({
    queryKey: ["/api/loot-boxes"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4">
        Error loading loot boxes: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!lootBoxes || lootBoxes.length === 0) {
    return (
      <div className="text-brand-light/70 text-center p-10">
        <p>No loot boxes found. Create some using the generator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
      {lootBoxes.map((lootBox) => (
        <Card key={lootBox.id} className="bg-space-dark border-brand-orange/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getTierColor(lootBox.type)}`}></div>
                <span className="font-pixel text-sm">
                  {lootBox.type.toUpperCase()} BOX #{lootBox.id}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${lootBox.opened ? 'bg-gray-700 text-gray-400' : 'bg-brand-orange/20 text-brand-orange'}`}>
                {lootBox.opened ? 'OPENED' : 'UNOPENED'}
              </span>
            </div>
            
            {lootBox.rewards && lootBox.rewards.length > 0 && (
              <div className="mt-2 pt-2 border-t border-brand-orange/10">
                <p className="text-xs text-brand-light/60 mb-1">Rewards:</p>
                <div className="flex flex-wrap gap-1">
                  {lootBox.rewards.map((reward, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-space-mid px-2 py-0.5 rounded-full"
                    >
                      {reward.quantity}x {reward.type.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-2 text-xs text-brand-light/50">
              Created: {new Date(lootBox.acquiredAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper function to get color based on tier
function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'common':
      return 'bg-green-500';
    case 'uncommon':
      return 'bg-blue-500';
    case 'rare':
      return 'bg-purple-500';
    case 'epic':
      return 'bg-yellow-500';
    case 'legendary':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export default LootBoxList;