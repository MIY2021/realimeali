import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';
import { checkExistingRecipe, updateImportedRecipe } from './importedRecipeService';
import { RecipeExportData } from "./recipeExportService";

export interface ImportedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  image?: string;
  meal_types: string[];
  cuisine_region?: string;
  diet_lifestyle?: string[];
  source_url?: string;
  import_method: string;
  top_tip?: string;
  alcoholic_pairing?: string;
  non_alcoholic_pairing?: string;
  fruit_veg_portions?: number;
  fruit_veg_breakdown?: string;
  fruit_veg_total_grams?: number;
  is_featured: boolean;
  priority_score: number;
  view_count: number;
  add_count: number;
  imported_by: string;
  created_at: string;
  updated_at: string;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  importLogId?: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
  data: any;
}

export const parseCSVFile = (file: File): Promise<RecipeExportData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          return;
        }
        resolve(results.data as RecipeExportData[]);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

export const validateRecipeData = (data: RecipeExportData[]): ImportValidationError[] => {
  const errors: ImportValidationError[] = [];

  data.forEach((recipe, index) => {
    const row = index + 2; // Account for header row

    // Required fields validation
    if (!recipe.title || recipe.title.trim() === '') {
      errors.push({ row, field: 'title', message: 'Title is required', data: recipe });
    }

    if (!recipe.ingredients || recipe.ingredients.trim() === '') {
      errors.push({ row, field: 'ingredients', message: 'Ingredients are required', data: recipe });
    }

    if (!recipe.instructions || recipe.instructions.trim() === '') {
      errors.push({ row, field: 'instructions', message: 'Instructions are required', data: recipe });
    }

    // Numeric validation
    if (recipe.prep_time && isNaN(Number(recipe.prep_time))) {
      errors.push({ row, field: 'prep_time', message: 'Prep time must be a number', data: recipe });
    }

    if (recipe.cook_time && isNaN(Number(recipe.cook_time))) {
      errors.push({ row, field: 'cook_time', message: 'Cook time must be a number', data: recipe });
    }

    if (recipe.servings && isNaN(Number(recipe.servings))) {
      errors.push({ row, field: 'servings', message: 'Servings must be a number', data: recipe });
    }

    // Array field validation
    if (recipe.meal_types) {
      try {
        const mealTypes = recipe.meal_types.split(';').map(t => t.trim()).filter(Boolean);
        if (mealTypes.length === 0) {
          errors.push({ row, field: 'meal_types', message: 'At least one meal type is required', data: recipe });
        }
      } catch (e) {
        errors.push({ row, field: 'meal_types', message: 'Invalid meal types format', data: recipe });
      }
    }
  });

  return errors;
};

export const convertExportDataToImportedRecipe = (exportData: RecipeExportData, userId: string): Omit<ImportedRecipe, 'id' | 'created_at' | 'updated_at'> => {
  // Parse array fields from semicolon-separated strings
  const ingredients = exportData.ingredients ? exportData.ingredients.split(';').map(i => i.trim()).filter(Boolean) : [];
  const instructions = exportData.instructions ? exportData.instructions.split(';').map(i => i.trim()).filter(Boolean) : [];
  const mealTypes = exportData.meal_types ? exportData.meal_types.split(';').map(t => t.trim()).filter(Boolean) : [];
  const dietLifestyle = exportData.diet_lifestyle ? exportData.diet_lifestyle.split(';').map(d => d.trim()).filter(Boolean) : [];

  return {
    title: exportData.title,
    description: exportData.description || '',
    ingredients,
    instructions,
    prep_time: Number(exportData.prep_time) || 0,
    cook_time: Number(exportData.cook_time) || 0,
    servings: Number(exportData.servings) || 1,
    image: exportData.image || null,
    meal_types: mealTypes,
    cuisine_region: exportData.cuisine_region || null,
    diet_lifestyle: dietLifestyle.length > 0 ? dietLifestyle : null,
    source_url: exportData.source_url || null,
    import_method: exportData.import_method || 'admin_import',
    top_tip: exportData.top_tip || null,
    fruit_veg_portions: exportData.fruit_veg_portions ? Number(exportData.fruit_veg_portions) : null,
    fruit_veg_breakdown: exportData.fruit_veg_breakdown || null,
    fruit_veg_total_grams: exportData.fruit_veg_total_grams ? Number(exportData.fruit_veg_total_grams) : null,
    is_featured: true,
    priority_score: 100,
    view_count: 0,
    add_count: 0,
    imported_by: userId
  };
};

export const importRecipesToDatabase = async (
  recipes: Omit<ImportedRecipe, 'id' | 'created_at' | 'updated_at'>[],
  filename: string,
  userId: string
): Promise<ImportResult> => {
  let successfulImports = 0;
  let failedImports = 0;
  const errors: string[] = [];

  // Create import log
  const { data: importLog, error: logError } = await supabase
    .from('recipe_import_logs')
    .insert({
      filename,
      imported_by: userId,
      total_records: recipes.length,
      successful_imports: 0,
      failed_imports: 0,
      import_notes: `Started import of ${recipes.length} recipes`
    })
    .select()
    .single();

  if (logError) {
    console.error('Error creating import log:', logError);
    return {
      success: false,
      totalRecords: recipes.length,
      successfulImports: 0,
      failedImports: recipes.length,
      errors: [`Failed to create import log: ${logError.message}`]
    };
  }

  // Import recipes in batches of 10 to avoid timeout
  const batchSize = 10;
  for (let i = 0; i < recipes.length; i += batchSize) {
    const batch = recipes.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('imported_recipes')
      .insert(batch as any)
      .select('id');

    if (error) {
      console.error(`Error importing batch ${i}-${i + batch.length}:`, error);
      failedImports += batch.length;
      errors.push(`Batch ${i}-${i + batch.length}: ${error.message}`);
    } else {
      successfulImports += data?.length || 0;
    }
  }

  // Update import log with final results
  const { error: updateError } = await supabase
    .from('recipe_import_logs')
    .update({
      successful_imports: successfulImports,
      failed_imports: failedImports,
      import_notes: `Completed: ${successfulImports} successful, ${failedImports} failed. ${errors.length > 0 ? `Errors: ${errors.join('; ')}` : ''}`
    })
    .eq('id', importLog.id);

  if (updateError) {
    console.error('Error updating import log:', updateError);
  }

  return {
    success: failedImports === 0,
    totalRecords: recipes.length,
    successfulImports,
    failedImports,
    errors,
    importLogId: importLog.id
  };
};

export const importRecipesFromCSV = async (
  file: File, 
  userId: string, 
  onOverwritePrompt?: (title: string) => Promise<boolean>
): Promise<ImportResult> => {
  try {
    console.log('Starting CSV import process for file:', file.name);
    
    // Parse the CSV file
    const rawData = await parseCSVFile(file);
    console.log('Parsed CSV data:', rawData.length, 'records');

    // Validate the data
    const validationErrors = validateRecipeData(rawData);
    if (validationErrors.length > 0) {
      console.warn('Validation errors found:', validationErrors);
      const errorMessages = validationErrors.map(e => `Row ${e.row} (${e.field}): ${e.message}`);
      return {
        success: false,
        totalRecords: rawData.length,
        successfulImports: 0,
        failedImports: rawData.length,
        errors: errorMessages
      };
    }

    // Check for existing recipes and handle overwrites
    const recipesToImport = [];
    const recipesToUpdate = [];
    
    for (const data of rawData) {
      const existing = await checkExistingRecipe(data.title);
      if (existing) {
        // If callback provided, ask user for confirmation
        if (onOverwritePrompt) {
          const shouldOverwrite = await onOverwritePrompt(data.title);
          if (shouldOverwrite) {
            const updatedRecipe = convertExportDataToImportedRecipe(data, userId);
            recipesToUpdate.push({ id: existing.id, ...updatedRecipe });
          }
          // If user says no, skip this recipe
        } else {
          // No callback, default to overwrite
          const updatedRecipe = convertExportDataToImportedRecipe(data, userId);
          recipesToUpdate.push({ id: existing.id, ...updatedRecipe });
        }
      } else {
        recipesToImport.push(convertExportDataToImportedRecipe(data, userId));
      }
    }

    console.log('Recipes to import (new):', recipesToImport.length);
    console.log('Recipes to update (existing):', recipesToUpdate.length);

    // Handle updates first
    let updateErrors: string[] = [];
    for (const recipe of recipesToUpdate) {
      try {
        const { id, ...updates } = recipe;
        await updateImportedRecipe(id, updates);
      } catch (error) {
        updateErrors.push(`Failed to update "${recipe.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import new recipes
    let importResult: ImportResult;
    if (recipesToImport.length > 0) {
      importResult = await importRecipesToDatabase(recipesToImport, file.name, userId);
    } else {
      importResult = {
        success: true,
        totalRecords: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: []
      };
    }

    // Combine results
    const combinedResult: ImportResult = {
      success: importResult.success && updateErrors.length === 0,
      totalRecords: rawData.length,
      successfulImports: importResult.successfulImports + (recipesToUpdate.length - updateErrors.length),
      failedImports: importResult.failedImports + updateErrors.length,
      errors: [...importResult.errors, ...updateErrors]
    };

    console.log('Combined import/update completed:', combinedResult);
    return combinedResult;
  } catch (error) {
    console.error('Error importing recipes from CSV:', error);
    return {
      success: false,
      totalRecords: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
};

export const fetchImportLogs = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('recipe_import_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching import logs:', error);
    throw new Error(`Failed to fetch import logs: ${error.message}`);
  }

  return data || [];
};