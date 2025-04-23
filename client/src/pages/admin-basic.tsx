import React, { useState, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ImageIcon, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';

export default function AdminBasicPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState<string>('common');
  const [isUploading, setIsUploading] = useState(false);
  
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
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Item created successfully'
      });
      
      // Reset form
      setId('');
      setName('');
      setDescription('');
      setRarity('common');
      
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
  
  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, itemId }: { file: File, itemId: string }) => {
      setIsUploading(true);
      try {
        // Create a FormData to send the file
        const formData = new FormData();
        formData.append('image', file);
        formData.append('itemId', itemId);
        
        // Make the request
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        return response.json();
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });
      
      // Refresh items list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to upload image: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
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
    
    try {
      // First create the item
      const createdItem = await createItemMutation.mutateAsync({
        id,
        name,
        description,
        rarity,
        // These are optional but we need to include them in the schema
        flavorText: '', 
        category: '',
        craftingUses: []
      });
      
      // If a file is selected, upload it
      if (fileInputRef.current?.files?.length) {
        const file = fileInputRef.current.files[0];
        await uploadImageMutation.mutateAsync({ file, itemId: id });
      }
      
      // Reset form fields
      setId('');
      setName('');
      setDescription('');
      setRarity('common');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };
  
  // Handle delete
  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(itemId);
    }
  };
  
  return (
    <MainLayout>
      <Container>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-6">Item Management (Basic)</h1>
          
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
                    <Label htmlFor="image">Item Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        ref={fileInputRef}
                        id="image"
                        type="file"
                        accept="image/*"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload an image for the item (max 5MB). This will appear in the inventory.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={createItemMutation.isPending || uploadImageMutation.isPending || isUploading}
                  >
                    {(createItemMutation.isPending || uploadImageMutation.isPending || isUploading) 
                      ? 'Creating...' 
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
                        <Badge 
                          className={`mt-1 ${
                            item.rarity === 'legendary' ? 'bg-amber-500' :
                            item.rarity === 'epic' ? 'bg-purple-500' :
                            item.rarity === 'rare' ? 'bg-blue-500' :
                            item.rarity === 'uncommon' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`}
                        >
                          {item.rarity}
                        </Badge>
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
                          
                          {!item.imagePath && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <label 
                                htmlFor={`upload-${item.id}`}
                                className="cursor-pointer flex flex-col items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Upload className="w-6 h-6 mb-1" />
                                <span>Add Image</span>
                                <input
                                  id={`upload-${item.id}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      uploadImageMutation.mutate({ file, itemId: item.id });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}
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