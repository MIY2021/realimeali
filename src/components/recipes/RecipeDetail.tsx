
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Clock, Users, Heart, Share, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Recipe } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";
import { RecipeImage } from "@/components/ui/recipe-image";
import { ShareRecipeDialog } from "@/components/recipes/ShareRecipeDialog";

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => Promise<void>;
  isOwner?: boolean;
}

export const RecipeDetail = ({ recipe, onEdit, onDelete, isOwner }: RecipeDetailProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Recipe Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-navy mb-3">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-gray-600 text-lg mb-4">{recipe.description}</p>
          )}
          
          {/* Recipe Meta */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-terracotta" />
              <span className="text-sm font-medium text-gray-700">
                {recipe.prep_time} min prep • {recipe.cook_time} min cook
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-terracotta" />
              <span className="text-sm font-medium text-gray-700">{recipe.servings} servings</span>
            </div>
          </div>

          {/* Recipe Badges */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {recipe.meal_type && (
              <Badge variant="secondary" className="bg-terracotta/10 text-terracotta border-terracotta/20">
                {capitalizeFirst(recipe.meal_type)}
              </Badge>
            )}
            {recipe.complexity_level && (
              <Badge variant="outline" className="border-gray-300">
                {capitalizeFirst(recipe.complexity_level.replace('_', ' '))}
              </Badge>
            )}
            {recipe.cuisine_region && (
              <Badge variant="outline" className="border-gray-300">
                {capitalizeFirst(recipe.cuisine_region)}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleFavorite}
            className="flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            {recipe.is_favorite ? 'Favorited' : 'Favorite'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(recipe)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Recipe
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Recipe'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Recipe Image */}
      {recipe.image && (
        <div className="mb-8 rounded-lg overflow-hidden shadow-md">
          <RecipeImage 
            recipe={recipe} 
            className="w-full h-80 object-cover"
            iconSize="h-8 w-8"
          />
        </div>
      )}

      {/* Recipe Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-navy mb-4 flex items-center gap-2">
            Ingredients
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-terracotta mt-1.5 text-lg font-bold">•</span>
                  <span className="text-gray-700 leading-relaxed">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-navy mb-4">Instructions</h2>
          <div className="space-y-6">
            {recipe.instructions.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-terracotta text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 pt-2 leading-relaxed text-lg">{step}</p>
              </div>
            ))}
          </div>

          {/* Top Tip */}
          {recipe.top_tip && (
            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <h3 className="font-bold text-blue-900 mb-2 text-lg">💡 Top Tip</h3>
              <p className="text-blue-800 leading-relaxed">{recipe.top_tip}</p>
            </div>
          )}
        </div>
      </div>

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

      {/* Share Dialog */}
      <ShareRecipeDialog
        recipe={recipe}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </div>
  );
};
