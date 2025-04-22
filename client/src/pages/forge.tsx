import React, { useState, useEffect } from "react";
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
import { Sparkles, Flame, Wrench } from "lucide-react";

// Import Gizbo's image
import gizboImg from '../assets/gizbo.png';

const ForgeQuotes = [
  "Oho! I haven't seen that combo since the Great Servo Fry of '93!",
  "More scrap! MORE SCRAP! The forge hungers!",
  "Don't mind the raccoon, it's my QA department!",
  "If you smell smoke, you're doing it right!",
  "Hmm, needs more heat and a dash of... KABOOM!",
  "Assistant! Stop chewing on the customer's materials!",
  "That's a fine choice! Or terrible. We'll find out when it explodes!",
  "Only the curious walk out with treasure!",
  "Where the broken becomes brilliant!",
  "I'll forge this with my special technique - controlled chaos!",
  "Every item tells a story... this one's a comedy!",
  "Fine crafting requires three things: heat, hammers, and haphazard hope!",
  "Ah, that component? Found it in a crashed pod from the Neon Realm!"
];

const Forge = () => {
  const { craftableItems, craftedItems, loading, craftItem, canCraftItem } = useCrafting();
  const { totalItems } = useInventory();
  const { sounds } = useSoundEffects();
  const [activeTab, setActiveTab] = useState("all");
  const [showCraftedItems, setShowCraftedItems] = useState(false);
  const [gizboQuote, setGizboQuote] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    sounds.click?.();
  };
  
  const filteredCraftables = craftableItems.filter(item => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });
  
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * ForgeQuotes.length);
    return ForgeQuotes[randomIndex];
  };
  
  const handleCraft = (itemId: string) => {
    // Display a Gizbo quote
    setGizboQuote(getRandomQuote());
    setShowQuote(true);
    
    // Play forge sound
    sounds.success?.();
    
    // Start crafting
    craftItem(itemId);
    
    // Hide quote after 4 seconds
    setTimeout(() => {
      setShowQuote(false);
      sounds.fanfare?.();
    }, 4000);
  };
  
  return (
    <div>
      {/* Gizbo Welcome Banner */}
      <section className="mb-8">
        <div className="bg-space-dark rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="md:order-1 order-2">
              <h1 className="font-pixel text-2xl md:text-3xl text-brand-orange mb-3">GIZBO'S FORGE</h1>
              <p className="text-brand-light/80 text-lg">
                <span className="text-brand-yellow font-semibold">"Where the broken becomes brilliant!"</span>
              </p>
              <p className="text-brand-light/80 mt-3">
                Welcome to the cluttered wonder-cave of master engineer Gizbo, the ogre craftsman.
              </p>
            </div>
            <div className="md:order-2 order-1 flex justify-center md:justify-end">
              <img 
                src={gizboImg} 
                alt="Gizbo the Ogre Craftsman" 
                className="h-auto w-full max-w-md rounded-lg shadow-lg border-2 border-brand-orange/30"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-brand-orange/30 flex items-center justify-center mr-4 border-2 border-brand-orange/50">
                <Flame className="w-8 h-8 text-brand-orange" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button 
                onClick={() => {
                  setShowCraftedItems(true);
                  sounds.click?.();
                }}
                variant="outline"
                className="text-brand-light border-brand-orange/30 hover:bg-brand-orange/10"
              >
                Crafting History
              </Button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-brand-orange/10 blur-3xl"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-brand-yellow/10 blur-3xl"></div>
        </div>
      </section>
      
      {/* Gizbo's Character Section */}
      <section className="mb-8">
        <div className="bg-space-mid rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-brand-orange/20 border-3 border-brand-orange/50 overflow-hidden flex items-center justify-center shadow-lg">
                <img 
                  src={gizboImg} 
                  alt="Gizbo the Master Craftsman" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-brand-orange text-space-darkest rounded-full w-12 h-12 flex items-center justify-center border-2 border-space-darkest shadow-md">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-pixel text-xl text-brand-yellow">Gizbo the Master Craftsman</h3>
              <p className="text-brand-light/80 mt-3">
                A wide-bellied, oil-stained ogre with soot on his sleeves and a monocle made from a magnifying 
                lens and an old servo mount. Once a master engineer in the Clockwork Wars, Gizbo now runs the 
                Forge — a place where sparks fly, cogs grind, and steam hisses from copper pipes.
              </p>
              
              {/* Gizbo's current quote - shown when crafting */}
              {showQuote && (
                <div className="mt-4 bg-space-dark p-4 rounded-lg border border-brand-orange/30 relative">
                  <div className="absolute -top-2 left-4 w-4 h-4 bg-space-dark border-t border-l border-brand-orange/30 transform rotate-45"></div>
                  <p className="text-brand-orange italic text-lg">"{gizboQuote}"</p>
                  <div className="mt-1 text-xs text-brand-light/50">- Gizbo</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Forge Crafting Section */}
      <section>
        <div className="bg-space-mid rounded-lg p-6 pixel-border mb-8">
          <div className="flex items-center mb-6">
            <Sparkles className="text-brand-yellow mr-2" />
            <p className="text-sm text-brand-light/80">
              Combine your hard-earned materials to forge wonders both digital and physical. But beware - as Gizbo says, "If you smell smoke, you're doing it right!"
            </p>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-space-dark mb-6">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
                onClick={() => handleTabClick("all")}
              >
                All Blueprints
              </TabsTrigger>
              <TabsTrigger 
                value="physical" 
                className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
                onClick={() => handleTabClick("physical")}
              >
                Physical Marvels
              </TabsTrigger>
              <TabsTrigger 
                value="digital" 
                className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
                onClick={() => handleTabClick("digital")}
              >
                Digital Wonders
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
                      onCraft={() => handleCraft(item.id)}
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
                      onCraft={() => handleCraft(item.id)}
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
                      onCraft={() => handleCraft(item.id)}
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
            <DialogTitle className="font-pixel text-brand-orange">GIZBO'S CREATIONS</DialogTitle>
            <DialogDescription>
              Marvels you've forged with Gizbo and their current status
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {craftedItems.length === 0 ? (
              <div className="text-center py-6 text-brand-light/50">
                <p>You haven't forged any items with Gizbo yet</p>
                <p className="text-xs mt-2 italic">"Even the mightiest forges start with a single spark!" - Gizbo</p>
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
                          Forged on {new Date(item.dateCrafted).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">{item.type === 'physical' ? 'Being delivered by Gizbo\'s assistant' : 'Digital enhancement'}</span>
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
                sounds.click?.();
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

export default Forge;