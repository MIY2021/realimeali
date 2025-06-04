
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Clock, Users, Heart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Recipe } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";
import { RecipeImage } from "@/components/ui/recipe-image";

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => Promise<void>;
  isOwner?: boolean;
}

export const RecipeDetail = ({ recipe, onEdit, onDelete, isOwner }: RecipeDetailProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toggleFavorite } = useRecipes();

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(recipe.id, !recipe.is_favorite);
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const totalTime = recipe.prep_time + recipe.cook_time;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section with Image and Title Overlay */}
      <div className="relative h-80 mb-8 rounded-lg overflow-hidden shadow-lg">
        <RecipeImage 
          recipe={recipe} 
          className="w-full h-full object-cover"
          iconSize="h-12 w-12"
        />
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Favorite button - top right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm hover:bg-white/30 transition-all duration-200"
        >
          <Heart className={`h-6 w-6 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </Button>

        {/* Action buttons - top right corner */}
        {isOwner && (
          <div className="absolute top-4 right-16 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm hover:bg-white/30 transition-all duration-200"
                >
                  <MoreHorizontal className="h-5 w-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-lg border border-gray-200">
                <DropdownMenuItem onClick={() => onEdit?.(recipe)} className="text-gray-700 hover:bg-gray-50">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Recipe
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Recipe'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        {/* Title and meta info overlay - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-3">{recipe.title}</h1>
          
          {/* Recipe badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {recipe.meal_type && (
              <Badge className="bg-terracotta/90 text-white border-0 backdrop-blur-sm">
                {capitalizeFirst(recipe.meal_type)}
              </Badge>
            )}
            {recipe.complexity_level && (
              <Badge variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm">
                {capitalizeFirst(recipe.complexity_level.replace('_', ' '))}
              </Badge>
            )}
            {recipe.cuisine_region && (
              <Badge variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm">
                {capitalizeFirst(recipe.cuisine_region)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Time and Servings Info */}
      <div className="flex items-center gap-8 mb-6 px-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-terracotta" />
          <span className="text-navy font-medium">{totalTime} min total</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-terracotta" />
          <span className="text-navy font-medium">{recipe.servings} servings</span>
        </div>
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-gray-600 text-lg mb-6 px-2">{recipe.description}</p>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1 mb-6">
          <TabsTrigger 
            value="ingredients" 
            className="text-gray-600 data-[state=active]:bg-sage data-[state=active]:text-white font-medium rounded-md transition-all"
          >
            Ingredients
          </TabsTrigger>
          <TabsTrigger 
            value="instructions" 
            className="text-gray-600 data-[state=active]:bg-sage data-[state=active]:text-white font-medium rounded-md transition-all"
          >
            Instructions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="mt-0">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy mb-4">Ingredients</h2>
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed flex-1">{ingredient}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="mt-0">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy mb-4">Instructions</h2>
            {recipe.instructions.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed flex-1">{step}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recipe Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-terracotta text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>Created {new Date(recipe.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div>
            Last updated {new Date(recipe.updated_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
