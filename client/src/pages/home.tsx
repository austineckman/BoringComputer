import React, { useState } from "react";
import { useQuests } from "@/hooks/useQuests";
import { useInventory } from "@/hooks/useInventory";
import { useComponentKits } from "@/hooks/useComponentKits";
import { Link } from "wouter";
import PixelButton from "@/components/ui/pixel-button";
import QuestCard from "@/components/quest/QuestCard";
import ResourceItem from "@/components/ui/resource-item";
import { useAuth } from "@/hooks/use-auth";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useAdventureNavigation } from "@/hooks/useAdventureNavigation";
import AdventureImage from "@/components/adventure/AdventureImage";
import { themeConfig } from "@/lib/themeConfig";

// Import banner images
import currentQuestBanner from "../assets/current_quest_banner.png";
import inventoryBanner from "../assets/inventory_banner.png";
import forgeBanner from "../assets/forgehero.png";
import goldBagIcon from "../assets/506_Gold_Bag_Leather_B.png";

const Home = () => {
  const { user } = useAuth();
  const { quests, activeQuest, loading: loadingQuests } = useQuests();
  const { inventory, loading: loadingInventory } = useInventory();
  const { kits, loading: loadingKits } = useComponentKits();
  const { sounds, playSoundSafely } = useSoundEffects();
  const { navigateToAdventure, adventureLines } = useAdventureNavigation();
  
  // State for selected kit filter
  const [selectedKit, setSelectedKit] = useState<string | null>(null);

  // Show active quest and a few available quests
  const activeQuests = Array.isArray(quests) ? quests.filter(q => q.status === "active") : [];
  const availableQuests = Array.isArray(quests) ? quests.filter(q => q.status === "available") : [];
  
  // Filter quests by selected kit if one is selected
  const filteredQuests = selectedKit 
    ? availableQuests.filter(quest => {
        // Get the selected kit object
        const selectedKitObj = kits.find(kit => kit.id === selectedKit);
        if (!selectedKitObj) return false;
        
        // First approach: Check if any component requirement matches by kit name
        if (quest.componentRequirements && 
            Array.isArray(quest.componentRequirements) && 
            quest.componentRequirements.length > 0 &&
            quest.componentRequirements.some(comp => comp.kitName === selectedKitObj.name)) {
          return true;
        }
        
        // Second approach: Check if quest.adventureLine matches kit name
        // This is useful for quests that are part of a kit series but may not have components defined
        if (quest.adventureLine === selectedKitObj.name) {
          return true;
        }
        
        // Third approach: Check if quest has kitId that matches the selected kit
        if (quest.kitId === selectedKit) {
          return true;
        }
        
        return false;
      })
    : availableQuests;
  
  // Show selected quests or default to showing a few available quests
  const displayQuests = [...activeQuests, ...(selectedKit ? filteredQuests : filteredQuests.slice(0, 2))];

  // Get ship status
  const powerLevel = Math.floor(Math.random() * 30) + 70; // 70-100%
  const securityLevel = Math.floor(Math.random() * 60) + 40; // 40-100%
  const communicationsLevel = Math.floor(Math.random() * 40) + 60; // 60-100%

  const handleButtonClick = () => {
    try {
      sounds.click?.();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
  };

  const handleButtonHover = () => {
    try {
      sounds.hover?.();
    } catch (e) {
      console.warn('Could not play hover sound', e);
    }
  };

  return (
    <div>
      {/* Header Section with Status */}
      <section className="mb-12">
        <div className="bg-space-mid rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="font-pixel text-xl md:text-2xl text-brand-orange mb-2">MISSION CONTROL</h1>
              <p className="text-brand-light/80 mb-4">
                {activeQuest ? `Day ${activeQuests.length}: ${activeQuest.title}` : "Ready for your next mission, cadet?"}
              </p>
              
              {/* Mission Status */}
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-brand-orange/20 text-brand-orange rounded-full text-xs flex items-center">
                  <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse mr-2"></div>
                  Mission {activeQuest ? "Active" : "Ready"}
                </div>
                <div className="px-3 py-1 bg-space-dark text-brand-light/70 rounded-full text-xs">
                  {activeQuest ? "13 days remaining" : "30 days of adventure awaits"}
                </div>
              </div>
            </div>
            
            <div>
              {/* Ship Status Container */}
              <div className="bg-space-dark p-4 rounded-lg w-full md:w-64">
                <h3 className="text-xs uppercase text-brand-light/60 mb-2">Ship Status</h3>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Power Systems</span>
                      <span className="text-green-400">Operational</span>
                    </div>
                    <div className="h-2 bg-space-mid rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${powerLevel}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Security Systems</span>
                      <span className={securityLevel < 50 ? "text-brand-orange" : "text-yellow-400"}>
                        {securityLevel < 50 ? "Compromised" : "Partial"}
                      </span>
                    </div>
                    <div className="h-2 bg-space-mid rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${securityLevel < 50 ? "from-brand-orange to-brand-yellow" : "from-yellow-500 to-yellow-400"}`} 
                        style={{ width: `${securityLevel}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Communications</span>
                      <span className="text-yellow-400">Partial</span>
                    </div>
                    <div className="h-2 bg-space-mid rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400" style={{ width: `${communicationsLevel}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-brand-orange/10 blur-3xl"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-brand-yellow/10 blur-3xl"></div>
        </div>
      </section>
      
      {/* Quick Overview */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Quest Preview */}
        <div className="bg-space-mid rounded-lg p-5 pixel-border">
          <div className="mb-4">
            <img src={currentQuestBanner} alt="Current Quest" className="w-full" />
          </div>
          {loadingQuests ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
            </div>
          ) : activeQuest ? (
            <div>
              <h3 className="font-bold text-brand-orange mb-2">{activeQuest.title}</h3>
              <p className="text-sm text-brand-light/70 mb-4">{activeQuest.description}</p>
              <Link href="/quests">
                <PixelButton
                  onClick={handleButtonClick}
                  onMouseEnter={handleButtonHover}
                >
                  CONTINUE QUEST
                </PixelButton>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-sm text-brand-light/70 mb-4">No active quest. Select a new quest to begin your adventure!</p>
              <Link href="/quests">
                <PixelButton
                  onClick={handleButtonClick}
                  onMouseEnter={handleButtonHover}
                >
                  FIND A QUEST
                </PixelButton>
              </Link>
            </div>
          )}
        </div>
        
        {/* Inventory Preview */}
        <div className="bg-space-mid rounded-lg p-5 pixel-border">
          <div className="mb-4">
            <img src={inventoryBanner} alt="Inventory" className="w-full" />
          </div>
          {loadingInventory ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center mb-4 bg-space-dark rounded-lg p-3">
                <p className="text-brand-light mb-2 text-center">
                  <span className="inline-flex items-center">
                    <img 
                      src={goldBagIcon} 
                      alt="Inventory Bag" 
                      className="w-5 h-5 mr-2 object-contain pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    You have <span className="font-bold text-brand-orange">{inventory.length}</span> items in your inventory
                  </span>
                </p>
                <div className="flex gap-2 justify-center">
                  {/* Simple resource type icons */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500/20 text-orange-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                </div>
              </div>
              <Link href="/inventory">
                <PixelButton 
                  variant="accent" 
                  fullWidth
                  onClick={handleButtonClick}
                  onMouseEnter={handleButtonHover}
                >
                  VIEW INVENTORY
                </PixelButton>
              </Link>
            </div>
          )}
        </div>
        
        {/* Workshop Preview */}
        <div className="bg-space-mid rounded-lg p-5 pixel-border">
          <div className="mb-4">
            <img src={forgeBanner} alt="Gizbo's Forge" className="w-full" />
          </div>
          <p className="text-sm text-brand-light/70 mb-4">Craft items using resources you've earned on your missions.</p>
          <Link href="/workshop">
            <PixelButton 
              variant="secondary" 
              fullWidth
              onClick={handleButtonClick}
              onMouseEnter={handleButtonHover}
            >
              VISIT WORKSHOP
            </PixelButton>
          </Link>
        </div>
      </section>
      
      {/* Component Kits Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-xl text-brand-light">COMPONENT KITS</h2>
          <button
            className={`text-sm ${selectedKit ? 'text-brand-orange hover:text-brand-yellow' : 'text-gray-500'}`}
            onClick={() => {
              if (selectedKit) {
                setSelectedKit(null);
                sounds.click?.();
              }
            }}
            disabled={!selectedKit}
            onMouseEnter={selectedKit ? handleButtonHover : undefined}
          >
            {selectedKit ? 'Clear Filter' : 'No Filter Active'}
          </button>
        </div>
        
        {loadingKits ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
          </div>
        ) : kits && kits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {kits.map((kit) => (
              <div 
                key={kit.id}
                className={`bg-space-mid rounded-lg overflow-hidden cursor-pointer hover:bg-space-light transition-colors duration-300 pixel-border-sm ${selectedKit === kit.id ? 'ring-2 ring-brand-orange' : ''}`}
                onClick={() => {
                  sounds.click?.();
                  setSelectedKit(selectedKit === kit.id ? null : kit.id);
                }}
                onMouseEnter={handleButtonHover}
              >
                {/* Image container */}
                <div className="h-40 w-full overflow-hidden bg-space-dark">
                  {kit.imagePath ? (
                    <img 
                      src={kit.imagePath} 
                      alt={kit.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-space-dark text-brand-light/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Content area */}
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-brand-light truncate">{kit.name}</h3>
                  </div>
                  <div className="mt-2 text-xs text-brand-light/70 line-clamp-2">
                    {kit.description || 'Physical components required for quests'}
                  </div>
                  <div className="mt-3">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-space-dark text-brand-light/60">
                      {kit.difficulty || 'All levels'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-space-dark rounded-lg">
            <p className="text-brand-light/70">No component kits available. Create some in the admin panel.</p>
          </div>
        )}
      </section>
      
      {/* Available Quests */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-xl text-brand-light">
            {selectedKit ? 
              <>
                <span className="text-brand-orange">FILTERED</span> QUESTS
                <span className="ml-2 text-sm font-normal text-brand-light/70">
                  ({filteredQuests.length} {filteredQuests.length === 1 ? 'quest' : 'quests'})
                </span>
              </> : 
              'AVAILABLE QUESTS'
            }
          </h2>
          <Link href="/quests">
            <div
              className="text-brand-orange hover:text-brand-yellow text-sm font-bold cursor-pointer"
              onClick={handleButtonClick}
              onMouseEnter={handleButtonHover}
            >
              View All
            </div>
          </Link>
        </div>
        
        {loadingQuests ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayQuests.length > 0 ? (
              displayQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  id={quest.id}
                  title={quest.title}
                  description={quest.description}
                  adventureLine={quest.adventureLine}
                  difficulty={quest.difficulty}
                  rewards={quest.rewards}
                  status={quest.status}
                  orderInLine={quest.orderInLine}
                  xpReward={quest.xpReward}
                  heroImage={quest.heroImage}
                  content={quest.content}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8 bg-space-dark rounded-lg">
                {selectedKit ? (
                  <div>
                    <p className="text-brand-light/70 mb-2">No quests require this component kit at the moment.</p>
                    <button
                      className="text-brand-orange hover:text-brand-yellow text-sm"
                      onClick={() => {
                        setSelectedKit(null);
                        sounds.click?.();
                      }}
                      onMouseEnter={handleButtonHover}
                    >
                      Clear filter to see all quests
                    </button>
                  </div>
                ) : (
                  <p className="text-brand-light/70">No quests available right now. Check back later!</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
