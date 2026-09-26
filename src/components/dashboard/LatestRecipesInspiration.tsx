import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImportedRecipeCard } from "@/components/discover-recipes/ImportedRecipeCard";
import { ImportedRecipe } from "@/services/importedRecipeService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { Recipe } from "@/types";

export const LatestRecipesInspiration = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [addToMealPlanOpen, setAddToMealPlanOpen] = useState(false);

  // Fetch all featured recipes
  const { data: allFeaturedRecipes, isLoading, error } = useQuery({
    queryKey: ['featured-recipes-for-daily'],
    queryFn: async (): Promise<ImportedRecipe[]> => {
      const { data, error } = await supabase
        .from('imported_recipes')
        .select('*')
        .eq('is_featured', true)
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured recipes:', error);
        throw new Error(`Failed to fetch featured recipes: ${error.message}`);
      }

      return (data || []) as unknown as ImportedRecipe[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - featured recipes don't change often
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 1,
  });

  // Select recipe of the day based on current date (same for all users)
  const recipeOfTheDay = useMemo(() => {
    if (!allFeaturedRecipes || allFeaturedRecipes.length === 0) return null;

    // Get today's date as a number (days since epoch)
    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    
    // Use date to deterministically pick a recipe (same for all users)
    const recipeIndex = daysSinceEpoch % allFeaturedRecipes.length;
    
    return allFeaturedRecipes[recipeIndex];
  }, [allFeaturedRecipes]);

  const handleAddToMealPlan = async (recipe: ImportedRecipe) => {
    if (!user || !currentHousehold) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add recipes to your meal plan.",
        variant: "destructive",
      });
      return;
    }

    // First, add recipe to My Recipes if it doesn't exist
    try {
      const { data: existingRecipe } = await supabase
        .from('recipes')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .eq('source_url', recipe.source_url)
        .eq('is_deleted', false)
        .single();

      if (existingRecipe) {
        // Recipe already exists, use it
        setSelectedRecipe(existingRecipe as any);
        setAddToMealPlanOpen(true);
      } else {
        // Insert recipe into household recipes
        const { data: newRecipe, error: insertError } = await supabase
          .from('recipes')
          .insert([{
            title: recipe.title,
            description: recipe.description || '',
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || [],
            prep_time: recipe.prep_time || 0,
            cook_time: recipe.cook_time || 0,
            servings: recipe.servings || 1,
            image: recipe.image,
            meal_types: recipe.meal_types || [],
            cuisine_region: recipe.cuisine_region as any,
            diet_lifestyle: recipe.diet_lifestyle as any,
            source_url: recipe.source_url,
            user_id: user.id,
            household_id: currentHousehold.id,
            import_method: 'featured',
            is_favorite: false,
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        setSelectedRecipe(newRecipe as any);
        setAddToMealPlanOpen(true);
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast({
        title: "Error",
        description: "Failed to add recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return null; // Silently fail if we can't fetch inspiration recipes
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Recipe of the Day
          </h2>
          <p className="text-sm text-gray-600">
            Discover something new every day
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          <ChefHat className="h-5 w-5 text-terracotta" />
        </div>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-[400px] w-full rounded-lg" />
      ) : recipeOfTheDay ? (
        <>
          <ImportedRecipeCard
            recipe={recipeOfTheDay}
            mobileLayout="1"
            onAddToMealPlan={handleAddToMealPlan}
          />

          {selectedRecipe && (
            <AddToMealPlanDialog
              recipe={selectedRecipe}
              open={addToMealPlanOpen}
              onOpenChange={setAddToMealPlanOpen}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            No recipes available at the moment.
          </p>
          <Link to="/discover-recipes">
            <button className="px-6 py-2 bg-[#FFDD6B] text-gray-900 rounded-full font-semibold hover:bg-[#FFDD6B]/90 transition-colors">
              Explore Recipes
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};