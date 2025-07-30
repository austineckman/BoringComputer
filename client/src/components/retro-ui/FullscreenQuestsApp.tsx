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
  const [questTab, setQuestTab] = useState<'available' | 'completed'>('available');
  
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
  
  // Get quests for selected kit with tab filtering
  const getQuestsForKit = (kitId: string) => {
    if (!allQuests || allQuests.length === 0) return [];
    
    let filteredQuests = allQuests.filter(quest => {
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

    // Filter by quest tab (available vs completed)
    filteredQuests = filteredQuests.filter(quest => {
      if (questTab === 'completed') {
        return quest.status === 'completed';
      } else {
        return quest.status !== 'completed'; // Show available, active, and locked quests
      }
    });

    // Sort by orderInLine to ensure proper quest ordering
    const sortedQuests = filteredQuests.sort((a, b) => (a.orderInLine || 0) - (b.orderInLine || 0));
    
    // Debug: Log quest ordering
    console.log('Quest ordering for kit:', kitId);
    sortedQuests.forEach(quest => {
      console.log(`Quest ${quest.id}: "${quest.title}" - Order: ${quest.orderInLine || 0}`);
    });
    
    return sortedQuests;
  };

  const handleKitSelect = (kitId: string) => {
    window.sounds?.click();
    setSelectedKit(kitId);
    setQuestView('quest-list');
  };

  const handleQuestClick = (questId: string) => {
    const quest = allQuests?.find(q => q.id === questId);
    if (quest && quest.status !== 'locked') {
      window.sounds?.click();
      setSelectedQuest(quest);
      setQuestView('detail');
    } else {
      window.sounds?.error();
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
        
        {/* Main quest intro layout - Two columns with large hero image */}
        <div className="grid grid-cols-5 gap-8 mb-6">
          {/* Left column - Large Hero Image and Flavor Text */}
          <div className="col-span-3 space-y-6">
            {/* Large Hero Image */}
            <div className="bg-gray-900/80 rounded-lg shadow-lg border border-brand-orange/30 overflow-hidden">
              {heroImage ? (
                <div className="relative">
                  <div className="w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <img 
                      src={heroImage} 
                      alt={selectedQuest.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h1 className="text-5xl font-bold text-white text-shadow mb-4">{selectedQuest.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-shadow">
                      <span className="text-brand-orange flex items-center text-lg font-semibold">
                        <Award className="h-5 w-5 mr-2" />
                        {selectedQuest.xpReward} XP
                      </span>
                      <span className="text-yellow-400 text-lg">
                        {Array(selectedQuest.difficulty).fill('★').join('')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-gray-800/60 h-80 flex flex-col items-center justify-center text-center">
                  <BookOpen className="h-20 w-20 text-brand-orange mb-6" />
                  <h1 className="text-5xl font-bold text-white mb-4">{selectedQuest.title}</h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-brand-orange flex items-center text-lg font-semibold">
                      <Award className="h-5 w-5 mr-2" />
                      {selectedQuest.xpReward} XP
                    </span>
                    <span className="text-yellow-400 text-lg">
                      {Array(selectedQuest.difficulty).fill('★').join('')}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Flavor Text */}
            <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg">
              <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
                <h2 className="text-xl font-bold text-brand-orange">Quest Description</h2>
              </div>
              <div className="p-6">
                <p className="text-white text-base leading-relaxed whitespace-pre-line">{selectedQuest.description}</p>
              </div>
            </div>
          </div>
          
          {/* Right column - Start Button, Quest Rewards, and Components */}
          <div className="col-span-2 space-y-6">
            {/* Start Quest Button */}
            <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg p-6">
              <button
                className="w-full py-6 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 border-2 border-orange-400 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 font-bold text-white text-xl tracking-wide"
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

            {/* Quest Rewards */}
            <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg">
              <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
                <h2 className="text-xl font-bold text-brand-orange flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Quest Rewards
                </h2>
              </div>
              <div className="p-6">
                {selectedQuest.rewards && selectedQuest.rewards.length > 0 ? (
                  <div className="space-y-4">
                    {selectedQuest.rewards.map((reward, idx) => {
                      const item = items?.find(i => i.id === reward.id);
                      const isLootbox = reward.type === 'lootbox';
                      const lootboxConfig = isLootbox ? lootBoxConfigsMap[reward.id] : null;
                      const rarityClass = item?.rarity ? getRarityColorClass(item.rarity) : 'border-gray-600';
                      

                      
                      return (
                        <div 
                          key={`${reward.id}-${idx}`}
                          className={`bg-gray-800/70 rounded-lg border ${rarityClass} p-4 flex items-center space-x-4 transition-all duration-300`}
                        >
                          <div className="w-12 h-12 bg-gradient-to-b from-gray-700/50 to-black/50 rounded-lg flex items-center justify-center">
                            {item?.imagePath ? (
                              <img 
                                src={item.imagePath} 
                                alt={reward.id}
                                className="w-10 h-10 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : isLootbox && lootboxConfig?.image ? (
                              <img 
                                src={lootboxConfig.image} 
                                alt={lootboxConfig.name}
                                className="w-10 h-10 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : isLootbox ? (
                              <Gift className="w-8 h-8 text-yellow-400" />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-base">
                              {item?.name || (isLootbox && lootboxConfig ? lootboxConfig.name : isLootbox ? `${reward.id} Loot Box` : reward.id)}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {item?.description || (isLootbox && lootboxConfig ? lootboxConfig.description : isLootbox ? 'Contains random rewards and materials' : 'Reward item')}
                            </p>
                            {item?.rarity && (
                              <div className="mt-1">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  item.rarity === 'legendary' ? 'bg-yellow-400/20 text-yellow-400' :
                                  item.rarity === 'epic' ? 'bg-purple-400/20 text-purple-400' :
                                  item.rarity === 'rare' ? 'bg-blue-400/20 text-blue-400' :
                                  item.rarity === 'uncommon' ? 'bg-green-400/20 text-green-400' :
                                  'bg-gray-400/20 text-gray-400'
                                }`}>
                                  {item.rarity.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="px-3 py-1 bg-brand-orange/90 rounded-full text-white text-sm font-bold">
                            {reward.quantity}x
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-base text-center">No rewards available</p>
                )}
              </div>
            </div>
            
            {/* Required Components */}
            {selectedQuest.componentRequirements && selectedQuest.componentRequirements.length > 0 && (
              <div className="bg-gray-900/80 border border-brand-orange/30 rounded-lg shadow-lg">
                <div className="bg-gray-800/60 px-6 py-4 border-b border-brand-orange/30">
                  <h2 className="text-xl font-bold text-brand-orange flex items-center">
                    <Cpu className="h-5 w-5 mr-2" />
                    Required Components
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedQuest.componentRequirements.map((comp, idx) => (
                      <div key={idx} className="bg-gray-800/70 rounded-lg p-4 text-center">
                        <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center mx-auto mb-2">
                          {comp.imagePath ? (
                            <img 
                              src={comp.imagePath} 
                              alt={comp.name}
                              className="w-10 h-10 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ) : (
                            <Cpu className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <h3 className="text-white font-semibold text-sm">{comp.name}</h3>
                        <div className="px-2 py-1 bg-brand-orange/90 rounded-full text-white text-xs font-bold mt-2 inline-block">
                          {comp.quantity || 1}x
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
        {questView === 'active' && activeQuestId && selectedQuest ? (
          <ActiveQuestScreen
            questId={activeQuestId}
            questData={selectedQuest}
            onClose={() => {
              setQuestView('quest-list');
              setActiveQuestId(null);
            }}
            onComplete={() => {
              setQuestView('quest-list');
              setActiveQuestId(null);
            }}
          />
        ) : questView === 'kit-select' ? (
          /* Kit Selection Screen */
          <div className="flex-1 overflow-y-auto bg-black/70">
            <div className="p-3 sm:p-6 pb-12 max-w-6xl mx-auto min-h-full">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Select a Component Kit</h2>
                <p className="text-gray-300 text-sm">Choose a kit to see available quests and adventures</p>
              </div>
              
              {loadingKits ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
                  <p className="text-brand-orange">Loading kits...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-8">
                  {kits?.map(kit => {
                    const kitQuests = getQuestsForKit(kit.id);
                    const questCount = kitQuests.length;
                    
                    return (
                      <div 
                        key={kit.id}
                        className="bg-gray-900/80 rounded-lg border border-brand-orange/30 p-3 sm:p-4 hover:border-brand-orange/60 transition-all duration-300 cursor-pointer hover:shadow-lg"
                        onClick={() => handleKitSelect(kit.id)}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-black/40 rounded-lg">
                            {kit.imagePath ? (
                              <img 
                                src={kit.imagePath} 
                                alt={kit.name}
                                className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <Cpu className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{kit.name}</h3>
                          <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">{kit.description}</p>
                          <div className="flex items-center justify-center space-x-4 text-xs sm:text-sm">
                            <div className="flex items-center text-brand-orange">
                              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Breadcrumb and back button */}
            <div className="bg-black/80 border-b border-brand-orange/30 p-3 sm:p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <button 
                    className="flex items-center text-white hover:text-brand-orange text-sm sm:text-base"
                    onClick={() => {
                      window.sounds?.click();
                      setQuestView('kit-select');
                      setSelectedKit(null);
                    }}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Back to Kits
                  </button>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="text-white font-semibold text-sm sm:text-base truncate">
                    {kits?.find(k => k.id === selectedKit)?.name || 'Selected Kit'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quest tabs */}
            <div className="flex bg-gray-900/80 border-b border-brand-orange/30 px-4">
              <button
                className={`px-6 py-3 font-semibold text-sm transition-all ${
                  questTab === 'available' 
                    ? 'text-white border-b-2 border-brand-orange bg-brand-orange/10' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
                onClick={() => {
                  window.sounds?.click();
                  setQuestTab('available');
                }}
                onMouseEnter={() => window.sounds?.hover()}
              >
                Available Quests
              </button>
              <button
                className={`px-6 py-3 font-semibold text-sm transition-all ${
                  questTab === 'completed' 
                    ? 'text-white border-b-2 border-green-500 bg-green-500/10' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
                onClick={() => {
                  window.sounds?.click();
                  setQuestTab('completed');
                }}
                onMouseEnter={() => window.sounds?.hover()}
              >
                Completed Quests
              </button>
            </div>

            {/* Quest list */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-black/70 min-h-0 quest-scroll">
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
                      <h3 className="text-xl font-bold text-white mb-2">
                        {questTab === 'completed' ? 'No Completed Quests' : 'No Quests Available'}
                      </h3>
                      <p className="text-gray-300 text-center">
                        {questTab === 'completed' 
                          ? 'Complete some quests to see them here.' 
                          : 'No quests are currently available for this kit.'
                        }
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-20">
                    {kitQuests.map(quest => {
                      const heroImage = quest.content?.images?.[0] || quest.heroImage;
                      const circuitDiagram = quest.content?.images?.[1]; // Second image as circuit diagram
                      
                      return (
                        <div 
                          key={quest.id}
                          className={`bg-gray-900/90 rounded-xl border overflow-hidden transition-all duration-300 relative group ${
                            quest.status === 'locked' 
                              ? 'border-gray-600/50 bg-gray-800/50 cursor-not-allowed opacity-60' 
                              : quest.status === 'completed' 
                                ? 'border-green-500/50 bg-green-900/20 cursor-pointer hover:border-green-400/60 hover:shadow-xl hover:scale-105' 
                                : 'border-brand-orange/30 cursor-pointer hover:border-brand-orange/60 hover:shadow-xl hover:scale-105'
                          }`}
                          onClick={() => handleQuestClick(quest.id.toString())}
                          onMouseEnter={() => quest.status !== 'locked' && window.sounds?.hover()}
                        >
                          {/* Hero Image Section */}
                          <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-800/50">
                            {heroImage ? (
                              <img 
                                src={heroImage} 
                                alt={quest.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                <Cpu className="w-12 h-12 text-gray-500" />
                              </div>
                            )}
                            
                            {/* Quest Number Overlay */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                              #{quest.orderInLine || 0}
                            </div>
                            
                            {/* Status Badge */}
                            {quest.status === 'completed' && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 border-2 border-green-400 shadow-lg">
                                <div className="w-5 h-5 flex items-center justify-center text-xs">
                                  ✓
                                </div>
                              </div>
                            )}
                            {quest.status === 'locked' && (
                              <div className="absolute top-2 right-2 bg-gray-600 text-white rounded-full p-1 border-2 border-gray-500 shadow-lg">
                                <div className="w-5 h-5 flex items-center justify-center text-xs">
                                  🔒
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Content Section */}
                          <div className="p-4">
                            {/* Title and Status */}
                            <div className="flex items-start justify-between mb-3">
                              <h3 className={`text-sm sm:text-base font-bold leading-tight ${
                                quest.status === 'completed' ? 'text-green-300' : 
                                quest.status === 'locked' ? 'text-gray-400' : 'text-white'
                              }`}>
                                {quest.title}
                              </h3>
                              {quest.status === 'completed' && (
                                <span className="text-xs text-green-400 font-semibold bg-green-900/40 px-2 py-1 rounded ml-2 flex-shrink-0">
                                  DONE
                                </span>
                              )}
                              {quest.status === 'locked' && (
                                <span className="text-xs text-gray-400 font-semibold bg-gray-800/40 px-2 py-1 rounded ml-2 flex-shrink-0">
                                  LOCKED
                                </span>
                              )}
                            </div>
                            
                            {/* Description */}
                            <p className={`text-xs mb-3 line-clamp-2 ${
                              quest.status === 'locked' ? 'text-gray-500' : 'text-gray-300'
                            }`}>
                              {quest.status === 'locked' ? 'Complete previous quests to unlock.' : quest.description}
                            </p>
                            
                            {/* Circuit Diagram (if available) */}
                            {circuitDiagram && quest.status !== 'locked' && (
                              <div className="mb-3">
                                <img 
                                  src={circuitDiagram} 
                                  alt="Circuit diagram"
                                  className="w-full h-16 object-contain rounded bg-white/5 p-2"
                                  style={{ imageRendering: 'pixelated' }}
                                />
                              </div>
                            )}
                            


                            {/* Quest Rewards Section */}
                            {quest.rewards && (quest.rewards.items?.length > 0 || quest.rewards.gold > 0 || quest.lootBoxRewards?.length > 0) && quest.status !== 'locked' && (
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold text-gray-400 mb-2">Quest Rewards:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {quest.rewards.gold > 0 && (
                                    <div className="flex items-center bg-yellow-900/30 rounded px-2 py-1">
                                      <img 
                                        src="/attached_assets/22_Leperchaun_Coin.png" 
                                        alt="Gold"
                                        className="w-4 h-4 mr-1"
                                        style={{ imageRendering: 'pixelated' }}
                                      />
                                      <span className="text-xs text-yellow-400">{quest.rewards.gold}</span>
                                    </div>
                                  )}
                                  {quest.rewards.items?.slice(0, 3).map((reward: any, index: number) => (
                                    <div key={index} className="flex items-center bg-purple-900/30 rounded px-2 py-1">
                                      {reward.image && (
                                        <img 
                                          src={reward.image} 
                                          alt={reward.name}
                                          className="w-4 h-4 mr-1"
                                          style={{ imageRendering: 'pixelated' }}
                                        />
                                      )}
                                      <span className="text-xs text-purple-300">{reward.quantity}x {reward.name}</span>
                                    </div>
                                  ))}
                                  {quest.lootBoxRewards?.slice(0, 2).map((loot: any, index: number) => (
                                    <div key={`loot-${index}`} className="flex items-center bg-orange-900/30 rounded px-2 py-1">
                                      <img 
                                        src="/attached_assets/loot crate.png" 
                                        alt="Loot Box"
                                        className="w-4 h-4 mr-1"
                                        style={{ imageRendering: 'pixelated' }}
                                      />
                                      <span className="text-xs text-orange-300">{loot.quantity}x {loot.type}</span>
                                    </div>
                                  ))}
                                  {quest.rewards.items && quest.rewards.items.length > 3 && (
                                    <div className="flex items-center bg-purple-900/30 rounded px-2 py-1">
                                      <span className="text-xs text-purple-400">+{quest.rewards.items.length - 3} more</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Components Required Section - At Bottom */}
                            {quest.components && quest.components.length > 0 && quest.status !== 'locked' && (
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold text-gray-400 mb-2">Components Required:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {quest.components.slice(0, 4).map((component: any, index: number) => (
                                    <div key={index} className="flex items-center bg-gray-800/50 rounded px-2 py-1">
                                      {component.image && (
                                        <img 
                                          src={component.image} 
                                          alt={component.name}
                                          className="w-4 h-4 mr-1"
                                          style={{ imageRendering: 'pixelated' }}
                                        />
                                      )}
                                      <span className="text-xs text-gray-300">{component.name}</span>
                                    </div>
                                  ))}
                                  {quest.components.length > 4 && (
                                    <div className="flex items-center bg-gray-800/50 rounded px-2 py-1">
                                      <span className="text-xs text-gray-400">+{quest.components.length - 4} more</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Footer Info */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center text-brand-orange">
                                <Award className="h-3 w-3 mr-1" />
                                <span>{quest.xpReward} XP</span>
                              </div>
                              <div className="flex items-center text-yellow-400">
                                <span>{Array(quest.difficulty).fill('★').join('')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
      

    </div>
  );
};

export default FullscreenQuestsApp;