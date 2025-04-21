import React, { useState } from "react";
import { useCrafting } from "@/hooks/useCrafting";
import { useInventory } from "@/hooks/useInventory";
import CraftingRecipe from "@/components/crafting/CraftingRecipe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Workshop = () => {
  const { craftableItems, craftedItems, loading, craftItem, canCraftItem } = useCrafting();
  const { totalItems } = useInventory();
  const { playSound } = useSoundEffects();
  const [activeTab, setActiveTab] = useState("all");
  const [showCraftedItems, setShowCraftedItems] = useState(false);
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    playSound("click");
  };
  
  const filteredCraftables = craftableItems.filter(item => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });
  
  return (
    <div>
      <section className="mb-12">
        <div className="bg-space-mid rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-brand-orange mb-2">GUILD WORKSHOP</h1>
              <p className="text-brand-light/80 mb-4">
                Use resources from your inventory to craft physical and digital rewards
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-brand-light/70">
                <span>Items Available: </span>
                <span className="text-brand-orange font-bold">{craftableItems.length}</span>
              </div>
              
              <Button 
                onClick={() => {
                  setShowCraftedItems(true);
                  playSound("click");
                }}
                variant="outline"
                className="text-brand-light border-brand-orange/30 hover:bg-brand-orange/10"
              >
                History
              </Button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-brand-orange/10 blur-3xl"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-brand-yellow/10 blur-3xl"></div>
        </div>
      </section>
      
      {/* Workshop Content */}
      <section>
        <div className="bg-space-mid rounded-lg p-6 pixel-border mb-8">
          <p className="text-sm text-brand-light/70 mb-6">
            Use the resources you've earned to craft both digital upgrades and physical items that will be shipped to you!
          </p>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-space-dark mb-6">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
                onClick={() => handleTabClick("all")}
              >
                All Items
              </TabsTrigger>
              <TabsTrigger 
                value="physical" 
                className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
                onClick={() => handleTabClick("physical")}
              >
                Physical Rewards
              </TabsTrigger>
              <TabsTrigger 
                value="digital" 
                className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
                onClick={() => handleTabClick("digital")}
              >
                Digital Upgrades
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCraftables.map((item) => (
                    <CraftingRecipe
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      imageUrl={item.image}
                      requirements={item.recipe}
                      type={item.type}
                      onCraft={() => craftItem(item.id)}
                      canCraft={canCraftItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="physical" className="mt-0">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCraftables.filter(item => item.type === "physical").map((item) => (
                    <CraftingRecipe
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      imageUrl={item.image}
                      requirements={item.recipe}
                      type={item.type}
                      onCraft={() => craftItem(item.id)}
                      canCraft={canCraftItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="digital" className="mt-0">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCraftables.filter(item => item.type === "digital").map((item) => (
                    <CraftingRecipe
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      imageUrl={item.image}
                      requirements={item.recipe}
                      type={item.type}
                      onCraft={() => craftItem(item.id)}
                      canCraft={canCraftItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Crafted Items Dialog */}
      <Dialog open={showCraftedItems} onOpenChange={setShowCraftedItems}>
        <DialogContent className="bg-space-dark border-brand-orange/30">
          <DialogHeader>
            <DialogTitle className="font-pixel text-brand-orange">CRAFTING HISTORY</DialogTitle>
            <DialogDescription>
              Items you've crafted and their current status
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {craftedItems.length === 0 ? (
              <div className="text-center py-6 text-brand-light/50">
                You haven't crafted any items yet
              </div>
            ) : (
              <div className="space-y-4">
                {craftedItems.map((item) => (
                  <div key={item.id} className="bg-space-mid p-4 rounded-lg">
                    <div className="flex items-center gap-4 mb-2">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-xs text-brand-light/70">
                          Crafted on {new Date(item.dateCrafted).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">{item.type === 'physical' ? 'Ships to you' : 'Digital unlock'}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        item.status === 'shipped' ? 'bg-blue-500/20 text-blue-300' :
                        item.status === 'delivered' || item.status === 'unlocked' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    
                    {item.type === 'physical' && item.tracking && (
                      <div className="mt-2 text-xs text-brand-light/70">
                        Tracking: {item.tracking}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowCraftedItems(false);
                playSound("click");
              }}
              className="bg-brand-orange hover:bg-brand-yellow text-space-darkest"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workshop;
