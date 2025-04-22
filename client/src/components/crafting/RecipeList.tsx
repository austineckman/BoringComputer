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
  const categories = ['all', ...new Set(recipes.map(recipe => recipe.category))];
  
  // Filter recipes based on search query and category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || recipe.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Group recipes by difficulty
  const recipesByDifficulty = {
    easy: filteredRecipes.filter(recipe => recipe.difficulty === 'easy'),
    medium: filteredRecipes.filter(recipe => recipe.difficulty === 'medium'),
    hard: filteredRecipes.filter(recipe => recipe.difficulty === 'hard')
  };
  
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
  const getDifficultyBadge = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-500 border-green-500/50';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/50';
      case 'hard':
        return 'bg-red-500/10 text-red-500 border-red-500/50';
      default:
        return '';
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
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded overflow-hidden bg-muted">
              <img 
                src={resultItem.imagePath} 
                alt={resultItem.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{recipe.name}</h4>
              <Badge 
                variant="outline" 
                className={getDifficultyBadge(recipe.difficulty)}
              >
                {recipe.difficulty}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{recipe.description}</p>
          <div className="text-xs">
            <span className="font-medium">Creates: </span>
            {recipe.resultQuantity}x {resultItem.name}
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
            <TabsList className="w-full justify-start">
              {categories.map(category => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => handleCategoryChange(category)}
                  className="capitalize"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {/* Recipe lists by difficulty */}
          <Tabs defaultValue="easy" className="space-y-4">
            <TabsList>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="easy" className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">Loading recipes...</div>
              ) : recipesByDifficulty.easy.length > 0 ? (
                recipesByDifficulty.easy.map(recipe => renderRecipeCard(recipe))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No easy recipes found
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="medium" className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">Loading recipes...</div>
              ) : recipesByDifficulty.medium.length > 0 ? (
                recipesByDifficulty.medium.map(recipe => renderRecipeCard(recipe))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No medium recipes found
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="hard" className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">Loading recipes...</div>
              ) : recipesByDifficulty.hard.length > 0 ? (
                recipesByDifficulty.hard.map(recipe => renderRecipeCard(recipe))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hard recipes found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeList;