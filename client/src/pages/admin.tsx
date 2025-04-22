import React, { useState, useContext, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Database, 
  Package, 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Archive,
  Search,
  Filter,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SoundContext } from '@/context/SoundContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Item form schema
const itemFormSchema = z.object({
  id: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  flavorText: z.string().max(200).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  craftingUses: z.array(z.string()).optional(),
  imagePath: z.string().optional(),
  category: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

export default function AdminPage() {
  const { toast } = useToast();
  const soundContext = useContext(SoundContext);
  const sounds = soundContext?.sounds || { click: () => {}, success: () => {}, error: () => {} };
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('quests');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Queries for each resource type
  const { 
    data: quests,
    isLoading: isQuestsLoading,
    error: questsError
  } = useQuery({
    queryKey: ['/api/admin/quests'],
    enabled: activeTab === 'quests'
  });
  
  const { 
    data: items,
    isLoading: isItemsLoading,
    error: itemsError
  } = useQuery({
    queryKey: ['/api/admin/items'],
    enabled: activeTab === 'items'
  });
  
  const { 
    data: recipes,
    isLoading: isRecipesLoading,
    error: recipesError
  } = useQuery({
    queryKey: ['/api/admin/recipes'],
    enabled: activeTab === 'recipes'
  });
  
  const { 
    data: lootBoxes,
    isLoading: isLootBoxesLoading,
    error: lootBoxesError
  } = useQuery({
    queryKey: ['/api/admin/loot-boxes'],
    enabled: activeTab === 'lootBoxes'
  });
  
  // Mutation for deleting a resource
  const deleteMutation = useMutation({
    mutationFn: async ({ resourceType, id }: { resourceType: string, id: string | number }) => {
      const res = await apiRequest('DELETE', `/api/admin/${resourceType}/${id}`);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      const { resourceType } = variables;
      sounds.success();
      toast({
        title: 'Success',
        description: `${resourceType.slice(0, -1)} deleted successfully.`,
      });
      // Invalidate the relevant query to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${resourceType}`] });
    },
    onError: (error: Error) => {
      sounds.error();
      toast({
        title: 'Error',
        description: `Failed to delete: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleDelete = (resourceType: string, id: string | number) => {
    if (window.confirm(`Are you sure you want to delete this ${resourceType.slice(0, -1)}?`)) {
      sounds.click();
      deleteMutation.mutate({ resourceType, id });
    }
  };
  
  const handleTabChange = (value: string) => {
    sounds.click();
    setActiveTab(value);
  };
  
  const renderQuestsTab = () => {
    if (isQuestsLoading) return <p className="text-center py-8">Loading quests...</p>;
    if (questsError) return <p className="text-center text-red-500 py-8">Error loading quests</p>;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative">
              <Input 
                placeholder="Search quests..." 
                className="w-64 pl-8" 
              />
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Adventure Line" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lines</SelectItem>
                <SelectItem value="lost-in-space">Lost in Space</SelectItem>
                <SelectItem value="cogsworth">Cogsworth</SelectItem>
                <SelectItem value="pandora">Pandora's Box</SelectItem>
                <SelectItem value="neon-realm">Neon Realm</SelectItem>
                <SelectItem value="nebula">Nebula Raiders</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => sounds.click()}>
            <Plus className="h-4 w-4 mr-2" /> Add Quest
          </Button>
        </div>
        
        <div className="grid gap-4">
          {quests && quests.length > 0 ? (
            quests.map((quest: any) => (
              <Card key={quest.id} className="overflow-hidden border border-border">
                <div className="flex">
                  <div className="bg-muted p-4 flex items-center justify-center w-16">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{quest.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {quest.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{quest.adventureLine}</Badge>
                          <Badge variant="outline">Order: {quest.orderInLine}</Badge>
                          <Badge variant="outline">XP: {quest.xpReward}</Badge>
                          <Badge variant={quest.active ? "default" : "secondary"}>
                            {quest.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => sounds.click()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete('quests', quest.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center py-8">No quests found. Add your first quest.</p>
          )}
        </div>
      </div>
    );
  };
  
  // Mutation for updating an item
  const updateItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const res = await apiRequest('PUT', `/api/admin/items/${item.id}`, item);
      return await res.json();
    },
    onSuccess: () => {
      sounds.success();
      toast({
        title: 'Success',
        description: 'Item updated successfully.',
      });
      // Close the dialog
      setEditDialogOpen(false);
      setSelectedItem(null);
      
      // Invalidate both admin items and regular inventory queries to ensure both views are updated
      queryClient.invalidateQueries({ queryKey: ['/api/admin/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
    onError: (error: Error) => {
      sounds.error();
      toast({
        title: 'Error',
        description: `Failed to update item: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handle image upload
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

  const handleOpenEditDialog = (item: any) => {
    sounds.click();
    // Create a clean copy of the item to prevent issues with direct manipulation
    if (item && item.id) {
      // Only copy the properties we need for the form
      const itemCopy = {
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        flavorText: item.flavorText || '',
        rarity: item.rarity || 'common',
        category: item.category || '',
        imagePath: item.imagePath || '',
        craftingUses: Array.isArray(item.craftingUses) ? [...item.craftingUses] : []
      };
      setSelectedItem(itemCopy);
      setEditDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Invalid item data",
        variant: "destructive"
      });
    }
  };

  const handleItemFormSubmit = async (data: ItemFormValues) => {
    try {
      if (!data || !data.id) {
        console.error('Invalid item data:', data);
        toast({
          title: 'Error',
          description: 'Item data is invalid. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      // Create a copy of the data to prevent mutation issues
      const itemToUpdate = { ...data };
      
      // If there's a file selected for upload
      if (fileInputRef.current?.files?.length) {
        const file = fileInputRef.current.files[0];
        const imagePath = await handleImageUpload(file, itemToUpdate.id);
        
        if (imagePath) {
          itemToUpdate.imagePath = imagePath;
        }
      }
      
      console.log('Updating item with data:', itemToUpdate);
      
      // Update the item
      updateItemMutation.mutate(itemToUpdate);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderItemsTab = () => {
    if (isItemsLoading) return <p className="text-center py-8">Loading items...</p>;
    if (itemsError) return <p className="text-center text-red-500 py-8">Error loading items</p>;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative">
              <Input 
                placeholder="Search items..." 
                className="w-64 pl-8" 
              />
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => sounds.click()}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items && items.length > 0 ? (
            items.map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleOpenEditDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive" 
                        onClick={() => handleDelete('items', item.id)}
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

        {/* Edit Item Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Make changes to the item details. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            
            {selectedItem && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    defaultValue={selectedItem.name}
                    className="col-span-3"
                    onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    defaultValue={selectedItem.description}
                    className="col-span-3"
                    onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flavorText">Flavor Text (Optional)</Label>
                  <Textarea
                    id="flavorText"
                    defaultValue={selectedItem.flavorText}
                    className="col-span-3"
                    onChange={(e) => setSelectedItem({...selectedItem, flavorText: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rarity">Rarity</Label>
                  <Select 
                    defaultValue={selectedItem.rarity}
                    onValueChange={(value) => setSelectedItem({...selectedItem, rarity: value})}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    defaultValue={selectedItem.category}
                    className="col-span-3"
                    onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Item Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="col-span-3"
                      />
                    </div>
                    {selectedItem.imagePath && (
                      <div className="flex-shrink-0 h-16 w-16 bg-muted rounded-md overflow-hidden">
                        <img 
                          src={selectedItem.imagePath} 
                          alt={selectedItem.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => {
                  if (selectedItem && selectedItem.id) {
                    // Handle the form submission carefully
                    handleItemFormSubmit({...selectedItem});
                  } else {
                    toast({
                      title: "Error",
                      description: "No item selected or item data is invalid",
                      variant: "destructive"
                    });
                  }
                }} 
                disabled={updateItemMutation.isPending || !selectedItem}
              >
                {updateItemMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  const renderRecipesTab = () => {
    if (isRecipesLoading) return <p className="text-center py-8">Loading recipes...</p>;
    if (recipesError) return <p className="text-center text-red-500 py-8">Error loading recipes</p>;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative">
              <Input 
                placeholder="Search recipes..." 
                className="w-64 pl-8" 
              />
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => sounds.click()}>
            <Plus className="h-4 w-4 mr-2" /> Add Recipe
          </Button>
        </div>
        
        <div className="grid gap-4">
          {recipes && recipes.length > 0 ? (
            recipes.map((recipe: any) => (
              <Card key={recipe.id} className="overflow-hidden border border-border">
                <div className="flex">
                  <div className="bg-muted p-4 flex items-center justify-center w-16">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{recipe.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {recipe.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge>{recipe.difficulty}</Badge>
                          <Badge variant="outline">{recipe.category}</Badge>
                          <Badge variant="outline">Result: {recipe.resultItem} x{recipe.resultQuantity}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => sounds.click()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete('recipes', recipe.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center py-8">No recipes found. Add your first recipe.</p>
          )}
        </div>
      </div>
    );
  };
  
  const renderLootBoxesTab = () => {
    if (isLootBoxesLoading) return <p className="text-center py-8">Loading loot box configurations...</p>;
    if (lootBoxesError) return <p className="text-center text-red-500 py-8">Error loading loot box configurations</p>;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative">
              <Input 
                placeholder="Search configurations..." 
                className="w-64 pl-8" 
              />
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="quest">Quest</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => sounds.click()}>
            <Plus className="h-4 w-4 mr-2" /> Add Configuration
          </Button>
        </div>
        
        <div className="grid gap-4">
          {lootBoxes && lootBoxes.length > 0 ? (
            lootBoxes.map((config: any) => (
              <Card key={config.id} className="overflow-hidden border border-border">
                <div className="flex">
                  <div className="bg-muted p-4 flex items-center justify-center w-16">
                    <Archive className="h-6 w-6 text-primary" />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{config.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {config.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge>{config.type}</Badge>
                          <Badge variant="outline">Items: {
                            config.itemDropTable ? 
                              (Array.isArray(config.itemDropTable) ? config.itemDropTable.length : 'N/A') 
                              : 'N/A'
                          }</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => sounds.click()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete('loot-boxes', config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center py-8">No loot box configurations found. Add your first configuration.</p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <Container>
        <div className="flex items-center my-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors" onClick={() => sounds.click()}>
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground">Admin</span>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-10">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="quests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Quests
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Database className="h-4 w-4" /> Items
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Recipes
            </TabsTrigger>
            <TabsTrigger value="lootBoxes" className="flex items-center gap-2">
              <Archive className="h-4 w-4" /> Loot Boxes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quests" className="mt-6">
            {renderQuestsTab()}
          </TabsContent>
          
          <TabsContent value="items" className="mt-6">
            {renderItemsTab()}
          </TabsContent>
          
          <TabsContent value="recipes" className="mt-6">
            {renderRecipesTab()}
          </TabsContent>
          
          <TabsContent value="lootBoxes" className="mt-6">
            {renderLootBoxesTab()}
          </TabsContent>
        </Tabs>
      </Container>
    </MainLayout>
  );
}