import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Search, RefreshCw, Package, Sparkles, FileText, Settings, Users, 
  PlusCircle, Loader2, Edit, Trash2, AlertTriangle, Upload, 
  Shield, ShieldCheck, ShieldX, Star, CalendarClock, LineChart,
  Database, Eye, FileImage, Box, Plus, CircuitBoard, Clipboard,
  ClipboardList, Grid3X3, ArrowRight, AlertCircle, Clock, User
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

// Game item interface
interface GameItem {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
  category?: string;
}

// Game item interface based on the itemDatabase.ts in the server
interface GameItem {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
  category?: string;
}

// Component Kit interfaces for educational kits
interface ComponentKit {
  id: string;
  name: string;
  description: string;
  imagePath: string | null;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt?: string;
  updatedAt?: string;
}

// Kit Component interface
interface KitComponent {
  id: number;
  kitId: string;
  name: string;
  description: string;
  imagePath: string | null;
  partNumber?: string;
  isRequired: boolean;
  quantity: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

// Recipe interface for crafting.exe
interface Recipe {
  id: number;
  name: string;
  description: string;
  flavorText?: string;
  resultItem: string;
  resultQuantity: number;
  gridSize: number;
  pattern: (string | null)[][];
  requiredItems: Record<string, number>;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  unlocked: boolean;
  image: string;
  heroImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

const FullscreenOracleApp: React.FC<FullscreenOracleAppProps> = ({ onClose }) => {
  // State for tabs - include 'recipes' for crafting management
  const [activeTab, setActiveTab] = useState<'lootboxes' | 'quests' | 'users' | 'items' | 'kits' | 'recipes' | 'settings'>('lootboxes');
  
  // State for data
  const [lootboxes, setLootboxes] = useState<LootBox[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [items, setItems] = useState<GameItem[]>([]);
  const [componentKits, setComponentKits] = useState<ComponentKit[]>([]);
  const [kitComponents, setKitComponents] = useState<Record<string, KitComponent[]>>({});
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeKitId, setActiveKitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for modals and actions
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; type: string; id: string | null; name: string; kitId?: string }>({
    show: false,
    type: '',
    id: null,
    name: '',
    kitId: undefined
  });
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // State for editing
  const [editingItem, setEditingItem] = useState<LootBox | Quest | GameItem | ComponentKit | KitComponent | Recipe | null>(null);
  const [editingType, setEditingType] = useState<'lootbox' | 'quest' | 'item' | 'kit' | 'component' | 'recipe' | null>(null);
  
  // Loading states
  const [loadingLootboxes, setLoadingLootboxes] = useState(true);
  const [loadingQuests, setLoadingQuests] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingKits, setLoadingKits] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingComponents, setLoadingComponents] = useState(false);
  
  // Fetch lootboxes, quests, users, items, recipes, and component kits using Oracle API
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
    
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const response = await fetch('/api/items');
        if (response.ok) {
          const data = await response.json();
          console.log('Items data from API:', data);
          if (Array.isArray(data)) {
            // Log sample item to inspect structure
            if (data.length > 0) {
              console.log('Example item structure:', data[0]);
            }
            
            // Deduplicate items based on ID
            const uniqueIds = new Set();
            const uniqueItems = data.filter(item => {
              if (!uniqueIds.has(item.id)) {
                uniqueIds.add(item.id);
                return true;
              }
              return false;
            });
            
            if (uniqueItems.length < data.length) {
              console.warn(`Filtered out ${data.length - uniqueItems.length} duplicate items`);
            }
            
            setItems(uniqueItems);
            console.log(`Loaded ${uniqueItems.length} game items`);
          } else {
            console.error('Expected array for items but got:', typeof data);
            setItems([]);
          }
        } else {
          console.error('Failed to fetch items');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoadingItems(false);
      }
    };
    
    const fetchComponentKits = async () => {
      try {
        setLoadingKits(true);
        const response = await fetch('/api/admin/kits');
        if (response.ok) {
          const data = await response.json();
          console.log('Component kits data from API:', data);
          if (Array.isArray(data)) {
            setComponentKits(data);
            console.log(`Loaded ${data.length} component kits`);
            
            // If there are kits, fetch components for the first kit
            if (data.length > 0) {
              setActiveKitId(data[0].id);
            }
          } else {
            console.error('Expected array for component kits but got:', typeof data);
            setComponentKits([]);
          }
        } else {
          console.error('Failed to fetch component kits, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching component kits:', error);
      } finally {
        setLoadingKits(false);
      }
    };
    
    const fetchRecipes = async () => {
      try {
        setLoadingRecipes(true);
        const response = await fetch('/api/admin/recipes');
        if (response.ok) {
          const data = await response.json();
          console.log('Recipes data from API:', data);
          if (Array.isArray(data)) {
            setRecipes(data);
            console.log(`Loaded ${data.length} crafting recipes`);
          } else {
            console.error('Expected array for recipes but got:', typeof data);
            setRecipes([]);
          }
        } else {
          console.error('Failed to fetch recipes, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchLootboxes();
    fetchQuests();
    fetchUsers();
    fetchItems();
    fetchComponentKits();
    fetchRecipes();
  }, []);

  // Add debug logging to see what we're getting from the API
  useEffect(() => {
    if (lootboxes.length > 0) {
      console.log("Lootboxes data:", lootboxes);
    }
  }, [lootboxes]);
  
  // Fetch components when activeKitId changes
  useEffect(() => {
    if (activeKitId) {
      const fetchComponentsForKit = async () => {
        try {
          setLoadingComponents(true);
          const response = await fetch(`/api/admin/kits/${activeKitId}/components`);
          if (response.ok) {
            const data = await response.json();
            console.log(`Components for kit ${activeKitId}:`, data);
            
            // Update the components for this kit
            setKitComponents(prev => ({
              ...prev,
              [activeKitId]: data
            }));
          } else {
            console.error(`Failed to fetch components for kit ${activeKitId}, status:`, response.status);
          }
        } catch (error) {
          console.error(`Error fetching components for kit ${activeKitId}:`, error);
        } finally {
          setLoadingComponents(false);
        }
      };
      
      fetchComponentsForKit();
    }
  }, [activeKitId]);

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
  
  // Filter items based on search query
  const filteredItems = items.filter(item => {
    // Make sure item exists
    if (!item) return false;
    
    // If search query is empty, show all
    if (!searchQuery) return true;
    
    // Check various properties
    const nameMatches = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatches = item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatches = item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const flavorMatches = item.flavorText?.toLowerCase().includes(searchQuery.toLowerCase());
    const rarityMatches = item.rarity.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatches = item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return nameMatches || idMatches || descMatches || 
           flavorMatches || rarityMatches || (categoryMatches || false);
  });
  
  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe => {
    // Make sure recipe exists
    if (!recipe) return false;
    
    // If search query is empty, show all
    if (!searchQuery) return true;
    
    // Check various properties
    const nameMatches = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatches = recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const flavorMatches = recipe.flavorText?.toLowerCase().includes(searchQuery.toLowerCase());
    const resultItemMatches = recipe.resultItem.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatches = recipe.category.toLowerCase().includes(searchQuery.toLowerCase());
    const difficultyMatches = recipe.difficulty.toLowerCase().includes(searchQuery.toLowerCase());
    
    return nameMatches || descMatches || flavorMatches || 
           resultItemMatches || categoryMatches || difficultyMatches;
  });

  // Handlers
  const handleTabChange = (tab: 'lootboxes' | 'quests' | 'users' | 'items' | 'kits' | 'recipes' | 'settings') => {
    window.sounds?.click();
    setActiveTab(tab);
  };
  
  // Handle kit selection
  const handleKitSelect = (kitId: string) => {
    window.sounds?.click();
    setActiveKitId(kitId);
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
    } else if (activeTab === 'items') {
      setLoadingItems(true);
      try {
        const response = await fetch('/api/items');
        if (response.ok) {
          const data = await response.json();
          console.log('Refreshed items data:', data);
          setItems(data);
        }
      } catch (error) {
        console.error('Error refreshing items:', error);
      } finally {
        setLoadingItems(false);
      }
    } else if (activeTab === 'kits') {
      setLoadingKits(true);
      try {
        const response = await fetch('/api/admin/kits');
        if (response.ok) {
          const data = await response.json();
          setComponentKits(data);
          
          // If we have an active kit, refresh its components too
          if (activeKitId) {
            setLoadingComponents(true);
            try {
              const componentResponse = await fetch(`/api/admin/kits/${activeKitId}/components`);
              if (componentResponse.ok) {
                const componentData = await componentResponse.json();
                setKitComponents(prev => ({
                  ...prev,
                  [activeKitId]: componentData
                }));
              }
            } catch (compError) {
              console.error(`Error refreshing components for kit ${activeKitId}:`, compError);
            } finally {
              setLoadingComponents(false);
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing component kits:', error);
      } finally {
        setLoadingKits(false);
      }
    } else if (activeTab === 'recipes') {
      setLoadingRecipes(true);
      try {
        const response = await fetch('/api/admin/recipes');
        if (response.ok) {
          const data = await response.json();
          console.log('Refreshed recipes data:', data);
          setRecipes(data);
        }
      } catch (error) {
        console.error('Error refreshing recipes:', error);
      } finally {
        setLoadingRecipes(false);
      }
    }
  };
  
  // Edit handlers
  const handleEditClick = (type: 'lootbox' | 'quest', item: LootBox | Quest) => {
    window.sounds?.click();
    setEditingType(type);
    setEditingItem(item);
  };
  
  // Handle editing an item
  const handleEditItemClick = (item: GameItem) => {
    window.sounds?.click();
    setEditingType('item');
    setEditingItem(item);
  };
  
  // Handle editing a component kit
  const handleEditKitClick = (kit: ComponentKit) => {
    window.sounds?.click();
    setEditingType('kit');
    setEditingItem(kit);
  };
  
  // Handle editing a component within a kit
  const handleEditComponentClick = (component: KitComponent) => {
    window.sounds?.click();
    setEditingType('component');
    setEditingItem(component);
  };
  
  // Handle editing a recipe
  const handleEditRecipeClick = (recipe: Recipe) => {
    window.sounds?.click();
    setEditingType('recipe');
    setEditingItem(recipe);
  };
  
  const closeEditDialog = () => {
    setEditingType(null);
    setEditingItem(null);
  };
  
  const handleEditSubmit = async (data: any) => {
    if (!editingItem || !editingType) return;
    
    window.sounds?.click();
    try {
      let endpoint = '';
      let method = 'PUT';
      let body: any = {};
      const id = (editingItem as any).id;
      
      if (editingType === 'lootbox') {
        endpoint = '/api/oracle/entities';
        body = {
          tableName: 'lootBoxConfigs',
          id,
          data
        };
      } else if (editingType === 'quest') {
        endpoint = '/api/oracle/entities';
        body = {
          tableName: 'quests',
          id,
          data
        };
      } else if (editingType === 'item') {
        endpoint = `/api/items/${id}`;
        body = data;
      } else if (editingType === 'kit') {
        endpoint = `/api/admin/kits/${id}`;
        body = data;
      } else if (editingType === 'component') {
        endpoint = `/api/admin/components/${id}`;
        body = data;
      } else if (editingType === 'recipe') {
        endpoint = `/api/admin/recipes/${id}`;
        body = data;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
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
        } else if (editingType === 'item') {
          setItems(prevItems => 
            prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
          );
        } else if (editingType === 'kit') {
          setComponentKits(prevKits => 
            prevKits.map(kit => kit.id === updatedItem.id ? updatedItem : kit)
          );
        } else if (editingType === 'component') {
          const kitId = (editingItem as KitComponent).kitId;
          setKitComponents(prev => {
            if (!prev[kitId]) return prev;
            
            return {
              ...prev,
              [kitId]: prev[kitId].map(comp => 
                comp.id === updatedItem.id ? updatedItem : comp
              )
            };
          });
        } else if (editingType === 'recipe') {
          setRecipes(prevRecipes => 
            prevRecipes.map(recipe => recipe.id === updatedItem.id ? updatedItem : recipe)
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
        const errorText = await response.text();
        let errorMessage = 'Failed to update';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If the response isn't JSON, use the text directly
          errorMessage = errorText || errorMessage;
        }
        
        setNotificationMessage({
          type: 'error',
          message: `Error: ${errorMessage}`
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
  const handleDeleteClick = (type: string, id: string, name: string, kitId?: string) => {
    window.sounds?.click();
    setConfirmDelete({
      show: true,
      type,
      id,
      name,
      kitId
    });
  };
  
  const closeDeleteDialog = () => {
    setConfirmDelete({
      show: false,
      type: '',
      id: null,
      name: '',
      kitId: undefined
    });
  };
  
  const confirmDeleteItem = async () => {
    if (!confirmDelete.id || !confirmDelete.type) return;
    
    window.sounds?.click();
    try {
      let endpoint = '';
      let method = 'DELETE';
      let body: any = {};
      
      if (confirmDelete.type === 'lootbox') {
        endpoint = '/api/oracle/entities';
        body = {
          tableName: 'lootBoxConfigs',
          id: confirmDelete.id
        };
      } else if (confirmDelete.type === 'quest') {
        endpoint = '/api/oracle/entities';
        body = {
          tableName: 'quests',
          id: confirmDelete.id
        };
      } else if (confirmDelete.type === 'item') {
        endpoint = '/api/items/' + confirmDelete.id;
        method = 'DELETE';
        body = null; // No body needed for REST-style item deletion
      } else if (confirmDelete.type === 'kit') {
        endpoint = '/api/admin/kits/' + confirmDelete.id;
        method = 'DELETE';
        body = null;
      } else if (confirmDelete.type === 'component') {
        endpoint = '/api/admin/components/' + confirmDelete.id;
        method = 'DELETE';
        body = null;
      } else if (confirmDelete.type === 'recipe') {
        endpoint = '/api/admin/recipes/' + confirmDelete.id;
        method = 'DELETE';
        body = null;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
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
        } else if (confirmDelete.type === 'item') {
          setItems(prevItems => prevItems.filter(item => item.id !== confirmDelete.id));
        } else if (confirmDelete.type === 'kit') {
          setComponentKits(prevKits => prevKits.filter(kit => kit.id !== confirmDelete.id));
          
          // Also clean up kit components from state
          setKitComponents(prev => {
            const newComponents = { ...prev };
            delete newComponents[confirmDelete.id];
            return newComponents;
          });
          
          // If this was the active kit, set a new active kit if possible
          if (activeKitId === confirmDelete.id) {
            setComponentKits(prevKits => {
              const remainingKits = prevKits.filter(kit => kit.id !== confirmDelete.id);
              if (remainingKits.length > 0) {
                setActiveKitId(remainingKits[0].id);
              } else {
                setActiveKitId(null);
              }
              return prevKits;
            });
          }
        } else if (confirmDelete.type === 'component') {
          // For component deletion, we need to identify which kit it belongs to
          // This would ideally be passed in with the deletion request or stored
          // temporarily when confirming deletion
          const componentKitId = confirmDelete.kitId || activeKitId;
          
          if (componentKitId) {
            setKitComponents(prev => {
              if (!prev[componentKitId]) return prev;
              
              return {
                ...prev,
                [componentKitId]: prev[componentKitId].filter(
                  comp => comp.id.toString() !== confirmDelete.id
                )
              };
            });
          }
        } else if (confirmDelete.type === 'recipe') {
          setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id.toString() !== confirmDelete.id));
        }
        
        setTimeout(() => {
          setNotificationMessage(null);
        }, 3000);
      } else {
        window.sounds?.error();
        const errorText = await response.text();
        let errorMessage = 'Failed to delete';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If the response isn't JSON, use the text directly
          errorMessage = errorText || errorMessage;
        }
        
        setNotificationMessage({
          type: 'error',
          message: `Error: ${errorMessage}`
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

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    // If search query is empty, show all
    if (!searchQuery) return true;
    
    // Check username
    const usernameMatches = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check user ID (as string)
    const idMatches = user.id.toString().includes(searchQuery);
    
    // Check roles
    const rolesMatch = user.roles?.some(role => 
      role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return usernameMatches || idMatches || (rolesMatch || false);
  });

  // Render user management section
  const renderUsers = () => {
    if (loadingUsers) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
          <p className="text-brand-orange">Loading users...</p>
        </div>
      );
    }

    // Calculate user stats
    const totalUsers = users.length;
    const adminCount = users.filter(user => user.roles?.includes('admin')).length;
    const totalItems = users.reduce((sum, user) => sum + user.totalItems, 0);
    const avgLevel = users.length > 0 ? 
      (users.reduce((sum, user) => sum + user.level, 0) / users.length).toFixed(1) : '0';

    return (
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/50 border border-gray-700 rounded-lg p-4 hover:border-brand-orange/40 transition-colors">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-brand-orange mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/50 border border-gray-700 rounded-lg p-4 hover:border-brand-orange/40 transition-colors">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-white">{adminCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/50 border border-gray-700 rounded-lg p-4 hover:border-brand-orange/40 transition-colors">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Avg. Level</p>
                <p className="text-2xl font-bold text-white">{avgLevel}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/50 border border-gray-700 rounded-lg p-4 hover:border-brand-orange/40 transition-colors">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-white">{totalItems.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Users table */}
        <div className="bg-black/50 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white">All Users</h3>
            <p className="text-sm text-gray-400">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} registered in the system</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Roles</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">XP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-mono text-gray-300">{user.id}</td>
                    <td className="px-4 py-3 font-semibold text-white">{user.username}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <span 
                            key={role}
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                              role === 'admin' 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {role}
                          </span>
                        )) || <span className="text-gray-500">None</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-yellow-500">{user.level}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.xp.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-300">{user.totalItems.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString() 
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className={`
                          text-xs px-2 py-1 rounded flex items-center gap-1 
                          ${user.roles?.includes('admin') 
                            ? 'text-red-500 hover:text-red-400' 
                            : 'text-green-500 hover:text-green-400'}
                        `}
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/admin/users/${user.id}/toggle-admin`, {
                              method: 'PUT'
                            });
                            
                            if (response.ok) {
                              window.sounds?.success();
                              // Refresh user data
                              const updatedUsers = await fetch('/api/admin/users').then(res => res.json());
                              setUsers(updatedUsers);
                              
                              setNotificationMessage({
                                type: 'success',
                                message: `User role updated successfully`
                              });
                              
                              setTimeout(() => {
                                setNotificationMessage(null);
                              }, 3000);
                            } else {
                              window.sounds?.error();
                              const errorData = await response.json();
                              setNotificationMessage({
                                type: 'error',
                                message: `Error: ${errorData.message || 'Failed to update role'}`
                              });
                              setTimeout(() => {
                                setNotificationMessage(null);
                              }, 3000);
                            }
                          } catch (err) {
                            window.sounds?.error();
                            const error = err as Error;
                            setNotificationMessage({
                              type: 'error',
                              message: `Error: ${error.message || 'Failed to update role'}`
                            });
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          }
                        }}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        {user.roles?.includes('admin') ? (
                          <>
                            <ShieldX className="h-3.5 w-3.5" />
                            <span>Revoke Admin</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Grant Admin</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr className="h-32">
                    <td colSpan={9} className="text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render items grid
  const renderItems = () => {
    if (loadingItems) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
          <p className="text-brand-orange">Loading items...</p>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Database className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg mb-2">No items found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className="border border-gray-700 rounded-lg bg-space-dark/80 p-4 hover:border-brand-orange/60 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-white">{item.name}</h3>
              <div className="flex space-x-1">
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Edit item"
                  onClick={() => handleEditItemClick(item)}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="Delete item"
                  onClick={() => handleDeleteClick('item', item.id, item.name)}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                </button>
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                  title="View item details"
                  onClick={() => {}} // Future feature: view item details
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <Eye className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
            
            {item.imagePath && (
              <div className="relative h-32 mb-3 rounded overflow-hidden flex items-center justify-center bg-gray-900/50">
                <img 
                  src={item.imagePath} 
                  alt={item.name} 
                  className="h-full object-contain"
                />
              </div>
            )}
            
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {item.description}
            </p>
            
            {item.flavorText && (
              <p className="text-gray-400 text-xs italic mb-3">
                "{item.flavorText}"
              </p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <span className={`
                text-xs px-2 py-1 rounded-full 
                ${rarityColorClass(item.rarity)}
              `}>
                {item.rarity}
              </span>
              {item.category && (
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                  {item.category}
                </span>
              )}
            </div>
            
            {item.craftingUses && item.craftingUses.length > 0 && (
              <div className="text-xs">
                <h4 className="text-gray-400 mb-1">Crafting Uses:</h4>
                <div className="flex flex-wrap gap-1">
                  {item.craftingUses.map((use, index) => (
                    <span 
                      key={index}
                      className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                    >
                      {use}
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
  
  // Render Recipes for crafting.exe
  const renderRecipes = () => {
    const actionBar = (
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center px-3 py-2 bg-brand-orange hover:bg-brand-orange/80 text-white rounded-md transition-colors"
            onClick={() => refreshData('recipes')}
            onMouseEnter={() => window.sounds?.hover()}
            disabled={loadingRecipes}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingRecipes ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            onClick={() => {
              // Create a new recipe with default values
              const newRecipe = {
                id: Math.floor(Math.random() * 1000000).toString(),
                name: "New Recipe",
                description: "Description of this new recipe",
                flavorText: "",
                resultItem: "item-id",
                resultQuantity: 1,
                gridSize: 3,
                pattern: [["", "", ""], ["", "", ""], ["", "", ""]],
                requiredItems: { "copper": 1 },
                difficulty: "easy" as const,
                category: "general",
                unlocked: false,
                image: "",
                createdAt: new Date().toISOString()
              };
              
              // Open the edit dialog for the new recipe
              setEditingItem(newRecipe);
              setEditingType('recipe');
              window.sounds?.click();
            }}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Recipe
          </button>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-700 rounded-md text-white focus:border-brand-orange focus:outline-none"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery('')}
              onMouseEnter={() => window.sounds?.hover()}
            >
              <X className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>
    );
    
    // Show loading state
    if (loadingRecipes) {
      return (
        <div>
          {actionBar}
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Loading recipes...</p>
          </div>
        </div>
      );
    }
    
    // Show empty state
    if (recipes.length === 0) {
      return (
        <div>
          {actionBar}
          <div className="text-center p-12 bg-black/20 rounded-lg border border-gray-800">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">No recipes found</p>
            <p className="text-sm text-gray-400">Get started by creating your first recipe</p>
          </div>
        </div>
      );
    }
    
    // Show no results for search
    if (filteredRecipes.length === 0 && searchQuery) {
      return (
        <div>
          {actionBar}
          <div className="text-center p-12 bg-black/20 rounded-lg border border-gray-800">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">No matching recipes</p>
            <p className="text-sm text-gray-400">Try a different search term or clear your search</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {actionBar}
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => (
            <div 
              key={recipe.id}
              className="border border-gray-700 bg-black/40 rounded-lg p-4 hover:border-brand-orange/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-bold truncate">{recipe.name}</h3>
                <div className="flex space-x-1">
                  <button 
                    className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                    title="Edit recipe"
                    onClick={() => handleEditRecipeClick(recipe)}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                    title="Delete recipe"
                    onClick={() => handleDeleteClick('recipe', recipe.id.toString(), recipe.name)}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="w-16 h-16 mr-3 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                  {/* Find the result item in the items array to display its image */}
                  {(() => {
                    // Look for image in recipe.image first
                    if (recipe.image) {
                      return (
                        <img 
                          src={recipe.image}
                          alt={recipe.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                            (e.target as HTMLImageElement).className = 'w-8 h-8 opacity-30';
                          }}
                        />
                      );
                    }
                    
                    // Otherwise, look for the result item's image in the items array
                    const resultItem = items.find(item => item.id === recipe.resultItem);
                    if (resultItem?.imagePath) {
                      return (
                        <img 
                          src={resultItem.imagePath}
                          alt={recipe.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                            (e.target as HTMLImageElement).className = 'w-8 h-8 opacity-30';
                          }}
                        />
                      );
                    }
                    
                    // Fallback if no image is found
                    return <ClipboardList className="w-8 h-8 text-gray-600" />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full mr-2">
                      {recipe.category || 'Uncategorized'}
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-white">
                    <span className="font-medium">Result:</span> {recipe.resultQuantity}x {recipe.resultItem}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">{recipe.description}</p>
              
              {recipe.flavorText && (
                <p className="text-xs text-gray-500 italic mb-2">"{recipe.flavorText}"</p>
              )}
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Required Items:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(recipe.requiredItems).map(([item, quantity], index) => (
                    <span 
                      key={index}
                      className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded"
                    >
                      {quantity}x {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render component kits
  const renderComponentKits = () => {
    if (loadingKits) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
          <p className="text-brand-orange">Loading component kits...</p>
        </div>
      );
    }

    if (componentKits.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Box className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg mb-2">No component kits found</p>
          <p className="text-sm">Try creating a new component kit</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {/* Kit selector sidebar and component display */}
        <div className="flex">
          {/* Component kit list */}
          <div className="w-1/3 pr-4 overflow-y-auto max-h-[calc(100vh-250px)]">
            <h3 className="text-lg font-bold text-white mb-3">Component Kits</h3>
            <div className="space-y-2">
              {componentKits.map(kit => (
                <div 
                  key={kit.id}
                  className={`border rounded-lg p-3 cursor-pointer ${
                    activeKitId === kit.id 
                      ? 'border-brand-orange bg-gray-800' 
                      : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                  }`}
                  onClick={() => handleKitSelect(kit.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Kit image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-black/30 rounded flex items-center justify-center overflow-hidden">
                      {kit.imagePath ? (
                        <img
                          src={kit.imagePath}
                          alt={kit.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                            (e.target as HTMLImageElement).className = 'w-10 h-10 opacity-30';
                          }}
                        />
                      ) : (
                        <Box className="w-10 h-10 text-gray-700" />
                      )}
                    </div>
                    
                    {/* Kit details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white">{kit.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{kit.category || 'Uncategorized'}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                            title="Edit kit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditKitClick(kit);
                            }}
                            onMouseEnter={() => window.sounds?.hover()}
                          >
                            <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                          </button>
                          <button 
                            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                            title="Delete kit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick('kit', kit.id, kit.name);
                            }}
                            onMouseEnter={() => window.sounds?.hover()}
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          kit.difficulty === 'beginner' ? 'bg-green-900/50 text-green-300' :
                          kit.difficulty === 'intermediate' ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-red-900/50 text-red-300'
                        }`}>
                          {kit.difficulty || 'beginner'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Components list */}
          <div className="w-2/3 pl-4 border-l border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Components</h3>
              <button
                className="flex items-center px-3 py-1 rounded-md bg-brand-orange text-white hover:bg-brand-orange/90 transition-colors"
                onClick={() => window.sounds?.click()}
                onMouseEnter={() => window.sounds?.hover()}
                disabled={!activeKitId}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Component</span>
              </button>
            </div>
            
            {!activeKitId ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Box className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-lg mb-2">No kit selected</p>
                <p className="text-sm">Select a kit from the list to view its components</p>
              </div>
            ) : loadingComponents ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-brand-orange mb-3" />
                <p className="text-brand-orange">Loading components...</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {kitComponents[activeKitId]?.length > 0 ? (
                  kitComponents[activeKitId].map(component => (
                    <div 
                      key={component.id}
                      className="border border-gray-700 rounded-lg p-3 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex gap-3">
                        {/* Component image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-black/30 rounded flex items-center justify-center overflow-hidden">
                          {component.imagePath ? (
                            <img
                              src={component.imagePath}
                              alt={component.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                (e.target as HTMLImageElement).className = 'w-10 h-10 opacity-30';
                              }}
                            />
                          ) : (
                            <Database className="w-10 h-10 text-gray-700" />
                          )}
                        </div>
                        
                        {/* Component details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium text-white">{component.name}</h4>
                              <p className="text-sm text-gray-400 line-clamp-2">{component.description}</p>
                              {component.partNumber && (
                                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded">
                                  Part #{component.partNumber}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <button 
                                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                                title="Edit component"
                                onClick={() => handleEditComponentClick(component)}
                                onMouseEnter={() => window.sounds?.hover()}
                              >
                                <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                              </button>
                              <button 
                                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                                title="Delete component"
                                onClick={() => handleDeleteClick('component', component.id.toString(), component.name, component.kitId)}
                                onMouseEnter={() => window.sounds?.hover()}
                              >
                                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">
                              {component.category || 'Uncategorized'}
                            </span>
                            <span className="text-xs text-gray-400">
                              Qty: {component.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <p className="text-lg mb-2">No components found</p>
                    <p className="text-sm">Add components to this kit</p>
                  </div>
                )}
              </div>
            )}
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

  // Function to generate test lootboxes
  const handleGenerateTestLootboxes = async () => {
    try {
      window.sounds?.click();
      setNotificationMessage({
        type: 'success',
        message: 'Generating test lootboxes...'
      });

      const response = await fetch('/api/loot-boxes/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationMessage({
          type: 'success',
          message: data.message || 'Generated test lootboxes successfully!'
        });
        window.sounds?.success();
      } else {
        const errorData = await response.json();
        setNotificationMessage({
          type: 'error',
          message: errorData.message || 'Failed to generate test lootboxes'
        });
        window.sounds?.error();
      }
    } catch (error) {
      console.error('Error generating test lootboxes:', error);
      setNotificationMessage({
        type: 'error',
        message: 'An error occurred while generating test lootboxes'
      });
      window.sounds?.error();
    }
  };

  // Function to reset inventory to one of each item
  const handleResetInventory = async () => {
    try {
      window.sounds?.click();
      setNotificationMessage({
        type: 'success',
        message: 'Resetting inventory...'
      });

      const response = await fetch('/api/admin/inventory/reset-to-one', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationMessage({
          type: 'success',
          message: data.message || 'Inventory reset successfully!'
        });
        window.sounds?.success();
      } else {
        const errorData = await response.json();
        setNotificationMessage({
          type: 'error',
          message: errorData.message || 'Failed to reset inventory'
        });
        window.sounds?.error();
      }
    } catch (error) {
      console.error('Error resetting inventory:', error);
      setNotificationMessage({
        type: 'error',
        message: 'An error occurred while resetting inventory'
      });
      window.sounds?.error();
    }
  };

  // Function to clear lootboxes from inventory
  const handleClearLootboxes = async () => {
    try {
      window.sounds?.click();
      setNotificationMessage({
        type: 'success',
        message: 'Clearing lootboxes...'
      });

      const response = await fetch('/api/admin/inventory/clear-loot-crates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationMessage({
          type: 'success',
          message: data.message || 'Lootboxes cleared successfully!'
        });
        window.sounds?.success();
      } else {
        const errorData = await response.json();
        setNotificationMessage({
          type: 'error',
          message: errorData.message || 'Failed to clear lootboxes'
        });
        window.sounds?.error();
      }
    } catch (error) {
      console.error('Error clearing lootboxes:', error);
      setNotificationMessage({
        type: 'error',
        message: 'An error occurred while clearing lootboxes'
      });
      window.sounds?.error();
    }
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
            src={oracleIconImage} 
            alt="The Oracle" 
            className="w-8 h-8 mr-3" 
            style={{ imageRendering: 'pixelated' }}
          />
          <h1 className="text-2xl font-bold text-brand-orange">The Oracle</h1>
          <span className="text-xs bg-red-600/80 text-white px-2 py-0.5 rounded-full ml-3">Admin Only</span>
          
          {/* Admin Action Buttons */}
          <div className="flex items-center ml-6 space-x-2">
            <button
              className="px-3 py-1 text-xs bg-brand-orange/90 hover:bg-brand-orange text-white rounded flex items-center"
              onClick={handleGenerateTestLootboxes}
              onMouseEnter={() => window.sounds?.hover()}
              title="Generate test lootboxes of each type for your inventory"
            >
              <Package className="h-3 w-3 mr-1" />
              Generate Test Lootboxes
            </button>
            <button
              className="px-3 py-1 text-xs bg-blue-600/90 hover:bg-blue-600 text-white rounded flex items-center"
              onClick={handleResetInventory}
              onMouseEnter={() => window.sounds?.hover()}
              title="Reset inventory to have exactly 1 of each item"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset Inventory
            </button>
            <button
              className="px-3 py-1 text-xs bg-red-600/90 hover:bg-red-600 text-white rounded flex items-center"
              onClick={handleClearLootboxes}
              onMouseEnter={() => window.sounds?.hover()}
              title="Clear all lootboxes from your inventory"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Lootboxes
            </button>
          </div>
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
              activeTab === 'items' 
                ? 'bg-brand-orange/20 text-brand-orange border-t border-l border-r border-brand-orange/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('items')}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-1" />
              Items
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'kits' 
                ? 'bg-brand-orange/20 text-brand-orange border-t border-l border-r border-brand-orange/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('kits')}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <div className="flex items-center">
              <Box className="h-4 w-4 mr-1" />
              Component Kits
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === 'recipes' 
                ? 'bg-brand-orange/20 text-brand-orange border-t border-l border-r border-brand-orange/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('recipes')}
            onMouseEnter={() => window.sounds?.hover()}
          >
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-1" />
              Recipes
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
              Create {
                activeTab === 'lootboxes' ? 'Lootbox' : 
                activeTab === 'quests' ? 'Quest' : 
                activeTab === 'kits' ? 'Kit' : 
                'Item'
              }
            </button>
          </div>
        </div>
        
        {/* Tab content */}
        {activeTab === 'lootboxes' && renderLootboxes()}
        {activeTab === 'quests' && renderQuests()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'items' && renderItems()}
        {activeTab === 'kits' && renderComponentKits()}
        {activeTab === 'recipes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map(recipe => (
              <div 
                key={recipe.id}
                className="border border-gray-700 bg-black/40 rounded-lg p-4 hover:border-brand-orange/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-bold truncate">{recipe.name}</h3>
                  <div className="flex space-x-1">
                    <button 
                      className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                      title="Edit recipe"
                      onClick={() => {
                        window.sounds?.click();
                        setEditingItem(recipe);
                        setEditingType('recipe');
                      }}
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                    </button>
                    <button 
                      className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                      title="Delete recipe"
                      onClick={() => handleDeleteClick('recipe', recipe.id.toString(), recipe.name)}
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center mb-2">
                  <div className="w-16 h-16 mr-3 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                    {recipe.image ? (
                      <img 
                        src={recipe.image} 
                        alt={recipe.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                          (e.target as HTMLImageElement).className = 'w-8 h-8 opacity-30';
                        }}
                      />
                    ) : (
                      <ClipboardList className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full mr-2">
                        {recipe.category || 'Uncategorized'}
                      </span>
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                        {recipe.difficulty}
                      </span>
                    </div>
                    <div className="text-sm text-white">
                      <span className="font-medium">Result:</span> {recipe.resultQuantity}x {recipe.resultItem}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">{recipe.description}</p>
                
                {recipe.flavorText && (
                  <p className="text-xs text-gray-500 italic mb-2">"{recipe.flavorText}"</p>
                )}
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">Required Items:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(recipe.requiredItems).map(([item, quantity], index) => (
                      <span 
                        key={index}
                        className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded"
                      >
                        {quantity}x {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
            
            {editingType === 'item' && (
              <div className="space-y-4">
                {/* Basic Info Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Item ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as GameItem).id || ''}
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
                        value={(editingItem as GameItem).name || ''}
                        onChange={(e) => {
                          const updatedItem = {...editingItem as GameItem, name: e.target.value};
                          setEditingItem(updatedItem);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[80px]"
                      value={(editingItem as GameItem).description || ''}
                      onChange={(e) => {
                        const updatedItem = {...editingItem as GameItem, description: e.target.value};
                        setEditingItem(updatedItem);
                      }}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Flavor Text</label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[80px]"
                      value={(editingItem as GameItem).flavorText || ''}
                      onChange={(e) => {
                        const updatedItem = {...editingItem as GameItem, flavorText: e.target.value};
                        setEditingItem(updatedItem);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Flavor text adds character to the item description</p>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Rarity</label>
                      <select
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as GameItem).rarity}
                        onChange={(e) => {
                          const updatedItem = {
                            ...editingItem as GameItem, 
                            rarity: e.target.value as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
                          };
                          setEditingItem(updatedItem);
                        }}
                      >
                        <option value="common">Common</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Category</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as GameItem).category || ''}
                        onChange={(e) => {
                          const updatedItem = {...editingItem as GameItem, category: e.target.value};
                          setEditingItem(updatedItem);
                        }}
                        placeholder="e.g. materials, equipment, consumable"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Image Path</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as GameItem).imagePath || ''}
                        readOnly
                        placeholder="/assets/item-name.png"
                      />
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                        id="item-image-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Create a FormData object
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          try {
                            // Upload the image
                            const response = await fetch(`/api/admin/items/${(editingItem as GameItem).id}/image`, {
                              method: 'POST',
                              body: formData,
                              credentials: 'include'
                            });
                            
                            if (!response.ok) {
                              throw new Error(`Upload failed: ${response.statusText}`);
                            }
                            
                            const data = await response.json();
                            
                            // Update the form with the new image path
                            const updatedItem = {
                              ...editingItem as GameItem,
                              imagePath: data.imagePath
                            };
                            setEditingItem(updatedItem);
                            
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
                        onClick={() => document.getElementById('item-image-upload')?.click()}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload a new image or use an existing image path</p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Crafting Uses</label>
                    <div className="flex">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as GameItem).craftingUses ? (editingItem as GameItem).craftingUses.join(',') : ''}
                        onChange={(e) => {
                          const uses = e.target.value.split(',').map(use => use.trim()).filter(Boolean);
                          const updatedItem = {...editingItem as GameItem, craftingUses: uses};
                          setEditingItem(updatedItem);
                        }}
                        placeholder="wiring,circuits,conductors"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Comma-separated list of crafting uses</p>
                  </div>
                </div>
                
                {/* Preview Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Item Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="flex justify-center items-center">
                      {(editingItem as GameItem).imagePath ? (
                        <img 
                          src={(editingItem as GameItem).imagePath} 
                          alt={(editingItem as GameItem).name}
                          className="w-24 h-24 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                            (e.target as HTMLImageElement).className = 'w-24 h-24 p-6 opacity-30';
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 flex items-center justify-center border border-gray-700 rounded bg-black/50">
                          <FileImage className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2 flex flex-col justify-center">
                      <h3 className="text-lg font-bold text-white">{(editingItem as GameItem).name}</h3>
                      <div className="flex my-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${rarityColorClass((editingItem as GameItem).rarity)}`}>
                          {(editingItem as GameItem).rarity}
                        </span>
                        {(editingItem as GameItem).category && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-300">
                            {(editingItem as GameItem).category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{(editingItem as GameItem).description}</p>
                      {(editingItem as GameItem).flavorText && (
                        <p className="text-xs italic text-gray-400 mt-1">"{(editingItem as GameItem).flavorText}"</p>
                      )}
                      
                      {(editingItem as GameItem).craftingUses && (editingItem as GameItem).craftingUses.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(editingItem as GameItem).craftingUses.map((use, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-gray-800 text-gray-300 rounded">
                              {use}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
                    onClick={() => handleEditSubmit(editingItem)}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
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
                    <label className="block text-gray-300 text-sm mb-1">Hero Image</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as any).heroImage || ''}
                        readOnly
                        placeholder="Hero image URL will appear here after upload"
                      />
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                        id="quest-hero-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Create a FormData object
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          try {
                            // Upload the image
                            const response = await fetch('/api/admin/upload-image', {
                              method: 'POST',
                              body: formData,
                              credentials: 'include'
                            });
                            
                            if (!response.ok) {
                              throw new Error(`Upload failed: ${response.statusText}`);
                            }
                            
                            const data = await response.json();
                            
                            // Update the form with the new image path
                            const updatedQuest = {
                              ...editingItem as any,
                              heroImage: data.url
                            };
                            setEditingItem(updatedQuest);
                            
                            setNotificationMessage({
                              type: 'success',
                              message: 'Hero image uploaded successfully'
                            });
                            
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          } catch (err) {
                            const error = err as Error;
                            console.error('Error uploading image:', error);
                            
                            setNotificationMessage({
                              type: 'error',
                              message: `Failed to upload hero image: ${error.message}`
                            });
                            
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          }
                        }}
                      />
                      <button
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 flex items-center"
                        onClick={() => document.getElementById('quest-hero-upload')?.click()}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Hero Image
                      </button>
                    </div>
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
            
            {editingType === 'kit' && (
              <div className="space-y-4">
                {/* Basic Info Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Kit Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Kit ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as ComponentKit).id || ''}
                        readOnly={true}
                        disabled={true}
                      />
                      <p className="text-xs text-gray-500 mt-1">ID cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Kit Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as ComponentKit).name || ''}
                        onChange={(e) => {
                          const updatedKit = {...editingItem as ComponentKit, name: e.target.value};
                          setEditingItem(updatedKit);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[80px]"
                      value={(editingItem as ComponentKit).description || ''}
                      onChange={(e) => {
                        const updatedKit = {...editingItem as ComponentKit, description: e.target.value};
                        setEditingItem(updatedKit);
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Category</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as ComponentKit).category || ''}
                        onChange={(e) => {
                          const updatedKit = {...editingItem as ComponentKit, category: e.target.value};
                          setEditingItem(updatedKit);
                        }}
                        placeholder="e.g. arduino, raspberry-pi, electronics"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Difficulty</label>
                      <select
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as ComponentKit).difficulty || 'beginner'}
                        onChange={(e) => {
                          const updatedKit = {
                            ...editingItem as ComponentKit, 
                            difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                          };
                          setEditingItem(updatedKit);
                        }}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Kit Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as ComponentKit).imagePath || ''}
                        readOnly
                        placeholder="/assets/kits/kit-name.png"
                      />
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                        id="kit-image-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Create a FormData object
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          try {
                            // Upload the image
                            const response = await fetch(`/api/admin/kits/${(editingItem as ComponentKit).id}/image`, {
                              method: 'POST',
                              body: formData,
                              credentials: 'include'
                            });
                            
                            if (!response.ok) {
                              throw new Error(`Upload failed: ${response.statusText}`);
                            }
                            
                            const data = await response.json();
                            
                            // Update the item with the new image path
                            const updatedKit = {
                              ...editingItem as ComponentKit,
                              imagePath: data.imagePath
                            };
                            setEditingItem(updatedKit);
                            
                            setNotificationMessage({
                              type: 'success',
                              message: 'Kit image uploaded successfully!'
                            });
                            
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          } catch (error) {
                            console.error('Error uploading image:', error);
                            window.sounds?.error();
                            
                            setNotificationMessage({
                              type: 'error',
                              message: 'Failed to upload image. Please try again.'
                            });
                            
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          }
                        }}
                      />
                      <label
                        htmlFor="kit-image-upload"
                        className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 cursor-pointer"
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        Upload
                      </label>
                    </div>
                    
                    {/* Preview */}
                    <div className="mt-3">
                      <span className="text-xs text-gray-400">Preview:</span>
                      <div className="mt-1 border border-gray-700 rounded bg-black/30 p-3 flex justify-center">
                        {(editingItem as ComponentKit).imagePath ? (
                          <img 
                            src={(editingItem as ComponentKit).imagePath} 
                            alt={(editingItem as ComponentKit).name}
                            className="max-h-48 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                              (e.target as HTMLImageElement).className = 'max-h-48 p-6 opacity-30';
                            }}
                          />
                        ) : (
                          <div className="h-32 flex items-center justify-center opacity-50">
                            <FileImage className="w-16 h-16 text-gray-600" />
                            <span className="ml-2 text-gray-500">No image uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
                    className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-orange-600"
                    onClick={() => {
                      const data = {...editingItem as ComponentKit};
                      handleEditSubmit(data);
                    }}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {editingType === 'component' && (
              <div className="space-y-4">
                {/* Basic Info Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Component Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Component ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as KitComponent).id.toString() || ''}
                        readOnly={true}
                        disabled={true}
                      />
                      <p className="text-xs text-gray-500 mt-1">ID cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Kit ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as KitComponent).kitId || ''}
                        readOnly={true}
                        disabled={true}
                      />
                      <p className="text-xs text-gray-500 mt-1">Cannot change parent kit</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Component Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as KitComponent).name || ''}
                        onChange={(e) => {
                          const updatedComponent = {...editingItem as KitComponent, name: e.target.value};
                          setEditingItem(updatedComponent);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Part Number (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as KitComponent).partNumber || ''}
                        onChange={(e) => {
                          const updatedComponent = {...editingItem as KitComponent, partNumber: e.target.value};
                          setEditingItem(updatedComponent);
                        }}
                        placeholder="e.g. ABC123-45X"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[80px]"
                      value={(editingItem as KitComponent).description || ''}
                      onChange={(e) => {
                        const updatedComponent = {...editingItem as KitComponent, description: e.target.value};
                        setEditingItem(updatedComponent);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Category</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as KitComponent).category || ''}
                        onChange={(e) => {
                          const updatedComponent = {...editingItem as KitComponent, category: e.target.value};
                          setEditingItem(updatedComponent);
                        }}
                        placeholder="e.g. resistor, capacitor, sensor"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Quantity</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as KitComponent).quantity || 1}
                        min={1}
                        onChange={(e) => {
                          const updatedComponent = {...editingItem as KitComponent, quantity: parseInt(e.target.value) || 1};
                          setEditingItem(updatedComponent);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="required-component"
                      className="w-4 h-4 bg-black/50 text-brand-orange border border-gray-700 rounded focus:border-brand-orange focus:outline-none"
                      checked={(editingItem as KitComponent).isRequired || false}
                      onChange={(e) => {
                        const updatedComponent = {...editingItem as KitComponent, isRequired: e.target.checked};
                        setEditingItem(updatedComponent);
                      }}
                    />
                    <label htmlFor="required-component" className="text-gray-300 text-sm">
                      Required Component (must be included in the kit)
                    </label>
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Component Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as KitComponent).imagePath || ''}
                        readOnly
                        placeholder="/assets/components/component-name.png"
                      />
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                        id="component-image-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Create a FormData object
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          try {
                            // Upload the image
                            const response = await fetch(`/api/admin/components/${(editingItem as KitComponent).id}/image`, {
                              method: 'POST',
                              body: formData,
                              credentials: 'include'
                            });
                            
                            if (!response.ok) {
                              throw new Error(`Upload failed: ${response.statusText}`);
                            }
                            
                            const data = await response.json();
                            
                            // Update the component with the new image path
                            const updatedComponent = {
                              ...editingItem as KitComponent,
                              imagePath: data.imagePath
                            };
                            setEditingItem(updatedComponent);
                            
                            setNotificationMessage({
                              type: 'success',
                              message: 'Component image uploaded successfully!'
                            });
                            
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          } catch (error) {
                            console.error('Error uploading image:', error);
                            window.sounds?.error();
                            
                            setNotificationMessage({
                              type: 'error',
                              message: 'Failed to upload image. Please try again.'
                            });
                            
                            setTimeout(() => {
                              setNotificationMessage(null);
                            }, 3000);
                          }
                        }}
                      />
                      <label
                        htmlFor="component-image-upload"
                        className="px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 cursor-pointer"
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        Upload
                      </label>
                    </div>
                    
                    {/* Preview */}
                    <div className="mt-3">
                      <span className="text-xs text-gray-400">Preview:</span>
                      <div className="mt-1 border border-gray-700 rounded bg-black/30 p-3 flex justify-center">
                        {(editingItem as KitComponent).imagePath ? (
                          <img 
                            src={(editingItem as KitComponent).imagePath} 
                            alt={(editingItem as KitComponent).name}
                            className="max-h-48 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                              (e.target as HTMLImageElement).className = 'max-h-48 p-6 opacity-30';
                            }}
                          />
                        ) : (
                          <div className="h-32 flex items-center justify-center opacity-50">
                            <FileImage className="w-16 h-16 text-gray-600" />
                            <span className="ml-2 text-gray-500">No image uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
                    className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-orange-600"
                    onClick={() => {
                      const data = {...editingItem as KitComponent};
                      handleEditSubmit(data);
                    }}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {editingType === 'recipe' && (
              <div className="space-y-4">
                {/* Basic Info Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Recipe Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Recipe ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Recipe).id || ''}
                        readOnly={true}
                        disabled={true}
                      />
                      <p className="text-xs text-gray-500 mt-1">ID cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Recipe Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Recipe).name || ''}
                        onChange={(e) => {
                          const updatedRecipe = {...editingItem as Recipe, name: e.target.value};
                          setEditingItem(updatedRecipe);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[80px]"
                      value={(editingItem as Recipe).description || ''}
                      onChange={(e) => {
                        const updatedRecipe = {...editingItem as Recipe, description: e.target.value};
                        setEditingItem(updatedRecipe);
                      }}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Flavor Text (Optional)</label>
                    <textarea
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none min-h-[60px]"
                      value={(editingItem as Recipe).flavorText || ''}
                      onChange={(e) => {
                        const updatedRecipe = {...editingItem as Recipe, flavorText: e.target.value};
                        setEditingItem(updatedRecipe);
                      }}
                      placeholder="Add some flavor text to make this recipe more interesting..."
                    />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Result Item</label>
                      <select
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Recipe).resultItem || ''}
                        onChange={(e) => {
                          const selectedItemId = e.target.value;
                          // Find the selected item
                          const selectedItem = items.find(i => i.id === selectedItemId);
                          
                          // Update the recipe with the selected item's id and image
                          const updatedRecipe = {
                            ...editingItem as Recipe, 
                            resultItem: selectedItemId,
                            image: selectedItem?.imagePath || ''
                          };
                          
                          setEditingItem(updatedRecipe);
                        }}
                      >
                        <option value="">-- Select Result Item --</option>
                        {items.map(item => (
                          <option key={item.id} value={item.id}>{item.name} ({item.rarity})</option>
                        ))}
                      </select>
                      
                      {/* Show preview of selected item */}
                      {(editingItem as Recipe).resultItem && (
                        <div className="mt-2 flex items-center p-2 bg-black/30 border border-gray-700 rounded">
                          <div className={`w-10 h-10 ${rarityColorClass((items.find(i => i.id === (editingItem as Recipe).resultItem)?.rarity || 'common')).replace('text-', 'border-')} bg-black/50 border rounded flex items-center justify-center overflow-hidden mr-2`}>
                            {(() => {
                              const selectedItem = items.find(i => i.id === (editingItem as Recipe).resultItem);
                              if (selectedItem?.imagePath) {
                                return (
                                  <img 
                                    src={selectedItem.imagePath} 
                                    alt={selectedItem.name}
                                    className="max-w-full max-h-full object-contain"
                                    style={{imageRendering: 'pixelated'}}
                                  />
                                );
                              }
                              return <div className="text-xs text-gray-500">No image</div>;
                            })()}
                          </div>
                          <div className="text-sm">
                            <div className="text-gray-300">{(() => {
                              const selectedItem = items.find(i => i.id === (editingItem as Recipe).resultItem);
                              return selectedItem?.name || (editingItem as Recipe).resultItem;
                            })()}</div>
                            <div className={(() => {
                              const selectedItem = items.find(i => i.id === (editingItem as Recipe).resultItem);
                              return rarityColorClass(selectedItem?.rarity || 'common'); 
                            })()}>{(() => {
                              const selectedItem = items.find(i => i.id === (editingItem as Recipe).resultItem);
                              return selectedItem?.rarity || 'unknown';
                            })()}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Result Quantity</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Recipe).resultQuantity || 1}
                        min={1}
                        onChange={(e) => {
                          const updatedRecipe = {...editingItem as Recipe, resultQuantity: parseInt(e.target.value) || 1};
                          setEditingItem(updatedRecipe);
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <Grid3X3 className="w-5 h-5 mr-2 text-gray-300" />
                        <label className="block text-gray-300 text-sm">Grid Size: 3×3</label>
                      </div>
                      <input
                        type="hidden"
                        value="3"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">All crafting recipes use a standard 3×3 grid.</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Category</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Recipe).category || ''}
                        onChange={(e) => {
                          const updatedRecipe = {...editingItem as Recipe, category: e.target.value};
                          setEditingItem(updatedRecipe);
                        }}
                        placeholder="e.g. weapons, armor, consumables"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Difficulty</label>
                      <select
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Recipe).difficulty || 'easy'}
                        onChange={(e) => {
                          const updatedRecipe = {
                            ...editingItem as Recipe, 
                            difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                          };
                          setEditingItem(updatedRecipe);
                        }}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Unlocked</label>
                      <select
                        className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                        value={(editingItem as Recipe).unlocked ? 'true' : 'false'}
                        onChange={(e) => {
                          const updatedRecipe = {...editingItem as Recipe, unlocked: e.target.value === 'true'};
                          setEditingItem(updatedRecipe);
                        }}
                      >
                        <option value="true">Yes (Available to players)</option>
                        <option value="false">No (Hidden)</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Image path is now automatically set from the selected item */}
                  <input
                    type="hidden"
                    value={(editingItem as Recipe).image || ''}
                  />
                  
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm mb-1">Hero Image (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                      value={(editingItem as Recipe).heroImage || ''}
                      onChange={(e) => {
                        const updatedRecipe = {...editingItem as Recipe, heroImage: e.target.value};
                        setEditingItem(updatedRecipe);
                      }}
                      placeholder="/assets/recipe-heroes/recipe-name.png"
                    />
                  </div>
                </div>
                
                {/* Recipe building note */}
                <div className="bg-black/30 border border-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-brand-orange mr-2 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="mb-1">Required items are automatically calculated from the crafting pattern.</p>
                      <p>Use the pattern grid below to define which materials are needed for this recipe.</p>
                    </div>
                  </div>
                </div>
                
                {/* Pattern Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Crafting Pattern</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="flex justify-between items-center bg-black/50 p-3 border border-gray-700 rounded-lg">
                        <div className="text-sm text-gray-200 flex items-center">
                          <AlertTriangle className="h-4 w-4 text-brand-orange mr-2" />
                          <div>
                            <p className="font-semibold text-brand-orange">How to create a recipe pattern:</p>
                            <p>1. Select a material from the panel below</p>
                            <p>2. Click on a grid cell to place the item</p>
                            <p>3. Click on a placed item to remove it</p>
                          </div>
                        </div>
                        
                        {/* Item selector dropdown (alternative selection method) */}
                        <div className="flex gap-2 items-center">
                          <label className="text-gray-300 text-sm">Select by name:</label>
                          <select
                            className="px-3 py-2 bg-black/50 text-white border border-gray-700 rounded-md focus:border-brand-orange focus:outline-none"
                            onChange={(e) => {
                              // Store the selected item ID in a recipe-specific attribute
                              const recipe = editingItem as Recipe;
                              const updatedRecipe = {...recipe, _selectedItemId: e.target.value};
                              setEditingItem(updatedRecipe);
                            }}
                            value={(editingItem as any)._selectedItemId || ""}
                          >
                            <option value="">Choose material</option>
                            {items.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Available items panel - select items from here */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-black/60 border-2 border-gray-700 rounded-lg p-4" style={{boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.6)'}}>
                        <h4 className="text-sm font-semibold text-brand-orange mb-3">Available Crafting Materials</h4>
                        <div className="grid grid-cols-5 gap-3">
                          {items.slice(0, 10).map(item => (
                            <div 
                              key={item.id}
                              className={`w-14 h-14 bg-black/40 border-2 ${
                                (editingItem as any)._selectedItemId === item.id 
                                  ? 'border-brand-orange' 
                                  : `border-gray-600 hover:border-gray-400`
                              } rounded-md flex items-center justify-center cursor-pointer transition-all`}
                              onClick={() => {
                                // Set as the selected item
                                const recipe = editingItem as Recipe;
                                const updatedRecipe = {...recipe, _selectedItemId: item.id};
                                setEditingItem(updatedRecipe);
                                
                                if (window.sounds?.click) {
                                  window.sounds.click();
                                }
                              }}
                              style={{
                                boxShadow: (editingItem as any)._selectedItemId === item.id ? '0 0 12px #ff7b00' : 'none',
                                transform: (editingItem as any)._selectedItemId === item.id ? 'scale(1.05)' : 'scale(1)'
                              }}
                            >
                              <div className="relative w-12 h-12 flex items-center justify-center">
                                <img 
                                  src={item.imagePath} 
                                  alt={item.name}
                                  className="max-w-full max-h-full object-contain"
                                  style={{imageRendering: 'pixelated'}}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual crafting grid */}
                    <div className="flex justify-center my-4">
                      <div 
                        className="grid grid-cols-3 gap-3 p-5 bg-black/70 border-2 border-gray-700 rounded-lg"
                        style={{ 
                          backgroundImage: 'radial-gradient(circle, rgba(50, 50, 50, 0.3) 1px, transparent 1px)',
                          backgroundSize: '10px 10px',
                          width: '345px',
                          height: '345px',
                          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)'
                        }}>
                        {/* Create grid cells - always 3x3 */}
                        {(() => {
                          // Fixed 3x3 grid
                          const gridSize = 3;
                          const cells = [];
                          
                          for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
                            for (let colIndex = 0; colIndex < gridSize; colIndex++) {
                              // Get the item ID at this position
                              const pattern = (editingItem as Recipe).pattern || [];
                              const itemId = pattern[rowIndex]?.[colIndex] || null;
                              
                              // Find the item details if an item is in this cell
                              const item = itemId ? items.find(i => i.id === itemId) : null;
                              
                              cells.push(
                                <div 
                                  key={`${rowIndex}-${colIndex}`}
                                  className="w-20 h-20 bg-black/60 border-2 border-gray-600 rounded-md flex items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-black/80 transition-all"
                                  onClick={() => {
                                    // Initialize pattern if it doesn't exist
                                    const recipe = editingItem as Recipe;
                                    const selectedItemId = (recipe as any)._selectedItemId || null;
                                    
                                    // Create a deep copy of the pattern
                                    const pattern = Array.isArray(recipe.pattern) 
                                      ? JSON.parse(JSON.stringify(recipe.pattern)) 
                                      : Array(recipe.gridSize || 3).fill(null).map(() => Array(recipe.gridSize || 3).fill(null));
                                    
                                    // Toggle the item at this position - add if not already there, remove if it is
                                    if (pattern[rowIndex]?.[colIndex] === selectedItemId) {
                                      pattern[rowIndex][colIndex] = null;
                                    } else {
                                      // Create rows if they don't exist
                                      while (pattern.length <= rowIndex) {
                                        pattern.push(Array(recipe.gridSize || 3).fill(null));
                                      }
                                      
                                      // Create columns if they don't exist
                                      while (pattern[rowIndex].length <= colIndex) {
                                        pattern[rowIndex].push(null);
                                      }
                                      
                                      // Set the item
                                      pattern[rowIndex][colIndex] = selectedItemId;
                                    }
                                    
                                    // Calculate required items based on pattern
                                    const requiredItems: Record<string, number> = {};
                                    pattern.forEach(row => {
                                      row.forEach(cellItemId => {
                                        if (cellItemId) {
                                          requiredItems[cellItemId] = (requiredItems[cellItemId] || 0) + 1;
                                        }
                                      });
                                    });
                                    
                                    // Update the recipe
                                    const updatedRecipe = {...recipe, pattern, requiredItems};
                                    setEditingItem(updatedRecipe);
                                  }}
                                >
                                  {item ? (
                                    <div className="relative w-full h-full p-1">
                                      <img 
                                        src={item.imagePath || ''}
                                        alt={item.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                          (e.target as HTMLImageElement).className = 'w-8 h-8 opacity-30';
                                        }}
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-xs text-white text-center py-1">
                                        {item.name}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center">
                                      <Plus className="h-6 w-6 text-gray-500 opacity-30" />
                                      <div className="text-gray-500 text-xs mt-1">Click to place</div>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          }
                          
                          return cells;
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                        onClick={() => {
                          // Reset the pattern
                          const recipe = editingItem as Recipe;
                          const gridSize = recipe.gridSize || 3;
                          const pattern = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
                          const updatedRecipe = {...recipe, pattern, requiredItems: {}};
                          setEditingItem(updatedRecipe);
                        }}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        Clear Grid
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Preview Section */}
                <div className="border border-gray-700 rounded-lg p-4 bg-black/30">
                  <h3 className="text-md font-semibold text-brand-orange mb-4">Recipe Preview</h3>
                  
                  {/* No item selected state */}
                  {!(editingItem as Recipe).resultItem ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="bg-black/40 rounded-full p-4 mb-4">
                        <ClipboardList className="w-12 h-12 text-gray-600" />
                      </div>
                      <p className="text-gray-400">Select a result item from the dropdown above to see a preview of your recipe.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center mb-4">
                        {/* Item image with rarity border */}
                        <div className={`w-24 h-24 ${
                          rarityColorClass((items.find(i => i.id === (editingItem as Recipe).resultItem)?.rarity || 'common')).replace('text-', 'border-')
                        } bg-black/50 border-2 rounded-lg flex items-center justify-center overflow-hidden mr-4`}>
                          {(editingItem as Recipe).image ? (
                            <img
                              src={(editingItem as Recipe).image}
                              alt={(editingItem as Recipe).name}
                              className="w-full h-full object-contain p-1"
                              style={{imageRendering: 'pixelated'}}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                (e.target as HTMLImageElement).className = 'w-10 h-10 opacity-30';
                              }}
                            />
                          ) : (
                            <ClipboardList className="w-10 h-10 text-gray-700" />
                          )}
                        </div>
                        
                        {/* Recipe details */}
                        <div>
                          <h4 className="font-medium text-white text-lg">{(editingItem as Recipe).name || "Unnamed Recipe"}</h4>
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full mr-2">
                              {(editingItem as Recipe).category || 'Uncategorized'}
                            </span>
                            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                              {(editingItem as Recipe).difficulty || 'easy'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${(editingItem as Recipe).unlocked ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                              {(editingItem as Recipe).unlocked ? 'Unlocked' : 'Locked'}
                            </span>
                          </div>
                          <div className="flex items-center mt-2">
                            <div className="text-sm text-white flex items-center">
                              <ArrowRight className="h-4 w-4 mr-1 text-brand-orange" />
                              <span>Creates:</span>
                              <span className="font-bold ml-1 text-brand-orange">{(editingItem as Recipe).resultQuantity || 1}×</span>
                              <span className="ml-1">
                                {(() => {
                                  const selectedItem = items.find(i => i.id === (editingItem as Recipe).resultItem);
                                  return selectedItem?.name || (editingItem as Recipe).resultItem;
                                })()}
                              </span>
                              <span className={`ml-2 text-xs ${
                                rarityColorClass((items.find(i => i.id === (editingItem as Recipe).resultItem)?.rarity || 'common'))
                              }`}>
                                ({(() => {
                                  const selectedItem = items.find(i => i.id === (editingItem as Recipe).resultItem);
                                  return selectedItem?.rarity || 'unknown';
                                })()})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recipe description */}
                      {(editingItem as Recipe).description && (
                        <div className="bg-black/40 border border-gray-700 rounded p-3 mt-2">
                          <p className="text-sm text-gray-300">{(editingItem as Recipe).description}</p>
                        </div>
                      )}
                      
                      {/* Recipe flavor text */}
                      {(editingItem as Recipe).flavorText && (
                        <div className="mt-2 px-3 py-2 text-xs italic text-gray-400">
                          "{(editingItem as Recipe).flavorText}"
                        </div>
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
                    onClick={() => handleEditSubmit(editingItem)}
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