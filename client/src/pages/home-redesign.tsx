import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import QuestCard from "@/components/quest-card";
import PixelButton from "@/components/ui/pixel-button";
import { useSound } from "@/context/SoundContext";
import { motion } from "framer-motion";

// Import assets
import currentQuestBanner from "@assets/current_quest_banner.png";
import inventoryBanner from "@assets/inventory_banner.png";
import forgeBanner from "@assets/forgehero.png";
import goldBagIcon from "@assets/506_Gold_Bag_Leather_B.png";
import nebulaBg from "@assets/neon-realm-pixelart.png";
import cogsworthImg from "@assets/cogsworth-pixelart.png";
import pandoraImg from "@assets/pandora-pixelart.png";
import wallBg from "@assets/wallbg.png";
import characterImg from "@assets/basecharacter.png";

const HomeRedesign: React.FC = () => {
  const { data: quests = { questsByAdventureLine: {}, questsByKit: {} }, isLoading: loadingQuests } = useQuery({
    queryKey: ["/api/quests"],
  });
  
  const { data: kits = [], isLoading: loadingKits } = useQuery({
    queryKey: ["/api/kits"],
  });
  
  const { data: inventory = [], isLoading: loadingInventory } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // Current active quest (would be from user's progress)
  const activeQuests = Object.values(quests.questsByAdventureLine || {})
    .flat()
    .filter((quest: any) => quest.status === "active");
  
  const activeQuest = activeQuests.length > 0 ? activeQuests[0] : null;
  
  // Adventure Lines (for map)
  const adventureLines = Object.keys(quests.questsByAdventureLine || {});
  const [hoveredAdventure, setHoveredAdventure] = useState<string | null>(null);
  const [selectedAdventure, setSelectedAdventure] = useState<string | null>(null);
  
  // Sounds
  const { sounds } = useSound();
  
  // Sound effects
  const handleButtonClick = () => {
    sounds?.click?.();
  };
  
  const handleButtonHover = () => {
    sounds?.hover?.();
  };
  
  const handleMapLocationHover = (adventureLine: string) => {
    setHoveredAdventure(adventureLine);
    sounds?.hover?.();
  };
  
  const handleMapLocationClick = (adventureLine: string) => {
    setSelectedAdventure(selectedAdventure === adventureLine ? null : adventureLine);
    sounds?.click?.();
  };
  
  // Get user level (mock data for now, would come from user profile)
  const userLevel = 3;
  
  // Get available quests for the selected adventure
  const availableQuests = selectedAdventure
    ? (quests.questsByAdventureLine[selectedAdventure] || [])
    : [];

  // Adventure line positions on the map (relative positions)
  const adventurePositions: Record<string, { x: number; y: number; color: string }> = {
    "30 Days Lost in Space": { x: 65, y: 25, color: "bg-purple-500" },
    "Cogsworth City": { x: 30, y: 70, color: "bg-amber-500" },
    "Neon Realm": { x: 80, y: 60, color: "bg-cyan-500" },
    "Pandora's Workshop": { x: 15, y: 40, color: "bg-green-500" },
    // Add more adventure lines with their positions
  };
  
  // Adventure icons (using existing assets or generic ones)
  const adventureIcons: Record<string, string> = {
    "30 Days Lost in Space": nebulaBg,
    "Cogsworth City": cogsworthImg,
    "Neon Realm": nebulaBg,
    "Pandora's Workshop": pandoraImg,
    // Add more adventure lines with their icons
  };

  return (
    <div className="space-y-8">
      {/* Interactive Quest Map Section */}
      <section className="mb-8">
        <div className="bg-space-dark rounded-lg overflow-hidden pixel-border relative">
          {/* Background with subtle animation */}
          <div 
            className="absolute inset-0 bg-space-dark z-0"
            style={{
              backgroundImage: `url(${wallBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.3
            }}
          >
            {/* Star field animation layer */}
            <div className="absolute inset-0 star-field-animation"></div>
          </div>
          
          {/* Character position indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <img 
                src={characterImg} 
                alt="Your character" 
                className="h-16 w-16 object-contain pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Pulsing beacon effect */}
              <div className="absolute inset-0 rounded-full animate-ping bg-brand-orange/30"></div>
              <div className="absolute inset-0 rounded-full animate-pulse bg-brand-orange/20"></div>
            </div>
          </div>
          
          {/* Map content */}
          <div className="relative z-10 p-8 min-h-[500px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="font-pixel text-2xl text-brand-orange mb-2">QUEST MAP</h1>
                <p className="text-brand-light/80">
                  {selectedAdventure 
                    ? `Exploring ${selectedAdventure} - ${availableQuests.length} quests available`
                    : "Select an adventure zone to begin your journey"}
                </p>
              </div>
              
              {/* User stats quick view */}
              <div className="bg-space-mid p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-brand-orange/20 flex items-center justify-center">
                    <span className="text-brand-orange font-pixel text-lg">{userLevel}</span>
                  </div>
                  <div>
                    <div className="text-xs text-brand-light/60 mb-1">XP Progress</div>
                    <div className="h-2 bg-space-dark rounded-full w-32 overflow-hidden">
                      <div className="h-full bg-brand-orange" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map with interactive zones */}
            <div className="relative w-full h-[400px]">
              {/* Adventure Line Locations */}
              {adventureLines.map((adventureLine) => {
                const position = adventurePositions[adventureLine] || { x: 50, y: 50, color: "bg-gray-500" };
                const isHovered = hoveredAdventure === adventureLine;
                const isSelected = selectedAdventure === adventureLine;
                const icon = adventureIcons[adventureLine];
                
                return (
                  <motion.div
                    key={adventureLine}
                    className="absolute cursor-pointer z-10"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleMapLocationClick(adventureLine)}
                    onMouseEnter={() => handleMapLocationHover(adventureLine)}
                    onMouseLeave={() => setHoveredAdventure(null)}
                  >
                    {/* Location indicator */}
                    <div className={`relative ${isSelected ? 'scale-125' : ''}`}>
                      {/* Icon */}
                      <div 
                        className={`h-16 w-16 rounded-full ${position.color} p-1 flex items-center justify-center border-2 ${isHovered || isSelected ? 'border-brand-yellow' : 'border-brand-light/30'}`}
                      >
                        {icon ? (
                          <img 
                            src={icon} 
                            alt={adventureLine} 
                            className="h-12 w-12 object-cover pixelated rounded-full"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-space-dark flex items-center justify-center text-brand-light">
                            {adventureLine.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      {/* Pulsing effect for hovered/selected */}
                      {(isHovered || isSelected) && (
                        <div className="absolute inset-0 rounded-full animate-ping-slow" style={{ 
                          background: `radial-gradient(circle, ${isSelected ? '#FFC149' : '#F97316'}33 0%, transparent 70%)` 
                        }}></div>
                      )}
                      
                      {/* Location name tooltip */}
                      <div 
                        className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-space-dark px-2 py-1 rounded text-xs whitespace-nowrap transition-opacity ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}`}
                      >
                        {adventureLine}
                      </div>
                      
                      {/* Available quest count */}
                      {(quests.questsByAdventureLine[adventureLine] || []).length > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-orange text-space-dark text-xs flex items-center justify-center font-bold">
                          {(quests.questsByAdventureLine[adventureLine] || []).length}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Connection lines between locations */}
              <svg className="absolute inset-0 w-full h-full z-0">
                <line 
                  x1={`${adventurePositions["30 Days Lost in Space"]?.x || 0}%`} 
                  y1={`${adventurePositions["30 Days Lost in Space"]?.y || 0}%`} 
                  x2={`${adventurePositions["Cogsworth City"]?.x || 0}%`} 
                  y2={`${adventurePositions["Cogsworth City"]?.y || 0}%`} 
                  stroke="#374151" 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
                />
                <line 
                  x1={`${adventurePositions["Cogsworth City"]?.x || 0}%`} 
                  y1={`${adventurePositions["Cogsworth City"]?.y || 0}%`} 
                  x2={`${adventurePositions["Neon Realm"]?.x || 0}%`} 
                  y2={`${adventurePositions["Neon Realm"]?.y || 0}%`} 
                  stroke="#374151" 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
                />
                <line 
                  x1={`${adventurePositions["Neon Realm"]?.x || 0}%`} 
                  y1={`${adventurePositions["Neon Realm"]?.y || 0}%`} 
                  x2={`${adventurePositions["Pandora's Workshop"]?.x || 0}%`} 
                  y2={`${adventurePositions["Pandora's Workshop"]?.y || 0}%`} 
                  stroke="#374151" 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
                />
                <line 
                  x1={`${adventurePositions["Pandora's Workshop"]?.x || 0}%`} 
                  y1={`${adventurePositions["Pandora's Workshop"]?.y || 0}%`} 
                  x2={`${adventurePositions["30 Days Lost in Space"]?.x || 0}%`} 
                  y2={`${adventurePositions["30 Days Lost in Space"]?.y || 0}%`} 
                  stroke="#374151" 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
                />
              </svg>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center mt-6 space-x-4">
              {activeQuest ? (
                <Link href={`/quests/${activeQuest.id}`}>
                  <PixelButton
                    onClick={handleButtonClick}
                    onMouseEnter={handleButtonHover}
                    className="animate-pulse-subtle"
                  >
                    CONTINUE ACTIVE QUEST
                  </PixelButton>
                </Link>
              ) : (
                <Link href="/quests">
                  <PixelButton
                    onClick={handleButtonClick}
                    onMouseEnter={handleButtonHover}
                  >
                    BROWSE ALL QUESTS
                  </PixelButton>
                </Link>
              )}
              
              <Link href="/inventory">
                <PixelButton
                  variant="secondary"
                  onClick={handleButtonClick}
                  onMouseEnter={handleButtonHover}
                >
                  INVENTORY ({inventory.length})
                </PixelButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Selected Adventure Quests (shown when a location is clicked) */}
      {selectedAdventure && (
        <section className="mb-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pixel text-xl text-brand-orange">
              {selectedAdventure} QUESTS
            </h2>
            <button
              className="text-brand-light/60 hover:text-brand-light text-sm"
              onClick={() => {
                setSelectedAdventure(null);
                handleButtonClick();
              }}
              onMouseEnter={handleButtonHover}
            >
              ← Back to map
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuests.length > 0 ? (
              availableQuests.map((quest: any) => (
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
                <p className="text-brand-light/70 mb-2">No quests available in this zone yet.</p>
                <p className="text-sm text-brand-orange">Check back later or select another zone!</p>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Quick Access Section */}
      {!selectedAdventure && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <Link href={`/quests/${activeQuest.id}`}>
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
                    {/* Display first 4 inventory items as icons */}
                    {inventory.slice(0, 4).map((item: any, index: number) => (
                      <div key={index} className="w-8 h-8 rounded-full flex items-center justify-center bg-space-light">
                        {item.icon ? (
                          <img 
                            src={item.icon} 
                            alt={item.id} 
                            className="w-6 h-6 object-contain pixelated"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center text-xs">
                            {item.id.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
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
      )}
    </div>
  );
};

export default HomeRedesign;