import React, { useState, useEffect } from 'react';
import { X, Search, FilterX, Filter, ChevronRight, Clock, Award, Cpu, Loader2, AlertTriangle } from 'lucide-react';
import { useComponentKits, type ComponentKit } from '../../hooks/useComponentKits';
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

interface QuestsAppProps {
  onClose: () => void;
}

const QuestsApp: React.FC<QuestsAppProps> = ({ onClose }) => {
  // State
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [selectedAdventureLine, setSelectedAdventureLine] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Data fetching
  const { kits, loading: kitsLoading } = useComponentKits();
  const { questsByAdventureLine, allQuests, loading: questsLoading } = useQuests();

  useEffect(() => {
    // Log data for debugging
    console.log("Component Kits Data:", kits);
    console.log("Quests Data:", { questsByAdventureLine, allQuests });

    // For error handling, we'll use the general error state now
    if (kitsLoading === false && kits.length === 0) {
      console.error("No kits found");
      setError("Failed to load component kits. Please try again later.");
    }

    if (questsLoading === false && allQuests.length === 0) {
      console.error("No quests found");
      setError("Failed to load quests. Please try again later.");
    }
  }, [kits, questsByAdventureLine, allQuests, kitsLoading, questsLoading]);

  // Filter quests when dependencies change
  useEffect(() => {
    if (!allQuests || allQuests.length === 0) return;

    let filtered = [...allQuests];
    
    // Filter by selected kit
    if (selectedKit) {
      filtered = filtered.filter(quest => {
        // Check if quest directly belongs to this kit
        if (quest.kitId === selectedKit) {
          return true;
        }
        
        // Check if any component from this kit is required for the quest
        if (quest.componentRequirements && quest.componentRequirements.length > 0) {
          return quest.componentRequirements.some(comp => comp.component?.kitId === selectedKit);
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
  }, [allQuests, selectedKit, searchQuery, selectedAdventureLine]);

  // Event handlers
  const handleKitSelect = (kitId: string) => {
    window.sounds?.click();
    setSelectedKit(prev => prev === kitId ? null : kitId);
  };

  const clearFilters = () => {
    window.sounds?.click();
    setSelectedKit(null);
    setSearchQuery('');
    setSelectedAdventureLine(null);
  };

  // Rendering functions
  const renderKitsList = () => {
    if (kitsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      );
    }

    if (kits.length === 0) {
      return (
        <div className="p-4 bg-black/30 rounded-lg border border-red-500/30 text-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-red-200">No component kits found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {kits.map((kit) => (
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
                className="w-10 h-10 object-cover rounded mr-2"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center mr-2">
                <Cpu className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{kit.name}</p>
              <p className="text-xs text-gray-400 truncate">{kit.difficulty}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQuestCard = (quest: Quest) => {
    return (
      <div 
        key={quest.id} 
        className="flex flex-col p-4 rounded-lg border border-gray-700 bg-space-dark hover:border-brand-orange/60 transition-colors cursor-pointer relative overflow-hidden"
        onMouseEnter={() => window.sounds?.hover()}
      >
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent opacity-60 z-0"></div>
        
        {/* Status badge */}
        {quest.status && (
          <div className="absolute top-3 right-3 z-10">
            {quest.status === 'locked' && (
              <span className="bg-red-900/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked
              </span>
            )}
            {quest.status === 'available' && (
              <span className="bg-blue-900/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Available
              </span>
            )}
            {quest.status === 'in-progress' && (
              <span className="bg-yellow-700/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
              </span>
            )}
            {quest.status === 'completed' && (
              <span className="bg-green-800/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Award className="w-3 h-3 mr-1" />
                Completed
              </span>
            )}
          </div>
        )}
        
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
                {quest.componentRequirements.slice(0, 3).map((req) => (
                  <span 
                    key={req.id} 
                    className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                    title={req.component?.description}
                  >
                    {req.component?.name} {req.quantity > 1 ? `(${req.quantity})` : ''}
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

  const renderQuestsList = () => {
    if (questsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
        </div>
      );
    }

    if (!allQuests || allQuests.length === 0) {
      return (
        <div className="p-6 bg-black/30 rounded-lg border border-red-500/30 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-200 text-lg">No quests found.</p>
        </div>
      );
    }

    // If filtered quests is empty but we have quests data, show no results message
    if (!filteredQuests || filteredQuests.length === 0) {
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

    // Display quests by adventure line
    if (!selectedAdventureLine) {
      const adventureLines = questsByAdventureLine ? Object.keys(questsByAdventureLine).sort() : [];
      
      return adventureLines.map(line => {
        // Get quests for this adventure line that also pass the filters
        const lineQuests = filteredQuests ? filteredQuests.filter(q => q.adventureLine === line) : [];
        
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
    const lineQuests = filteredQuests ? filteredQuests.filter(q => q.adventureLine === selectedAdventureLine) : [];
    
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
      
      {/* Error message if needed */}
      {error && (
        <div className="bg-red-900/80 border-b border-red-500 p-3 text-white flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button 
            className="text-white hover:text-red-300" 
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
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
            
            {renderKitsList()}
          </div>
          
          <div className="pt-4 border-t border-gray-700">
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange/80 transition-colors"
              onClick={clearFilters}
              onMouseEnter={() => window.sounds?.hover()}
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Main quest list area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderQuestsList()}
        </div>
      </div>
    </div>
  );
};

export default QuestsApp;