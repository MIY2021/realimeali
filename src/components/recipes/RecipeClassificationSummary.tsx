import { Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getDisplayLabel } from "@/utils/recipeClassification";

interface RecipeClassificationSummaryProps {
  recipe: Recipe;
}

export const RecipeClassificationSummary = ({ recipe }: RecipeClassificationSummaryProps) => {
  const classifications = [];

  // Add meal type
  if (recipe.meal_type) {
    classifications.push({
      label: getDisplayLabel(recipe.meal_type, 'mealType'),
      variant: 'default' as const
    });
  }

  // Add cuisine region
  if (recipe.cuisine_region) {
    classifications.push({
      label: getDisplayLabel(recipe.cuisine_region, 'cuisineRegion'),
      variant: 'secondary' as const
    });
  }

  // Add complexity level
  if (recipe.complexity_level) {
    classifications.push({
      label: getDisplayLabel(recipe.complexity_level, 'complexityLevel'),
      variant: 'outline' as const
    });
  }

  // Add diet/lifestyle badges
  if (recipe.diet_lifestyle && recipe.diet_lifestyle.length > 0) {
    recipe.diet_lifestyle.forEach(diet => {
      classifications.push({
        label: getDisplayLabel(diet, 'dietLifestyle'),
        variant: 'secondary' as const
      });
    });
  }

  // Don't render if no classifications
  if (classifications.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 px-2">
      <div className="flex flex-wrap gap-2">
        {classifications.map((classification, index) => (
          <Badge 
            key={index} 
            variant={classification.variant}
            className="text-sm"
          >
            {classification.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};