
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { CommunityRecipeCard } from "./CommunityRecipeCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface CommunityRecipeGridProps {
  recipes: CommunityRecipe[];
  mobileLayout: string;
}

export function CommunityRecipeGrid({ recipes, mobileLayout }: CommunityRecipeGridProps) {
  const isMobile = useIsMobile();

  // Determine grid classes based on mobile layout or default responsive layout
  const getGridClasses = () => {
    if (isMobile) {
      // Mobile with layout preference
      return mobileLayout === '1' 
        ? 'grid grid-cols-1 gap-4 sm:gap-6'
        : 'grid grid-cols-2 gap-3 sm:gap-4';
    }
    // Default responsive layout for desktop
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';
  };

  return (
    <div className={getGridClasses()} data-testid="community-recipe-list">
      {recipes.map((recipe) => (
        <CommunityRecipeCard 
          key={recipe.id} 
          recipe={recipe} 
        />
      ))}
    </div>
  );
}
