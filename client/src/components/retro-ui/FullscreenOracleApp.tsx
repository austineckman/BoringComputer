import React, { useState, useEffect, useRef } from 'react';
import { X, Search, RefreshCw, Package, Sparkles, FileText, Settings, Users, PlusCircle, Loader2, Edit, Trash2, AlertTriangle } from 'lucide-react';
import wallbg from '@assets/wallbg.png';
import oracleIconImage from '@assets/01_Fire_Grimoire.png'; // Using grimoire as placeholder for Oracle icon

// Define types for lootboxes and quests
interface LootBox {
  id: number;
  userId: number;
  type: string;  // Name of the lootbox
  opened: boolean;
  acquiredAt: string;
  openedAt?: string | null;
  rewards: any[] | null;
  source: string;  // Description of the lootbox
  sourceId: string | null;
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
  // State for tabs
  const [activeTab, setActiveTab] = useState<'lootboxes' | 'quests' | 'users' | 'settings'>('lootboxes');
  
  // State for data
  const [lootboxes, setLootboxes] = useState<LootBox[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for modals and actions
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; type: string; id: string | null; name: string }>({
    show: false,
    type: '',
    id: null,
    name: ''
  });
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // State for editing
  const [editingItem, setEditingItem] = useState<LootBox | Quest | null>(null);
  const [editingType, setEditingType] = useState<'lootbox' | 'quest' | null>(null);
  
  // Loading states
  const [loadingLootboxes, setLoadingLootboxes] = useState(true);
  const [loadingQuests, setLoadingQuests] = useState(true);
  
  // Fetch lootboxes and quests using Oracle API
  useEffect(() => {
    const fetchLootboxes = async () => {
      try {
        setLoadingLootboxes(true);
        const response = await fetch('/api/oracle/entities/lootBoxes');
        if (response.ok) {
          const data = await response.json();
          console.log('Raw lootbox data from API:', data);
          
          // Make sure we have an array
          if (Array.isArray(data)) {
            setLootboxes(data);
          } else {
            console.error('Expected array for lootboxes but got:', typeof data);
            setLootboxes([]);
          }
        } else {
          console.error('Failed to fetch lootboxes, status:', response.status);
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
        // Use the specialized endpoint that includes component requirements
        const response = await fetch('/api/oracle/quests-with-components');
        if (response.ok) {
          const data = await response.json();
          setQuests(data);
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
  }, []);

  // Add debug logging to see what we're getting from the API
  useEffect(() => {
    if (lootboxes.length > 0) {
      console.log("Lootboxes data:", lootboxes);
    }
  }, [lootboxes]);

  // Filter data based on search query with looser conditions
  const filteredLootboxes = lootboxes.filter(box => {
    // Make sure box exists
    if (!box) return false;
    
    // If search query is empty, show all
    if (!searchQuery) return true;
    
    // Check for 'type' field (actual name in the database)
    const nameMatches = typeof box.type === 'string' && 
      box.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check for 'source' field (closest to description)
    const descMatches = typeof box.source === 'string' && 
      box.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    return nameMatches || descMatches;
  });

  const filteredQuests = quests.filter(quest => {
    // Make sure quest exists
    if (!quest) return false;
    
    // If search query is empty, show all
    if (!searchQuery) return true;
    
    // If title exists, check it
    const titleMatches = typeof quest.title === 'string' && 
      quest.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If description exists, check it
    const descMatches = typeof quest.description === 'string' && 
      quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return titleMatches || descMatches;
  });

  // Handlers
  const handleTabChange = (tab: 'lootboxes' | 'quests' | 'users' | 'settings') => {
    window.sounds?.click();
    setActiveTab(tab);
  };

  const handleRefresh = async () => {
    window.sounds?.click();
    if (activeTab === 'lootboxes') {
      setLoadingLootboxes(true);
      try {
        const response = await fetch('/api/oracle/entities/lootBoxes');
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
        const response = await fetch('/api/oracle/quests-with-components');
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
  
  // Edit handlers
  const handleEditClick = (type: 'lootbox' | 'quest', item: LootBox | Quest) => {
    window.sounds?.click();
    setEditingType(type);
    setEditingItem(item);
  };
  
  const closeEditDialog = () => {
    setEditingType(null);
    setEditingItem(null);
  };
  
  const handleEditSubmit = async (data: any) => {
    if (!editingItem || !editingType) return;
    
    window.sounds?.click();
    try {
      const tableName = editingType === 'lootbox' ? 'lootBoxes' : 'quests';
      const id = (editingItem as any).id;
      
      const response = await fetch('/api/oracle/entities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tableName,
          id,
          data
        })
      });
      
      if (response.ok) {
        window.sounds?.success();
        const updatedItem = await response.json();
        
        // Update the state with the edited item
        if (editingType === 'lootbox') {
          setLootboxes(prevBoxes => 
            prevBoxes.map(box => box.id === updatedItem.id ? updatedItem : box)
          );
        } else if (editingType === 'quest') {
          setQuests(prevQuests => 
            prevQuests.map(quest => quest.id === updatedItem.id ? updatedItem : quest)
          );
        }
        
        setNotificationMessage({
          type: 'success',
          message: `${editingType.charAt(0).toUpperCase() + editingType.slice(1)} updated successfully!`
        });
        
        setTimeout(() => {
          setNotificationMessage(null);
        }, 3000);
        
        closeEditDialog();
      } else {
        window.sounds?.error();
        const errorData = await response.json();
        setNotificationMessage({
          type: 'error',
          message: `Error: ${errorData.message || 'Failed to update'}`
        });
        setTimeout(() => {
          setNotificationMessage(null);
        }, 3000);
      }
    } catch (err) {
      window.sounds?.error();
      const error = err as Error;
      console.error(`Error updating ${editingType}:`, error);
      setNotificationMessage({
        type: 'error',
        message: `Error: ${error.message || 'Failed to update'}`
      });
      setTimeout(() => {
        setNotificationMessage(null);
      }, 3000);
    }
  };
  
  // Delete handlers
  const handleDeleteClick = (type: string, id: string, name: string) => {
    window.sounds?.click();
    setConfirmDelete({
      show: true,
      type,
      id,
      name
    });
  };
  
  const closeDeleteDialog = () => {
    setConfirmDelete({
      show: false,
      type: '',
      id: null,
      name: ''
    });
  };
  
  const confirmDeleteItem = async () => {
    if (!confirmDelete.id || !confirmDelete.type) return;
    
    window.sounds?.click();
    try {
      const tableName = confirmDelete.type === 'lootbox' ? 'lootBoxes' : 'quests';
      const response = await fetch('/api/oracle/entities', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tableName,
          id: confirmDelete.id
        })
      });
      
      if (response.ok) {
        window.sounds?.success();
        setNotificationMessage({
          type: 'success',
          message: `${confirmDelete.type.charAt(0).toUpperCase() + confirmDelete.type.slice(1)} deleted successfully!`
        });
        
        // Update the state to remove the deleted item
        if (confirmDelete.type === 'lootbox') {
          setLootboxes(prevBoxes => prevBoxes.filter(box => box.id !== confirmDelete.id));
        } else if (confirmDelete.type === 'quest') {
          setQuests(prevQuests => prevQuests.filter(quest => quest.id !== confirmDelete.id));
        }
        
        setTimeout(() => {
          setNotificationMessage(null);
        }, 3000);
      } else {
        window.sounds?.error();
        const errorData = await response.json();
        setNotificationMessage({
          type: 'error',
          message: `Error: ${errorData.message || 'Failed to delete'}`
        });
        setTimeout(() => {
          setNotificationMessage(null);
        }, 3000);
      }
    } catch (err) {
      window.sounds?.error();
      const error = err as Error;
      console.error(`Error deleting ${confirmDelete.type}:`, error);
      setNotificationMessage({
        type: 'error',
        message: `Error: ${error.message || 'Failed to delete'}`
      });
      setTimeout(() => {
        setNotificationMessage(null);
      }, 3000);
    }
    
    closeDeleteDialog();
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
              <h3 className="text-lg font-bold text-white">{lootbox.type || 'Unnamed Lootbox'}</h3>
              <div className="flex space-x-1">
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Edit lootbox"
                  onClick={() => handleEditClick('lootbox', lootbox)}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Delete lootbox"
                  onClick={() => handleDeleteClick('lootbox', lootbox.id.toString(), lootbox.type || 'Unnamed Lootbox')}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {lootbox.source || 'No description available'}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <span className={`
                text-xs px-2 py-1 rounded-full 
                ${lootbox.opened ? 'bg-gray-600/50 text-gray-200' : 'bg-green-600/50 text-green-200'}
              `}>
                {lootbox.opened ? 'Opened' : 'Unopened'}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(lootbox.acquiredAt).toLocaleDateString()}
              </span>
            </div>
            
            {lootbox.rewards && Array.isArray(lootbox.rewards) && lootbox.rewards.length > 0 && (
              <div className="text-xs">
                <h4 className="text-gray-400 mb-1">Rewards:</h4>
                <div className="flex flex-wrap gap-1">
                  {lootbox.rewards.slice(0, 3).map((reward, index) => (
                    <span 
                      key={index}
                      className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                    >
                      {typeof reward === 'object' ? (reward.id || reward.type || 'Unknown') : 'Unknown reward'}
                    </span>
                  ))}
                  {lootbox.rewards.length > 3 && (
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                      +{lootbox.rewards.length - 3} more
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
          <FileText className="h-12 w-12 mb-3 opacity-50" />
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
                  onClick={() => handleEditClick('quest', quest)}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Delete quest"
                  onClick={() => handleDeleteClick('quest', quest.id.toString(), quest.title)}
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
          <span className="text-xs bg-red-600/80 text-white px-2 py-0.5 rounded-full ml-3">Admin Only</span>
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
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-4 bg-black/70">
        {/* Action bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md pl-9 focus:border-brand-orange focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          
          <div className="flex space-x-3">
            <button
              className="px-3 py-2 bg-black/50 text-gray-300 border border-gray-700 rounded-md hover:border-brand-orange hover:text-brand-orange transition-colors flex items-center"
              onClick={handleRefresh}
              onMouseEnter={() => window.sounds?.hover()}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
            
            <button
              className="px-3 py-2 bg-brand-orange/80 text-white rounded-md hover:bg-brand-orange transition-colors flex items-center"
              onClick={() => console.log(`Create new ${activeTab.slice(0, -1)}`)}
              onMouseEnter={() => window.sounds?.hover()}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Create {activeTab === 'lootboxes' ? 'Lootbox' : activeTab === 'quests' ? 'Quest' : 'Item'}
            </button>
          </div>
        </div>
        
        {/* Tab content */}
        {activeTab === 'lootboxes' && renderLootboxes()}
        {activeTab === 'quests' && renderQuests()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'settings' && renderSettings()}
      </div>
      
      {/* Status footer */}
      <div className="bg-black/80 border-t border-brand-orange/30 px-4 py-2 text-xs text-gray-400 flex items-center justify-between">
        <span>
          The Oracle | Admin Control Panel
        </span>
        <span>
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
      
      {/* Confirmation Dialog */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-red-500 rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4 text-red-500">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Confirm Delete</h3>
            </div>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete this {confirmDelete.type}?<br />
              <span className="font-bold">{confirmDelete.name}</span>
              <br /><br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                onClick={closeDeleteDialog}
                onMouseEnter={() => window.sounds?.hover()}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDeleteItem}
                onMouseEnter={() => window.sounds?.hover()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Dialog */}
      {editingItem && editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-brand-orange rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-brand-orange">
                <Edit className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-bold">
                  Edit {editingType.charAt(0).toUpperCase() + editingType.slice(1)}
                </h3>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={closeEditDialog}
                onMouseEnter={() => window.sounds?.hover()}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {editingType === 'lootbox' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as LootBox).name}
                      onChange={(e) => {
                        const updatedLootbox = {...editingItem as LootBox, name: e.target.value};
                        setEditingItem(updatedLootbox);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Rarity</label>
                    <select
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as LootBox).rarity}
                      onChange={(e) => {
                        const updatedLootbox = {
                          ...editingItem as LootBox, 
                          rarity: e.target.value as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'welcome' | 'quest' | 'event'
                        };
                        setEditingItem(updatedLootbox);
                      }}
                    >
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                      <option value="welcome">Welcome</option>
                      <option value="quest">Quest</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[100px]"
                    value={(editingItem as LootBox).description}
                    onChange={(e) => {
                      const updatedLootbox = {...editingItem as LootBox, description: e.target.value};
                      setEditingItem(updatedLootbox);
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Image Path (optional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                    value={(editingItem as LootBox).imagePath || ''}
                    onChange={(e) => {
                      const updatedLootbox = {...editingItem as LootBox, imagePath: e.target.value};
                      setEditingItem(updatedLootbox);
                    }}
                  />
                </div>
                
                <div>
                  <label className="flex items-center justify-between text-gray-300 text-sm mb-1">
                    <span>Possible Items</span>
                    <button 
                      className="text-xs bg-brand-orange/80 text-white px-2 py-1 rounded hover:bg-brand-orange"
                      onMouseEnter={() => window.sounds?.hover()}
                      onClick={() => {
                        const updatedLootbox = {...editingItem as LootBox};
                        const possibleItems = updatedLootbox.possibleItems || [];
                        possibleItems.push({
                          itemId: '',
                          chance: 10,
                          minQuantity: 1,
                          maxQuantity: 1
                        });
                        updatedLootbox.possibleItems = possibleItems;
                        setEditingItem(updatedLootbox);
                      }}
                    >
                      + Add Item
                    </button>
                  </label>
                  
                  <div className="space-y-2">
                    {(editingItem as LootBox).possibleItems && (editingItem as LootBox).possibleItems.map((item, index) => (
                      <div key={index} className="bg-black/50 border border-gray-700 rounded-md p-3 flex flex-wrap gap-2 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-gray-400 text-xs mb-1">Item ID</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1 bg-black/80 text-white border border-gray-600 rounded-md focus:border-brand-orange focus:outline-none text-sm"
                            value={item.itemId}
                            onChange={(e) => {
                              const updatedLootbox = {...editingItem as LootBox};
                              updatedLootbox.possibleItems[index].itemId = e.target.value;
                              setEditingItem(updatedLootbox);
                            }}
                          />
                        </div>
                        <div className="w-20">
                          <label className="block text-gray-400 text-xs mb-1">Chance (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            className="w-full px-2 py-1 bg-black/80 text-white border border-gray-600 rounded-md focus:border-brand-orange focus:outline-none text-sm"
                            value={item.chance}
                            onChange={(e) => {
                              const updatedLootbox = {...editingItem as LootBox};
                              updatedLootbox.possibleItems[index].chance = parseInt(e.target.value);
                              setEditingItem(updatedLootbox);
                            }}
                          />
                        </div>
                        <div className="w-[70px]">
                          <label className="block text-gray-400 text-xs mb-1">Min Qty</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full px-2 py-1 bg-black/80 text-white border border-gray-600 rounded-md focus:border-brand-orange focus:outline-none text-sm"
                            value={item.minQuantity}
                            onChange={(e) => {
                              const updatedLootbox = {...editingItem as LootBox};
                              updatedLootbox.possibleItems[index].minQuantity = parseInt(e.target.value);
                              setEditingItem(updatedLootbox);
                            }}
                          />
                        </div>
                        <div className="w-[70px]">
                          <label className="block text-gray-400 text-xs mb-1">Max Qty</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full px-2 py-1 bg-black/80 text-white border border-gray-600 rounded-md focus:border-brand-orange focus:outline-none text-sm"
                            value={item.maxQuantity}
                            onChange={(e) => {
                              const updatedLootbox = {...editingItem as LootBox};
                              updatedLootbox.possibleItems[index].maxQuantity = parseInt(e.target.value);
                              setEditingItem(updatedLootbox);
                            }}
                          />
                        </div>
                        <button
                          className="text-red-400 hover:text-red-600 p-1 h-8 w-8 flex items-center justify-center rounded-full hover:bg-black/30 mt-5"
                          onClick={() => {
                            const updatedLootbox = {...editingItem as LootBox};
                            updatedLootbox.possibleItems = updatedLootbox.possibleItems.filter((_, i) => i !== index);
                            setEditingItem(updatedLootbox);
                          }}
                          onMouseEnter={() => window.sounds?.hover()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                    onClick={closeEditDialog}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange/80"
                    onClick={() => {
                      // Omit the componentRequirements as it's handled separately in the backend
                      const { componentRequirements, ...data } = editingItem as any;
                      handleEditSubmit(data);
                    }}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {editingType === 'quest' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as Quest).title}
                      onChange={(e) => {
                        const updatedQuest = {...editingItem as Quest, title: e.target.value};
                        setEditingItem(updatedQuest);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Adventure Line</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as Quest).adventureLine}
                      onChange={(e) => {
                        const updatedQuest = {...editingItem as Quest, adventureLine: e.target.value};
                        setEditingItem(updatedQuest);
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Difficulty (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as Quest).difficulty}
                      onChange={(e) => {
                        const updatedQuest = {...editingItem as Quest, difficulty: parseInt(e.target.value)};
                        setEditingItem(updatedQuest);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">XP Reward</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as Quest).xpReward}
                      onChange={(e) => {
                        const updatedQuest = {...editingItem as Quest, xpReward: parseInt(e.target.value)};
                        setEditingItem(updatedQuest);
                      }}
                    />
                  </div>
                  {/* orderInLine field - only rendered if property exists */}
                  {(editingItem as any).orderInLine !== undefined && (
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Order in Line</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as any).orderInLine || 1}
                        onChange={(e) => {
                          const updatedQuest = {...editingItem as any, orderInLine: parseInt(e.target.value)};
                          setEditingItem(updatedQuest);
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[100px]"
                    value={(editingItem as Quest).description}
                    onChange={(e) => {
                      const updatedQuest = {...editingItem as Quest, description: e.target.value};
                      setEditingItem(updatedQuest);
                    }}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                    onClick={closeEditDialog}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange/80"
                    onClick={() => {
                      // Omit the componentRequirements as it's handled separately in the backend
                      const { componentRequirements, ...data } = editingItem as any;
                      handleEditSubmit(data);
                    }}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Notification Message */}
      {notificationMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          notificationMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white flex items-center`}>
          {notificationMessage.type === 'success' ? (
            <div className="mr-2">✓</div>
          ) : (
            <AlertTriangle className="h-5 w-5 mr-2" />
          )}
          <p>{notificationMessage.message}</p>
        </div>
      )}
    </div>
  );
};

export default FullscreenOracleApp;