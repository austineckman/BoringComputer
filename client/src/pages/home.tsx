import React from "react";
import { useQuests } from "@/hooks/useQuests";
import { useInventory } from "@/hooks/useInventory";
import { Link } from "wouter";
import PixelButton from "@/components/ui/pixel-button";
import QuestCard from "@/components/quest/QuestCard";
import ResourceItem from "@/components/ui/resource-item";
import { useAuth } from "@/hooks/useAuth";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useAdventureNavigation } from "@/hooks/useAdventureNavigation";
import AdventureImage from "@/components/adventure/AdventureImage";

// Import banner images
import currentQuestBanner from "../assets/current_quest_banner.png";
import inventoryBanner from "../assets/inventory_banner.png";
import forgeBanner from "../assets/forgehero.png";

const Home = () => {
  const { user } = useAuth();
  const { quests, activeQuest, loading: loadingQuests } = useQuests();
  const { inventory, loading: loadingInventory } = useInventory();
  const { sounds, playSoundSafely } = useSoundEffects();
  const { navigateToAdventure, adventureLines } = useAdventureNavigation();

  // Show active quest and a few available quests
  const activeQuests = Array.isArray(quests) ? quests.filter(q => q.status === "active") : [];
  const availableQuests = Array.isArray(quests) ? quests.filter(q => q.status === "available").slice(0, 2) : [];
  const displayQuests = [...activeQuests, ...availableQuests];

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
              <div className="grid grid-cols-3 gap-2 mb-4">
                {inventory.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <ResourceItem type={item.type as any} quantity={item.quantity} size="sm" />
                  </div>
                ))}
              </div>
              <Link href="/inventory">
                <PixelButton 
                  variant="accent" 
                  fullWidth
                  onClick={handleButtonClick}
                  onMouseEnter={handleButtonHover}
                >
                  VIEW ALL
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
      
      {/* Adventure Lines Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-xl text-brand-light">ADVENTURE LINES</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {adventureLines.map((adventure) => (
            <div 
              key={adventure.id}
              className="bg-space-mid rounded-lg overflow-hidden cursor-pointer hover:bg-space-light transition-colors duration-300 pixel-border-sm"
              style={{ 
                boxShadow: `0 0 15px ${adventure.color}22`,
                borderColor: adventure.color
              }}
              onClick={() => navigateToAdventure(adventure.id)}
              onMouseEnter={handleButtonHover}
            >
              {/* Image container */}
              <div className="h-40 w-full overflow-hidden">
                <AdventureImage 
                  adventureId={adventure.id}
                  alt={adventure.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content area */}
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${adventure.color}22`, color: adventure.color }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        adventure.icon === 'rocket' ? 'M13 10V3L4 14h7v7l9-11h-7z' :
                        adventure.icon === 'cogs' ? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' :
                        adventure.icon === 'box' ? 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' :
                        adventure.icon === 'lightbulb' ? 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' :
                        'M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64'
                      } />
                    </svg>
                  </div>
                  <h3 className="font-medium text-brand-light">{adventure.name}</h3>
                </div>
                <div className="mt-2 text-xs text-brand-light/70">
                  {adventure.id === 'lost-in-space' ? 'Survive 30 days stranded in space' :
                   adventure.id === 'cogsworth-city' ? 'Unravel the mysteries of a mechanical metropolis' :
                   adventure.id === 'pandoras-box' ? 'Contain the chaos of an ancient artifact' :
                   adventure.id === 'neon-realm' ? 'Navigate the digital world of light and energy' :
                   'Chart a course through dangerous stellar phenomena'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Available Quests */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-xl text-brand-light">AVAILABLE QUESTS</h2>
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
                <p className="text-brand-light/70">No quests available right now. Check back later!</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
