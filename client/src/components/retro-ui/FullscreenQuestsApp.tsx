import React, { useState } from 'react';
import { X, ArrowLeft, Cpu, BookOpen, Award, Loader2, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuests } from '@/hooks/useQuests';
import { useComponentKits } from '@/hooks/useComponentKits';
import { useItems } from '@/hooks/useItems';
import { useLootBoxConfigs } from '@/hooks/useLootBoxConfigs';
import { Quest } from '@shared/schema';
import wallbg from '@assets/lootroomg.png';
import questImage from '@assets/current_quest_banner.png';
import { Package, Gift } from 'lucide-react';
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
  const { allQuests, loading: loadingQuests, error: questsError } = useQuests();
  const { items, loading: loadingItems } = useItems();
  const { lootBoxConfigs, lootBoxConfigsMap, isLoading: loadingLootBoxConfigs } = useLootBoxConfigs();
  
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [questView, setQuestView] = useState<'kit-select' | 'quest-list' | 'detail' | 'active'>('kit-select');
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  
  // Simple rarity color function
  const getRarityColorClass = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400';
      case 'epic': return 'border-purple-400';
      case 'rare': return 'border-blue-400';
      case 'uncommon': return 'border-green-400';
      case 'common': return 'border-gray-400';
      default: return 'border-gray-600';
    }
  };
  
  // Get quests for selected kit
  const getQuestsForKit = (kitId: string) => {
    if (!allQuests || allQuests.length === 0) return [];
    
    return allQuests.filter(quest => {
      // First check if the quest directly belongs to this kit
      if (quest.kitId === kitId) {
        return true;
      }
      
      // Check if any component from this kit is required for the quest
      const components = quest.componentRequirements || [];
      if (components.length > 0) {
        for (const comp of components) {
          if (comp && comp.kitId === kitId) {
            return true;
          }
        }
      }
      
      return false;
    });
  };

  const handleKitSelect = (kitId: string) => {
    window.sounds?.click();
    setSelectedKit(kitId);
    setQuestView('quest-list');
  };

  const handleQuestClick = (questId: string) => {
    window.sounds?.click();
    const quest = allQuests?.find(q => q.id === questId);
    if (quest) {
      setSelectedQuest(quest);
      setQuestView('detail');
    }
  };

  const renderQuestDetail = () => {
    if (!selectedQuest) return null;
    
    console.log('Quest detail rendering for:', selectedQuest.title);
    console.log('Quest content:', selectedQuest.content);
    console.log('Quest images:', selectedQuest.content?.images);
    
    const questImages = selectedQuest.content?.images || [];
    const heroImage = questImages[0]; // Get the first image as hero image
    
    console.log('Hero image:', heroImage);
    
    return (
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto">
        {/* Back button */}
        <button 
          className="flex items-center text-white hover:text-brand-orange mb-4 bg-gray-900/90 px-4 py-2 rounded-md border border-brand-orange/50 shadow-md"
          onClick={() => {
            window.sounds?.click();
            setQuestView('quest-list');
            setSelectedQuest(null);
          }}
          onMouseEnter={() => window.sounds?.hover()}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Quest List
        </button>
        
        {/* Main quest intro layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left column - Hero Image and Flavor Text */}
          <div className="bg-gray-900/80 rounded-lg shadow-lg border border-brand-orange/30 overflow-hidden">
            {/* Hero image */}
            {heroImage ? (
              <div className="relative">
                <div className="w-full h-64 overflow-hidden">
                  <img 
                    src={heroImage} 
                    alt={selectedQuest.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                </div>
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h1 className="text-2xl font-bold text-white text-shadow mb-2">{selectedQuest.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-shadow">
                    <span className="text-brand-orange flex items-center text-sm font-semibold">
                      <Award className="h-4 w-4 mr-1" />
                      {selectedQuest.xpReward} XP
                    </span>
                    <span className="text-yellow-400 text-sm">
                      {Array(selectedQuest.difficulty).fill('★').join('')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-800/60">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedQuest.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-brand-orange flex items-center text-sm font-semibold">
                    <Award className="h-4 w-4 mr-1" />
                    {selectedQuest.xpReward} XP
                  </span>
                  <span className="text-yellow-400 text-sm">
                    {Array(selectedQuest.difficulty).fill('★').join('')}
                  </span>
                </div>
              </div>
            )}
            
            {/* Flavor text */}
            <div className="p-4 bg-gray-800/50">
              <p className="text-sm text-gray-300 leading-relaxed">{selectedQuest.description}</p>
            </div>
          </div>
          
          {/* Middle column - Mission Brief and Adventure Info */}
          <div className="space-y-4">
            {/* Mission Brief */}
            {selectedQuest.missionBrief && (
              <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg">
                <div className="bg-gray-800/60 px-4 py-3 border-b border-brand-orange/30">
                  <h2 className="text-lg font-bold text-brand-orange">Mission Brief</h2>
                </div>
                <div className="p-4">
                  <p className="text-white text-sm leading-relaxed whitespace-pre-line">{selectedQuest.missionBrief}</p>
                </div>
              </div>
            )}
            
            {/* Adventure Line Info */}
            <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 font-semibold text-sm">Adventure Line:</span>
                <span className="text-white text-sm">{selectedQuest.adventureLine}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-semibold text-sm">Quest Order:</span>
                <span className="text-white text-sm">#{selectedQuest.orderInLine}</span>
              </div>
            </div>
          </div>
          
          {/* Right column - Quest Rewards and Start Button */}
          <div className="space-y-4">
            {/* Quest Rewards */}
            {selectedQuest.rewards && selectedQuest.rewards.length > 0 && (
              <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg">
                <div className="bg-gray-800/60 px-4 py-3 border-b border-brand-orange/30">
                  <h2 className="text-lg font-bold text-brand-orange flex items-center">
                    <Gift className="h-4 w-4 mr-2" />
                    Quest Rewards
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {selectedQuest.rewards.slice(0, 4).map((reward, idx) => {
                      const item = items?.find(i => i.id === reward.id);
                      const isLootbox = reward.type === 'lootbox';
                      const lootboxConfig = isLootbox ? lootBoxConfigsMap[reward.id] : null;
                      const rarityClass = item?.rarity ? getRarityColorClass(item.rarity) : 'border-gray-600';
                      
                      return (
                        <div 
                          key={`${reward.id}-${idx}`}
                          className={`bg-gray-800/70 rounded-lg border ${rarityClass} p-3 flex flex-col items-center transition-all duration-300`}
                        >
                          <div className="bg-gradient-to-b from-gray-700/50 to-black/50 p-2 rounded-lg mb-2 flex items-center justify-center">
                            {item?.imagePath ? (
                              <img 
                                src={item.imagePath} 
                                alt={reward.id}
                                className="w-8 h-8 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : isLootbox && lootboxConfig?.image ? (
                              <img 
                                src={lootboxConfig.image} 
                                alt={lootboxConfig.name}
                                className="w-8 h-8 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <h3 className="text-white font-semibold text-center text-xs mb-1 line-clamp-1">
                            {item?.name || (lootboxConfig ? lootboxConfig.name : reward.id)}
                          </h3>
                          <div className="px-2 py-1 bg-brand-orange/90 rounded-full text-white text-xs font-bold">
                            {reward.quantity}x
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedQuest.rewards.length > 4 && (
                    <div className="mt-2 text-center text-xs text-gray-400">
                      +{selectedQuest.rewards.length - 4} more rewards
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Start Quest Button */}
            <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg p-4">
              <button
                className="w-full py-4 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 border-2 border-orange-400 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-white text-lg tracking-wide"
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
                START QUEST
              </button>
            </div>
          </div>
        </div>
        
        {/* Required Components section */}
        {selectedQuest.componentRequirements && selectedQuest.componentRequirements.length > 0 && (
          <div className="mb-6 bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800/60 px-4 py-3 border-b border-brand-orange/30">
              <h2 className="text-lg font-bold text-brand-orange flex items-center">
                <Cpu className="h-4 w-4 mr-2" />
                Required Components
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedQuest.componentRequirements.map((component) => (
                  <div 
                    key={component.id}
                    className="bg-gray-800/80 rounded-lg border border-gray-600 hover:border-gray-400 p-3 flex flex-col items-center transition-all duration-300"
                  >
                    <div className="mb-3 flex items-center justify-center bg-black/40 p-3 rounded-md">
                      {component.imagePath ? (
                        <img 
                          src={component.imagePath} 
                          alt={component.name}
                          className="w-12 h-12 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <Cpu className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 text-center">
                      <h3 className="text-white font-semibold mb-1 text-sm">{component.name}</h3>
                      <p className="text-gray-300 text-xs line-clamp-2">{component.description}</p>
                      {component.quantity > 1 && (
                        <div className="flex items-center justify-center mt-2">
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
              : questView === 'quest-list' && selectedKit
              ? `${kits?.find(k => k.id === selectedKit)?.name || 'Selected Kit'} Quests`
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
      <div className="flex-1 flex flex-col">
        {questView === 'active' && activeQuestId ? (
          <ActiveQuestScreen
            questId={activeQuestId}
            onClose={() => {
              setQuestView('quest-list');
              setActiveQuestId(null);
            }}
          />
        ) : questView === 'kit-select' ? (
          /* Kit Selection Screen */
          <div className="flex-1 overflow-y-auto p-6 bg-black/70">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Select a Component Kit</h2>
                <p className="text-gray-300">Choose a kit to see available quests and adventures</p>
              </div>
              
              {loadingKits ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
                  <p className="text-brand-orange">Loading kits...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kits?.map(kit => {
                    const kitQuests = getQuestsForKit(kit.id);
                    const questCount = kitQuests.length;
                    
                    return (
                      <div 
                        key={kit.id}
                        className="bg-gray-900/80 rounded-lg border border-brand-orange/30 p-6 hover:border-brand-orange/60 transition-all duration-300 cursor-pointer hover:shadow-lg"
                        onClick={() => handleKitSelect(kit.id)}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-4 p-4 bg-black/40 rounded-lg">
                            {kit.imagePath ? (
                              <img 
                                src={kit.imagePath} 
                                alt={kit.name}
                                className="w-24 h-24 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <Cpu className="w-24 h-24 text-gray-400" />
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{kit.name}</h3>
                          <p className="text-gray-300 text-sm mb-4 line-clamp-3">{kit.description}</p>
                          <div className="flex items-center justify-center space-x-4 text-sm">
                            <div className="flex items-center text-brand-orange">
                              <BookOpen className="h-4 w-4 mr-1" />
                              <span>{questCount} Quest{questCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : questView === 'quest-list' ? (
          /* Quest List for Selected Kit */
          <div className="flex-1 flex flex-col">
            {/* Breadcrumb and back button */}
            <div className="bg-black/80 border-b border-brand-orange/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button 
                    className="flex items-center text-white hover:text-brand-orange"
                    onClick={() => {
                      window.sounds?.click();
                      setQuestView('kit-select');
                      setSelectedKit(null);
                    }}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Kits
                  </button>
                  <span className="text-gray-400">•</span>
                  <span className="text-white font-semibold">
                    {kits?.find(k => k.id === selectedKit)?.name || 'Selected Kit'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quest list */}
            <div className="flex-1 overflow-y-auto p-6 bg-black/70">
              {loadingQuests ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
                  <p className="text-brand-orange">Loading quests...</p>
                </div>
              ) : (() => {
                const kitQuests = selectedKit ? getQuestsForKit(selectedKit) : [];
                
                if (kitQuests.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full">
                      <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Quests Available</h3>
                      <p className="text-gray-300 text-center">
                        No quests are currently available for this kit.
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kitQuests.map(quest => (
                      <div 
                        key={quest.id}
                        className="bg-gray-900/80 rounded-lg border border-brand-orange/30 p-6 hover:border-brand-orange/60 transition-all duration-300 cursor-pointer hover:shadow-lg"
                        onClick={() => handleQuestClick(quest.id.toString())}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <div className="flex flex-col h-full">
                          <h3 className="text-lg font-bold text-white mb-2">{quest.title}</h3>
                          <p className="text-gray-300 text-sm mb-4 flex-1 line-clamp-3">{quest.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-brand-orange">
                              <Award className="h-4 w-4 mr-1" />
                              <span>{quest.xpReward} XP</span>
                            </div>
                            <div className="flex items-center text-yellow-400">
                              <span>{Array(quest.difficulty).fill('★').join('')}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            {quest.adventureLine}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
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