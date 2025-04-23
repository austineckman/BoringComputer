import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Grid5x5 } from '@/components/ui/grid';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Plus, Trash2, Edit, ArrowLeft, X, RefreshCw, UploadCloud } from 'lucide-react';

// Define the form schema for recipe creation/editing
const recipeFormSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  resultItem: z.string().min(1, 'Result item is required'),
  resultQuantity: z.coerce.number().int().positive('Quantity must be a positive number'),
  image: z.string().optional(),
  heroImage: z.string().optional(),
  unlocked: z.boolean().default(true),
  // These will be handled separately but included for type safety
  pattern: z.array(z.array(z.string().nullable())).optional(),
  requiredItems: z.record(z.string(), z.number()).optional(),
});

// Typescript interface for our recipe data
interface Recipe {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resultItem: string;
  resultQuantity: number;
  pattern: (string | null)[][];
  requiredItems: Record<string, number>;
  image?: string;
  heroImage?: string;
  unlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Required items component for the form
const RequiredItemsInput: React.FC<{
  items: Record<string, number>;
  onItemsChange: (items: Record<string, number>) => void;
  availableItems: { id: string; name: string }[];
}> = ({ items, onItemsChange, availableItems }) => {
  const [itemId, setItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddItem = () => {
    if (itemId && quantity > 0) {
      onItemsChange({
        ...items,
        [itemId]: quantity,
      });
      setItemId('');
      setQuantity(1);
    }
  };

  const handleRemoveItem = (id: string) => {
    const newItems = { ...items };
    delete newItems[id];
    onItemsChange(newItems);
  };

  const getItemName = (id: string) => {
    return availableItems.find(item => item.id === id)?.name || id;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Select value={itemId} onValueChange={setItemId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              {availableItems.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value))}
            min={1}
            className="w-24"
          />
          <Button type="button" size="sm" onClick={handleAddItem} disabled={!itemId}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {Object.keys(items).length > 0 && (
        <div className="border rounded-md p-3">
          <h4 className="text-sm font-medium mb-2">Required Items:</h4>
          <div className="space-y-2">
            {Object.entries(items).map(([id, qty]) => (
              <div key={id} className="flex justify-between items-center text-sm p-2 bg-accent/50 rounded">
                <span>{getItemName(id)} x{qty}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveItem(id)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminRecipesPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deleteRecipe, setDeleteRecipe] = useState<Recipe | null>(null);

  // Form state for the recipe pattern and required items that can't be directly handled by react-hook-form
  const [patternGrid, setPatternGrid] = useState<(string | null)[][]>(
    Array(5).fill(null).map(() => Array(5).fill(null))
  );
  const [requiredItems, setRequiredItems] = useState<Record<string, number>>({});
  
  // Fetch recipes
  const { data: recipes = [], isLoading: loadingRecipes } = useQuery({
    queryKey: ['/api/admin/recipes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/recipes');
      return await response.json() || [];
    }
  });

  // Fetch all items for the dropdown
  const { data: items = [] } = useQuery({
    queryKey: ['/api/admin/items'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/items');
      return await response.json() || [];
    }
  });

  // Create recipe mutation
  const createRecipeMutation = useMutation({
    mutationFn: async (recipe: any) => {
      return await apiRequest('POST', '/api/admin/recipes', recipe);
    },
    onSuccess: () => {
      toast({
        title: 'Recipe created',
        description: 'The recipe has been created successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recipes'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create recipe',
        variant: 'destructive',
      });
    },
  });

  // Update recipe mutation
  const updateRecipeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest('PATCH', `/api/admin/recipes/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Recipe updated',
        description: 'The recipe has been updated successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recipes'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update recipe',
        variant: 'destructive',
      });
    },
  });

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/recipes/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Recipe deleted',
        description: 'The recipe has been deleted successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recipes'] });
      setDeleteRecipe(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete recipe',
        variant: 'destructive',
      });
    },
  });

  // Form for recipe creation/editing
  const form = useForm<z.infer<typeof recipeFormSchema>>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      difficulty: 'medium',
      resultItem: '',
      resultQuantity: 1,
      image: '',
      heroImage: '',
      unlocked: true,
    },
  });

  // Handle opening the dialog for adding a new recipe
  const handleAddRecipe = () => {
    form.reset({
      name: '',
      description: '',
      difficulty: 'medium',
      resultItem: '',
      resultQuantity: 1,
      image: '',
      unlocked: true,
    });
    setPatternGrid(Array(5).fill(null).map(() => Array(5).fill(null)));
    setRequiredItems({});
    setIsAddingRecipe(true);
    setEditingRecipe(null);
  };

  // Handle opening the dialog for editing an existing recipe
  const handleEditRecipe = (recipe: Recipe) => {
    form.reset({
      name: recipe.name,
      description: recipe.description,
      difficulty: recipe.difficulty,
      resultItem: recipe.resultItem,
      resultQuantity: recipe.resultQuantity,
      image: recipe.image || '',
      unlocked: recipe.unlocked,
    });
    setPatternGrid(recipe.pattern || Array(5).fill(null).map(() => Array(5).fill(null)));
    setRequiredItems(recipe.requiredItems || {});
    setEditingRecipe(recipe);
    setIsAddingRecipe(false);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setIsAddingRecipe(false);
    setEditingRecipe(null);
    form.reset();
    setPatternGrid(Array(5).fill(null).map(() => Array(5).fill(null)));
    setRequiredItems({});
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof recipeFormSchema>) => {
    const recipeData = {
      ...values,
      pattern: patternGrid,
      requiredItems,
    };

    if (editingRecipe) {
      updateRecipeMutation.mutate({
        id: editingRecipe.id,
        data: recipeData,
      });
    } else {
      createRecipeMutation.mutate(recipeData);
    }
  };

  // Handle pattern cell click for the recipe grid
  const handlePatternCellClick = (row: number, col: number) => {
    const newPattern = [...patternGrid.map(r => [...r])];
    // If we have a selected item, set it, otherwise clear the cell
    const selectedItem = form.getValues('resultItem');
    newPattern[row][col] = newPattern[row][col] ? null : selectedItem;
    setPatternGrid(newPattern);
  };

  // Cell renderer for the pattern grid
  const renderPatternCell = (cellValue: string | null) => {
    if (!cellValue) return null;
    
    const item = items.find(i => i.id === cellValue);
    return (
      <div className="w-full h-full flex items-center justify-center">
        {item ? (
          <div className="relative w-full h-full p-1">
            <img 
              src={item.imagePath || '/placeholder-item.png'} 
              alt={item.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-4 h-4 bg-primary rounded-full" />
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crafting Recipes</h1>
            <p className="text-muted-foreground">
              Manage the crafting recipes that players can use to create items
            </p>
          </div>
          <Dialog open={isAddingRecipe || !!editingRecipe} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddRecipe}>
                <Plus className="mr-2 h-4 w-4" />
                Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
                </DialogTitle>
                <DialogDescription>
                  {editingRecipe 
                    ? 'Update the details of this crafting recipe'
                    : 'Create a new crafting recipe for players to use'
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 pb-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipe Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter recipe name" />
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
                              <Textarea {...field} placeholder="Describe what this recipe creates" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="resultItem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Result Item</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Update pattern cells with this item
                                const newPattern = [...patternGrid.map(r => [...r])];
                                for (let row = 0; row < 5; row++) {
                                  for (let col = 0; col < 5; col++) {
                                    if (newPattern[row][col]) {
                                      newPattern[row][col] = value;
                                    }
                                  }
                                }
                                setPatternGrid(newPattern);
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select result item" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {items.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="resultQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Result Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                min={1} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="heroImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipe Hero Image</FormLabel>
                            <div className="space-y-3">
                              {field.value && (
                                <div className="mt-2 relative w-full h-40 rounded-md overflow-hidden">
                                  <img 
                                    src={field.value} 
                                    alt="Recipe hero preview" 
                                    className="object-cover w-full h-full"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => field.onChange('')}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              
                              {!field.value && (
                                <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                                  <div className="flex justify-center">
                                    <label 
                                      htmlFor="hero-image-upload" 
                                      className="cursor-pointer flex flex-col items-center space-y-2"
                                    >
                                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                      <span className="text-muted-foreground">Upload hero image</span>
                                      <Input
                                        id="hero-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          
                                          // Upload the file
                                          const formData = new FormData();
                                          formData.append('heroImage', file);
                                          
                                          try {
                                            // Show loading state
                                            toast({
                                              title: "Uploading...",
                                              description: "Uploading hero image",
                                            });
                                            
                                            const response = await fetch('/api/admin/recipes/upload-hero', {
                                              method: 'POST',
                                              body: formData,
                                            });
                                            
                                            if (!response.ok) {
                                              throw new Error('Failed to upload image');
                                            }
                                            
                                            const data = await response.json();
                                            
                                            if (data.success) {
                                              field.onChange(data.url);
                                              toast({
                                                title: "Success",
                                                description: "Hero image uploaded successfully",
                                              });
                                            } else {
                                              throw new Error(data.error || 'Failed to upload image');
                                            }
                                          } catch (error) {
                                            console.error('Error uploading image:', error);
                                            toast({
                                              title: "Error",
                                              description: "Failed to upload hero image",
                                              variant: "destructive",
                                            });
                                          } finally {
                                            // Clear the input
                                            e.target.value = '';
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="unlocked"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Available to all players</FormLabel>
                              <CardDescription>
                                If unchecked, this recipe will need to be unlocked by players
                              </CardDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormLabel>Required Items</FormLabel>
                        <RequiredItemsInput
                          items={requiredItems}
                          onItemsChange={setRequiredItems}
                          availableItems={items}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Recipe Pattern</FormLabel>
                        <CardDescription>
                          Click cells to toggle where items are required in the crafting grid
                        </CardDescription>
                        <div className="mt-2">
                          <Grid5x5
                            value={patternGrid}
                            onCellClick={handlePatternCellClick}
                            itemRenderer={renderPatternCell}
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCloseDialog}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createRecipeMutation.isPending || updateRecipeMutation.isPending}
                    >
                      {(createRecipeMutation.isPending || updateRecipeMutation.isPending) && (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recipes</CardTitle>
            <CardDescription>
              A list of all crafting recipes available in the game
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecipes ? (
              <div className="py-6 text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading recipes...</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="py-8 text-center border rounded-md">
                <p className="text-muted-foreground mb-4">No recipes found</p>
                <Button onClick={handleAddRecipe}>Create your first recipe</Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell className="font-medium">{recipe.name}</TableCell>
                        <TableCell>
                          {items.find(i => i.id === recipe.resultItem)?.name || recipe.resultItem} x{recipe.resultQuantity}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            recipe.difficulty === 'easy' ? 'outline' : 
                            recipe.difficulty === 'medium' ? 'secondary' : 
                            'default'
                          }>
                            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {recipe.unlocked ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline">Locked</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditRecipe(recipe)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the recipe "{recipe.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-destructive text-destructive-foreground"
                                    onClick={() => deleteRecipeMutation.mutate(recipe.id)}
                                  >
                                    {deleteRecipeMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminRecipesPage;