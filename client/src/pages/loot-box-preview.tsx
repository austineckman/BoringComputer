import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Package, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Rarity styles for visual appeal
const rarityStyles = {
  common: 'bg-slate-200 text-slate-700 border-slate-300',
  uncommon: 'bg-green-100 text-green-700 border-green-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300',
};

// Animation classes for the items
const rarityAnimations = {
  common: 'animate-pulse',
  uncommon: 'animate-pulse',
  rare: 'animate-bounce',
  epic: 'animate-bounce',
  legendary: 'animate-ping',
};

export default function LootBoxPreview() {
  const [, params] = useRoute('/loot-box-preview/:id');
  const [, setLocation] = useLocation();
  const [isOpening, setIsOpening] = useState(false);
  const [openedRewards, setOpenedRewards] = useState<Array<{type: string, quantity: number}> | null>(null);

  // Get the loot box ID from the route params
  const lootBoxId = params?.id ? parseInt(params.id) : undefined;

  // Fetch loot box details
  const { data: lootBox, isLoading: isLoadingLootBox } = useQuery({
    queryKey: ['/api/loot-boxes', lootBoxId],
    queryFn: async () => {
      const response = await apiRequest(`/api/loot-boxes/${lootBoxId}`);
      return await response.json();
    },
    enabled: !!lootBoxId,
    onSuccess: (data) => console.log("Successfully loaded loot box data:", data),
    onError: (error) => console.error("Error loading loot box data:", error)
  });

  // Fetch all items for displaying names
  const { data: items } = useQuery({
    queryKey: ['/api/admin/items'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/items');
      return await response.json();
    }
  });

  // Calculate drop chances based on weights
  const calculateDropChance = (weight: number, totalWeight: number) => {
    if (!totalWeight) return 0;
    return ((weight / totalWeight) * 100).toFixed(1);
  };

  // Get the total weight of all items
  const getTotalWeight = (dropTable: Array<{itemId: string, weight: number}>) => {
    if (!dropTable || !Array.isArray(dropTable)) return 0;
    return dropTable.reduce((sum, item) => sum + (item.weight || 0), 0);
  };

  // Get item name from ID
  const getItemName = (itemId: string) => {
    if (!items) return itemId;
    const item = items.find((i: any) => i.id === itemId);
    return item ? item.name : itemId;
  };

  // Handle opening the loot box
  const handleOpenLootBox = async () => {
    if (!lootBoxId) return;

    setIsOpening(true);
    
    try {
      const response = await apiRequest(`/api/loot-boxes/${lootBoxId}/open`, 'POST');
      const data = await response.json();

      if (data.success) {
        setOpenedRewards(data.rewards);
        toast({
          title: "Loot Box Opened!",
          description: "Check out your new items!",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to open loot box",
          variant: "destructive"
        });
        setLocation('/inventory');
      }
    } catch (error) {
      console.error('Error opening loot box:', error);
      toast({
        title: "Error",
        description: "Something went wrong while opening the loot box",
        variant: "destructive"
      });
      setLocation('/inventory');
    } finally {
      setIsOpening(false);
    }
  };

  // Handle returning to inventory
  const handleBackToInventory = () => {
    setLocation('/inventory');
  };

  // If loot box is not found, return to inventory
  useEffect(() => {
    if (!isLoadingLootBox && !lootBox) {
      toast({
        title: "Error",
        description: "Loot box not found",
        variant: "destructive"
      });
      setLocation('/inventory');
    }
  }, [isLoadingLootBox, lootBox, setLocation]);

  // Loading state
  if (isLoadingLootBox) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  // If we've opened the loot box, show the rewards
  if (openedRewards) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Loot Box Opened!
        </h1>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <Package size={64} className="text-brand-orange mb-4" />
          <p className="text-xl mb-4">You received the following items:</p>
          
          <div className="w-full max-w-md">
            <Card className="p-6 bg-black/30 border border-brand-orange/30">
              <ul className="space-y-4">
                {openedRewards.map((reward, index) => (
                  <li 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-md bg-black/20 border border-brand-orange/20"
                  >
                    <span className="font-medium">{getItemName(reward.type)}</span>
                    <span className="px-2 py-1 rounded-full bg-brand-orange/20 text-brand-orange">
                      x{reward.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={handleBackToInventory} className="px-8">
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  // Regular display for loot box preview
  if (!lootBox) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">
          <p>Loot box not found.</p>
          <Button onClick={handleBackToInventory} className="mt-4">
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }
  
  // For debugging purposes
  console.log('Loot box data:', lootBox);
  
  // Get data from either the config or fallback to the loot box data
  const config = lootBox.config;
  
  // If no config exists, we won't show an error anymore, just display with default values
  // Instead of returning early, we'll use the fallback values below

  // Extract data with fallbacks in case config is missing
  const { name, description, image, rarity, type } = lootBox;
  
  // If no config, provide default values
  const itemDropTable = config?.itemDropTable || [];
  const minRewards = config?.minRewards || 1;
  const maxRewards = config?.maxRewards || 3;
  const totalWeight = getTotalWeight(itemDropTable);

  return (
    <div className="container max-w-4xl py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={handleBackToInventory}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </Button>
      </div>
      
      {/* Loot Box Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className={`p-4 rounded-lg border-2 ${rarityStyles[rarity as keyof typeof rarityStyles] || rarityStyles.common}`}>
            <img 
              src={image || '/images/loot-crate.png'} 
              alt={name} 
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${rarityStyles[rarity as keyof typeof rarityStyles] || rarityStyles.common}`}>
              {rarity?.charAt(0).toUpperCase() + rarity?.slice(1)}
            </span>
          </div>
          
          <p className="text-gray-300 mb-4">{description}</p>
          
          <div className="bg-black/20 rounded-md p-4 border border-brand-orange/20">
            <p className="font-medium">About this loot box:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
              <li>You will receive {minRewards === maxRewards ? minRewards : `${minRewards}-${maxRewards}`} items</li>
              <li>Contains {itemDropTable?.length || 0} potential items</li>
              <li>Rarity: {rarity?.charAt(0).toUpperCase() + rarity?.slice(1)}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Potential Rewards Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Potential Rewards</h2>
        
        <Card className="overflow-hidden border-brand-orange/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Drop Chance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(itemDropTable) && itemDropTable.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{getItemName(item.itemId)}</TableCell>
                  <TableCell className="text-right">
                    {item.minQuantity === item.maxQuantity 
                      ? item.minQuantity 
                      : `${item.minQuantity}-${item.maxQuantity}`}
                  </TableCell>
                  <TableCell className="text-right">{calculateDropChance(item.weight, totalWeight)}%</TableCell>
                </TableRow>
              ))}
              
              {(!itemDropTable || !itemDropTable.length) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    No item data available for this loot box.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBackToInventory}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={handleOpenLootBox}
          disabled={isOpening}
          className="relative group overflow-hidden"
        >
          {isOpening ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              <span className="relative z-10">Open Loot Box</span>
              <span className="absolute inset-0 bg-brand-orange/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}