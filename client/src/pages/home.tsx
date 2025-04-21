import React from "react";
import { useQuests } from "@/hooks/useQuests";
import { useInventory } from "@/hooks/useInventory";
import { Link } from "wouter";
import PixelButton from "@/components/ui/pixel-button";
import QuestCard from "@/components/quest/QuestCard";
import ResourceItem from "@/components/ui/resource-item";
import { useAuth } from "@/hooks/useAuth";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Home = () => {
  const { user } = useAuth();
  const { quests, activeQuest, loading: loadingQuests } = useQuests();
  const { inventory, loading: loadingInventory } = useInventory();
  const { playSound } = useSoundEffects();

  // Show active quest and a few available quests
  const activeQuests = quests.filter(q => q.status === "active");
  const availableQuests = quests.filter(q => q.status === "available").slice(0, 2);
  const displayQuests = [...activeQuests, ...availableQuests];

  // Get ship status
  const powerLevel = Math.floor(Math.random() * 30) + 70; // 70-100%
  const securityLevel = Math.floor(Math.random() * 60) + 40; // 40-100%
  const communicationsLevel = Math.floor(Math.random() * 40) + 60; // 60-100%

  const handleButtonClick = () => {
    playSound("click");
  };

  const handleButtonHover = () => {
    playSound("hover");
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
          <h2 className="font-pixel text-lg text-brand-light mb-4">CURRENT QUEST</h2>
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
          <h2 className="font-pixel text-lg text-brand-light mb-4">INVENTORY</h2>
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
          <h2 className="font-pixel text-lg text-brand-light mb-4">WORKSHOP</h2>
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
      
      {/* Available Quests */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-xl text-brand-light">AVAILABLE QUESTS</h2>
          <Link href="/quests">
            <a 
              className="text-brand-orange hover:text-brand-yellow text-sm font-bold"
              onClick={handleButtonClick}
              onMouseEnter={handleButtonHover}
            >
              View All
            </a>
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
                  kitRequired={quest.kitRequired}
                  difficulty={quest.difficulty}
                  rewards={quest.rewards}
                  status={quest.status}
                  adventureKit={quest.adventureKit}
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
