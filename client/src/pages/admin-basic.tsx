import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
  
  // Form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState<string>('common');
  
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
    
    // Create the item
    createItemMutation.mutate({
      id,
      name,
      description,
      rarity,
      flavorText: '', 
      category: '',
      craftingUses: []
    });
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
                  
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={createItemMutation.isPending}
                  >
                    {createItemMutation.isPending ? 'Creating...' : 'Create Item'}
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