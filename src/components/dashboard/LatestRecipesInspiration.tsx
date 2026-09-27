import { Clock, Users, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImportedRecipe } from "@/services/importedRecipeService";
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

  const { data: allFeaturedRecipes, isLoading, error } = useQuery({
    queryKey: ["featured-recipes-for-daily"],
    queryFn: async (): Promise<ImportedRecipe[]> => {
      const { data, error } = await supabase
        .from("imported_recipes")
        .select("*")
        .eq("is_featured", true)
        .order("priority_score", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw new Error(`Failed to fetch featured recipes: ${error.message}`);
      return (data || []) as unknown as ImportedRecipe[];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    retry: 1,
  });

  const recipeOfTheDay = useMemo(() => {
    if (!allFeaturedRecipes?.length) return null;
    const daysSinceEpoch = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
    return allFeaturedRecipes[daysSinceEpoch % allFeaturedRecipes.length];
  }, [allFeaturedRecipes]);

  const handleAddToMealPlan = async () => {
    if (!recipeOfTheDay || !user || !currentHousehold) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add recipes to your meal plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingRecipe } = await supabase
        .from("recipes")
        .select("*")
        .eq("household_id", currentHousehold.id)
        .eq("source_url", recipeOfTheDay.source_url)
        .eq("is_deleted", false)
        .single();

      if (existingRecipe) {
        setSelectedRecipe(existingRecipe as any);
        setAddToMealPlanOpen(true);
      } else {
        const { data: newRecipe, error: insertError } = await supabase
          .from("recipes")
          .insert([{
            title: recipeOfTheDay.title,
            description: recipeOfTheDay.description || "",
            ingredients: recipeOfTheDay.ingredients || [],
            instructions: recipeOfTheDay.instructions || [],
            prep_time: recipeOfTheDay.prep_time || 0,
            cook_time: recipeOfTheDay.cook_time || 0,
            servings: recipeOfTheDay.servings || 1,
            image: recipeOfTheDay.image,
            meal_types: recipeOfTheDay.meal_types || [],
            cuisine_region: recipeOfTheDay.cuisine_region as any,
            diet_lifestyle: recipeOfTheDay.diet_lifestyle as any,
            source_url: recipeOfTheDay.source_url,
            user_id: user.id,
            household_id: currentHousehold.id,
            import_method: "featured",
            is_favorite: false,
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        setSelectedRecipe(newRecipe as any);
        setAddToMealPlanOpen(true);
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
      toast({
        title: "Error",
        description: "Failed to add recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) return null;

  if (isLoading) {
    return <div className="h-[300px] w-full rounded-2xl bg-white border border-gray-200 animate-pulse" />;
  }

  if (!recipeOfTheDay) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-600 mb-4">No recipes available at the moment.</p>
        <Link to="/discover-recipes" className="inline-flex items-center gap-2 rounded-full bg-[#b85f49] px-5 py-2.5 text-sm font-semibold text-white">
          Explore recipes <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const totalTime = (recipeOfTheDay.prep_time || 0) + (recipeOfTheDay.cook_time || 0);

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Link to={`/discover-recipes/${recipeOfTheDay.id}`} className="group block">
          <div className="relative h-40 sm:h-48 overflow-hidden bg-[#eeeae5]">
            {recipeOfTheDay.image ? (
              <img
                src={recipeOfTheDay.image}
                alt={recipeOfTheDay.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-5xl">🍽️</div>
            )}
            <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold tracking-wide text-gray-800 shadow-sm">
              RECIPE OF THE DAY
            </div>
          </div>
        </Link>

        <div className="p-4 sm:p-5">
          <Link to={`/discover-recipes/${recipeOfTheDay.id}`} className="group">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-[#b85f49] transition-colors">
              {recipeOfTheDay.title}
            </h3>
          </Link>

          {recipeOfTheDay.description && (
            <p className="mt-2 text-sm leading-6 text-gray-600 line-clamp-2">
              {recipeOfTheDay.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
            {totalTime > 0 && (
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{totalTime} min</span>
            )}
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{recipeOfTheDay.servings} servings</span>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              to={`/discover-recipes/${recipeOfTheDay.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              View recipe <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleAddToMealPlan}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#b85f49] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a9513d] transition-colors"
            >
              <Plus className="h-4 w-4" /> Add to plan
            </button>
          </div>
        </div>
      </article>

      {selectedRecipe && (
        <AddToMealPlanDialog
          recipe={selectedRecipe}
          open={addToMealPlanOpen}
          onOpenChange={setAddToMealPlanOpen}
        />
      )}
    </>
  );
};
