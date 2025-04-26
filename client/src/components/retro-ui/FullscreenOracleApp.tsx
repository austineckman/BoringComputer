import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw, Package, Sparkles, Settings, Users, Loader2, Edit, Trash2, Star, Scroll, Book, Award, BarChart, Shield } from 'lucide-react';
import wallbg from '@assets/wallbg.png';
import oracleIconImage from '@assets/hooded-figure.png';
import { useAuth } from '@/hooks/useAuth';

// Define types for lootboxes and quests
interface LootBox {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'welcome' | 'quest' | 'event';
  possibleItems: Array<{
    itemId: string;
    chance: number;
    minQuantity: number;
    maxQuantity: number;
  }>;
  imagePath?: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  xpReward: number;
  adventureLine: string;
  status?: 'available' | 'locked' | 'in-progress' | 'completed';
  rewards: Array<{
    id: string;
    type: string;
    quantity: number;
  }>;
  componentRequirements?: Array<{
    id: string;
    name: string;
    description: string;
    kitId: string;
  }>;
}

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

interface FullscreenOracleAppProps {
  onClose: () => void;
}

const FullscreenOracleApp: React.FC<FullscreenOracleAppProps> = ({ onClose }) => {
  // Get user data from auth context
  const { user, playSoundSafely } = useAuth();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lootboxes' | 'quests' | 'users' | 'settings'>('dashboard');
  
  // State for data
  const [lootboxes, setLootboxes] = useState<LootBox[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [loadingLootboxes, setLoadingLootboxes] = useState(true);
  const [loadingQuests, setLoadingQuests] = useState(true);
  
  // State for personalized recommendations
  const [recommendedQuests, setRecommendedQuests] = useState<Quest[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<string[]>([]);
  
  // Fetch lootboxes and quests
  useEffect(() => {
    const fetchLootboxes = async () => {
      try {
        setLoadingLootboxes(true);
        const response = await fetch('/api/admin/lootboxes');
        if (response.ok) {
          const data = await response.json();
          setLootboxes(data);
        } else {
          console.error('Failed to fetch lootboxes');
        }
      } catch (error) {
        console.error('Error fetching lootboxes:', error);
      } finally {
        setLoadingLootboxes(false);
      }
    };

    const fetchQuests = async () => {
      try {
        setLoadingQuests(true);
        const response = await fetch('/api/admin/quests');
        if (response.ok) {
          const data = await response.json();
          setQuests(data);
          
          // Generate personalized quest recommendations
          if (user) {
            // In a real app, this would use an algorithm based on user's level, completed quests, etc.
            // For now, we'll just pick some quests based on the user's level
            const userLevel = user.level || 1;
            const appropriateQuests = data.filter(
              (quest: Quest) => quest.difficulty <= userLevel + 1 && quest.difficulty >= userLevel - 1
            );
            setRecommendedQuests(appropriateQuests.slice(0, 3));
          }
        } else {
          console.error('Failed to fetch quests');
        }
      } catch (error) {
        console.error('Error fetching quests:', error);
      } finally {
        setLoadingQuests(false);
      }
    };

    fetchLootboxes();
    fetchQuests();
  }, [user]);

  // Generate item recommendations based on user inventory
  useEffect(() => {
    if (user && user.inventory) {
      // In a real application, this would be a more sophisticated recommendation system
      // For now, let's recommend items that the user doesn't have or has few of
      const itemsToRecommend = ['copper', 'crystal', 'circuit board', 'cloth'];
      const filteredItems = itemsToRecommend.filter(item => 
        !user.inventory[item] || user.inventory[item] < 5
      );
      
      setRecommendedItems(filteredItems.slice(0, 3));
    }
  }, [user]);

  // Filter data based on search query
  const filteredLootboxes = lootboxes.filter(box => 
    box.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    box.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuests = quests.filter(quest => 
    quest.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    quest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleTabChange = (tab: 'dashboard' | 'lootboxes' | 'quests' | 'users' | 'settings') => {
    if (window.sounds) {
      window.sounds.click();
    } else {
      playSoundSafely('click');
    }
    setActiveTab(tab);
  };

  const handleRefresh = async () => {
    if (window.sounds) {
      window.sounds.click();
    } else {
      playSoundSafely('click');
    }
    
    if (activeTab === 'lootboxes') {
      setLoadingLootboxes(true);
      try {
        const response = await fetch('/api/admin/lootboxes');
        if (response.ok) {
          const data = await response.json();
          setLootboxes(data);
        }
      } catch (error) {
        console.error('Error refreshing lootboxes:', error);
      } finally {
        setLoadingLootboxes(false);
      }
    } else if (activeTab === 'quests') {
      setLoadingQuests(true);
      try {
        const response = await fetch('/api/admin/quests');
        if (response.ok) {
          const data = await response.json();
          setQuests(data);
        }
      } catch (error) {
        console.error('Error refreshing quests:', error);
      } finally {
        setLoadingQuests(false);
      }
    }
  };

  // Render user dashboard
  const renderDashboard = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Book className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg mb-2">No user data available</p>
          <p className="text-sm">Please log in to see your personalized recommendations</p>
        </div>
      );
    }

    // Calculate inventory count
    const inventoryCount = user.inventory ? 
      Object.values(user.inventory).reduce((sum, count) => sum + count, 0) : 0;
    
    // Generate a mysterious fortune message based on user level
    const fortuneMessages = [
      "The stars align for one who seeks knowledge in the realm of circuits.",
      "A powerful creation lies waiting for your skilled hands to bring it to life.",
      "Beware the path of the lone creator - seek allies in your quest for innovation.",
      "The wisdom of the elders will guide your circuit designs to new heights.",
      "What seems like failure is merely a step on the path to your greatest invention."
    ];
    
    const fortuneIndex = (user.level || 1) % fortuneMessages.length;
    const todaysFortune = fortuneMessages[fortuneIndex];

    return (
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-4">Welcome, {user.username}</h2>
        
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-space-dark/80 rounded-lg p-4 border border-purple-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-300 font-medium">Level</h3>
              <Star className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{user.level || 1}</p>
          </div>
          
          <div className="bg-space-dark/80 rounded-lg p-4 border border-green-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-green-300 font-medium">Inventory</h3>
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{inventoryCount}</p>
            <p className="text-xs text-gray-400">items collected</p>
          </div>
          
          <div className="bg-space-dark/80 rounded-lg p-4 border border-blue-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-300 font-medium">Quests</h3>
              <Scroll className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{user.completedQuests?.length || 0}</p>
            <p className="text-xs text-gray-400">completed</p>
          </div>
          
          <div className="bg-space-dark/80 rounded-lg p-4 border border-amber-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-amber-300 font-medium">Rank</h3>
              <Award className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">Circuit Novice</p>
            <p className="text-xs text-gray-400">5 more levels to advance</p>
          </div>
        </div>
        
        {/* The Oracle's Wisdom */}
        <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-lg p-5 mb-6 border border-purple-500/30 shadow-xl">
          <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center">
            <Book className="h-5 w-5 mr-2 text-purple-300" />
            The Oracle's Wisdom
          </h3>
          <p className="text-white italic mb-4">"{todaysFortune}"</p>
          
          <div className="bg-black/40 p-3 rounded-md border border-purple-500/30">
            <h4 className="text-purple-200 font-medium mb-2">Today's Guidance</h4>
            <p className="text-gray-300 text-sm">
              Your circuits show promise, but the oracle sees that you should focus on
              gathering more materials. The path to mastery requires various components.
            </p>
          </div>
        </div>
        
        {/* Recommended Quests */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-amber-400" />
            Recommended Quests
          </h3>
          
          {recommendedQuests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedQuests.map(quest => (
                <div 
                  key={quest.id}
                  className="border border-amber-700/30 rounded-lg bg-space-dark/80 p-4 hover:border-amber-500/60 transition-colors"
                >
                  <h4 className="text-white font-bold mb-2">{quest.title}</h4>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{quest.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400">{quest.xpReward} XP</span>
                    <span className="text-gray-400">
                      Difficulty: {Array(quest.difficulty).fill('★').join('')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-space-dark/80 rounded-lg p-4 border border-gray-700/50 text-center">
              <p className="text-gray-400">Loading recommended quests...</p>
            </div>
          )}
        </div>
        
        {/* Recommended Materials */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <Package className="h-5 w-5 mr-2 text-cyan-400" />
            Materials to Gather
          </h3>
          
          {recommendedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedItems.map(item => (
                <div 
                  key={item}
                  className="border border-cyan-700/30 rounded-lg bg-space-dark/80 p-4 hover:border-cyan-500/60 transition-colors"
                >
                  <h4 className="text-white font-bold mb-2">{item}</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    You currently have: {user.inventory[item] || 0}
                  </p>
                  <div className="flex items-center text-xs">
                    <span className="text-cyan-400">Recommended for crafting</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-space-dark/80 rounded-lg p-4 border border-gray-700/50 text-center">
              <p className="text-gray-400">Loading material recommendations...</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render lootbox cards
  const renderLootboxes = () => {
    if (loadingLootboxes) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
          <p className="text-brand-orange">Loading lootboxes...</p>
        </div>
      );
    }

    if (filteredLootboxes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Package className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg mb-2">No lootboxes found</p>
          <p className="text-sm">Try adjusting your search or create a new lootbox</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredLootboxes.map(lootbox => (
          <div 
            key={lootbox.id}
            className="border border-gray-700 rounded-lg bg-space-dark/80 p-4 hover:border-brand-orange/60 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-white">{lootbox.name}</h3>
              <div className="flex space-x-1">
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Edit lootbox"
                  onClick={() => console.log('Edit lootbox', lootbox.id)}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Delete lootbox"
                  onClick={() => console.log('Delete lootbox', lootbox.id)}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{lootbox.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <span className={`
                text-xs px-2 py-1 rounded-full 
                ${lootbox.rarity === 'legendary' ? 'bg-yellow-600/50 text-yellow-200' : ''}
                ${lootbox.rarity === 'epic' ? 'bg-purple-600/50 text-purple-200' : ''}
                ${lootbox.rarity === 'rare' ? 'bg-blue-600/50 text-blue-200' : ''}
                ${lootbox.rarity === 'uncommon' ? 'bg-green-600/50 text-green-200' : ''}
                ${lootbox.rarity === 'common' ? 'bg-gray-600/50 text-gray-200' : ''}
                ${lootbox.rarity === 'welcome' ? 'bg-teal-600/50 text-teal-200' : ''}
                ${lootbox.rarity === 'quest' ? 'bg-amber-600/50 text-amber-200' : ''}
                ${lootbox.rarity === 'event' ? 'bg-pink-600/50 text-pink-200' : ''}
              `}>
                {lootbox.rarity.charAt(0).toUpperCase() + lootbox.rarity.slice(1)}
              </span>
              <span className="text-xs text-gray-400">
                {lootbox.possibleItems?.length || 0} items
              </span>
            </div>
            
            {lootbox.possibleItems && lootbox.possibleItems.length > 0 && (
              <div className="text-xs">
                <h4 className="text-gray-400 mb-1">Possible items:</h4>
                <div className="flex flex-wrap gap-1">
                  {lootbox.possibleItems.slice(0, 3).map((item, index) => (
                    <span 
                      key={index}
                      className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                      title={`Chance: ${item.chance}%, Quantity: ${item.minQuantity}-${item.maxQuantity}`}
                    >
                      {item.itemId}
                    </span>
                  ))}
                  {lootbox.possibleItems.length > 3 && (
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                      +{lootbox.possibleItems.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render quest cards
  const renderQuests = () => {
    if (loadingQuests) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
          <p className="text-brand-orange">Loading quests...</p>
        </div>
      );
    }

    if (filteredQuests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Scroll className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg mb-2">No quests found</p>
          <p className="text-sm">Try adjusting your search or create a new quest</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredQuests.map(quest => (
          <div 
            key={quest.id}
            className="border border-gray-700 rounded-lg bg-space-dark/80 p-4 hover:border-brand-orange/60 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-white">{quest.title}</h3>
              <div className="flex space-x-1">
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Edit quest"
                  onClick={() => console.log('Edit quest', quest.id)}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Delete quest"
                  onClick={() => console.log('Delete quest', quest.id)}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{quest.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-3">
                  Adventure: {quest.adventureLine}
                </span>
                <span className="text-xs text-gray-400">
                  Difficulty: {Array(quest.difficulty).fill('★').join('')}
                </span>
              </div>
              <span className="text-xs text-brand-orange">
                {quest.xpReward} XP
              </span>
            </div>
            
            {quest.componentRequirements && quest.componentRequirements.length > 0 && (
              <div className="text-xs">
                <h4 className="text-gray-400 mb-1">Required components:</h4>
                <div className="flex flex-wrap gap-1">
                  {quest.componentRequirements.slice(0, 3).map((comp) => (
                    <span 
                      key={comp.id}
                      className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                      title={comp.description}
                    >
                      {comp.name}
                    </span>
                  ))}
                  {quest.componentRequirements.length > 3 && (
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                      +{quest.componentRequirements.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render placeholder for users and settings tabs
  const renderUsers = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <Users className="h-12 w-12 mb-3 opacity-50" />
      <p className="text-lg mb-2">User Management</p>
      <p className="text-sm">This feature is coming soon</p>
    </div>
  );

  const renderSettings = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <Settings className="h-12 w-12 mb-3 opacity-50" />
      <p className="text-lg mb-2">Oracle Settings</p>
      <p className="text-sm">This feature is coming soon</p>
    </div>
  );

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
            src={oracleIconImage} 
            alt="The Oracle" 
            className="w-8 h-8 mr-3" 
            style={{ imageRendering: 'pixelated' }}
          />
          <h1 className="text-2xl font-bold text-brand-orange">The Oracle</h1>
          {user && (
            <div className="ml-6 flex items-center">
              <Shield className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-purple-300">Level {user.level || 1} Adventurer</span>
            </div>
          )}
        </div>
        <button 
          className="text-white hover:text-brand-orange" 
          onClick={onClose}
          onMouseEnter={() => window.sounds?.hover()}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Tab navigation */}
      <div className="bg-black/70 border-b border-brand-orange/30 px-4">
        <div className="flex space-x-1">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'dashboard' 
                ? 'bg-brand-orange/20 text-brand-orange border-t border-l border-r border-brand-orange/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('dashboard')}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <div className="flex items-center">
              <BarChart className="h-4 w-4 mr-1" />
              Dashboard
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'lootboxes' 
                ? 'bg-brand-orange/20 text-brand-orange border-t border-l border-r border-brand-orange/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('lootboxes')}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-1" />
              Lootboxes
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'quests' 
                ? 'bg-brand-orange/20 text-brand-orange border-t border-l border-r border-brand-orange/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('quests')}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-1" />
              Quests
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'users' 
                ? 'bg-brand-orange/20 text-brand-orange border-t border-l border-r border-brand-orange/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('users')}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Users
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'settings' 
                ? 'bg-brand-orange/20 text-brand-orange border-t border-l border-r border-brand-orange/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('settings')}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </div>
          </button>
        </div>
      </div>
      
      {/* Search bar and action buttons */}
      {(activeTab === 'lootboxes' || activeTab === 'quests') && (
        <div className="bg-black/80 p-4 flex flex-wrap items-center space-x-4">
          {/* Search input */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="bg-gray-900 border border-gray-700 w-full pl-10 pr-4 py-2 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Refresh button */}
          <button
            className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
            onClick={handleRefresh}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      )}
      
      {/* Content area */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'lootboxes' && renderLootboxes()}
        {activeTab === 'quests' && renderQuests()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default FullscreenOracleApp;