import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Search, RefreshCw, Package, Sparkles, FileText, Settings, Users, 
  PlusCircle, Loader2, Edit, Trash2, AlertTriangle, Upload, 
  Shield, ShieldCheck, ShieldX, Star, CalendarClock, LineChart
} from 'lucide-react';
import wallbg from '@assets/wallbg.png';
import oracleIconImage from '@assets/01_Fire_Grimoire.png'; // Using grimoire as placeholder for Oracle icon

// Define types for lootboxes and quests
interface LootBox {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'welcome' | 'quest' | 'event';
  image: string;
  itemDropTable: Array<{
    itemId: string;
    weight: number;
    minQuantity: number;
    maxQuantity: number;
  }>;
  minRewards: number;
  maxRewards: number;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to determine color class based on rarity
function rarityColorClass(rarity?: string): string {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'bg-gray-600/50 text-gray-200';
    case 'uncommon':
      return 'bg-green-600/50 text-green-200';
    case 'rare':
      return 'bg-blue-600/50 text-blue-200';
    case 'epic':
      return 'bg-purple-600/50 text-purple-200';
    case 'legendary':
      return 'bg-yellow-600/50 text-yellow-200';
    case 'welcome':
      return 'bg-teal-600/50 text-teal-200';
    case 'quest':
      return 'bg-brand-orange/50 text-orange-200';
    case 'event':
      return 'bg-pink-600/50 text-pink-200';
    default:
      return 'bg-gray-600/50 text-gray-200';
  }
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

// User interface based on admin panel
interface UserData {
  id: number;
  username: string;
  roles: string[] | null;
  level: number;
  xp: number;
  totalItems: number;
  createdAt: string;
  lastLogin: string | null;
}

const FullscreenOracleApp: React.FC<FullscreenOracleAppProps> = ({ onClose }) => {
  // State for tabs
  const [activeTab, setActiveTab] = useState<'lootboxes' | 'quests' | 'users' | 'settings'>('lootboxes');
  
  // State for data
  const [lootboxes, setLootboxes] = useState<LootBox[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
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
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Fetch lootboxes, quests, and users using Oracle API
  useEffect(() => {
    const fetchLootboxes = async () => {
      try {
        setLoadingLootboxes(true);
        // Change to fetch lootbox configs (definitions) instead of instances
        const response = await fetch('/api/admin/lootboxes');
        if (response.ok) {
          const data = await response.json();
          console.log('Raw lootbox config data from API:', data);
          
          // Make sure we have an array
          if (Array.isArray(data)) {
            setLootboxes(data);
            console.log(`Loaded ${data.length} lootbox configurations`);
          } else {
            console.error('Expected array for lootbox configs but got:', typeof data);
            setLootboxes([]);
          }
        } else {
          console.error('Failed to fetch lootbox configs, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching lootbox configs:', error);
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

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchLootboxes();
    fetchQuests();
    fetchUsers();
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
    
    // Check for name field
    const nameMatches = typeof box.name === 'string' && 
      box.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check for id field (might be used as an identifier)
    const idMatches = typeof box.id === 'string' && 
      box.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check for description field
    const descMatches = typeof box.description === 'string' && 
      box.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check for rarity field
    const rarityMatches = typeof box.rarity === 'string' && 
      box.rarity.toLowerCase().includes(searchQuery.toLowerCase());
    
    return nameMatches || idMatches || descMatches || rarityMatches;
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
    } else if (activeTab === 'users') {
      setLoadingUsers(true);
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error refreshing users:', error);
      } finally {
        setLoadingUsers(false);
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
      // Important: Use lootBoxConfigs instead of lootBoxes for lootbox configurations
      const tableName = editingType === 'lootbox' ? 'lootBoxConfigs' : 'quests';
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
      // Also update delete to use lootBoxConfigs instead of lootBoxes
      const tableName = confirmDelete.type === 'lootbox' ? 'lootBoxConfigs' : 'quests';
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
              <h3 className="text-lg font-bold text-white">{lootbox.name || lootbox.id || 'Unnamed Lootbox'}</h3>
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
                  onClick={() => handleDeleteClick('lootbox', lootbox.id.toString(), lootbox.name || lootbox.id || 'Unnamed Lootbox')}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
            
            {lootbox.image && (
              <div className="relative h-32 mb-3 rounded overflow-hidden">
                <img 
                  src={lootbox.image} 
                  alt={lootbox.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
            
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {lootbox.description || 'No description available'}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <span className={`
                text-xs px-2 py-1 rounded-full 
                ${rarityColorClass(lootbox.rarity)}
              `}>
                {lootbox.rarity || 'common'}
              </span>
              {lootbox.createdAt && (
                <span className="text-xs text-gray-400">
                  Added: {new Date(lootbox.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {lootbox.itemDropTable && Array.isArray(lootbox.itemDropTable) && lootbox.itemDropTable.length > 0 && (
              <div className="text-xs">
                <h4 className="text-gray-400 mb-1">Possible Items:</h4>
                <div className="flex flex-wrap gap-1">
                  {lootbox.itemDropTable.slice(0, 3).map((item, index) => (
                    <span 
                      key={index}
                      className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded flex items-center"
                    >
                      <span>{item.itemId}</span>
                      <span className="ml-1 text-gray-400">({item.weight}%)</span>
                    </span>
                  ))}
                  {lootbox.itemDropTable.length > 3 && (
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                      +{lootbox.itemDropTable.length - 3} more
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
            className="border border-gray-700 rounded-lg bg-space-dark/80 p-4 hover:border-brand-orange/60 transition-colors overflow-hidden relative"
          >
            {/* Status badge */}
            {quest.active === false && (
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-red-900/80 text-white text-xs px-2 py-0.5 rounded-full">
                  Inactive
                </span>
              </div>
            )}
            
            {/* Image section */}
            {(quest.heroImage || (quest.content?.images && quest.content.images.length > 0)) && (
              <div className="h-32 w-full mb-3 rounded-md overflow-hidden relative">
                <img 
                  src={quest.heroImage || (quest.content?.images && quest.content.images[0])} 
                  alt={quest.title}
                  className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  {quest.content?.videos && quest.content.videos.length > 0 && (
                    <span className="flex h-5 items-center rounded-full bg-red-500/20 px-2 text-xs text-white">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 mr-1 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 8h16v8H4z"></path>
                        <path d="M14 12l-6-4v8l6-4z"></path>
                      </svg>
                      {quest.content.videos.length}
                    </span>
                  )}
                  
                  {quest.content?.images && quest.content.images.length > 1 && (
                    <span className="flex h-5 items-center rounded-full bg-blue-500/20 px-2 text-xs text-white">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 mr-1 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4h16v16H4z"></path>
                        <path d="M4 4h12v12H4z"></path>
                      </svg>
                      {quest.content.images.length}
                    </span>
                  )}
                  
                  {quest.content?.codeBlocks && quest.content.codeBlocks.length > 0 && (
                    <span className="flex h-5 items-center rounded-full bg-green-500/20 px-2 text-xs text-white">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 mr-1 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"></path>
                        <path d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path>
                      </svg>
                      {quest.content.codeBlocks.length}
                    </span>
                  )}
                </div>
              </div>
            )}
            
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
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="flex h-6 items-center rounded-full bg-primary/10 px-2 text-xs text-gray-300">
                {new Date(quest.date).toLocaleDateString()}
              </span>
              
              <span className="flex h-6 items-center rounded-full bg-blue-900/20 px-2 text-xs text-blue-300">
                {quest.adventureLine}
              </span>
              
              <span className="flex h-6 items-center rounded-full bg-yellow-500/10 px-2 text-xs text-yellow-300">
                {Array(quest.difficulty).fill('★').join('')}
              </span>
              
              <span className="flex h-6 items-center rounded-full bg-amber-500/20 px-2 text-xs text-amber-300">
                <Sparkles className="h-3 w-3 mr-1" />
                {quest.xpReward} XP
              </span>
            </div>
            
            {quest.componentRequirements && quest.componentRequirements.length > 0 && (
              <div className="text-xs">
                <h4 className="text-gray-400 mb-1">Required components:</h4>
                <div className="flex flex-wrap gap-1">
                  {quest.componentRequirements.map((comp, index) => (
                    <span 
                      key={index}
                      className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                      title={comp.description}
                    >
                      {comp.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render users tab with table
  const renderUsers = () => {
    // Create a filtered list of users based on search query
    const filteredUsers = users.filter(user => {
      if (!searchQuery) return true;
      
      return (
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.roles && user.roles.some(role => 
          role.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    });
    
    if (loadingUsers) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
          <p className="text-brand-orange">Loading users...</p>
        </div>
      );
    }
    
    if (filteredUsers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Users className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg mb-2">No users found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      );
    }
    
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
            <tr>
              <th scope="col" className="px-4 py-3">Username</th>
              <th scope="col" className="px-4 py-3">Roles</th>
              <th scope="col" className="px-4 py-3">Level</th>
              <th scope="col" className="px-4 py-3">XP</th>
              <th scope="col" className="px-4 py-3">Total Items</th>
              <th scope="col" className="px-4 py-3">Created</th>
              <th scope="col" className="px-4 py-3">Last Login</th>
              <th scope="col" className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-700 bg-gray-900/30 hover:bg-gray-700/30">
                <td className="px-4 py-3 font-medium text-white">
                  {user.username}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles && user.roles.map((role, index) => (
                      <span 
                        key={index} 
                        className={`px-2 py-1 text-xs rounded-full ${
                          role === 'admin' 
                            ? 'bg-red-900/70 text-red-200' 
                            : role === 'moderator'
                              ? 'bg-purple-900/70 text-purple-200' 
                              : 'bg-blue-900/70 text-blue-200'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-brand-orange/20 text-brand-orange rounded-full">
                    {user.level}
                  </span>
                </td>
                <td className="px-4 py-3">{user.xp}</td>
                <td className="px-4 py-3">{user.totalItems}</td>
                <td className="px-4 py-3">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button 
                      className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                      title="Edit user"
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                    </button>
                    <button 
                      className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                      title="Delete user"
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* User stats summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm">Total Users</h3>
              <Users className="h-5 w-5 text-brand-orange" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{users.length}</p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm">Admins</h3>
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {users.filter(u => u.roles && u.roles.includes('admin')).length}
            </p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm">Average Level</h3>
              <LineChart className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {Math.round(users.reduce((sum, user) => sum + user.level, 0) / users.length) || 0}
            </p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm">New This Month</h3>
              <CalendarClock className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {users.filter(u => {
                const createdDate = new Date(u.createdAt);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() && 
                       createdDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
                {/* Basic Info Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Loot Box ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as LootBox).id || ''}
                        readOnly={true} // ID should not be editable
                        disabled={true}
                      />
                      <p className="text-xs text-gray-500 mt-1">ID cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Display Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as LootBox).name || ''}
                        onChange={(e) => {
                          const updatedLootbox = {...editingItem as LootBox, name: e.target.value};
                          setEditingItem(updatedLootbox);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[100px]"
                      value={(editingItem as LootBox).description || ''}
                      onChange={(e) => {
                        const updatedLootbox = {...editingItem as LootBox, description: e.target.value};
                        setEditingItem(updatedLootbox);
                      }}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Rarity</label>
                    <select
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as LootBox).rarity || 'common'}
                      onChange={(e) => {
                        const updatedLootbox = {
                          ...editingItem as LootBox, 
                          rarity: e.target.value as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
                        };
                        setEditingItem(updatedLootbox);
                      }}
                    >
                      <option value="common" className="text-gray-300">Common</option>
                      <option value="uncommon" className="text-green-400">Uncommon</option>
                      <option value="rare" className="text-blue-400">Rare</option>
                      <option value="epic" className="text-purple-400">Epic</option>
                      <option value="legendary" className="text-amber-400">Legendary</option>
                    </select>
                  </div>
                </div>
                
                {/* Reward Settings Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Reward Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Min Rewards</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as LootBox).minRewards || 1}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const updatedLootbox = {
                            ...editingItem as LootBox,
                            minRewards: isNaN(value) ? 1 : value
                          };
                          setEditingItem(updatedLootbox);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Max Rewards</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as LootBox).maxRewards || 1}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const updatedLootbox = {
                            ...editingItem as LootBox,
                            maxRewards: isNaN(value) ? 1 : value
                          };
                          setEditingItem(updatedLootbox);
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Lootbox Image Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Loot Box Image</h3>
                  
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Current Image URL</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as LootBox).image || ''}
                        readOnly
                      />
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      To change the image, use the Upload button below:
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                        id="image-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Create a FormData object
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          try {
                            // Upload the image
                            const response = await fetch(`/api/admin/lootboxes/${(editingItem as LootBox).id}/upload`, {
                              method: 'POST',
                              body: formData,
                              credentials: 'include'
                            });
                            
                            if (!response.ok) {
                              throw new Error(`Upload failed: ${response.statusText}`);
                            }
                            
                            const data = await response.json();
                            
                            // Update the form with the new image path
                            const updatedLootbox = {
                              ...editingItem as LootBox,
                              image: data.imagePath
                            };
                            setEditingItem(updatedLootbox);
                            
                            setNotificationMessage({
                              type: 'success',
                              message: 'Image uploaded successfully'
                            });
                            
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          } catch (err) {
                            const error = err as Error;
                            console.error('Error uploading image:', error);
                            
                            setNotificationMessage({
                              type: 'error',
                              message: `Failed to upload image: ${error.message}`
                            });
                            
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          }
                        }}
                      />
                      <button
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 flex items-center"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Image
                      </button>
                    </div>
                    
                    {(editingItem as LootBox).image && (
                      <div className="bg-gray-800 rounded-md overflow-hidden">
                        <div className="text-xs text-gray-400 p-2">Current Image</div>
                        <div className="h-48 flex items-center justify-center p-4">
                          <img 
                            src={(editingItem as LootBox).image} 
                            alt="Loot Box Preview" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Item Drop Table Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Item Drop Table</h3>
                  
                  <div className="text-sm text-gray-400 mb-4">
                    Configure which items can drop from this loot box and their chances.
                    Total weight should equal 100%.
                  </div>
                  
                  {/* Item Drop Table */}
                  {(editingItem as LootBox).itemDropTable && Array.isArray((editingItem as LootBox).itemDropTable) && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 text-gray-400">Item ID</th>
                            <th className="text-left py-2 text-gray-400">Weight (%)</th>
                            <th className="text-left py-2 text-gray-400">Min Qty</th>
                            <th className="text-left py-2 text-gray-400">Max Qty</th>
                            <th className="py-2 text-gray-400"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(editingItem as LootBox).itemDropTable.map((item, index) => (
                            <tr key={index} className="border-b border-gray-700">
                              <td className="py-2">{item.itemId}</td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  min={1}
                                  max={100}
                                  className="w-16 px-2 py-1 bg-black/50 text-white border border-gray-700 rounded-md"
                                  value={item.weight}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (isNaN(value)) return;
                                    
                                    const updatedTable = [...(editingItem as LootBox).itemDropTable];
                                    updatedTable[index] = { ...item, weight: value };
                                    
                                    const updatedLootbox = {
                                      ...editingItem as LootBox,
                                      itemDropTable: updatedTable
                                    };
                                    setEditingItem(updatedLootbox);
                                  }}
                                />
                              </td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  min={1}
                                  max={99}
                                  className="w-16 px-2 py-1 bg-black/50 text-white border border-gray-700 rounded-md"
                                  value={item.minQuantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (isNaN(value)) return;
                                    
                                    const updatedTable = [...(editingItem as LootBox).itemDropTable];
                                    updatedTable[index] = { ...item, minQuantity: value };
                                    
                                    const updatedLootbox = {
                                      ...editingItem as LootBox,
                                      itemDropTable: updatedTable
                                    };
                                    setEditingItem(updatedLootbox);
                                  }}
                                />
                              </td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  min={1}
                                  max={99}
                                  className="w-16 px-2 py-1 bg-black/50 text-white border border-gray-700 rounded-md"
                                  value={item.maxQuantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (isNaN(value)) return;
                                    
                                    const updatedTable = [...(editingItem as LootBox).itemDropTable];
                                    updatedTable[index] = { ...item, maxQuantity: value };
                                    
                                    const updatedLootbox = {
                                      ...editingItem as LootBox,
                                      itemDropTable: updatedTable
                                    };
                                    setEditingItem(updatedLootbox);
                                  }}
                                />
                              </td>
                              <td className="py-2">
                                <button
                                  className="p-1 text-gray-400 hover:text-red-500"
                                  onClick={() => {
                                    const updatedTable = [...(editingItem as LootBox).itemDropTable];
                                    updatedTable.splice(index, 1);
                                    
                                    const updatedLootbox = {
                                      ...editingItem as LootBox,
                                      itemDropTable: updatedTable
                                    };
                                    setEditingItem(updatedLootbox);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Add New Item Row */}
                  <div className="mt-4 mb-4 p-3 border border-gray-700 rounded-md bg-black/20">
                    <h4 className="text-sm font-medium text-brand-orange mb-3">Add New Item</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Item ID</label>
                        <input
                          type="text"
                          className="w-full px-2 py-1 bg-black/50 text-white border border-gray-700 rounded-md"
                          placeholder="e.g. metal"
                          id="new-item-id"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Weight (%)</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          defaultValue={10}
                          className="w-full px-2 py-1 bg-black/50 text-white border border-gray-700 rounded-md"
                          id="new-item-weight"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Min Qty</label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          defaultValue={1}
                          className="w-full px-2 py-1 bg-black/50 text-white border border-gray-700 rounded-md"
                          id="new-item-min"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Max Qty</label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          defaultValue={1}
                          className="w-full px-2 py-1 bg-black/50 text-white border border-gray-700 rounded-md"
                          id="new-item-max"
                        />
                      </div>
                    </div>
                    <button
                      className="mt-3 px-3 py-1 bg-green-800/60 text-white border border-green-700/40 rounded-md hover:bg-green-700/60 flex items-center"
                      onClick={() => {
                        const itemId = (document.getElementById('new-item-id') as HTMLInputElement)?.value;
                        const weight = parseInt((document.getElementById('new-item-weight') as HTMLInputElement)?.value || '10');
                        const minQty = parseInt((document.getElementById('new-item-min') as HTMLInputElement)?.value || '1');
                        const maxQty = parseInt((document.getElementById('new-item-max') as HTMLInputElement)?.value || '1');
                        
                        if (!itemId) {
                          setNotificationMessage({
                            type: 'error',
                            message: 'Item ID is required'
                          });
                          setTimeout(() => setNotificationMessage(null), 3000);
                          return;
                        }
                        
                        // Add the new item
                        const newItem = {
                          itemId,
                          weight: isNaN(weight) ? 10 : weight,
                          minQuantity: isNaN(minQty) ? 1 : minQty,
                          maxQuantity: isNaN(maxQty) ? 1 : Math.max(maxQty, minQty)
                        };
                        
                        const updatedTable = [
                          ...(editingItem as LootBox).itemDropTable || [],
                          newItem
                        ];
                        
                        const updatedLootbox = {
                          ...editingItem as LootBox,
                          itemDropTable: updatedTable
                        };
                        
                        setEditingItem(updatedLootbox);
                        
                        // Clear the form
                        (document.getElementById('new-item-id') as HTMLInputElement).value = '';
                        (document.getElementById('new-item-weight') as HTMLInputElement).value = '10';
                        (document.getElementById('new-item-min') as HTMLInputElement).value = '1';
                        (document.getElementById('new-item-max') as HTMLInputElement).value = '1';
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                  
                  {/* Calculate Total Weight */}
                  {(editingItem as LootBox).itemDropTable && Array.isArray((editingItem as LootBox).itemDropTable) && (
                    <div className="mt-4">
                      <div className={
                        (editingItem as LootBox).itemDropTable.reduce((sum, item) => sum + item.weight, 0) === 100
                          ? "text-green-500"
                          : "text-red-500"
                      }>
                        Total Weight: {(editingItem as LootBox).itemDropTable.reduce((sum, item) => sum + item.weight, 0)}%
                        {(editingItem as LootBox).itemDropTable.reduce((sum, item) => sum + item.weight, 0) !== 100 && (
                          <span> (Should be 100%)</span>
                        )}
                        {(editingItem as LootBox).itemDropTable.reduce((sum, item) => sum + item.weight, 0) === 100 && (
                          <span> ✓</span>
                        )}
                      </div>
                      
                      {/* Normalize Weights Button */}
                      {(editingItem as LootBox).itemDropTable.reduce((sum, item) => sum + item.weight, 0) !== 100 && (
                        <button
                          className="mt-2 px-3 py-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-md hover:border-brand-orange hover:text-brand-orange transition-colors text-sm"
                          onClick={() => {
                            const items = [...(editingItem as LootBox).itemDropTable];
                            if (items.length === 0) return;
                            
                            const currentTotal = items.reduce((sum, item) => sum + item.weight, 0);
                            if (currentTotal === 0) return;
                            
                            const normalizedItems = items.map(item => ({
                              ...item,
                              weight: Math.round((item.weight / currentTotal) * 100)
                            }));
                            
                            // Adjust to exactly 100 by adding/subtracting from the last item
                            const newTotal = normalizedItems.reduce((sum, item) => sum + item.weight, 0);
                            const diff = 100 - newTotal;
                            if (diff !== 0 && normalizedItems.length > 0) {
                              normalizedItems[normalizedItems.length - 1].weight += diff;
                            }
                            
                            const updatedLootbox = {
                              ...editingItem as LootBox,
                              itemDropTable: normalizedItems
                            };
                            setEditingItem(updatedLootbox);
                          }}
                        >
                          Normalize Weights to 100%
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
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
                      handleEditSubmit(editingItem);
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
                {/* Basic Info Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Quest ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Quest).id || ''}
                        readOnly={true}
                        disabled={true}
                      />
                      <p className="text-xs text-gray-500 mt-1">ID cannot be changed</p>
                    </div>
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
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as any).date ? new Date((editingItem as any).date).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const updatedQuest = {...editingItem as any, date: e.target.value};
                          setEditingItem(updatedQuest);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Difficulty (1-5)</label>
                      <select
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Quest).difficulty}
                        onChange={(e) => {
                          const updatedQuest = {...editingItem as Quest, difficulty: parseInt(e.target.value)};
                          setEditingItem(updatedQuest);
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level}>{level} {Array(level).fill('★').join('')}</option>
                        ))}
                      </select>
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
                    {/* Order in line field */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Order in Line</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as any).orderInLine !== undefined ? (editingItem as any).orderInLine : 0}
                        onChange={(e) => {
                          const updatedQuest = {...editingItem as any, orderInLine: parseInt(e.target.value)};
                          setEditingItem(updatedQuest);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <input 
                      type="checkbox"
                      id="quest-active"
                      className="form-checkbox h-4 w-4 text-brand-orange border-gray-700 rounded"
                      checked={(editingItem as any).active !== false}
                      onChange={(e) => {
                        const updatedQuest = {...editingItem as any, active: e.target.checked};
                        setEditingItem(updatedQuest);
                      }}
                    />
                    <label htmlFor="quest-active" className="ml-2 text-gray-300 text-sm">
                      Quest is active (appears in quest list)
                    </label>
                  </div>
                </div>
                
                {/* Quest Content Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Quest Content</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Flavor Text <span className="text-xs text-gray-500">(Background Story)</span></label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[100px]"
                      value={(editingItem as Quest).description}
                      onChange={(e) => {
                        const updatedQuest = {...editingItem as Quest, description: e.target.value};
                        setEditingItem(updatedQuest);
                      }}
                      placeholder="Add a flavor text to set the mood or provide background story"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Mission Brief <span className="text-xs text-gray-500">(Direct Instructions)</span></label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[100px]"
                      value={(editingItem as any).missionBrief || ''}
                      onChange={(e) => {
                        const updatedQuest = {...editingItem as any, missionBrief: e.target.value};
                        setEditingItem(updatedQuest);
                      }}
                      placeholder="Provide clear instructions for the mission objectives"
                    />
                  </div>
                </div>
                
                {/* Media Content Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Media Content</h3>
                  
                  {/* Hero Image */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Hero Image URL</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as any).heroImage || ''}
                      onChange={(e) => {
                        const updatedQuest = {...editingItem as any, heroImage: e.target.value};
                        setEditingItem(updatedQuest);
                      }}
                      placeholder="Enter URL for the main quest image"
                    />
                    {(editingItem as any).heroImage && (
                      <div className="mt-2 bg-gray-800 rounded-md overflow-hidden">
                        <div className="text-xs text-gray-400 p-2">Hero Image Preview</div>
                        <div className="h-32 flex items-center justify-center p-2">
                          <img 
                            src={(editingItem as any).heroImage} 
                            alt="Hero Preview" 
                            className="max-h-full max-w-full object-contain" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Content Images */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-300 text-sm">Additional Images</label>
                      <button
                        className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded hover:bg-gray-700 flex items-center"
                        onClick={() => {
                          const content = (editingItem as any).content || { videos: [], images: [], codeBlocks: [] };
                          const updatedQuest = {
                            ...editingItem as any,
                            content: {
                              ...content,
                              images: [...(content.images || []), ""]
                            }
                          };
                          setEditingItem(updatedQuest);
                        }}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Add Image
                      </button>
                    </div>
                    
                    {/* Image List */}
                    <div className="space-y-2">
                      {((editingItem as any).content?.images || []).map((imageUrl: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                            value={imageUrl}
                            onChange={(e) => {
                              const content = {...(editingItem as any).content};
                              content.images[index] = e.target.value;
                              const updatedQuest = {...editingItem as any, content};
                              setEditingItem(updatedQuest);
                            }}
                            placeholder="Image URL"
                          />
                          <button
                            className="p-2 text-red-500 hover:text-red-700 rounded"
                            onClick={() => {
                              const content = {...(editingItem as any).content};
                              content.images.splice(index, 1);
                              const updatedQuest = {...editingItem as any, content};
                              setEditingItem(updatedQuest);
                            }}
                            onMouseEnter={() => window.sounds?.hover()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      {(!((editingItem as any).content?.images?.length > 0)) && (
                        <div className="text-xs text-gray-500 bg-black/50 p-2 rounded">
                          No additional images added yet
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* YouTube Videos */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-300 text-sm">YouTube Videos</label>
                      <button
                        className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded hover:bg-gray-700 flex items-center"
                        onClick={() => {
                          const content = (editingItem as any).content || { videos: [], images: [], codeBlocks: [] };
                          const updatedQuest = {
                            ...editingItem as any,
                            content: {
                              ...content,
                              videos: [...(content.videos || []), ""]
                            }
                          };
                          setEditingItem(updatedQuest);
                        }}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Add Video
                      </button>
                    </div>
                    
                    {/* Video List */}
                    <div className="space-y-2">
                      {((editingItem as any).content?.videos || []).map((videoUrl: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                            value={videoUrl}
                            onChange={(e) => {
                              const videoInput = e.target.value;
                              // Extract video ID if a full YouTube URL is provided
                              let videoId = videoInput;
                              const watchMatch = videoInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                              if (watchMatch && watchMatch[1]) {
                                videoId = watchMatch[1];
                              }
                              
                              const content = {...(editingItem as any).content};
                              content.videos[index] = videoId;
                              const updatedQuest = {...editingItem as any, content};
                              setEditingItem(updatedQuest);
                            }}
                            placeholder="YouTube Video ID or URL"
                          />
                          <button
                            className="p-2 text-red-500 hover:text-red-700 rounded"
                            onClick={() => {
                              const content = {...(editingItem as any).content};
                              content.videos.splice(index, 1);
                              const updatedQuest = {...editingItem as any, content};
                              setEditingItem(updatedQuest);
                            }}
                            onMouseEnter={() => window.sounds?.hover()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      {(!((editingItem as any).content?.videos?.length > 0)) && (
                        <div className="text-xs text-gray-500 bg-black/50 p-2 rounded">
                          No videos added yet
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Code Examples */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-300 text-sm">Code Examples</label>
                      <button
                        className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded hover:bg-gray-700 flex items-center"
                        onClick={() => {
                          const content = (editingItem as any).content || { videos: [], images: [], codeBlocks: [] };
                          const updatedQuest = {
                            ...editingItem as any,
                            content: {
                              ...content,
                              codeBlocks: [...(content.codeBlocks || []), { code: "", language: "javascript" }]
                            }
                          };
                          setEditingItem(updatedQuest);
                        }}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Add Code Example
                      </button>
                    </div>
                    
                    {/* Code Blocks */}
                    <div className="space-y-3">
                      {((editingItem as any).content?.codeBlocks || []).map((codeBlock: { code: string, language: string }, index: number) => (
                        <div key={index} className="bg-black/50 border border-gray-700 rounded-md p-3">
                          <div className="flex justify-between items-center mb-2">
                            <select
                              className="bg-gray-800 text-white border-0 rounded px-2 py-1 text-xs"
                              value={codeBlock.language}
                              onChange={(e) => {
                                const content = {...(editingItem as any).content};
                                content.codeBlocks[index].language = e.target.value;
                                const updatedQuest = {...editingItem as any, content};
                                setEditingItem(updatedQuest);
                              }}
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="cpp">C++</option>
                              <option value="html">HTML</option>
                              <option value="css">CSS</option>
                            </select>
                            
                            <button
                              className="p-1 text-red-500 hover:text-red-700 rounded"
                              onClick={() => {
                                const content = {...(editingItem as any).content};
                                content.codeBlocks.splice(index, 1);
                                const updatedQuest = {...editingItem as any, content};
                                setEditingItem(updatedQuest);
                              }}
                              onMouseEnter={() => window.sounds?.hover()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <textarea
                            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[100px] font-mono text-sm"
                            value={codeBlock.code}
                            onChange={(e) => {
                              const content = {...(editingItem as any).content};
                              content.codeBlocks[index].code = e.target.value;
                              const updatedQuest = {...editingItem as any, content};
                              setEditingItem(updatedQuest);
                            }}
                            placeholder={`// ${codeBlock.language} code example`}
                          />
                        </div>
                      ))}
                      
                      {(!((editingItem as any).content?.codeBlocks?.length > 0)) && (
                        <div className="text-xs text-gray-500 bg-black/50 p-2 rounded">
                          No code examples added yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Component Requirements Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Component Requirements</h3>
                  <div className="text-sm text-gray-400 mb-4">
                    Note: Component requirements are managed through the component kit system. 
                    The Oracle currently displays but doesn't edit component requirements directly.
                  </div>
                  
                  {(editingItem as Quest).componentRequirements && (editingItem as Quest).componentRequirements.length > 0 && (
                    <div className="bg-black/50 p-3 rounded border border-gray-700">
                      <div className="text-sm font-medium text-gray-300 mb-2">Current Requirements:</div>
                      <div className="space-y-2">
                        {(editingItem as Quest).componentRequirements?.map((comp, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between bg-gray-800/50 p-2 rounded"
                          >
                            <div>
                              <span className="text-sm font-medium text-white">{comp.name}</span>
                              <p className="text-xs text-gray-400 mt-1">{comp.description}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                              Kit: {comp.kitId || "Unknown"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(!((editingItem as Quest).componentRequirements && (editingItem as Quest).componentRequirements.length > 0)) && (
                    <div className="text-center p-4 bg-black/40 rounded-md">
                      <div className="text-gray-500 text-sm">No component requirements</div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
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