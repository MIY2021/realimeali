
import { MealType, RecipeCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";

export const useRandomMealSelection = (
  week: 1 | 2,
  mealTypeToCategories: Record<MealType, RecipeCategory[]>,
  mealTypes: MealType[]
) => {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { getMealPlansForWeek, addMealPlan, clearWeek } = useMealPlan();
  const { toast } = useToast();

  const getUniqueRandomRecipes = (
    availableRecipes: typeof recipes,
    categories: RecipeCategory[],
    count: number,
    excludeIds: Set<string>
  ) => {
    const pool = availableRecipes.filter(r =>
      r.categories.some(cat => categories.includes(cat as RecipeCategory)) &&
      !excludeIds.has(r.id)
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const result = [];
    const seen = new Set(excludeIds);
    for (let recipe of shuffled) {
      if (!seen.has(recipe.id)) {
        result.push(recipe);
        seen.add(recipe.id);
        if (result.length === count) break;
      }
    }
    return result;
  };

  const handleRandomMealSelection = async () => {
    console.log("Starting random meal selection...");
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to randomize meals.",
        variant: "destructive",
      });
      return;
    }

    if (!currentHousehold) {
      toast({
        title: "No Household Selected",
        description: "Please select or create a household to manage meal plans.",
        variant: "destructive",
      });
      return;
    }

    if (recipes.length === 0) {
      toast({
        title: "No Recipes Available",
        description: "You need to create some recipes first before randomizing meals.",
        variant: "destructive",
      });
      return;
    }

    const currentWeekPlans = getMealPlansForWeek(week);
    if (currentWeekPlans.length > 0) {
      if (!window.confirm("This will overwrite your current meal list. Continue?"))
        return;
    }
    
    try {
      console.log("Clearing week", week);
      await clearWeek(week);
      
      let allSelectedIds = new Set<string>();
      
      for (const mealType of mealTypes) {
        console.log(`Selecting recipes for ${mealType}...`);
        
        const unique = getUniqueRandomRecipes(
          recipes,
          mealTypeToCategories[mealType],
          Math.min(3, recipes.length),
          allSelectedIds
        );
        
        console.log(`Found ${unique.length} recipes for ${mealType}:`, unique.map(r => r.title));
        
        for (const [i, recipe] of unique.entries()) {
          console.log(`Adding ${recipe.title} to ${mealType} slot ${i}`);
          
          await addMealPlan({
            date: new Date().toISOString().split('T')[0],
            mealType: mealType,
            recipeId: recipe.id,
            createdBy: user.id,
            slotIndex: i,
          }, week);
          
          allSelectedIds.add(recipe.id);
        }
      }
      
      console.log("Random meal selection completed");
      toast({
        title: "Meal Plan Randomised",
        description: "Your meals have been chosen from your recipe collection!",
      });
    } catch (error) {
      console.error("Error during random meal selection:", error);
      toast({
        title: "Error",
        description: "Failed to randomize meal plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleRandomMealSelection };
};
