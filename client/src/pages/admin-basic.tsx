import React, { useState, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';

export default function AdminBasic() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState<string>('common');
  const [isEquippable, setIsEquippable] = useState(false);
  const [equipSlot, setEquipSlot] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Query to fetch items
  const { 
    data: items = [] as any[],
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/admin/items']
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await apiRequest('POST', '/api/admin/items', itemData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }
      return response.json();
    },
    onSuccess: (newItem) => {
      toast({
        title: 'Success',
        description: 'Item created successfully'
      });
      
      // If we have a file selected, upload it for the new item
      if (selectedFile) {
        uploadImageMutation.mutate({
          itemId: newItem.id,
          file: selectedFile
        });
      } else {
        // Reset form if no image to upload
        resetForm();
      }
      
      // Refresh items list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create item: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ itemId, file }: { itemId: string, file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`/api/admin/items/${itemId}/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });
      
      // Reset form
      resetForm();
      
      // Refresh items list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to upload image: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Upload image for existing item
  const uploadExistingItemImageMutation = useMutation({
    mutationFn: async ({ itemId, file }: { itemId: string, file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`/api/admin/items/${itemId}/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Image updated successfully'
      });
      
      // Refresh items list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update image: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/items/${itemId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Item deleted successfully'
      });
      
      // Refresh items list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete item: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Reset the form
  const resetForm = () => {
    setId('');
    setName('');
    setDescription('');
    setRarity('common');
    setIsEquippable(false);
    setEquipSlot(undefined);
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size exceeds the maximum allowed (5MB)',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Only image files are allowed (JPEG, PNG, GIF, WebP)',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!id || !name || !description) {
      toast({
        title: 'Error',
        description: 'ID, name and description are required',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate equipment slot if item is equippable
    if (isEquippable && !equipSlot) {
      toast({
        title: 'Error',
        description: 'Equipment slot is required for equippable items',
        variant: 'destructive'
      });
      return;
    }
    
    // Create the item
    createItemMutation.mutate({
      id,
      name,
      description,
      rarity,
      flavorText: '', 
      category: '',
      craftingUses: [],
      isEquippable,
      equipSlot: isEquippable ? equipSlot : null
    });
  };
  
  // Handle delete
  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(itemId);
    }
  };
  
  // Handle image upload for existing item
  const handleExistingItemImageUpload = (itemId: string, file: File) => {
    uploadExistingItemImageMutation.mutate({
      itemId,
      file
    });
  };
  
  return (
    <MainLayout>
      <Container>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-6">Item Management</h1>
          
          {/* Create item form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="id">ID (unique identifier)</Label>
                    <Input 
                      id="id"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      placeholder="e.g., copper, techscrap"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Copper, Tech Scrap"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the item"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="rarity">Rarity</Label>
                    <Select 
                      value={rarity}
                      onValueChange={(value) => setRarity(value)}
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
                  
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="is-equippable" 
                        checked={isEquippable}
                        onCheckedChange={(checked) => {
                          setIsEquippable(checked === true);
                          if (checked !== true) {
                            setEquipSlot(undefined);
                          }
                        }}
                      />
                      <Label htmlFor="is-equippable">Item is equippable</Label>
                    </div>
                  </div>
                  
                  {isEquippable && (
                    <div className="grid gap-2">
                      <Label htmlFor="equip-slot">Equipment Slot</Label>
                      <Select
                        value={equipSlot}
                        onValueChange={(value) => setEquipSlot(value)}
                      >
                        <SelectTrigger id="equip-slot">
                          <SelectValue placeholder="Select equipment slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="head">Head</SelectItem>
                          <SelectItem value="torso">Torso</SelectItem>
                          <SelectItem value="legs">Legs</SelectItem>
                          <SelectItem value="accessory">Accessory</SelectItem>
                          <SelectItem value="hands">Hands</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="grid gap-2">
                    <Label htmlFor="image">Item Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        ref={fileInputRef}
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="flex-1"
                        onChange={handleFileChange}
                      />
                    </div>
                    {imagePreview && (
                      <div className="mt-2 relative overflow-hidden rounded-md" style={{ height: '120px' }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain bg-black/5 rounded-md"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload an image for the item (max 5MB). This will appear in the inventory.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={createItemMutation.isPending || uploadImageMutation.isPending}
                  >
                    {(createItemMutation.isPending || uploadImageMutation.isPending) 
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> 
                      : 'Create Item'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Items list */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Items</h2>
            
            {isLoading ? (
              <p className="text-center py-4">Loading items...</p>
            ) : error ? (
              <p className="text-center text-red-500 py-4">Error loading items</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.length > 0 ? (
                  items.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive" 
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge 
                            className={`${
                              item.rarity === 'legendary' ? 'bg-amber-500' :
                              item.rarity === 'epic' ? 'bg-purple-500' :
                              item.rarity === 'rare' ? 'bg-blue-500' :
                              item.rarity === 'uncommon' ? 'bg-green-500' :
                              'bg-gray-500'
                            }`}
                          >
                            {item.rarity}
                          </Badge>
                          
                          {item.isEquippable && (
                            <Badge variant="outline" className="border-blue-400 text-blue-500">
                              {item.equipSlot && `${item.equipSlot.charAt(0).toUpperCase() + item.equipSlot.slice(1)} Slot`}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="mb-3 relative overflow-hidden rounded-md" style={{ height: '120px' }}>
                          {item.imagePath ? (
                            <img 
                              src={item.imagePath} 
                              alt={item.name}
                              className="w-full h-full object-contain bg-black/5 rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-md">
                              <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <label 
                              htmlFor={`upload-${item.id}`}
                              className="cursor-pointer flex flex-col items-center justify-center text-sm text-white hover:text-primary transition-colors"
                            >
                              {uploadExistingItemImageMutation.isPending && uploadExistingItemImageMutation.variables?.itemId === item.id ? (
                                <Loader2 className="w-6 h-6 mb-1 animate-spin" />
                              ) : (
                                <Upload className="w-6 h-6 mb-1" />
                              )}
                              <span>{item.imagePath ? 'Change Image' : 'Add Image'}</span>
                              <input
                                id={`upload-${item.id}`}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleExistingItemImageUpload(item.id, file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-4 col-span-3">No items found. Create your first item above.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}