
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { CommunityRecipeCard } from "./CommunityRecipeCard";

interface CommunityRecipeGridProps {
  recipes: CommunityRecipe[];
  mobileLayout?: string;
}

export function CommunityRecipeGrid({ recipes, mobileLayout = "1" }: CommunityRecipeGridProps) {
  // Determine grid layout based on screen size and mobile layout preference
  const getGridCols = () => {
    if (mobileLayout === "2") {
      return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  return (
    <div className={`grid ${getGridCols()} gap-4 sm:gap-6`}>
      {recipes.map((recipe) => (
        <CommunityRecipeCard
          key={recipe.id}
          recipe={recipe}
          mobileLayout={mobileLayout}
        />
      ))}
    </div>
  );
}
