import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, PlusCircle, Pencil, Trash2, HelpCircle, X, AlertCircle } from 'lucide-react';
import { Grid, GridItem } from '@/components/ui/grid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the schema for recipe form validation
const recipeFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  flavorText: z.string().optional(),
  resultItem: z.string().min(1, { message: "Result item is required." }),
  resultQuantity: z.number().min(1, { message: "Quantity must be at least 1." }),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string().min(1, { message: "Category is required." }),
  unlocked: z.boolean().default(true),
  image: z.string().min(1, { message: "Image URL is required." }),
  // Pattern and requiredItems will be handled separately
});

// Recipe interface matching our database schema
interface Recipe {
  id: number;
  name: string;
  description: string;
  flavorText?: string;
  resultItem: string;
  resultQuantity: number;
  gridSize: number;
  pattern: (string | null)[][];
  requiredItems: Record<string, number>;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  unlocked: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Item {
  id: string;
  name: string;
  description: string;
  imagePath?: string;
  category?: string;
}

// Type for form values
type RecipeFormValues = z.infer<typeof recipeFormSchema> & {
  pattern?: (string | null)[][];
  requiredItems?: Record<string, number>;
};

const AdminRecipesPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for dialog and grid pattern
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [gridPattern, setGridPattern] = useState<(string | null)[][]>(
    Array(5).fill(null).map(() => Array(5).fill(null))
  );
  const [requiredItems, setRequiredItems] = useState<Record<string, number>>({});

  // Query for fetching recipes
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery<Recipe[]>({
    queryKey: ['/api/admin/recipes'],
  });

  // Query for fetching items for the recipe editor
  const { data: items = [], isLoading: isLoadingItems } = useQuery<Item[]>({
    queryKey: ['/api/admin/items'],
  });

  // Form for recipe creation/editing
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      flavorText: '',
      resultItem: '',
      resultQuantity: 1,
      difficulty: 'easy',
      category: 'general',
      unlocked: true,
      image: '',
    }
  });

  // Mutations for recipes
  const createMutation = useMutation({
    mutationFn: (data: RecipeFormValues) => {
      return apiRequest('POST', '/api/admin/recipes', {
        ...data,
        pattern: gridPattern,
        requiredItems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recipes'] });
      toast({
        title: 'Recipe created',
        description: 'The recipe has been added successfully.',
      });
      closeDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create recipe.',
        variant: 'destructive',
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: RecipeFormValues & { id: number }) => {
      return apiRequest('PATCH', `/api/admin/recipes/${data.id}`, {
        ...data,
        pattern: gridPattern,
        requiredItems
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recipes'] });
      toast({
        title: 'Recipe updated',
        description: 'The recipe has been updated successfully.',
      });
      closeDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update recipe.',
        variant: 'destructive',
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/admin/recipes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recipes'] });
      toast({
        title: 'Recipe deleted',
        description: 'The recipe has been deleted successfully.',
      });
      closeDeleteDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete recipe.',
        variant: 'destructive',
      });
    }
  });

  // Handler for opening the add recipe dialog
  const openAddDialog = () => {
    setSelectedRecipe(null);
    form.reset({
      name: '',
      description: '',
      flavorText: '',
      resultItem: '',
      resultQuantity: 1,
      difficulty: 'easy',
      category: 'general',
      unlocked: true,
      image: '',
    });
    setGridPattern(Array(5).fill(null).map(() => Array(5).fill(null)));
    setRequiredItems({});
    setIsAddDialogOpen(true);
  };

  // Handler for opening the edit recipe dialog
  const openEditDialog = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    form.reset({
      name: recipe.name,
      description: recipe.description,
      flavorText: recipe.flavorText || '',
      resultItem: recipe.resultItem,
      resultQuantity: recipe.resultQuantity,
      difficulty: recipe.difficulty,
      category: recipe.category,
      unlocked: recipe.unlocked,
      image: recipe.image,
    });
    setGridPattern(recipe.pattern);
    setRequiredItems(recipe.requiredItems);
    setIsAddDialogOpen(true);
  };

  // Handler for opening the delete confirmation dialog
  const openDeleteDialog = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDeleteDialogOpen(true);
  };

  // Handler for closing the recipe dialog
  const closeDialog = () => {
    setIsAddDialogOpen(false);
  };

  // Handler for closing the delete dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedRecipe(null);
  };

  // Handler for form submission
  const onSubmit = (data: RecipeFormValues) => {
    const recipeData = {
      ...data,
      pattern: gridPattern,
      requiredItems
    };

    if (selectedRecipe) {
      updateMutation.mutate({ ...recipeData, id: selectedRecipe.id });
    } else {
      createMutation.mutate(recipeData);
    }
  };

  // Handler for deleting a recipe
  const handleDelete = () => {
    if (selectedRecipe) {
      deleteMutation.mutate(selectedRecipe.id);
    }
  };

  // Handler for updating the crafting grid
  const handleGridClick = (row: number, col: number, itemId: string | null) => {
    setGridPattern(prev => {
      const newGrid = [...prev];
      newGrid[row] = [...newGrid[row]];
      
      // Toggle the item on/off
      newGrid[row][col] = newGrid[row][col] === itemId ? null : itemId;
      
      // Update required items count
      recalculateRequiredItems(newGrid);
      
      return newGrid;
    });
  };
  
  // Function to recalculate required items based on the grid pattern
  const recalculateRequiredItems = (grid: (string | null)[][]) => {
    const newRequiredItems: Record<string, number> = {};
    
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          newRequiredItems[cell] = (newRequiredItems[cell] || 0) + 1;
        }
      });
    });
    
    setRequiredItems(newRequiredItems);
  };

  // Handler for manually updating required items
  const handleRequiredItemChange = (itemId: string, quantity: number) => {
    setRequiredItems(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };
  
  // Helper function to get item name from ID
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item?.name || itemId;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Recipe Management</h1>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Recipe
          </Button>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recipe Design Guide</AlertTitle>
          <AlertDescription>
            Create crafting recipes for users to build. Place items in the 5x5 grid to create patterns,
            then define the recipe's difficulty, category, and reward item. Users will need the exact materials
            in their inventory to craft these items.
          </AlertDescription>
        </Alert>

        {isLoadingRecipes ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recipes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">No Recipes Yet</h3>
                <p className="text-muted-foreground">Create your first crafting recipe to get started.</p>
              </div>
              <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Recipe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Crafting Recipes</CardTitle>
                <CardDescription>
                  Manage crafting recipes that users can discover and craft in the forge.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Result Item</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell className="font-medium">{recipe.name}</TableCell>
                        <TableCell>
                          {recipe.resultItem} x{recipe.resultQuantity}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            recipe.difficulty === 'easy' ? 'outline' : 
                            recipe.difficulty === 'medium' ? 'secondary' : 
                            'destructive'
                          }>
                            {recipe.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{recipe.category}</TableCell>
                        <TableCell>
                          {recipe.unlocked ? (
                            <Badge variant="success">Unlocked</Badge>
                          ) : (
                            <Badge variant="outline">Locked</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(recipe)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(recipe)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Recipe Form Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{selectedRecipe ? 'Edit Recipe' : 'Create New Recipe'}</DialogTitle>
            <DialogDescription>
              {selectedRecipe 
                ? 'Modify the recipe details and pattern.' 
                : 'Create a new crafting recipe for users to discover.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Advanced Circuit" {...field} />
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
                            placeholder="Describe what this recipe creates and its purpose..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="flavorText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flavor Text (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add some fun flavor text..."
                            className="min-h-[60px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="resultItem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Result Item</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select item..." />
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
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                                <SelectValue placeholder="Select difficulty..." />
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="electronics">Electronics</SelectItem>
                              <SelectItem value="mechanical">Mechanical</SelectItem>
                              <SelectItem value="clothing">Clothing</SelectItem>
                              <SelectItem value="tools">Tools</SelectItem>
                              <SelectItem value="weapons">Weapons</SelectItem>
                              <SelectItem value="accessories">Accessories</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., /images/items/circuit.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unlocked"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Available to Craft</FormLabel>
                          <FormDescription>
                            Toggle whether users can see and craft this recipe immediately
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Crafting Pattern</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Click on grid cells to place items and create a pattern. The items you place will automatically
                      be added to the required materials list.
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Available Items:</h4>
                      <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-2 border rounded-md">
                        {isLoadingItems ? (
                          <div className="w-full flex justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          items.map((item) => (
                            <TooltipProvider key={item.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => handleGridClick(0, 0, item.id)}
                                  >
                                    {item.name}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click a grid cell after selecting this item</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* 5x5 Grid Editor */}
                    <div className="border rounded-md p-3">
                      <div className="grid grid-cols-5 gap-1">
                        {gridPattern.map((row, rowIndex) => (
                          row.map((cell, colIndex) => (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`
                                h-12 w-full border rounded-md flex items-center justify-center
                                ${cell ? 'bg-secondary' : 'bg-background'}
                                cursor-pointer hover:bg-secondary/50 transition-colors
                              `}
                              onClick={() => {
                                // When clicking an empty cell, ask user to select an item first
                                // When clicking a filled cell, remove the item
                                if (cell) {
                                  handleGridClick(rowIndex, colIndex, null);
                                }
                              }}
                            >
                              {cell ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <span className="text-xs truncate max-w-[90%]">{getItemName(cell)}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 absolute top-0 right-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGridClick(rowIndex, colIndex, null);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <HelpCircle className="h-4 w-4 text-muted-foreground/50" />
                              )}
                            </div>
                          ))
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Required Materials</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      These materials are calculated based on your pattern. You can manually adjust quantities if needed.
                    </p>
                    
                    <div className="border rounded-md p-3">
                      {Object.keys(requiredItems).length === 0 ? (
                        <div className="text-center py-3 text-muted-foreground">
                          Place items in the grid to add required materials
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(requiredItems).map(([itemId, quantity]) => (
                            <div key={itemId} className="flex items-center justify-between">
                              <span>{getItemName(itemId)}</span>
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 rounded-r-none"
                                  onClick={() => handleRequiredItemChange(itemId, Math.max(1, quantity - 1))}
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => handleRequiredItemChange(itemId, parseInt(e.target.value) || 1)}
                                  className="h-6 w-16 text-center rounded-none"
                                  min="1"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 rounded-l-none"
                                  onClick={() => handleRequiredItemChange(itemId, quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedRecipe ? 'Update Recipe' : 'Create Recipe'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the recipe "{selectedRecipe?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRecipesPage;