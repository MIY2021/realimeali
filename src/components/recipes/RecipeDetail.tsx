import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Pencil, Share, Users, Trash2 } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { format } from "date-fns";

interface RecipeDetailProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export function RecipeDetail({ recipe, onAddToMealPlan, onEdit, onDelete, isOwner }: RecipeDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile } = useUserProfile(recipe.createdBy);
  
  const { 
    title, 
    description, 
    ingredients, 
    instructions, 
    prepTime, 
    cookTime, 
    servings, 
    categories,
    createdAt
  } = recipe;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(recipe);
    }
  };

  const handleDelete = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to delete recipes.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`);
    if (confirmed && onDelete) {
      onDelete();
    }
  };

  const handleShare = () => {
    const recipeSlug = recipe.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    const recipeUrl = `${window.location.origin}/recipes/${recipeSlug}`;
    navigator.clipboard.writeText(recipeUrl).then(() => {
      toast({
        title: "Recipe Link Copied",
        description: "The recipe link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Share Failed",
        description: "Could not copy the recipe link.",
        variant: "destructive",
      });
    });
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/2">
            <div className="aspect-video overflow-hidden rounded-lg">
              <RecipeImage recipe={recipe} className="h-full w-full" iconSize="h-16 w-16" />
            </div>
          </div>
          
          <div className="lg:w-1/2 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">{recipe.title}</h1>
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map((category) => (
                <span 
                  key={category} 
                  className="inline-flex items-center rounded-full bg-sage/20 px-2.5 py-1 text-xs font-medium text-sage"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground">{recipe.description}</p>
            
            {/* Recipe Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Prep: {recipe.prepTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Cook: {recipe.cookTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-terracotta" />
                <span>Total: {recipe.prepTime + recipe.cookTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-terracotta" />
                <span>Serves: {recipe.servings}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => onAddToMealPlan?.(recipe)}
              >
                <CalendarDays className="h-4 w-4" />
                <span>Add to Meal Plan</span>
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {user && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 w-full sm:w-auto"
                    onClick={handleEdit}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Edit Recipe</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 w-full sm:w-auto"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-navy">Ingredients</h2>
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 block h-2 w-2 rounded-full bg-terracotta flex-shrink-0" />
                  <span className="text-sm sm:text-base">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-navy">Instructions</h2>
            <ol className="space-y-4">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm sm:text-base">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Recipe Attribution Footer */}
        <div className="border-t pt-6 mt-8">
          <div className="text-sm text-muted-foreground">
            <p>
              Recipe added by {profile?.full_name || 'Unknown user'} on{' '}
              {format(new Date(createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
