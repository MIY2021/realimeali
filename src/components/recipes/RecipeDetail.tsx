
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Pencil, Share, Users, Trash2 } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";

interface RecipeDetailProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export function RecipeDetail({ recipe, onAddToMealPlan, onEdit, onDelete, isOwner }: RecipeDetailProps) {
  const { 
    title, 
    description, 
    ingredients, 
    instructions, 
    prepTime, 
    cookTime, 
    servings, 
    categories
  } = recipe;
  
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="aspect-video overflow-hidden rounded-lg">
            <RecipeImage recipe={recipe} className="h-full w-full" iconSize="h-16 w-16" />
          </div>
        </div>
        
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-navy">{recipe.title}</h1>
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
          <div className="flex flex-wrap gap-6 text-sm">
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
            <Button 
              variant="outline" 
              className="flex items-center gap-1 w-full md:w-auto"
              onClick={() => onAddToMealPlan?.(recipe)}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Add to Meal Plan</span>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            {isOwner && (
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => onEdit?.(recipe)}
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Recipe</span>
              </Button>
            )}
            <Button variant="outline" className="flex items-center gap-1">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            {isOwner && onDelete && (
              <Button
                variant="outline"
                className="flex items-center gap-1 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-navy">Ingredients</h2>
          <ul className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-terracotta" />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-navy">Instructions</h2>
          <ol className="space-y-4">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-medium">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
