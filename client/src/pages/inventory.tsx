import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LootBoxItem, LootBoxRewardModal } from '@/components/inventory/LootBox';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface Resource {
  type: string;
  quantity: number;
  lastAcquired?: string;
}

interface LootBox {
  id: number;
  userId: number;
  type: string;
  opened: boolean;
  rewards: { type: string, quantity: number }[];
  source: string;
  sourceId: number;
  createdAt: string;
}

export default function Inventory() {
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [currentRewards, setCurrentRewards] = useState<{type: string, quantity: number}[]>([]);
  
  // Get inventory resources
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: () => fetch('/api/inventory').then(res => res.json()),
  });
  
  // Get loot boxes
  const { data: lootBoxes, isLoading: isLoadingLootBoxes } = useQuery({
    queryKey: ['/api/loot-boxes'],
    queryFn: () => fetch('/api/loot-boxes').then(res => res.json()),
  });
  
  // Get inventory history
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/inventory/history'],
    queryFn: () => fetch('/api/inventory/history').then(res => res.json()),
  });
  
  const handleLootBoxOpen = (lootBox: LootBox, rewards: {type: string, quantity: number}[]) => {
    sounds.questComplete();
    setCurrentRewards(rewards);
    setIsRewardModalOpen(true);
  };
  
  const closeRewardModal = () => {
    sounds.click();
    setIsRewardModalOpen(false);
  };
  
  // Group resources by category
  const groupedResources = {
    basicMaterials: [] as Resource[],
    advancedMaterials: [] as Resource[],
    specialMaterials: [] as Resource[],
  };
  
  if (resources) {
    resources.forEach((resource: Resource) => {
      if (['cloth', 'metal'].includes(resource.type)) {
        groupedResources.basicMaterials.push(resource);
      } else if (['tech-scrap', 'circuit-board'].includes(resource.type)) {
        groupedResources.advancedMaterials.push(resource);
      } else {
        groupedResources.specialMaterials.push(resource);
      }
    });
  }
  
  // Group loot boxes by type (opened/unopened)
  const groupedLootBoxes = {
    unopened: [] as LootBox[],
    opened: [] as LootBox[],
  };
  
  if (lootBoxes) {
    lootBoxes.forEach((lootBox: LootBox) => {
      if (lootBox.opened) {
        groupedLootBoxes.opened.push(lootBox);
      } else {
        groupedLootBoxes.unopened.push(lootBox);
      }
    });
  }
  
  // Sort tabs to show unopened first
  groupedLootBoxes.unopened.sort((a, b) => {
    const typeOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    return (typeOrder[a.type as keyof typeof typeOrder] || 999) - (typeOrder[b.type as keyof typeof typeOrder] || 999);
  });
  
  if (isLoadingResources || isLoadingLootBoxes || isLoadingHistory) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Inventory</h1>
        
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger 
              value="resources" 
              className="text-lg py-3"
              onClick={() => sounds.hover()}
            >
              Resources
            </TabsTrigger>
            <TabsTrigger 
              value="loot-boxes" 
              className="text-lg py-3"
              onClick={() => sounds.hover()}
            >
              Loot Boxes
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-lg py-3"
              onClick={() => sounds.hover()}
            >
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Resources Tab */}
          <TabsContent value="resources" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Basic Materials</h3>
                <ul className="space-y-3">
                  {groupedResources.basicMaterials.map((resource) => (
                    <li key={resource.type} className="flex justify-between items-center">
                      <span className="capitalize">{resource.type}</span>
                      <span className="text-lg font-medium">{resource.quantity}</span>
                    </li>
                  ))}
                  {groupedResources.basicMaterials.length === 0 && (
                    <li className="text-sm text-muted-foreground">No basic materials yet.</li>
                  )}
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Advanced Materials</h3>
                <ul className="space-y-3">
                  {groupedResources.advancedMaterials.map((resource) => (
                    <li key={resource.type} className="flex justify-between items-center">
                      <span className="capitalize">{resource.type.replace('-', ' ')}</span>
                      <span className="text-lg font-medium">{resource.quantity}</span>
                    </li>
                  ))}
                  {groupedResources.advancedMaterials.length === 0 && (
                    <li className="text-sm text-muted-foreground">No advanced materials yet.</li>
                  )}
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Special Materials</h3>
                <ul className="space-y-3">
                  {groupedResources.specialMaterials.map((resource) => (
                    <li key={resource.type} className="flex justify-between items-center">
                      <span className="capitalize">{resource.type.replace('-', ' ')}</span>
                      <span className="text-lg font-medium">{resource.quantity}</span>
                    </li>
                  ))}
                  {groupedResources.specialMaterials.length === 0 && (
                    <li className="text-sm text-muted-foreground">No special materials yet.</li>
                  )}
                </ul>
              </Card>
            </div>
          </TabsContent>
          
          {/* Loot Boxes Tab */}
          <TabsContent value="loot-boxes" className="w-full">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Unopened Loot Boxes</h3>
              {groupedLootBoxes.unopened.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {groupedLootBoxes.unopened.map((lootBox) => (
                    <LootBoxItem 
                      key={lootBox.id} 
                      lootBox={lootBox}
                      onOpen={handleLootBoxOpen}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-4 text-center">
                  <p className="text-muted-foreground">No unopened loot boxes. Complete quests to earn more!</p>
                </Card>
              )}
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4">Opened Loot Boxes</h3>
              {groupedLootBoxes.opened.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {groupedLootBoxes.opened.map((lootBox) => (
                    <LootBoxItem 
                      key={lootBox.id} 
                      lootBox={lootBox}
                      onOpen={handleLootBoxOpen}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-4 text-center">
                  <p className="text-muted-foreground">No opened loot boxes yet.</p>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="w-full">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Resource History</h3>
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry: any, index: number) => (
                    <div key={index} className="p-3 border rounded-md flex justify-between items-center">
                      <div>
                        <span className={`font-medium capitalize ${entry.action === 'gained' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.action === 'gained' ? '+' : '-'}{entry.quantity} {entry.type.replace('-', ' ')}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          from {entry.source}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No resource history yet.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Loot Box Rewards Modal */}
        <LootBoxRewardModal 
          isOpen={isRewardModalOpen}
          onClose={closeRewardModal}
          rewards={currentRewards}
        />
      </div>
    </MainLayout>
  );
}