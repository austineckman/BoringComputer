import React, { useState, useEffect } from 'react';
import { X, Search, FilterX, Filter, ChevronRight, Clock, Award, Cpu, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useComponentKits } from '../../hooks/useComponentKits';
import { useQuests, type Quest } from '../../hooks/useQuests';
import questImage from '@assets/01_Fire_Grimoire.png';
import wallbg from '@assets/wallbg.png';

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
  const { questsByAdventureLine, allQuests, loading: loadingQuests } = useQuests();
  
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdventureLine, setSelectedAdventureLine] = useState<string | null>(null);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  
  // Filter quests based on selected kit, search query, and adventure line
  useEffect(() => {
    let filtered = allQuests ? [...allQuests] : [];
    
    // Filter by selected kit
    if (selectedKit) {
      console.log('Filtering by kit ID:', selectedKit);
      
      filtered = filtered.filter(quest => {
        // First check if the quest directly belongs to this kit
        if (quest.kitId === selectedKit) {
          console.log(`Quest "${quest.title}" matches kit ${selectedKit} by direct kitId`);
          return true;
        }
        
        // Debug info about component requirements
        const components = quest.componentRequirements || [];
        console.log(`Quest "${quest.title}" has ${components.length} component requirements`);
        
        // Check if any component from this kit is required for the quest
        if (components.length > 0) {
          for (const comp of components) {
            if (comp && comp.kitId === selectedKit) {
              console.log(`Quest "${quest.title}" requires component ${comp.name} from kit ${selectedKit}`);
              return true;
            }
          }
        }
        
        return false;
      });
      
      console.log(`After filtering by kit ${selectedKit}, ${filtered.length} quests remain`);
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
  }, [allQuests, selectedKit, searchQuery, selectedAdventureLine]);

  const handleKitSelect = (kitId: string) => {
    // Play sound effect if available
    window.sounds?.click();
    
    // Toggle the kit selection
    setSelectedKit(prev => prev === kitId ? null : kitId);
  };

  const handleQuestClick = (questId: string) => {
    // Play sound effect if available
    window.sounds?.click();
    
    // Navigate to quest detail page
    navigate(`/quests/${questId}`);
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
        
        return (
          <div key={line} className="mb-8">
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
    
    return (
      <div>
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
    return (
      <div 
        key={quest.id} 
        className="flex flex-col p-4 rounded-lg border border-gray-700 bg-space-dark hover:border-brand-orange/60 transition-colors cursor-pointer relative overflow-hidden"
        onClick={() => handleQuestClick(quest.id)}
        onMouseEnter={() => window.sounds?.hover()}
      >
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
          <h1 className="text-2xl font-bold text-brand-orange">Quest Center</h1>
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
        {/* Sidebar with filters */}
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
          ) : (
            renderQuestsByAdventureLine()
          )}
        </div>
      </div>
      
      {/* Bottom notice about returning to desktop */}
      <div className="p-3 bg-black/80 border-t border-brand-orange/30 text-center text-xs text-gray-400">
        Press ESC or click the X button to return to desktop
      </div>
    </div>
  );
};

export default FullscreenQuestsApp;