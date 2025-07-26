import { supabase } from "@/integrations/supabase/client";
import { Recipe, MealType } from "@/types";

const VALID_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snacks", "sides", "desserts", "drinks"];

export const useRecipeApi = () => {
  const fetchRecipes = async (householdId: string): Promise<Recipe[]> => {
    try {
      console.log('API: Fetching recipes for household:', householdId);
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('API: Supabase error:', error);
        throw error;
      }
      
      console.log('API: Raw data from Supabase:', data);
      
      // Transform database response to match Recipe interface
      return (data || []).map(recipe => {
        // Use type assertion to handle the new has_cooked property
        const recipeWithCookingStatus = recipe as any;
        
        return {
          ...recipe,
          created_by: recipe.user_id, // Map user_id to created_by
          has_cooked: Boolean(recipeWithCookingStatus.has_cooked || false), // Use the direct column
          // Filter meal_type to only valid values, cast as MealType
          meal_type: VALID_MEAL_TYPES.includes(recipe.meal_type as MealType) 
            ? recipe.meal_type as MealType 
            : undefined,
          // Handle meal_types array - convert from database string array to MealType array
          meal_types: Array.isArray(recipeWithCookingStatus.meal_types) 
            ? recipeWithCookingStatus.meal_types.filter((type: string) => 
                VALID_MEAL_TYPES.includes(type as MealType)
              ) as MealType[]
            : (recipe.meal_type && VALID_MEAL_TYPES.includes(recipe.meal_type as MealType) 
                ? [recipe.meal_type as MealType] 
                : []),
          cuisine_region: recipe.cuisine_region as any,
        };
      });
    } catch (error) {
      console.error('API: Error fetching recipes:', error);
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
        // Handle meal_types array - use new field if available, fallback to single meal_type
        meal_types: recipeData.meal_types && recipeData.meal_types.length > 0 
          ? recipeData.meal_types 
          : (recipeData.meal_type ? [recipeData.meal_type] : []),
        cuisine_region: recipeData.cuisine_region,
        diet_lifestyle: recipeData.diet_lifestyle,
        complexity_level: recipeData.complexity_level,
        top_tip: recipeData.top_tip,
        source_url: recipeData.source_url,
        import_method: recipeData.import_method || 'manual',
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
        // Handle meal_types from response
        meal_types: Array.isArray((data as any).meal_types) 
          ? (data as any).meal_types.filter((type: string) => 
              VALID_MEAL_TYPES.includes(type as MealType)
            ) as MealType[]
          : (data.meal_type && VALID_MEAL_TYPES.includes(data.meal_type as MealType) 
              ? [data.meal_type as MealType] 
              : []),
      } as Recipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  };

  const updateRecipe = async (id: string, recipe: Recipe): Promise<Recipe | null> => {
    try {
      // First, get the current recipe to compare ingredients
      const { data: currentRecipe, error: fetchError } = await supabase
        .from('recipes')
        .select('ingredients')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Compare ingredients arrays to determine if we need to clear fruit/veg data
      const ingredientsChanged = JSON.stringify(currentRecipe.ingredients) !== JSON.stringify(recipe.ingredients);
      
      // Prepare update object
      const updateData: any = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        image: recipe.image,
        is_favorite: recipe.is_favorite,
        has_cooked: recipe.has_cooked, // Include the cooking status
        meal_type: recipe.meal_type,
        // Handle meal_types array
        meal_types: recipe.meal_types && recipe.meal_types.length > 0 
          ? recipe.meal_types 
          : (recipe.meal_type ? [recipe.meal_type] : []),
        cuisine_region: recipe.cuisine_region,
        diet_lifestyle: recipe.diet_lifestyle,
        complexity_level: recipe.complexity_level,
        top_tip: recipe.top_tip,
        source_url: recipe.source_url,
        import_method: recipe.import_method,
      };

      // Clear fruit/veg data if ingredients have changed
      if (ingredientsChanged) {
        updateData.fruit_veg_portions = null;
        updateData.fruit_veg_breakdown = null;
        updateData.fruit_veg_ingredient_breakdown = null;
        updateData.fruit_veg_recommendations = null;
        updateData.fruit_veg_total_grams = null;
      }

      const { data, error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Use type assertion for the response data
      const responseData = data as any;
      
      return {
        ...data,
        created_by: data.user_id, // Map user_id to created_by
        has_cooked: Boolean(responseData.has_cooked || false), // Use the direct column
        meal_type: VALID_MEAL_TYPES.includes(data.meal_type as MealType) 
          ? data.meal_type as MealType 
          : undefined,
        // Handle meal_types from response
        meal_types: Array.isArray(responseData.meal_types) 
          ? responseData.meal_types.filter((type: string) => 
              VALID_MEAL_TYPES.includes(type as MealType)
            ) as MealType[]
          : (data.meal_type && VALID_MEAL_TYPES.includes(data.meal_type as MealType) 
              ? [data.meal_type as MealType] 
              : []),
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

  const toggleCookingStatus = async (recipeId: string): Promise<boolean> => {
    try {
      // Use a more generic RPC call with type assertion
      const { data, error } = await (supabase as any).rpc('toggle_recipe_cooking_status_simple', {
        recipe_id_param: recipeId
      });

      if (error) throw error;
      
      // Ensure we return a boolean
      return Boolean(data);
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
