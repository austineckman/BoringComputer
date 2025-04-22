import React, { useState, useContext } from 'react';
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
  Filter
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

export default function AdminPage() {
  const { toast } = useToast();
  const soundContext = useContext(SoundContext);
  const sounds = soundContext?.sounds || { click: () => {}, success: () => {}, error: () => {} };
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('quests');
  
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => sounds.click()}>
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
                <CardContent className="p-4 pt-2">
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