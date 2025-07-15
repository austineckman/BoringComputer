import React, { useState, useEffect } from 'react';
import { 
  X, Search, FilterX, Filter, ChevronRight, ChevronLeft, 
  Clock, Award, Cpu, Loader2, AlertCircle, Package, Gift, 
  ArrowLeft, Play, Check, ExternalLink, Code, Video
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useComponentKits } from '../../hooks/useComponentKits';
import { useQuests, type Quest } from '../../hooks/useQuests';
import { useItems } from '../../hooks/useItems';
import { useLootBoxConfigs, getLootBoxConfigById, getRarityColorClass } from '../../hooks/useLootBoxConfigs';
import questImage from '@assets/01_Fire_Grimoire.png';
import wallbg from '@assets/wallbg.png';
import defaultLootboxImage from '@assets/goldcrate.png';
import ActiveQuestScreen from './ActiveQuestScreen';

// For sounds
declare global {
  interface Window {
    sounds?: {
      click: () => void;
      hover: () => void;
      success: () => void;
      error: () => void;
      reward: () => void;
    };
  }
}

interface FullscreenQuestsAppProps {
  onClose: () => void;
}

const FullscreenQuestsApp: React.FC<FullscreenQuestsAppProps> = ({ onClose }) => {
  const [, navigate] = useLocation();
  const { kits, loading: loadingKits } = useComponentKits();
  const { questsByAdventureLine, allQuests, loading: loadingQuests, error: questsError } = useQuests();
  const { items, loading: loadingItems } = useItems();
  const { lootBoxConfigs, lootBoxConfigsMap, isLoading: loadingLootBoxConfigs } = useLootBoxConfigs();
  
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debug logs for lootbox configs only once on initial load
  useEffect(() => {
    if (!loadingLootBoxConfigs && lootBoxConfigs.length > 0) {
      console.log('Lootbox configs loaded:', lootBoxConfigs.length);
      console.log('Lootbox configs map size:', Object.keys(lootBoxConfigsMap).length);
    }
  }, [loadingLootBoxConfigs, lootBoxConfigs.length]);
  const [selectedAdventureLine, setSelectedAdventureLine] = useState<string | null>(null);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [questView, setQuestView] = useState<'list' | 'detail' | 'active'>('list');
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  
  // Initialize filtered quests when allQuests changes
  // Combined effect that only runs when filters or data changes
  useEffect(() => {
    if (!allQuests || allQuests.length === 0) {
      setFilteredQuests([]);
      return;
    }
    
    let filtered = [...allQuests];
    
    // Filter by selected kit
    if (selectedKit) {
      filtered = filtered.filter(quest => {
        // First check if the quest directly belongs to this kit
        if (quest.kitId === selectedKit) {
          return true;
        }
        
        // Check if any component from this kit is required for the quest
        const components = quest.componentRequirements || [];
        if (components.length > 0) {
          for (const comp of components) {
            if (comp && comp.kitId === selectedKit) {
              return true;
            }
          }
        }
        
        return false;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(query) || 
        quest.description.toLowerCase().includes(query) ||
        (quest.missionBrief && quest.missionBrief.toLowerCase().includes(query))
      );
    }
    
    // Filter by adventure line
    if (selectedAdventureLine) {
      filtered = filtered.filter(quest => quest.adventureLine === selectedAdventureLine);
    }
    
    setFilteredQuests(filtered);
  }, [selectedKit, searchQuery, selectedAdventureLine, allQuests]);

  const handleKitSelect = (kitId: string) => {
    // Play sound effect if available
    window.sounds?.click();
    
    // Toggle the kit selection
    setSelectedKit(prev => prev === kitId ? null : kitId);
  };

  const handleQuestClick = (questId: string) => {
    // Play sound effect if available
    window.sounds?.click();
    
    // Find the quest by ID and set it as the selected quest
    const quest = allQuests?.find(q => q.id === questId);
    if (quest) {
      setSelectedQuest(quest);
      setQuestView('detail');
    }
  };

  const clearFilters = () => {
    // Play sound effect if available
    window.sounds?.click();
    
    setSelectedKit(null);
    setSearchQuery('');
    setSelectedAdventureLine(null);
  };

  const renderQuestsByAdventureLine = () => {
    // Sort adventure lines with null check
    const adventureLines = questsByAdventureLine ? Object.keys(questsByAdventureLine).sort() : [];
    
    // If filtered quests is empty, show a message
    if (filteredQuests.length === 0 && !loadingQuests) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-space-dark/60 rounded-lg border border-brand-orange/30">
          <FilterX className="h-12 w-12 text-brand-orange mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">No Quests Found</h3>
          <p className="text-gray-300 text-center mb-4">
            No quests match your current filters.
          </p>
          <button 
            className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange/80 transition-colors"
            onClick={clearFilters}
            onMouseEnter={() => window.sounds?.hover()}
          >
            Clear Filters
          </button>
        </div>
      );
    }

    // Display all quests grouped by adventure line
    if (!selectedAdventureLine) {
      return adventureLines.map(line => {
        // Get quests for this adventure line that also pass the filters
        const lineQuests = filteredQuests.filter(q => q.adventureLine === line);
        
        // Skip if no quests in this line pass the filters
        if (lineQuests.length === 0) return null;
        
        // Find the kit for this adventure line
        const firstQuestInLine = lineQuests[0];
        const questKit = firstQuestInLine?.kitId ? kits?.find(k => k.id === firstQuestInLine.kitId) : null;

        return (
          <div key={line} className="mb-8">
            {/* Component Kit Image Section */}
            {questKit?.image && (
              <div className="mb-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg overflow-hidden shadow-lg">
                <div className="p-6">
                  <div className="flex items-center justify-center">
                    <img 
                      src={questKit.image} 
                      alt={`${questKit.name} Component Kit`}
                      className="max-w-full h-auto max-h-64 object-contain rounded-lg shadow-md"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="text-center mt-4">
                    <h3 className="text-lg font-bold text-brand-orange">{questKit.name}</h3>
                    <p className="text-gray-300 text-sm mt-1">{questKit.description}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div 
              className="flex items-center mb-4 cursor-pointer group"
              onClick={() => {
                window.sounds?.click();
                setSelectedAdventureLine(line);
              }}
            >
              <h2 className="text-xl font-bold text-brand-orange">{line}</h2>
              <ChevronRight className="ml-2 h-5 w-5 text-brand-orange group-hover:translate-x-1 transition-transform" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lineQuests.map(quest => renderQuestCard(quest))}
            </div>
          </div>
        );
      });
    }
    
    // Display only quests from the selected adventure line
    const lineQuests = filteredQuests.filter(q => q.adventureLine === selectedAdventureLine);
    
    // Find the kit for the selected adventure line
    const firstQuestInLine = lineQuests[0];
    const selectedKit = firstQuestInLine?.kitId ? kits?.find(k => k.id === firstQuestInLine.kitId) : null;

    return (
      <div>
        {/* Component Kit Image Section for Selected Adventure Line */}
        {selectedKit?.image && (
          <div className="mb-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg overflow-hidden shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-center">
                <img 
                  src={selectedKit.image} 
                  alt={`${selectedKit.name} Component Kit`}
                  className="max-w-full h-auto max-h-64 object-contain rounded-lg shadow-md"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="text-center mt-4">
                <h3 className="text-lg font-bold text-brand-orange">{selectedKit.name}</h3>
                <p className="text-gray-300 text-sm mt-1">{selectedKit.description}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center mb-6">
          <button 
            className="flex items-center text-lg font-bold text-brand-orange hover:underline" 
            onClick={() => {
              window.sounds?.click();
              setSelectedAdventureLine(null);
            }}
          >
            <ChevronRight className="rotate-180 mr-1 h-5 w-5" />
            Back to All Adventures
          </button>
          <h2 className="text-xl font-bold text-brand-orange ml-4">{selectedAdventureLine}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lineQuests.map(quest => renderQuestCard(quest))}
        </div>
      </div>
    );
  };

  const renderQuestCard = (quest: Quest) => {
    // Get the quest image if available
    const questImage = quest.content?.images?.[0];

    return (
      <div 
        key={quest.id} 
        className="flex flex-col p-4 rounded-lg border border-gray-700 bg-space-dark hover:border-brand-orange/60 transition-colors cursor-pointer relative overflow-hidden"
        onClick={() => handleQuestClick(quest.id)}
        onMouseEnter={() => window.sounds?.hover()}
      >
        {/* Background gradient */}
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent opacity-60 z-0"></div>
        
        {/* Status badge - handle status property which might not exist in the database */}
        <div className="absolute top-3 right-3 z-10">
          {(quest as any).status === 'locked' && (
            <span className="bg-red-900/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          )}
          {(quest as any).status === 'available' && (
            <span className="bg-blue-900/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Available
            </span>
          )}
          {(quest as any).status === 'in-progress' && (
            <span className="bg-yellow-700/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              In Progress
            </span>
          )}
          {(quest as any).status === 'completed' && (
            <span className="bg-green-800/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <Award className="w-3 h-3 mr-1" />
              Completed
            </span>
          )}
        </div>
        
        <div className="z-10">
          {/* Show a direct image preview if exists */}
          {questImage && (
            <div className="mb-3 w-full h-32 overflow-hidden rounded-md flex items-center justify-center">
              <img 
                src={questImage} 
                alt={quest.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <h3 className="text-lg font-bold text-white mb-1">{quest.title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2 mb-3">{quest.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">
              Difficulty: {Array(quest.difficulty).fill('★').join('')}
            </span>
            <span className="text-xs text-gray-400 flex items-center">
              <Award className="w-3 h-3 mr-1 text-brand-orange" />
              {quest.xpReward} XP
            </span>
          </div>
          
          {/* Quest rewards */}
          {quest.rewards && quest.rewards.length > 0 && (
            <div className="mt-2 mb-3">
              <h4 className="text-xs uppercase text-gray-400 mb-1 flex items-center">
                <Gift className="w-3 h-3 mr-1 text-green-400" />
                Rewards
              </h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {quest.rewards.map((reward, idx) => {
                  // Try to find the item in the items list to get its image
                  const item = items?.find(i => i.id === reward.id);
                  
                  // Check if this is a lootbox type reward (type = 'lootbox')
                  const isLootbox = reward.type === 'lootbox';
                  // Get lootbox config if available
                  const lootboxConfig = isLootbox ? getLootBoxConfigById(lootBoxConfigsMap, reward.id) : null;
                  
                  return (
                    <div
                      key={`${reward.id}-${idx}`}
                      className="flex items-center px-2 py-1 bg-gray-800/80 rounded-md"
                      title={`${reward.quantity}x ${lootboxConfig?.name || reward.id}`}
                    >
                      {item?.imagePath ? (
                        // Use item image from item database
                        <img 
                          src={item.imagePath} 
                          alt={reward.id} 
                          className="w-8 h-8 mr-1"
                          style={{ objectFit: 'contain', imageRendering: 'pixelated' }}
                        />
                      ) : isLootbox && lootboxConfig?.image ? (
                        // Use lootbox config image for lootbox rewards
                        <img 
                          src={lootboxConfig.image} 
                          alt={lootboxConfig.name} 
                          className="w-8 h-8 mr-1"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : isLootbox ? (
                        // Try to load the image directly using ID patterns from the database
                        <img 
                          src={`/uploads/items/${reward.id}.png`} 
                          alt={reward.id || "Loot Crate"}
                          className="w-8 h-8 mr-1"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            // If image fails to load, try looking for image in lootboxes folder
                            const img = e.currentTarget;
                            img.src = `/uploads/lootboxes/${reward.id}.png`;
                            img.onerror = () => {
                              // Use a real crate image as last resort
                              img.src = '/assets/goldcrate.png';
                            };
                          }}
                        />
                      ) : (
                        // Show a generic box icon if no image found
                        <div className="flex items-center justify-center mr-1 bg-gray-700 rounded p-1">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <span className="text-xs text-gray-300">{reward.quantity}x {reward.id}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Component requirements */}
          {quest.componentRequirements && quest.componentRequirements.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs uppercase text-gray-400 mb-1 flex items-center">
                <Cpu className="w-3 h-3 mr-1" />
                Required Components
              </h4>
              <div className="flex flex-wrap gap-1">
                {quest.componentRequirements.slice(0, 3).map((comp) => (
                  <span 
                    key={comp.id} 
                    className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                    title={comp.description}
                  >
                    {comp.name}
                  </span>
                ))}
                {quest.componentRequirements.length > 3 && (
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                    +{quest.componentRequirements.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render the detailed view of a quest
  const renderQuestDetail = () => {
    if (!selectedQuest) return null;
    
    // Get the quest images if available
    const questImages = selectedQuest.content?.images || [];
    const questVideos = selectedQuest.content?.videos || [];
    const questCodeBlocks = selectedQuest.content?.codeBlocks || [];
    
    return (
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto">
        {/* Back button */}
        <button 
          className="flex items-center text-white hover:text-brand-orange mb-4 bg-gray-900/90 px-4 py-2 rounded-md border border-brand-orange/50 shadow-md"
          onClick={() => {
            window.sounds?.click();
            setQuestView('list');
            setSelectedQuest(null);
          }}
          onMouseEnter={() => window.sounds?.hover()}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Quest List
        </button>
        
        {/* Main quest intro layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left column - Hero Image and Title */}
          <div className="bg-gray-900/80 rounded-lg shadow-lg border border-brand-orange/30 overflow-hidden">
            {/* Hero image */}
            {questImages[0] && (
              <div className="relative">
                <div className="w-full h-80 overflow-hidden">
                  <img 
                    src={questImages[0]} 
                    alt={selectedQuest.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                </div>
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-2">{selectedQuest.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-shadow">
                    <span className="text-brand-orange flex items-center text-lg font-semibold">
                      <Award className="h-6 w-6 mr-1" />
                      {selectedQuest.xpReward} XP
                    </span>
                    <span className="text-yellow-400 text-lg">
                      {Array(selectedQuest.difficulty).fill('★').join('')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quest description */}
            <div className="p-6 bg-gray-800/50">
              <p className="text-lg text-white leading-relaxed">{selectedQuest.description}</p>
            </div>
          </div>
          
          {/* Right column - Mission Brief and Key Info */}
          <div className="space-y-4">
            {/* Mission Brief */}
            {selectedQuest.missionBrief && (
              <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg">
                <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
                  <h2 className="text-xl font-bold text-brand-orange">Mission Brief</h2>
                </div>
                <div className="p-6">
                  <p className="text-white leading-relaxed whitespace-pre-line">{selectedQuest.missionBrief}</p>
                </div>
              </div>
            )}
            
            {/* Adventure Line Info */}
            <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-300 font-semibold">Adventure Line:</span>
                <span className="text-white">{selectedQuest.adventureLine}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-300 font-semibold">Quest Order:</span>
                <span className="text-white">#{selectedQuest.orderInLine}</span>
              </div>
            </div>
            
            {/* RuneScape-style Start Quest Button */}
            <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg p-6">
              <button
                className="w-full py-4 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 border-2 border-orange-400 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-white text-xl tracking-wide"
                onClick={() => {
                  window.sounds?.click();
                  if (selectedQuest) {
                    setActiveQuestId(selectedQuest.id.toString());
                    setQuestView('active');
                  }
                }}
                onMouseEnter={() => window.sounds?.hover()}
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                ⚔️ START QUEST ⚔️
              </button>
            </div>
          </div>
        </div>
        
        {/* Required Components section */}
        {selectedQuest.componentRequirements && selectedQuest.componentRequirements.length > 0 && (
          <div className="mb-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
              <h2 className="text-xl font-bold text-brand-orange flex items-center">
                <Cpu className="h-5 w-5 mr-2" />
                Required Components
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedQuest.componentRequirements.map((component) => (
                  <div 
                    key={component.id}
                    className="bg-gray-800/80 rounded-lg border border-gray-600 hover:border-gray-400 p-4 flex transition-all duration-300"
                  >
                    <div className="mr-4 flex-shrink-0 flex items-center justify-center bg-black/40 p-3 rounded-md">
                      {component.imagePath ? (
                        <img 
                          src={component.imagePath} 
                          alt={component.name}
                          className="w-16 h-16 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <Cpu className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{component.name}</h3>
                      <p className="text-gray-300 text-sm">{component.description}</p>
                      {component.quantity > 1 && (
                        <div className="flex items-center mt-2">
                          <div className="bg-brand-orange/80 text-white text-xs px-2 py-1 rounded-full font-bold">
                            Qty: {component.quantity}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Rewards section */}
        {selectedQuest.rewards && selectedQuest.rewards.length > 0 && (
          <div className="mb-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
              <h2 className="text-xl font-bold text-brand-orange flex items-center">
                <Gift className="h-5 w-5 mr-2" />
                Quest Rewards
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {selectedQuest.rewards.map((reward, idx) => {
                  // Find item details
                  const item = items?.find(i => i.id === reward.id);
                  
                  // Check if this is a lootbox type reward
                  const isLootbox = reward.type === 'lootbox';
                  // Get lootbox config if available
                  const lootboxConfig = isLootbox ? getLootBoxConfigById(lootBoxConfigsMap, reward.id) : null;
                  
                  // Determine rarity class for border color
                  const rarityClass = item?.rarity ? getRarityColorClass(item.rarity) : 'border-gray-600';
                  
                  return (
                    <div 
                      key={`${reward.id}-${idx}`}
                      className={`bg-gray-800/70 rounded-lg border ${rarityClass} p-4 flex flex-col items-center hover:shadow-md hover:border-opacity-100 transition-all duration-300`}
                    >
                      <div className="bg-gradient-to-b from-gray-700/50 to-black/50 p-3 rounded-lg mb-3 flex items-center justify-center">
                        {item?.imagePath ? (
                          // Show item image from database
                          <img 
                            src={item.imagePath} 
                            alt={reward.id}
                            className="w-12 h-12 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : isLootbox && lootboxConfig?.image ? (
                          // Show lootbox image from lootbox config
                          <img 
                            src={lootboxConfig.image} 
                            alt={lootboxConfig.name}
                            className="w-12 h-12 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : isLootbox ? (
                          // For lootboxes without config, look for item with matching ID in items list
                          <img 
                            src={`/uploads/items/${reward.id}.png`} 
                            alt={reward.id || "Loot Crate"}
                            className="w-12 h-12 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              // If image fails to load, try looking for item with this ID
                              const img = e.currentTarget;
                              // Try looking for a default image with this generic type
                              img.src = `/uploads/lootboxes/${reward.id}.png`;
                              img.onerror = () => {
                                // As last resort, use our real crate asset
                                img.src = '/assets/goldcrate.png';
                              };
                            }}
                          />
                        ) : (
                          // Show generic package icon with appropriate styling for non-lootbox items
                          <div className="flex items-center justify-center">
                            <Package className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-center text-sm mb-1 px-1 line-clamp-2">
                        {item?.name || (lootboxConfig ? lootboxConfig.name : reward.id)}
                      </h3>
                      <div className="px-2 py-1 bg-brand-orange/90 rounded-full text-white text-xs font-bold">
                        {reward.quantity}x
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        
        {/* Images gallery */}
        {questImages.length > 1 && (
          <div className="mt-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
              <h2 className="text-xl font-bold text-brand-orange flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Reference Images
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {questImages.slice(1).map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border border-gray-700 bg-black/30 hover:shadow-lg transition-all duration-300 hover:border-gray-500">
                    <img 
                      src={image} 
                      alt={`Quest image ${index + 1}`}
                      className="w-full h-40 object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Videos gallery */}
        {questVideos && questVideos.length > 0 && (
          <div className="mt-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
              <h2 className="text-xl font-bold text-brand-orange flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Tutorial Videos
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questVideos.map((video, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-700 hover:border-gray-500 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video bg-black/70 flex items-center justify-center">
                      {/* Embed video or show placeholder with link */}
                      <a 
                        href={video} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center text-white hover:text-brand-orange transition-colors duration-300"
                      >
                        <div className="w-16 h-16 rounded-full bg-brand-orange/80 flex items-center justify-center mb-3 hover:bg-brand-orange transition-colors duration-300">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex items-center px-4 py-2 bg-black/50 rounded-full">
                          <span>Watch Video</span>
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </div>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Code blocks */}
        {questCodeBlocks && questCodeBlocks.length > 0 && (
          <div className="mt-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
              <h2 className="text-xl font-bold text-brand-orange flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Code Examples
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {questCodeBlocks.map((codeBlock, index) => (
                  <div key={index} className="bg-black rounded-lg border border-gray-700 overflow-hidden">
                    <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <Code className="w-4 h-4 mr-2 text-brand-orange" />
                        <span className="text-gray-300 font-mono text-sm">{codeBlock.language || 'Code'}</span>
                      </div>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm">
                      <code className="font-mono text-gray-100 whitespace-pre-wrap break-words">{codeBlock.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Kit information if available */}
        {selectedQuest.kitId && (
          <div className="mt-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
              <h2 className="text-xl font-bold text-brand-orange flex items-center">
                <Cpu className="h-5 w-5 mr-2" />
                Required Kit
              </h2>
            </div>
            <div className="p-6">
              {kits ? (
                <div>
                  {kits.find(k => k.id === selectedQuest.kitId) ? (
                    <div className="flex items-start bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                      <div className="mr-4 flex-shrink-0 bg-black/40 p-3 rounded-md">
                        {kits.find(k => k.id === selectedQuest.kitId)?.imagePath ? (
                          <img 
                            src={kits.find(k => k.id === selectedQuest.kitId)?.imagePath} 
                            alt={kits.find(k => k.id === selectedQuest.kitId)?.name || 'Kit'}
                            className="w-20 h-20 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div className="flex items-center justify-center p-2">
                            <Cpu className="w-16 h-16 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{kits.find(k => k.id === selectedQuest.kitId)?.name}</h3>
                        <p className="text-gray-300 leading-relaxed">{kits.find(k => k.id === selectedQuest.kitId)?.description}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 p-4 bg-gray-800/40 rounded-lg">Kit information not available</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center p-4 bg-gray-800/40 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand-orange" />
                  <p className="text-gray-300">Loading kit information...</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col bg-black text-white z-50"
      style={{ 
        backgroundImage: `url(${wallbg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Header with title and close button */}
      <div className="bg-black/80 border-b border-brand-orange/30 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={questImage} 
            alt="Quest Book" 
            className="w-8 h-8 mr-3" 
            style={{ imageRendering: 'pixelated' }}
          />
          <h1 className="text-2xl font-bold text-brand-orange">
            {questView === 'detail' && selectedQuest 
              ? `Quest: ${selectedQuest.title}` 
              : 'Quest Center'
            }
          </h1>
        </div>
        <button 
          className="text-white hover:text-brand-orange" 
          onClick={onClose}
          onMouseEnter={() => window.sounds?.hover()}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {questView === 'active' && activeQuestId ? (
          <ActiveQuestScreen
            questId={activeQuestId}
            questData={allQuests?.find(q => q.id.toString() === activeQuestId)}
            onClose={() => {
              setQuestView('list');
              setActiveQuestId(null);
            }}
            onComplete={() => {
              setQuestView('list');
              setActiveQuestId(null);
              // Refresh quest data
              window.location.reload();
            }}
            onAbandon={() => {
              setQuestView('list');
              setActiveQuestId(null);
            }}
          />
        ) : questView === 'list' ? (
          <>
            {/* Sidebar with filters - only show in list view */}
            <div className="w-full md:w-64 bg-space-dark/80 p-4 border-r border-brand-orange/30 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-brand-orange mb-3">Search</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search quests..."
                    className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md pl-9 focus:border-brand-orange focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-brand-orange">Component Kits</h2>
                  {selectedKit && (
                    <button 
                      className="text-xs text-gray-400 hover:text-white"
                      onClick={() => setSelectedKit(null)}
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {loadingKits ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
                  </div>
                ) : kits && kits.length > 0 ? (
                  <div className="space-y-2">
                    {kits.map(kit => (
                      <div 
                        key={kit.id}
                        className={`
                          flex items-center p-2 rounded-md cursor-pointer transition-colors
                          ${selectedKit === kit.id 
                            ? 'bg-brand-orange/20 border border-brand-orange/50' 
                            : 'hover:bg-space-mid border border-transparent'
                          }
                        `}
                        onClick={() => handleKitSelect(kit.id)}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        {kit.imagePath ? (
                          <img 
                            src={kit.imagePath} 
                            alt={kit.name} 
                            className="w-8 h-8 mr-2 rounded" 
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="w-8 h-8 mr-2 rounded bg-space-mid flex items-center justify-center">
                            <Cpu className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{kit.name}</p>
                          <p className="text-xs text-gray-400 truncate">{kit.difficulty || kit.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No component kits available.</p>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-brand-orange">Adventure Lines</h2>
                  {selectedAdventureLine && (
                    <button 
                      className="text-xs text-gray-400 hover:text-white"
                      onClick={() => setSelectedAdventureLine(null)}
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="space-y-1">
                  {Object.keys(questsByAdventureLine || {}).map(line => (
                    <div 
                      key={line}
                      className={`
                        px-3 py-2 rounded-md cursor-pointer transition-colors
                        ${selectedAdventureLine === line 
                          ? 'bg-brand-orange/20 text-white' 
                          : 'text-gray-300 hover:bg-space-mid'
                        }
                      `}
                      onClick={() => {
                        window.sounds?.click();
                        setSelectedAdventureLine(prev => prev === line ? null : line);
                      }}
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Active filters indicator and reset button */}
              {(selectedKit || selectedAdventureLine || searchQuery) && (
                <div className="mt-auto pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-400">
                      <Filter className="h-4 w-4 mr-1" />
                      Active Filters
                    </div>
                    <button
                      className="text-xs text-brand-orange hover:text-brand-orange/80 font-medium"
                      onClick={clearFilters}
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      Reset All
                    </button>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedKit && (
                      <div className="flex items-center text-xs bg-brand-orange/20 text-white px-2 py-1 rounded-full">
                        Kit: {kits.find(k => k.id === selectedKit)?.name || 'Selected Kit'}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.sounds?.click();
                            setSelectedKit(null);
                          }}
                        />
                      </div>
                    )}
                    {selectedAdventureLine && (
                      <div className="flex items-center text-xs bg-brand-orange/20 text-white px-2 py-1 rounded-full">
                        Line: {selectedAdventureLine}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.sounds?.click();
                            setSelectedAdventureLine(null);
                          }}
                        />
                      </div>
                    )}
                    {searchQuery && (
                      <div className="flex items-center text-xs bg-brand-orange/20 text-white px-2 py-1 rounded-full">
                        Search: {searchQuery}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.sounds?.click();
                            setSearchQuery('');
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quest list */}
            <div className="flex-1 overflow-y-auto p-4 bg-black/70">
              {loadingQuests ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
                  <p className="text-brand-orange">Loading quests...</p>
                </div>
              ) : questsError ? (
                <div className="flex flex-col items-center justify-center h-full bg-black/20 rounded-lg border border-red-500/50 p-8">
                  <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Quests</h3>
                  <p className="text-gray-300 text-center mb-6">
                    Unable to load quests from the server. Please make sure you're logged in and try again.
                  </p>
                  <div className="text-sm text-gray-400 bg-black/50 p-3 rounded mb-4 max-w-md overflow-auto">
                    {questsError instanceof Error ? questsError.message : "Unknown error"}
                  </div>
                  <button 
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/80 text-white rounded-md"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                renderQuestsByAdventureLine()
              )}
            </div>
          </>
        ) : (
          /* Render quest detail view */
          renderQuestDetail()
        )}
      </div>
      
      {/* Bottom notice about returning to desktop */}
      <div className="p-3 bg-black/80 border-t border-brand-orange/30 text-center text-xs text-gray-400">
        Press ESC or click the X button to return to desktop
      </div>
    </div>
  );
};

export default FullscreenQuestsApp;