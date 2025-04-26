import React, { useState, useEffect } from 'react';
import { X, Settings, Package, Loader2, Search, PlusSquare, Edit, Trash, Check, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import wallbg from '@assets/wallbg.png';
import adminIcon from '@assets/Asset 7@2x-8.png';

// Input components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Add sounds global interface
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

// Loot box schema
const lootBoxSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]),
  minRewards: z.coerce.number().min(1).max(10),
  maxRewards: z.coerce.number().min(1).max(20),
  image: z.string().min(1, "Image URL is required"),
  itemDropTable: z.array(
    z.object({
      itemId: z.string().min(1, "Item ID is required"),
      weight: z.coerce.number().min(1, "Weight must be at least 1"),
      minQuantity: z.coerce.number().min(1, "Minimum quantity must be at least 1"),
      maxQuantity: z.coerce.number().min(1, "Maximum quantity must be at least 1"),
    })
  ).default([])
});

// Interface for App props
interface FullscreenAdminAppProps {
  onClose: () => void;
}

// Type for loot box
type LootBox = z.infer<typeof lootBoxSchema>;

// Type for item
interface Item {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imagePath?: string;
}

const FullscreenAdminApp: React.FC<FullscreenAdminAppProps> = ({ onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('lootboxes');
  const [selectedLootBox, setSelectedLootBox] = useState<LootBox | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form setup
  const form = useForm<LootBox>({
    resolver: zodResolver(lootBoxSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      rarity: "common",
      minRewards: 1,
      maxRewards: 3,
      image: "/images/loot-crate.png",
      itemDropTable: []
    }
  });

  // Fetch loot boxes
  const { data: lootBoxes, isLoading: isLoadingLootBoxes } = useQuery<LootBox[]>({
    queryKey: ['/api/admin/lootboxes'],
    enabled: activeTab === 'lootboxes',
    onSuccess: (data) => {
      console.log('Fetched lootboxes:', data);
    },
    onError: (error) => {
      console.error('Error fetching lootboxes:', error);
    }
  });

  // Fetch quests for the quests tab
  const { data: quests, isLoading: isLoadingQuests } = useQuery<any[]>({
    queryKey: ['/api/admin/quests'],
    enabled: activeTab === 'quests',
    onSuccess: (data) => {
      console.log('Fetched quests:', data);
    },
    onError: (error) => {
      console.error('Error fetching quests:', error);
    }
  });

  // Fetch items for the dropdown
  const { data: items, isLoading: isLoadingItems } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: LootBox) => 
      apiRequest('POST', '/api/admin/lootboxes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lootboxes'] });
      toast({ title: "Success", description: "Loot box created successfully" });
      setIsCreateDialogOpen(false);
      form.reset();
      // Play sound effect if available
      window.sounds?.success();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create loot box: ${error.message}`,
        variant: "destructive"
      });
      // Play sound effect if available
      window.sounds?.error();
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: LootBox) => 
      apiRequest('PUT', `/api/admin/lootboxes/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lootboxes'] });
      toast({ title: "Success", description: "Loot box updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedLootBox(null);
      form.reset();
      // Play sound effect if available
      window.sounds?.success();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to update loot box: ${error.message}`,
        variant: "destructive"
      });
      // Play sound effect if available
      window.sounds?.error();
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest('DELETE', `/api/admin/lootboxes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lootboxes'] });
      toast({ title: "Success", description: "Loot box deleted successfully" });
      setIsDeleteDialogOpen(false);
      setSelectedLootBox(null);
      // Play sound effect if available
      window.sounds?.success();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete loot box: ${error.message}`,
        variant: "destructive"
      });
      // Play sound effect if available
      window.sounds?.error();
    }
  });

  // Handle form submission
  const onSubmit = (data: LootBox) => {
    if (isEditDialogOpen) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle edit action
  const handleEdit = (lootBox: LootBox) => {
    setSelectedLootBox(lootBox);
    form.reset(lootBox);
    setIsEditDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = (lootBox: LootBox) => {
    setSelectedLootBox(lootBox);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedLootBox) {
      deleteMutation.mutate(selectedLootBox.id);
    }
  };

  // Filter loot boxes based on search query
  const filteredLootBoxes = React.useMemo(() => {
    if (!lootBoxes || !Array.isArray(lootBoxes)) return [];

    if (!searchQuery) return lootBoxes;

    const query = searchQuery.toLowerCase();
    return lootBoxes.filter((box: any) => 
      box.name?.toLowerCase().includes(query) || 
      box.description?.toLowerCase().includes(query) ||
      box.rarity?.toLowerCase().includes(query)
    );
  }, [lootBoxes, searchQuery]);

  // Helper to render rarity with appropriate color class
  const getRarityColorClass = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-300';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-amber-400';
      default: return 'text-gray-300';
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
            src={adminIcon} 
            alt="Admin Tools" 
            className="w-8 h-8 mr-3" 
          />
          <h1 className="text-2xl font-bold text-brand-orange">Admin Center</h1>
        </div>
        <button 
          className="text-white hover:text-brand-orange transition-colors" 
          onClick={onClose}
          onMouseEnter={() => window.sounds?.hover()}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar with navigation */}
        <div className="w-full md:w-64 bg-space-dark/80 p-4 border-r border-brand-orange/30 overflow-y-auto">
          <h2 className="text-lg font-bold text-brand-orange mb-4">Navigation</h2>
          <div className="space-y-2">
            <div 
              className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                activeTab === 'lootboxes' 
                  ? 'bg-brand-orange/20 border border-brand-orange/50' 
                  : 'hover:bg-space-mid/50 border border-transparent'
              }`}
              onClick={() => setActiveTab('lootboxes')}
              onMouseEnter={() => window.sounds?.hover()}
            >
              <Package className="h-5 w-5 mr-2 text-brand-orange" />
              <span className="text-white">Loot Boxes</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                activeTab === 'quests' 
                  ? 'bg-brand-orange/20 border border-brand-orange/50' 
                  : 'hover:bg-space-mid/50 border border-transparent'
              }`}
              onClick={() => setActiveTab('quests')}
              onMouseEnter={() => window.sounds?.hover()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-brand-orange">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="text-white">Quests</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-brand-orange/20 border border-brand-orange/50' 
                  : 'hover:bg-space-mid/50 border border-transparent'
              }`}
              onClick={() => setActiveTab('settings')}
              onMouseEnter={() => window.sounds?.hover()}
            >
              <Settings className="h-5 w-5 mr-2 text-brand-orange" />
              <span className="text-white">Settings</span>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 bg-black/60 p-6 overflow-y-auto">
          {/* Loot Boxes Tab */}
          {activeTab === 'lootboxes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-orange">Loot Box Management</h2>
                <Button 
                  onClick={() => {
                    form.reset({
                      id: "",
                      name: "",
                      description: "",
                      rarity: "common",
                      minRewards: 1,
                      maxRewards: 3,
                      image: "/images/loot-crate.png",
                      itemDropTable: []
                    });
                    setIsCreateDialogOpen(true);
                  }}
                  onMouseEnter={() => window.sounds?.hover()}
                >
                  <PlusSquare className="h-4 w-4 mr-2" />
                  Create New Loot Box
                </Button>
              </div>
              
              {/* Search and filter area */}
              <div className="flex mb-6 gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    className="pl-10 bg-space-dark/70 border-gray-700 text-white" 
                    placeholder="Search loot boxes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Loot boxes list */}
              {isLoadingLootBoxes ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(lootBoxes) && lootBoxes.length > 0 ? (
                    lootBoxes.map((lootBox: any) => (
                      <Card key={lootBox.id} className="overflow-hidden border-2 border-gray-700 bg-space-dark/80 hover:border-brand-orange/40 transition-all flex flex-col h-full">
                        <div className="h-48 bg-black/50 relative overflow-hidden">
                          {lootBox.image && (
                            <img 
                              src={lootBox.image} 
                              alt={lootBox.name || "Loot box"} 
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.src = "/images/loot-crate.png";
                                e.currentTarget.onerror = null;
                              }}
                            />
                          )}
                          <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded">
                            <span className={`font-semibold ${getRarityColorClass(lootBox.rarity || "common")}`}>
                              {lootBox.rarity ? lootBox.rarity.charAt(0).toUpperCase() + lootBox.rarity.slice(1) : "Common"}
                            </span>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg leading-tight">{lootBox.name || "Unnamed Loot Box"}</CardTitle>
                          <CardDescription className="line-clamp-2 h-10 text-gray-400">{lootBox.description || "No description available"}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2 flex-grow">
                          <div className="space-y-1 text-sm text-gray-400">
                            <p>
                              Rewards: {lootBox.minRewards || 0} - {lootBox.maxRewards || 0} items
                            </p>
                            <p>
                              Drop table: {Array.isArray(lootBox.itemDropTable) ? lootBox.itemDropTable.length : 0} items
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <Button 
                            variant="outline" 
                            className="border-gray-700 hover:bg-gray-800 hover:text-white text-gray-300"
                            onClick={() => handleEdit(lootBox)}
                            onMouseEnter={() => window.sounds?.hover()}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDelete(lootBox)}
                            onMouseEnter={() => window.sounds?.hover()}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 py-16 flex flex-col items-center justify-center text-center">
                      <div className="bg-space-dark/80 rounded-full p-6 mb-4">
                        <Package className="h-12 w-12 text-gray-500" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-2">No Loot Boxes Available</h3>
                      <p className="text-gray-400 max-w-md mb-6">
                        {searchQuery 
                          ? `No loot boxes match "${searchQuery}". Try a different search term.` 
                          : "There are no loot box configurations in the system yet. Create your first loot box to get started."}
                      </p>
                      {!searchQuery && (
                        <Button 
                          onClick={() => {
                            form.reset();
                            setIsCreateDialogOpen(true);
                          }}
                          onMouseEnter={() => window.sounds?.hover()}
                        >
                          <PlusSquare className="mr-2 h-4 w-4" /> Create First Loot Box
                        </Button>
                      )}
                      {searchQuery && (
                        <Button 
                          variant="outline"
                          onClick={() => setSearchQuery('')}
                          onMouseEnter={() => window.sounds?.hover()}
                        >
                          <X className="mr-2 h-4 w-4" /> Clear Search
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Quests Tab - Placeholder for now */}
          {activeTab === 'quests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-orange">Quest Management</h2>
              </div>
              
              {/* Quests list */}
              {isLoadingQuests ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.isArray(quests) && quests.length > 0 ? (
                    quests.map((quest: any) => (
                      <Card key={quest.id} className="overflow-hidden border-2 border-gray-700 bg-space-dark/80 hover:border-brand-orange/40 transition-all">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-4 md:w-1/3">
                            <h3 className="text-lg font-semibold text-brand-orange">{quest.title || "Untitled Quest"}</h3>
                            <p className="text-sm text-gray-400 mt-1">Adventure Line: {quest.adventureLine || "Unknown"}</p>
                            <div className="mt-2 flex items-center">
                              <span className="bg-space-mid px-2 py-1 rounded text-xs mr-2">Difficulty: {quest.difficulty || "1"}</span>
                              <span className="bg-space-mid px-2 py-1 rounded text-xs">Order: {quest.orderInLine || "1"}</span>
                            </div>
                          </div>
                          <div className="p-4 md:w-2/3 border-t md:border-t-0 md:border-l border-gray-700">
                            <p className="text-gray-300 text-sm mb-2">
                              {quest.description || "No description available"}
                            </p>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                className="border-gray-700 hover:bg-gray-800 hover:text-white text-gray-300 text-xs"
                                onMouseEnter={() => window.sounds?.hover()}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="text-xs"
                                onMouseEnter={() => window.sounds?.hover()}
                              >
                                <Trash className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-space-dark/50 rounded-lg border border-gray-800">
                      <AlertTriangle className="h-12 w-12 text-brand-orange/60 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-orange mb-2">No Quests Found</h3>
                      <p className="text-gray-400">There are no quests in the database or there was an error fetching them.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Settings Tab - Placeholder for now */}
          {activeTab === 'settings' && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-brand-orange mb-4">Admin Settings</h2>
              <p className="text-gray-400 mb-6">Settings and configuration options will be coming soon.</p>
              <div className="flex justify-center">
                <Settings className="h-20 w-20 text-brand-orange/60" />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-space-dark text-white border border-brand-orange/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-orange">Create New Loot Box</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure a new loot box for players to discover.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Loot Box ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., common-crate, quest-reward" 
                            {...field} 
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Display Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Common Crate, Quest Reward Box" 
                            {...field} 
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rarity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Rarity</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select a rarity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-space-dark border-gray-700">
                            <SelectItem value="common" className="text-gray-300">Common</SelectItem>
                            <SelectItem value="uncommon" className="text-green-400">Uncommon</SelectItem>
                            <SelectItem value="rare" className="text-blue-400">Rare</SelectItem>
                            <SelectItem value="epic" className="text-purple-400">Epic</SelectItem>
                            <SelectItem value="legendary" className="text-amber-400">Legendary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minRewards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Min Rewards</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={10}
                              {...field} 
                              className="bg-black/50 border-gray-700 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxRewards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Max Rewards</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={20}
                              {...field} 
                              className="bg-black/50 border-gray-700 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="URL to loot box image" 
                            {...field} 
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what players can expect from this loot box" 
                            {...field} 
                            className="bg-black/50 border-gray-700 text-white resize-none min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-orange hover:bg-brand-orange/80"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Loot Box
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-space-dark text-white border border-brand-orange/30 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-orange">Edit Loot Box</DialogTitle>
            <DialogDescription className="text-gray-400">
              Edit the configuration for {selectedLootBox?.name || "this loot box"}.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Loot Box ID</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-black/50 border-gray-700 text-white"
                            disabled // ID can't be changed once created
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Display Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rarity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Rarity</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select a rarity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-space-dark border-gray-700">
                            <SelectItem value="common" className="text-gray-300">Common</SelectItem>
                            <SelectItem value="uncommon" className="text-green-400">Uncommon</SelectItem>
                            <SelectItem value="rare" className="text-blue-400">Rare</SelectItem>
                            <SelectItem value="epic" className="text-purple-400">Epic</SelectItem>
                            <SelectItem value="legendary" className="text-amber-400">Legendary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minRewards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Min Rewards</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={10}
                              {...field} 
                              className="bg-black/50 border-gray-700 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxRewards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Max Rewards</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={20}
                              {...field} 
                              className="bg-black/50 border-gray-700 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-black/50 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="bg-black/50 border-gray-700 text-white resize-none min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-orange hover:bg-brand-orange/80"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Update Loot Box
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-space-dark text-white border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete the loot box "{selectedLootBox?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FullscreenAdminApp;