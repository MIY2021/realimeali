
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Pencil, Share, Users } from "lucide-react";

interface RecipeDetailProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
}

export function RecipeDetail({ recipe, onAddToMealPlan, onEdit }: RecipeDetailProps) {
  const { 
    title, 
    description, 
    ingredients, 
    instructions, 
    prepTime, 
    cookTime, 
    servings, 
    image,
    categories
  } = recipe;
  
  const totalTime = prepTime + cookTime;
  
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="aspect-video overflow-hidden rounded-lg">
            {recipe.image ? (
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
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
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => onAddToMealPlan?.(recipe)}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Add to Meal Plan</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => onEdit?.(recipe)}
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Recipe</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
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
