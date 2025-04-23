import React, { useState, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminItemsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for new item dialog
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    id: '',
    name: '',
    description: '',
    flavorText: '',
    rarity: 'common' as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
    category: '',
    craftingUses: [] as string[]
  });

  // Query to fetch items
  const { 
    data: items = [] as any[],
    isLoading: isItemsLoading,
    error: itemsError
  } = useQuery({
    queryKey: ['/api/admin/items']
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/items/${itemId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: `Failed to delete item: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handle image upload utility function
  const handleImageUpload = async (file: File, itemId: string) => {
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('image', file);
      formData.append('itemId', itemId);
      
      // Make a fetch request to upload the image
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.imagePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create a new mutation for creating items
  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/items', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      // Reset form and close dialog
      setNewItem({
        id: '',
        name: '',
        description: '',
        flavorText: '',
        rarity: 'common',
        category: '',
        craftingUses: []
      });
      setNewItemDialogOpen(false);
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Item created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error creating item:', error);
      toast({
        title: 'Error',
        description: `Failed to create item: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Function to handle new item form submission
  const handleNewItemFormSubmit = async () => {
    try {
      // Validate required fields
      if (!newItem.id || !newItem.name || !newItem.description) {
        toast({
          title: 'Error',
          description: 'ID, Name, and Description are required',
          variant: 'destructive',
        });
        return;
      }
      
      // Create a copy to avoid mutation issues
      const itemToCreate = { ...newItem };
      
      // Create the item first
      const createdItem = await createItemMutation.mutateAsync(itemToCreate);
      
      // If there's a file selected for upload and item was created successfully
      if (fileInputRef.current?.files?.length && createdItem) {
        const file = fileInputRef.current.files[0];
        await handleImageUpload(file, createdItem.id);
        
        // Refresh the items list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
        queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle delete function
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <MainLayout>
      <Container>
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Item Management</h1>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              onClick={() => setNewItemDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
          
          {isItemsLoading ? (
            <p className="text-center py-8">Loading items...</p>
          ) : itemsError ? (
            <p className="text-center text-red-500 py-8">Error loading items</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.length > 0 ? (
                items.map((item: any) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive" 
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                    <div className="p-4 flex justify-center">
                      {item.imagePath ? (
                        <img 
                          src={item.imagePath} 
                          alt={item.name} 
                          className="h-32 object-contain" 
                        />
                      ) : (
                        <div className="h-32 w-32 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      {item.flavorText && (
                        <p className="text-sm italic text-muted-foreground">{item.flavorText}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center py-8 col-span-3">No items found. Add your first item.</p>
              )}
            </div>
          )}

          {/* Create New Item Dialog */}
          <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new item.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newId">ID (unique identifier)</Label>
                  <Input
                    id="newId"
                    value={newItem.id}
                    className="col-span-3"
                    onChange={(e) => setNewItem({...newItem, id: e.target.value})}
                    placeholder="e.g., copper, techscrap, crystal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newName">Name</Label>
                  <Input
                    id="newName"
                    value={newItem.name}
                    className="col-span-3"
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g., Copper, Tech Scrap, Crystal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newDescription">Description</Label>
                  <Textarea
                    id="newDescription"
                    value={newItem.description}
                    className="col-span-3"
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Describe the item's purpose and appearance"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newFlavorText">Flavor Text (Optional)</Label>
                  <Textarea
                    id="newFlavorText"
                    value={newItem.flavorText}
                    className="col-span-3"
                    onChange={(e) => setNewItem({...newItem, flavorText: e.target.value})}
                    placeholder="Add some flavor text or lore for the item"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newRarity">Rarity</Label>
                  <Select 
                    value={newItem.rarity}
                    onValueChange={(value: any) => setNewItem({...newItem, rarity: value})}
                  >
                    <SelectTrigger id="newRarity">
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
                
                <div className="space-y-2">
                  <Label htmlFor="newCategory">Category (Optional)</Label>
                  <Input
                    id="newCategory"
                    value={newItem.category}
                    className="col-span-3"
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    placeholder="e.g., Resource, Material, Component"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newImage">Item Image</Label>
                  <Input
                    id="newImage"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleNewItemFormSubmit} 
                  disabled={createItemMutation.isPending}
                >
                  {createItemMutation.isPending ? "Creating..." : "Create Item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Container>
    </MainLayout>
  );
}