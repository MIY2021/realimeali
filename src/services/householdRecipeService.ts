import { supabase } from "@/integrations/supabase/client";
import { ImportedRecipe } from "@/services/importedRecipeService";
import { Recipe } from "@/types";

export interface AddToHouseholdResult {
  success: boolean;
  recipeId?: string;
  error?: string;
}

export const addImportedRecipeToHousehold = async (
  importedRecipe: ImportedRecipe,
  userId: string,
  householdId: string
): Promise<AddToHouseholdResult> => {
  try {
    // Convert imported recipe to household recipe format
    const householdRecipe = {
      title: importedRecipe.title,
      description: importedRecipe.description || '',
      ingredients: importedRecipe.ingredients,
      instructions: importedRecipe.instructions,
      prep_time: importedRecipe.prep_time,
      cook_time: importedRecipe.cook_time,
      servings: importedRecipe.servings,
      image: importedRecipe.image,
      meal_types: importedRecipe.meal_types,
      cuisine_region: importedRecipe.cuisine_region,
      diet_lifestyle: importedRecipe.diet_lifestyle,
      source_url: importedRecipe.source_url || `imported-recipe-${importedRecipe.id}`,
      import_method: 'imported_from_curated',
      top_tip: importedRecipe.top_tip,
      alcoholic_pairing: (importedRecipe as any).alcoholic_pairing,
      non_alcoholic_pairing: (importedRecipe as any).non_alcoholic_pairing,
      fruit_veg_portions: importedRecipe.fruit_veg_portions,
      fruit_veg_breakdown: importedRecipe.fruit_veg_breakdown,
      fruit_veg_total_grams: importedRecipe.fruit_veg_total_grams,
      user_id: userId,
      household_id: householdId,
      is_favorite: false
    };

    // Check if recipe already exists in household (by title and source_url)
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id, title')
      .eq('household_id', householdId)
      .eq('title', importedRecipe.title)
      .eq('source_url', householdRecipe.source_url)
      .single();

    if (existingRecipe) {
      return {
        success: false,
        error: 'This recipe already exists in your household'
      };
    }

    // Add recipe to household
    const { data, error } = await supabase
      .from('recipes')
      .insert(householdRecipe as any) // Type assertion to work around Supabase type issues
      .select('id')
      .single();

    if (error) {
      console.error('Error adding recipe to household:', error);
      return {
        success: false,
        error: `Failed to add recipe: ${error.message}`
      };
    }

    // Increment the add count for the imported recipe (fire and forget)
    supabase
      .from('imported_recipes' as any)
      .update({ 
        add_count: (supabase as any).sql`add_count + 1`
      })
      .eq('id', importedRecipe.id)
      .then(() => {
        console.log('Add count incremented for imported recipe:', importedRecipe.id);
      }, (error) => {
        console.error('Error incrementing add count:', error);
      });

    return {
      success: true,
      recipeId: data.id
    };

  } catch (error) {
    console.error('Error in addImportedRecipeToHousehold:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};