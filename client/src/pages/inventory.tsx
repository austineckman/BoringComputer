import React, { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import InventoryItem from "@/components/inventory/InventoryItem";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Inventory = () => {
  const { inventory, history, loading, totalItems } = useInventory();
  const { playSound } = useSoundEffects();
  const [activeTab, setActiveTab] = useState("all");
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    playSound("click");
  };
  
  const filteredInventory = inventory.filter(item => {
    if (activeTab === "all") return true;
    
    // Map tabs to resource types
    if (activeTab === "materials") {
      return ["cloth", "metal"].includes(item.type);
    } else if (activeTab === "circuits") {
      return ["tech-scrap", "circuit-board"].includes(item.type);
    } else if (activeTab === "special") {
      return ["sensor-crystal", "alchemy-ink"].includes(item.type);
    }
    
    return false;
  });
  
  return (
    <div>
      <section className="mb-12">
        <div className="bg-space-mid rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-brand-orange mb-2">INVENTORY</h1>
              <p className="text-brand-light/80 mb-4">Manage your resources collected from quests</p>
            </div>
            
            <div className="text-sm text-brand-light/70">
              <span>Total Items: </span>
              <span className="text-brand-orange font-bold">{totalItems}</span>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-brand-orange/10 blur-3xl"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-brand-yellow/10 blur-3xl"></div>
        </div>
      </section>
      
      {/* Inventory Container */}
      <section className="mb-16">
        <div className="bg-space-mid rounded-lg p-6 pixel-border">
          <div className="mb-4 overflow-x-auto">
            <div className="flex space-x-4 pb-2">
              <Button
                onClick={() => handleTabClick("all")}
                className={activeTab === "all" 
                  ? "bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30" 
                  : "bg-transparent hover:bg-space-light text-brand-light"
                }
                variant="ghost"
              >
                All Items
              </Button>
              <Button
                onClick={() => handleTabClick("materials")}
                className={activeTab === "materials" 
                  ? "bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30" 
                  : "bg-transparent hover:bg-space-light text-brand-light"
                }
                variant="ghost"
              >
                Materials
              </Button>
              <Button
                onClick={() => handleTabClick("circuits")}
                className={activeTab === "circuits" 
                  ? "bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30" 
                  : "bg-transparent hover:bg-space-light text-brand-light"
                }
                variant="ghost"
              >
                Circuits
              </Button>
              <Button
                onClick={() => handleTabClick("special")}
                className={activeTab === "special" 
                  ? "bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30" 
                  : "bg-transparent hover:bg-space-light text-brand-light"
                }
                variant="ghost"
              >
                Special
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Inventory Grid */}
              <div className="inventory-grid mb-8">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item, index) => (
                    <InventoryItem
                      key={index}
                      type={item.type}
                      quantity={item.quantity}
                      lastAcquired={item.lastAcquired}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex justify-center py-10 text-brand-light/50">
                    No items found in this category
                  </div>
                )}
              </div>
              
              {/* Inventory History */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Recent Acquisitions</h3>
                <div className="bg-space-dark rounded-lg p-4">
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.slice(0, 5).map((entry, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <i className={`fas fa-${entry.action === 'gained' ? 'plus-circle text-green-400' : 'minus-circle text-red-400'} mr-2`}></i>
                            <span>
                              {entry.action === 'gained' ? 'Gained' : 'Used'} {entry.quantity}x {entry.type.replace('-', ' ')}
                              {entry.source && ` (${entry.source})`}
                            </span>
                          </div>
                          <div className="text-brand-light/50 text-xs">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-brand-light/50">
                      No history available
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Inventory;
