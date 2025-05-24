
import { RecipeCategory } from "@/types";

interface ParsedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  categories: RecipeCategory[];
  prepTime: number;
  cookTime: number;
  servings: number;
}

interface RecipePreviewProps {
  recipe: ParsedRecipe;
  onUpdateRecipe?: (field: string, value: any) => void;
}

export function RecipePreview({ recipe, onUpdateRecipe }: RecipePreviewProps) {
  const availableCategories: RecipeCategory[] = [
    "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish",
    "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ",
    "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast"
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recipe Preview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-lg">{recipe.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">Prep:</span> {recipe.prepTime} min
            </div>
            <div>
              <span className="font-medium">Cook:</span> {recipe.cookTime} min
            </div>
            <div>
              <span className="font-medium">Serves:</span> {recipe.servings}
            </div>
          </div>

          <div>
            <span className="font-medium text-sm">Categories:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {recipe.categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center rounded-full bg-sage/20 px-2 py-1 text-xs font-medium text-sage"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="font-medium text-sm">Ingredients ({recipe.ingredients.length}):</span>
            <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2 mt-1">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="text-sm">• {ingredient}</div>
              ))}
            </div>
          </div>

          <div>
            <span className="font-medium text-sm">Instructions ({recipe.instructions.length} steps):</span>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2 mt-1">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-sage">{index + 1}.</span> {instruction}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
