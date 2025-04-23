import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { Recipe } from '@/../../shared/types';
import { getItemDetails } from '@/lib/itemDatabase';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe) => void;
  isLoading: boolean;
  inventory?: Record<string, number>;
  canCraft?: boolean;
  onCraft?: () => void;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  isLoading
}) => {
  const { sounds } = useSoundEffects();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Get unique categories from recipes
  const uniqueCategories = Array.from(new Set(recipes.map(recipe => recipe.category || 'uncategorized')));
  const categories = ['all', ...uniqueCategories];
  
  // Filter recipes based on search query and category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || recipe.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Handle selecting a recipe
  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    sounds.click();
  };
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    sounds.hover();
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Get result item details
  const getResultItemDetails = (itemId: string) => {
    return getItemDetails(itemId);
  };
  
  // Get difficulty badge variant
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/50';
      case 'medium':
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/50';
      case 'hard':
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/50';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
    }
  };
  
  // Render recipe card
  const renderRecipeCard = (recipe: Recipe) => {
    const resultItem = getResultItemDetails(recipe.resultItem);
    const isSelected = selectedRecipe?.id === recipe.id;
    
    return (
      <Card 
        key={recipe.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'border-primary ring-1 ring-primary' : ''}`}
        onClick={() => handleSelectRecipe(recipe)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Result item image */}
            <div className="w-14 h-14 rounded overflow-hidden bg-muted border flex-shrink-0">
              <img 
                src={resultItem.imagePath} 
                alt={resultItem.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Recipe image */}
            <div className="w-14 h-14 rounded overflow-hidden bg-background/50 border flex-shrink-0">
              <img 
                src={recipe.image || '/images/recipe-placeholder.png'} 
                alt={recipe.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = resultItem.imagePath; // Fallback to result item image
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{recipe.name}</h4>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <Badge 
                  variant="outline" 
                  className={getDifficultyBadge(recipe.difficulty)}
                >
                  {recipe.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {recipe.resultQuantity}x {resultItem.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{recipe.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Crafting Recipes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and filter */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon" title="Filter recipes">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Category tabs */}
          <div className="overflow-x-auto">
            <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
              <TabsList className="w-full justify-start">
                {categories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="capitalize"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Recipe list */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">Loading recipes...</div>
            ) : filteredRecipes.length > 0 ? (
              filteredRecipes.map(recipe => renderRecipeCard(recipe))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recipes found
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeList;