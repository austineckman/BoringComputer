import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MoreVertical, Package, Filter, Search } from 'lucide-react';

// Define item type
interface Item {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image?: string;
  imagePath?: string; // Added to match the schema
  category?: string;
  isEquippable?: boolean;
  equipSlot?: 'head' | 'torso' | 'legs' | 'hands' | 'accessory' | null;
}

const AdminItems: React.FC = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Handle dialog open/close with cleanup
  const handleCreateDialogOpen = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setImageFile(null);
    }
  };
  
  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setImageFile(null);
    }
  };
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("all");
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '',
    description: '',
    rarity: 'common',
    image: '',
    isEquippable: false,
    equipSlot: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['/api/admin/items'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/items');
        if (!response.ok) {
          throw new Error(`Error fetching items: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      }
    },
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // First create the item with basic data
      const itemId = newItem.name?.toLowerCase().replace(/\s+/g, '-') || '';
      
      const itemData = {
        id: itemId,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        flavorText: '',
        rarity: formData.get('rarity') as string,
        craftingUses: [],
        imagePath: '',
        category: formData.get('category') as string || 'resource',
        isEquippable: formData.get('isEquippable') === 'true',
        equipSlot: formData.get('equipSlot') as string || undefined,
      };
      
      const response = await fetch('/api/admin/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }
      
      const createdItem = await response.json();
      
      // If there's an image, upload it separately
      const imageFile = formData.get('image') as File;
      if (imageFile && imageFile.size > 0) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const imageResponse = await fetch(`/api/admin/items/${itemId}/image`, {
          method: 'POST',
          body: imageFormData,
        });
        
        if (!imageResponse.ok) {
          throw new Error('Item created but failed to upload image');
        }
      }
      
      return createdItem;
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setNewItem({
        name: '',
        description: '',
        rarity: 'common',
        image: '',
        isEquippable: false,
        equipSlot: null,
      });
      setImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
      toast({
        title: 'Item created',
        description: 'The item has been successfully created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, formData }: { itemId: string; formData: FormData }) => {
      // First update the basic item properties
      const itemDataResponse = await fetch(`/api/admin/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          rarity: formData.get('rarity'),
          category: formData.get('category'),
          isEquippable: formData.get('isEquippable') === 'true',
          equipSlot: formData.get('equipSlot'),
        }),
      });
      
      if (!itemDataResponse.ok) {
        throw new Error('Failed to update item data');
      }
      
      // If there's an image file, upload it separately
      const imageFile = formData.get('image') as File;
      if (imageFile && imageFile.size > 0) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const imageResponse = await fetch(`/api/admin/items/${itemId}/image`, {
          method: 'POST',
          body: imageFormData,
        });
        
        if (!imageResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const imageResult = await imageResponse.json();
        return imageResult.item; // Return the updated item with new image path
      }
      
      return itemDataResponse.json();
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setCurrentItem(null);
      // Clear image file to prevent reuse
      setImageFile(null);
      // Invalidate both admin items and inventory caches
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: 'Item updated',
        description: 'The item has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setCurrentItem(null);
      // Invalidate both admin items and inventory caches
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: 'Item deleted',
        description: 'The item has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle create item form submission
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', newItem.name || '');
    formData.append('description', newItem.description || '');
    formData.append('rarity', newItem.rarity || 'common');
    if (newItem.category) formData.append('category', newItem.category);
    formData.append('isEquippable', String(!!newItem.isEquippable));
    if (newItem.equipSlot) formData.append('equipSlot', newItem.equipSlot);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    createItemMutation.mutate(formData);
  };

  // Handle update item form submission
  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    
    const formData = new FormData();
    formData.append('name', currentItem.name || '');
    formData.append('description', currentItem.description || '');
    formData.append('rarity', currentItem.rarity || 'common');
    if (currentItem.category) formData.append('category', currentItem.category);
    formData.append('isEquippable', String(!!currentItem.isEquippable));
    if (currentItem.equipSlot) formData.append('equipSlot', currentItem.equipSlot);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    updateItemMutation.mutate({ itemId: currentItem.id, formData });
  };

  // Handle delete item
  const handleDeleteItem = () => {
    if (!currentItem) return;
    deleteItemMutation.mutate(currentItem.id);
  };

  // Filter items
  const filteredItems = items.filter((item: Item) => {
    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Rarity filter
    if (rarityFilter !== "all" && item.rarity !== rarityFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }

    // Equipment filter
    if (equipmentFilter !== 'all') {
      if (equipmentFilter === 'equippable' && !item.isEquippable) {
        return false;
      } else if (equipmentFilter === 'non-equippable' && item.isEquippable) {
        return false;
      }
    }
    
    return true;
  });

  // Get unique categories
  const categories = Array.from(new Set(items.map((item: Item) => item.category).filter(Boolean))) as string[];

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Item Management</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or description..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="rarity-filter">Rarity</Label>
                <Select value={rarityFilter} onValueChange={(value) => setRarityFilter(value)}>
                  <SelectTrigger id="rarity-filter">
                    <SelectValue placeholder="All rarities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All rarities</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="equipment-filter">Equipment</Label>
                <Select value={equipmentFilter} onValueChange={(value) => setEquipmentFilter(value)}>
                  <SelectTrigger id="equipment-filter">
                    <SelectValue placeholder="All items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All items</SelectItem>
                    <SelectItem value="equippable">Equippable</SelectItem>
                    <SelectItem value="non-equippable">Non-equippable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items grid */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No items found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery || rarityFilter || categoryFilter || equipmentFilter
                ? "No items match your current filters."
                : "There are no items in the database yet."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item: Item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {/* Display the item image when available, with better loading handling */}
                  <div className="relative h-full w-full">
                    {/* Always show placeholder/icon as background */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    
                    {/* Overlay actual image when available */}
                    {item.imagePath && (
                      <img
                        key={`item-${item.id}-image-${Date.now()}`}
                        src={
                          // Handle various image path formats
                          item.imagePath.startsWith('http') ? 
                            item.imagePath : 
                          item.imagePath.startsWith('/uploads/') ?
                            item.imagePath :
                            `/uploads/items/${item.imagePath}`
                        }
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover object-center"
                        loading="eager"
                        onError={(e) => {
                          // Fallback for broken images - hide the image instead of showing placeholder
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setCurrentItem(item);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setCurrentItem(item);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{item.name}</CardTitle>
                    <div className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      item.rarity === 'common' ? 'bg-slate-200 text-slate-700' :
                      item.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
                      item.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                      item.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between border-t p-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>ID: {item.id}</span>
                  </div>
                  {item.isEquippable && (
                    <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      Equippable: {item.equipSlot}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Create a new item with details and an optional image.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateItem}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name" className="mb-1.5 block">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="mb-1.5 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Item description"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rarity" className="mb-1.5 block">
                    Rarity
                  </Label>
                  <Select 
                    value={newItem.rarity} 
                    onValueChange={(value: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary') => 
                      setNewItem({ ...newItem, rarity: value })
                    }
                  >
                    <SelectTrigger id="rarity">
                      <SelectValue placeholder="Select rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="uncommon">Uncommon</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category" className="mb-1.5 block">
                    Category (Optional)
                  </Label>
                  <Input
                    id="category"
                    value={newItem.category || ''}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    placeholder="e.g. Resource, Potion"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isEquippable"
                    checked={!!newItem.isEquippable}
                    onChange={(e) => setNewItem({ ...newItem, isEquippable: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isEquippable">This item is equippable</Label>
                </div>
              </div>
              
              {newItem.isEquippable && (
                <div>
                  <Label htmlFor="equipSlot" className="mb-1.5 block">
                    Equipment Slot
                  </Label>
                  <Select 
                    value={newItem.equipSlot || 'head'} 
                    onValueChange={(value: 'head' | 'torso' | 'legs' | 'hands' | 'accessory') => 
                      setNewItem({ ...newItem, equipSlot: value })
                    }
                  >
                    <SelectTrigger id="equipSlot">
                      <SelectValue placeholder="Select equipment slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head">Head</SelectItem>
                      <SelectItem value="torso">Torso</SelectItem>
                      <SelectItem value="legs">Legs</SelectItem>
                      <SelectItem value="hands">Hands</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="image" className="mb-1.5 block">
                  Image (Optional)
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Recommended size: 400 x 300 pixels
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createItemMutation.isPending}>
                {createItemMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  'Create Item'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update item details and image.
            </DialogDescription>
          </DialogHeader>
          {currentItem && (
            <form onSubmit={handleUpdateItem}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="edit-name" className="mb-1.5 block">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    placeholder="Item name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-description" className="mb-1.5 block">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    placeholder="Item description"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-rarity" className="mb-1.5 block">
                      Rarity
                    </Label>
                    <Select 
                      value={currentItem.rarity} 
                      onValueChange={(value: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary') => 
                        setCurrentItem({ ...currentItem, rarity: value })
                      }
                    >
                      <SelectTrigger id="edit-rarity">
                        <SelectValue placeholder="Select rarity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="uncommon">Uncommon</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-category" className="mb-1.5 block">
                      Category (Optional)
                    </Label>
                    <Input
                      id="edit-category"
                      value={currentItem.category || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                      placeholder="e.g. Resource, Potion"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isEquippable"
                      checked={!!currentItem.isEquippable}
                      onChange={(e) => setCurrentItem({ ...currentItem, isEquippable: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="edit-isEquippable">This item is equippable</Label>
                  </div>
                </div>
                
                {currentItem.isEquippable && (
                  <div>
                    <Label htmlFor="edit-equipSlot" className="mb-1.5 block">
                      Equipment Slot
                    </Label>
                    <Select 
                      value={currentItem.equipSlot || 'head'} 
                      onValueChange={(value: 'head' | 'torso' | 'legs' | 'hands' | 'accessory') => 
                        setCurrentItem({ ...currentItem, equipSlot: value })
                      }
                    >
                      <SelectTrigger id="edit-equipSlot">
                        <SelectValue placeholder="Select equipment slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="head">Head</SelectItem>
                        <SelectItem value="torso">Torso</SelectItem>
                        <SelectItem value="legs">Legs</SelectItem>
                        <SelectItem value="hands">Hands</SelectItem>
                        <SelectItem value="accessory">Accessory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="edit-image" className="mb-1.5 block">
                    Image 
                  </Label>
                  {/* Image preview with improved loading */}
                  <div className="mb-2 relative h-24 rounded border bg-muted">
                    {/* Default placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    {/* Actual image when available */}
                    {(currentItem.imagePath || currentItem.image) && (
                      <img
                        key={`edit-${currentItem.id}-image-${Date.now()}`}
                        src={
                          // Handle various image path formats
                          currentItem.imagePath ? 
                            (currentItem.imagePath.startsWith('http') ? currentItem.imagePath : `/uploads/items/${currentItem.imagePath}`) :
                          currentItem.image ? 
                            (currentItem.image.startsWith('http') ? currentItem.image : `/uploads/items/${currentItem.image}`) :
                          '/images/item-placeholder.png'
                        }
                        alt={currentItem.name}
                        className="absolute inset-0 h-24 w-auto rounded object-cover"
                        loading="eager"
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recommended size: 400 x 300 pixels. Leave empty to keep current image.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateItemMutation.isPending}>
                  {updateItemMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Item'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentItem && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  {/* More robust image display with placeholder fallback */}
                  <div className="relative h-16 w-16 rounded overflow-hidden bg-muted">
                    {/* Default placeholder always visible in background */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    {/* Only show image when available */}
                    {(currentItem.imagePath || currentItem.image) && (
                      <img
                        key={`delete-${currentItem.id}-image-${Date.now()}`}
                        src={
                          // Handle various image path formats
                          currentItem.imagePath ? 
                            (currentItem.imagePath.startsWith('http') ? currentItem.imagePath : `/uploads/items/${currentItem.imagePath}`) :
                          currentItem.image ? 
                            (currentItem.image.startsWith('http') ? currentItem.image : `/uploads/items/${currentItem.image}`) :
                          '/images/item-placeholder.png'
                        }
                        alt={currentItem.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{currentItem.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {currentItem.id}</p>
                    <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      currentItem.rarity === 'common' ? 'bg-slate-200 text-slate-700' :
                      currentItem.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
                      currentItem.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                      currentItem.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {currentItem.rarity.charAt(0).toUpperCase() + currentItem.rarity.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteItem}
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                'Delete Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminItems;