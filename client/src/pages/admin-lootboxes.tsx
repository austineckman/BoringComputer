import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Edit, X, Image, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Validation schema for loot box configuration
const lootBoxConfigSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]),
  minRewards: z.number().min(1).max(10),
  maxRewards: z.number().min(1).max(20),
  image: z.string().min(1, "Image URL is required"),
  itemDropTable: z.array(
    z.object({
      itemId: z.string().min(1, "Item ID is required"),
      weight: z.number().min(1, "Weight must be at least 1"),
      minQuantity: z.number().min(1, "Minimum quantity must be at least 1"),
      maxQuantity: z.number().min(1, "Maximum quantity must be at least 1"),
    })
  ).min(1, "At least one item must be in the drop table")
});

type LootBoxConfig = z.infer<typeof lootBoxConfigSchema>;

// Initial form values
const defaultValues: Partial<LootBoxConfig> = {
  id: "",
  name: "",
  description: "",
  rarity: "common",
  minRewards: 1,
  maxRewards: 3,
  image: "/images/loot-crate.png",
  itemDropTable: []
};

const AdminLootBoxesPage: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentLootBox, setCurrentLootBox] = useState<LootBoxConfig | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("list");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [totalWeight, setTotalWeight] = useState(0);
  const [newItemRow, setNewItemRow] = useState({
    itemId: "",
    weight: 10,
    minQuantity: 1,
    maxQuantity: 1
  });

  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Form setup
  const form = useForm<LootBoxConfig>({
    resolver: zodResolver(lootBoxConfigSchema),
    defaultValues
  });

  // Fetch loot box configs
  const { data: lootBoxConfigs, isLoading: isLoadingConfigs, error: lootBoxError } = useQuery({
    queryKey: ['/api/admin/lootboxes'],
    enabled: selectedTab === "list",
    // Use the default queryFn
  });

  // Add effects for debugging
  useEffect(() => {
    if (lootBoxConfigs) {
      console.log('Loot box configs loaded:', lootBoxConfigs);
    }
  }, [lootBoxConfigs]);

  useEffect(() => {
    if (lootBoxError) {
      console.error('Error loading loot box configs:', lootBoxError);
    }
  }, [lootBoxError]);

  // Fetch items for dropdown
  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/admin/items'],
    // Use the default queryFn
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: LootBoxConfig) => 
      apiRequest('POST', '/api/admin/lootboxes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lootboxes'] });
      toast({ title: "Success", description: "Loot box configuration created successfully" });
      setIsCreateDialogOpen(false);
      setSelectedTab("list");
      form.reset(defaultValues);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to create loot box configuration: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: LootBoxConfig) => 
      apiRequest('PUT', `/api/admin/lootboxes/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lootboxes'] });
      toast({ title: "Success", description: "Loot box configuration updated successfully" });
      setSelectedTab("list");
      setIsEditMode(false);
      form.reset(defaultValues);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to update loot box configuration: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest('DELETE', `/api/admin/lootboxes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lootboxes'] });
      toast({ title: "Success", description: "Loot box configuration deleted successfully" });
      setIsDeleteDialogOpen(false);
      setCurrentLootBox(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete loot box configuration: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Reset inventory to 1 of each item mutation
  const resetInventoryMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/admin/inventory/reset-to-one'),
    onSuccess: (data) => {
      toast({ 
        title: "Success", 
        description: `Inventory reset successfully. You now have exactly 1 of each item (${data.inventory ? Object.keys(data.inventory).length : 0} items).`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to reset inventory: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Generate test loot crates mutation
  const generateTestCratesMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/loot-boxes/generate-test'),
    onSuccess: (data) => {
      toast({ 
        title: "Success", 
        description: `Generated ${data.lootBoxes?.length || 0} test loot crates successfully!`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loot-boxes'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: `Failed to generate test loot crates: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: LootBoxConfig) => {
    // Validate item weights sum to 100
    const weightSum = data.itemDropTable.reduce((sum, item) => sum + item.weight, 0);
    
    if (Math.abs(weightSum - 100) > 0.01) {
      toast({
        title: "Invalid Drop Table",
        description: `Item weights must sum to 100. Current sum: ${weightSum}`,
        variant: "destructive"
      });
      return;
    }
    
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle edit action
  const handleEdit = (lootBox: LootBoxConfig) => {
    setCurrentLootBox(lootBox);
    form.reset(lootBox);
    setPreviewImage(lootBox.image);
    setIsEditMode(true);
    setSelectedTab("edit");
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (currentLootBox) {
      deleteMutation.mutate(currentLootBox.id);
    }
  };

  // Reset form and state when tab changes
  useEffect(() => {
    if (selectedTab === "create") {
      form.reset(defaultValues);
      setPreviewImage(defaultValues.image || "");
      setIsEditMode(false);
    }
  }, [selectedTab, form]);

  // Update total weight calculation
  useEffect(() => {
    const itemDropTable = form.watch("itemDropTable") || [];
    const sum = itemDropTable.reduce((total, item) => total + item.weight, 0);
    setTotalWeight(sum);
  }, [form.watch("itemDropTable")]);

  // Add new item to drop table
  const addItemToDropTable = () => {
    const currentItems = form.getValues("itemDropTable") || [];
    
    // Check if itemId is already in the table
    if (currentItems.some(item => item.itemId === newItemRow.itemId)) {
      toast({
        title: "Duplicate Item",
        description: "This item is already in the drop table",
        variant: "destructive"
      });
      return;
    }
    
    // Validate item ID
    if (!newItemRow.itemId) {
      toast({
        title: "Missing Item",
        description: "Please select an item to add",
        variant: "destructive"
      });
      return;
    }
    
    // Add the new item
    form.setValue("itemDropTable", [...currentItems, { ...newItemRow }]);
    
    // Reset the new item form
    setNewItemRow({
      itemId: "",
      weight: 10,
      minQuantity: 1,
      maxQuantity: 1
    });
  };

  // Remove item from drop table
  const removeItemFromDropTable = (index: number) => {
    const currentItems = form.getValues("itemDropTable") || [];
    form.setValue("itemDropTable", 
      currentItems.filter((_, i) => i !== index)
    );
  };

  // Adjust weight to make total 100%
  const normalizeWeights = () => {
    const currentItems = form.getValues("itemDropTable") || [];
    if (currentItems.length === 0) return;
    
    const currentTotal = currentItems.reduce((sum, item) => sum + item.weight, 0);
    if (currentTotal === 0) return;
    
    const normalizedItems = currentItems.map(item => ({
      ...item,
      weight: Math.round((item.weight / currentTotal) * 100)
    }));
    
    // Adjust to exactly 100 by adding/subtracting from the last item
    const newTotal = normalizedItems.reduce((sum, item) => sum + item.weight, 0);
    const diff = 100 - newTotal;
    if (diff !== 0 && normalizedItems.length > 0) {
      normalizedItems[normalizedItems.length - 1].weight += diff;
    }
    
    form.setValue("itemDropTable", normalizedItems);
  };

  // Move item up in the drop table
  const moveItemUp = (index: number) => {
    if (index <= 0) return;
    
    const currentItems = [...form.getValues("itemDropTable")];
    const temp = currentItems[index];
    currentItems[index] = currentItems[index - 1];
    currentItems[index - 1] = temp;
    
    form.setValue("itemDropTable", currentItems);
  };

  // Move item down in the drop table
  const moveItemDown = (index: number) => {
    const currentItems = [...form.getValues("itemDropTable")];
    if (index >= currentItems.length - 1) return;
    
    const temp = currentItems[index];
    currentItems[index] = currentItems[index + 1];
    currentItems[index + 1] = temp;
    
    form.setValue("itemDropTable", currentItems);
  };

  // Helper to get the actual item data
  const getItemById = (id: string) => {
    return items?.find((item: any) => item.id === id);
  };

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
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Loot Box Configuration</h1>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">Loot Box List</TabsTrigger>
            <TabsTrigger value="create">Create Loot Box</TabsTrigger>
            {isEditMode && <TabsTrigger value="edit">Edit Loot Box</TabsTrigger>}
          </TabsList>
          
          {/* List view */}
          <TabsContent value="list">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between">
                <h2 className="text-2xl font-semibold">Available Loot Box Configurations</h2>
                <Button onClick={() => setSelectedTab("create")}>
                  <Plus className="mr-2 h-4 w-4" /> Create New
                </Button>
              </div>
            </div>
            
            {isLoadingConfigs ? (
              <p>Loading loot box configurations...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lootBoxConfigs && lootBoxConfigs.length > 0 ? (
                  lootBoxConfigs.map((lootBox: LootBoxConfig) => (
                    <Card key={lootBox.id} className="overflow-hidden border-2 hover:shadow-md transition-all">
                      <div className="h-48 bg-gray-800 relative overflow-hidden">
                        <img 
                          src={lootBox.image} 
                          alt={lootBox.name} 
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded">
                          <span className={`font-semibold ${getRarityColorClass(lootBox.rarity)}`}>
                            {lootBox.rarity.charAt(0).toUpperCase() + lootBox.rarity.slice(1)}
                          </span>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle>{lootBox.name}</CardTitle>
                        <CardDescription>{lootBox.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">Rewards: {lootBox.minRewards} - {lootBox.maxRewards} items</p>
                        <p className="text-sm mb-4">Items in drop table: {lootBox.itemDropTable.length}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleEdit(lootBox)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            setCurrentLootBox(lootBox);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Alert>
                    <AlertDescription>
                      No loot box configurations found. Create one to get started.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Create/Edit Form */}
          <TabsContent value="create">
            <h2 className="text-2xl font-semibold mb-6">Create New Loot Box Configuration</h2>
            <LootBoxConfigForm 
              form={form} 
              onSubmit={onSubmit}
              isSubmitting={createMutation.isPending}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              items={items || []}
              newItemRow={newItemRow}
              setNewItemRow={setNewItemRow}
              addItemToDropTable={addItemToDropTable}
              removeItemFromDropTable={removeItemFromDropTable}
              moveItemUp={moveItemUp}
              moveItemDown={moveItemDown}
              normalizeWeights={normalizeWeights}
              totalWeight={totalWeight}
              getItemById={getItemById}
            />
          </TabsContent>
          
          <TabsContent value="edit">
            <h2 className="text-2xl font-semibold mb-6">Edit Loot Box Configuration</h2>
            <LootBoxConfigForm 
              form={form} 
              onSubmit={onSubmit}
              isSubmitting={updateMutation.isPending}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              items={items || []}
              newItemRow={newItemRow}
              setNewItemRow={setNewItemRow}
              addItemToDropTable={addItemToDropTable}
              removeItemFromDropTable={removeItemFromDropTable}
              moveItemUp={moveItemUp}
              moveItemDown={moveItemDown}
              normalizeWeights={normalizeWeights}
              totalWeight={totalWeight}
              getItemById={getItemById}
              isEditMode={true}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the loot box configuration "{currentLootBox?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

interface LootBoxConfigFormProps {
  form: any;
  onSubmit: (data: LootBoxConfig) => void;
  isSubmitting: boolean;
  previewImage: string;
  setPreviewImage: (url: string) => void;
  items: any[];
  newItemRow: any;
  setNewItemRow: (data: any) => void;
  addItemToDropTable: () => void;
  removeItemFromDropTable: (index: number) => void;
  moveItemUp: (index: number) => void;
  moveItemDown: (index: number) => void;
  normalizeWeights: () => void;
  totalWeight: number;
  getItemById: (id: string) => any;
  isEditMode?: boolean;
}

const LootBoxConfigForm: React.FC<LootBoxConfigFormProps> = ({
  form,
  onSubmit,
  isSubmitting,
  previewImage,
  setPreviewImage,
  items,
  newItemRow,
  setNewItemRow,
  addItemToDropTable,
  removeItemFromDropTable,
  moveItemUp,
  moveItemDown,
  normalizeWeights,
  totalWeight,
  getItemById,
  isEditMode = false
}) => {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Basic Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loot Box ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., common-crate, quest-reward" 
                          {...field} 
                          disabled={isEditMode}
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
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Common Crate, Quest Reward Box" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what players can expect from this loot box" 
                          {...field} 
                          rows={4}
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
                      <FormLabel>Rarity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a rarity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
              </CardContent>
            </Card>
            
            {/* Rewards settings section */}
            <Card>
              <CardHeader>
                <CardTitle>Reward Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minRewards"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Rewards</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={10} 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
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
                        <FormLabel>Max Rewards</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={20} 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Image section */}
            <Card>
              <CardHeader>
                <CardTitle>Loot Box Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loot Box Image</FormLabel>
                      <div className="flex flex-col gap-4">
                        {/* Only show URL input in create mode */}
                        {!isEditMode && (
                          <FormControl>
                            <Input 
                              placeholder="URL to the loot box image (optional)" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                setPreviewImage(e.target.value || '');
                              }}
                            />
                          </FormControl>
                        )}
                        
                        {/* In edit mode, show current image path - readonly */}
                        {isEditMode && (
                          <div className="flex flex-col space-y-4">
                            <FormControl>
                              <Input 
                                placeholder="Image path will be updated when you upload" 
                                value={field.value || ''}
                                readOnly
                              />
                            </FormControl>
                            
                            <div className="flex flex-col space-y-2">
                              <div className="text-sm font-medium">
                                Upload a new image
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  key={`file-upload-${isEditMode ? 'edit' : 'create'}`}
                                  type="file"
                                  accept="image/png, image/jpeg, image/gif, image/webp"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    
                                    // We know we have an ID in edit mode
                                    const id = form.getValues('id');
                                    
                                    // Create a FormData object
                                    const formData = new FormData();
                                    formData.append('image', file);
                                    
                                    try {
                                      // Upload the image
                                      const response = await fetch(`/api/admin/lootboxes/${id}/upload`, {
                                        method: 'POST',
                                        body: formData,
                                        credentials: 'include'
                                      });
                                      
                                      if (!response.ok) {
                                        throw new Error(`Upload failed: ${response.statusText}`);
                                      }
                                      
                                      const data = await response.json();
                                      
                                      // Update the form with the new image path
                                      field.onChange(data.imagePath);
                                      setPreviewImage(data.imagePath);
                                      
                                      toast({
                                        title: 'Success',
                                        description: 'Image uploaded successfully'
                                      });
                                    } catch (error: any) {
                                      toast({
                                        title: 'Upload Error',
                                        description: error.message || 'Failed to upload image',
                                        variant: 'destructive'
                                      });
                                    }
                                  }}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!isEditMode && (
                          <div className="text-sm text-muted-foreground mt-2">
                            You can upload a custom image after creating the loot box.
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {previewImage && (
                  <div className="bg-gray-800 rounded-md overflow-hidden">
                    <div className="text-xs text-gray-400 p-2">Preview</div>
                    <div className="h-48 flex items-center justify-center p-4">
                      <img 
                        src={previewImage} 
                        alt="Loot Box Preview" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Item Drop Table */}
            <Card>
              <CardHeader>
                <CardTitle>Item Drop Table</CardTitle>
                <CardDescription>
                  Configure which items can drop from this loot box and their chances.
                  Total weight should equal 100%.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end space-x-2 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="itemId">Item</Label>
                    <Select
                      value={newItemRow.itemId}
                      onValueChange={(value) => setNewItemRow({...newItemRow, itemId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            <span className={getRarityColorClass(item.rarity)}>
                              {item.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">Weight (%)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={newItemRow.weight}
                      onChange={(e) => setNewItemRow({...newItemRow, weight: parseInt(e.target.value) || 0})}
                      className="w-20"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minQuantity">Min Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={newItemRow.minQuantity}
                      onChange={(e) => setNewItemRow({...newItemRow, minQuantity: parseInt(e.target.value) || 1})}
                      className="w-16"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxQuantity">Max Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={newItemRow.maxQuantity}
                      onChange={(e) => setNewItemRow({...newItemRow, maxQuantity: parseInt(e.target.value) || 1})}
                      className="w-16"
                    />
                  </div>
                  
                  <Button type="button" onClick={addItemToDropTable}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className={totalWeight !== 100 ? "text-red-500" : "text-green-500"}>
                  Total Weight: {totalWeight}% {totalWeight !== 100 ? "(Should be 100%)" : "✓"}
                </div>
                
                {totalWeight > 0 && totalWeight !== 100 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={normalizeWeights}
                  >
                    Normalize Weights to 100%
                  </Button>
                )}
                
                <Separator />
                
                <FormField
                  control={form.control}
                  name="itemDropTable"
                  render={({ field }) => (
                    <FormItem>
                      <div className="overflow-auto max-h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead>Weight</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {field.value?.length > 0 ? (
                              field.value.map((item, index) => {
                                const itemData = getItemById(item.itemId);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <div className="flex flex-col">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => moveItemUp(index)}
                                          disabled={index === 0}
                                        >
                                          <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => moveItemDown(index)}
                                          disabled={index === field.value.length - 1}
                                        >
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        {itemData?.imagePath && (
                                          <img 
                                            src={itemData.imagePath} 
                                            alt={itemData.name}
                                            className="w-8 h-8 object-contain"
                                          />
                                        )}
                                        <span className={getRarityColorClass(itemData?.rarity || 'common')}>
                                          {itemData?.name || item.itemId}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={item.weight}
                                        onChange={(e) => {
                                          const newValue = parseInt(e.target.value) || 0;
                                          const items = [...field.value];
                                          items[index].weight = newValue;
                                          field.onChange(items);
                                        }}
                                        className="w-16"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-1">
                                        <Input
                                          type="number"
                                          value={item.minQuantity}
                                          onChange={(e) => {
                                            const newValue = parseInt(e.target.value) || 1;
                                            const items = [...field.value];
                                            items[index].minQuantity = newValue;
                                            field.onChange(items);
                                          }}
                                          className="w-14"
                                        />
                                        <span>-</span>
                                        <Input
                                          type="number"
                                          value={item.maxQuantity}
                                          onChange={(e) => {
                                            const newValue = parseInt(e.target.value) || 1;
                                            const items = [...field.value];
                                            items[index].maxQuantity = newValue;
                                            field.onChange(items);
                                          }}
                                          className="w-14"
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItemFromDropTable(index)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                  No items added to the drop table yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Reset Form
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditMode ? "Update Loot Box" : "Create Loot Box"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AdminLootBoxesPage;