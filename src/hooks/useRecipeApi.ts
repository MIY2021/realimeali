import { supabase } from "@/integrations/supabase/client";
import { Recipe, MealType } from "@/types";

const VALID_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snacks", "sides", "desserts", "drinks"];

export const useRecipeApi = () => {
  const fetchRecipes = async (householdId: string): Promise<Recipe[]> => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          household_recipe_cooking_status!left(has_cooked)
        `)
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform database response to match Recipe interface
      return (data || []).map(recipe => {
        // Handle the cooking status from the joined table - it comes as an array
        let hasCooked = false;
        const cookingStatus = recipe.household_recipe_cooking_status;
        
        if (cookingStatus !== null && cookingStatus !== undefined) {
          if (Array.isArray(cookingStatus)) {
            hasCooked = cookingStatus.length > 0 && 
                      cookingStatus[0]?.has_cooked === true;
          } else if (typeof cookingStatus === 'object' && cookingStatus !== null) {
            hasCooked = cookingStatus.has_cooked === true;
          }
        }

        return {
          ...recipe,
          created_by: recipe.user_id, // Map user_id to created_by
          has_cooked: hasCooked,
          // Filter meal_type to only valid values, cast as MealType
          meal_type: VALID_MEAL_TYPES.includes(recipe.meal_type as MealType) 
            ? recipe.meal_type as MealType 
            : undefined,
          cuisine_region: recipe.cuisine_region as any,
          main_ingredient: recipe.main_ingredient as any,
        };
      });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  };

  const createRecipe = async (
    recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>, 
    householdId: string
  ): Promise<Recipe | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Map the data to match database schema
      const insertData = {
        user_id: user.id,
        household_id: householdId,
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        servings: recipeData.servings,
        image: recipeData.image,
        is_favorite: recipeData.is_favorite,
        meal_type: recipeData.meal_type,
        cuisine_region: recipeData.cuisine_region,
        diet_lifestyle: recipeData.diet_lifestyle,
        complexity_level: recipeData.complexity_level,
        main_ingredient: recipeData.main_ingredient,
        top_tip: recipeData.top_tip,
        slug: recipeData.slug,
      };

      const { data, error } = await supabase
        .from('recipes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        created_by: data.user_id, // Map user_id to created_by
        has_cooked: false, // New recipes haven't been cooked yet
        meal_type: VALID_MEAL_TYPES.includes(data.meal_type as MealType) 
          ? data.meal_type as MealType 
          : undefined,
      } as Recipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  };

  const updateRecipe = async (id: string, recipe: Recipe): Promise<Recipe | null> => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          image: recipe.image,
          is_favorite: recipe.is_favorite,
          meal_type: recipe.meal_type,
          cuisine_region: recipe.cuisine_region,
          diet_lifestyle: recipe.diet_lifestyle,
          complexity_level: recipe.complexity_level,
          main_ingredient: recipe.main_ingredient,
          top_tip: recipe.top_tip,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        created_by: data.user_id, // Map user_id to created_by
        has_cooked: recipe.has_cooked, // Preserve cooking status
        meal_type: VALID_MEAL_TYPES.includes(data.meal_type as MealType) 
          ? data.meal_type as MealType 
          : undefined,
      } as Recipe;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return false;
    }
  };

  const toggleCookingStatus = async (recipeId: string, householdId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('toggle_recipe_cooking_status', {
        recipe_id_param: recipeId,
        household_id_param: householdId
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error toggling cooking status:', error);
      throw error;
    }
  };

  return {
    fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleCookingStatus,
  };
};
