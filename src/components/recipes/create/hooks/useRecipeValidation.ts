import { IngredientSectionParser } from "@/utils/ingredientSectionParser";

export const useRecipeValidation = () => {
  const prepareIngredientsForSave = (ingredients: string[]): string[] => {
    // Preserve ALL ingredients including section headers, but filter out empty ones
    return ingredients.filter(ingredient => ingredient && ingredient.trim().length > 0);
  };

  const validateRecipe = (newRecipe: any) => {
    const errors: string[] = [];
    
    // Prepare ingredients for validation (preserve headers but filter empty)
    const validIngredients = prepareIngredientsForSave(newRecipe.ingredients || []);
    
    // Count only actual ingredients (not headers) for validation
    const sections = IngredientSectionParser.parseIngredients(validIngredients);
    const actualIngredients = sections.reduce((count, section) => count + section.ingredients.length, 0);
    
    console.log('🔍 Validating recipe:', {
      title: newRecipe.title,
      totalItems: validIngredients.length,
      actualIngredients: actualIngredients,
      sections: sections.length,
      instructions: newRecipe.instructions?.length || 0,
      prep_time: newRecipe.prep_time,
      cook_time: newRecipe.cook_time,
      servings: newRecipe.servings,
      image: newRecipe.image ? 'has image' : 'no image'
    });
    
    if (!newRecipe.title?.trim()) {
      errors.push("Recipe title is required");
    }
    
    if (actualIngredients === 0) {
      errors.push("At least one ingredient is required");
    }
    
    if (!newRecipe.instructions || newRecipe.instructions.length === 0) {
      errors.push("At least one instruction is required");
    }
    
    if (!newRecipe.prep_time || newRecipe.prep_time <= 0) {
      errors.push("Prep time must be greater than 0 minutes");
    }
    
    if (newRecipe.cook_time === undefined || newRecipe.cook_time < 0) {
      errors.push("Cook time must be 0 or greater");
    }
    
    if (!newRecipe.servings || newRecipe.servings <= 0) {
      errors.push("Servings must be greater than 0");
    }
    
    if (!newRecipe.cuisine_region) {
      errors.push("Cuisine is required");
    } {
      errors.push("Servings must be greater than 0");
    }
    
    // Validate meal types - require at least one
    if (!newRecipe.meal_types || newRecipe.meal_types.length === 0) {
      errors.push("At least one meal type must be selected");
    }

    console.log('🔍 Validation errors:', errors);
    return errors;
  };

  return {
    validateRecipe,
    prepareIngredientsForSave,
  };
};