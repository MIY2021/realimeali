import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";
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
    is_featured: false,
    priority_score: 0,
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
  await supabase
    .from('recipe_import_logs')
    .update({
      successful_imports: successfulImports,
      failed_imports: failedImports,
      import_notes: `Completed: ${successfulImports} successful, ${failedImports} failed. ${errors.length > 0 ? `Errors: ${errors.join('; ')}` : ''}`
    })
    .eq('id', importLog.id);

  return {
    success: failedImports === 0,
    totalRecords: recipes.length,
    successfulImports,
    failedImports,
    errors,
    importLogId: importLog.id
  };
};

export const importRecipesFromCSV = async (file: File, userId: string): Promise<ImportResult> => {
  try {
    console.log('Starting CSV import process...');
    
    // Parse CSV file
    const csvData = await parseCSVFile(file);
    console.log(`Parsed ${csvData.length} records from CSV`);

    // Validate data
    const validationErrors = validateRecipeData(csvData);
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(e => `Row ${e.row} (${e.field}): ${e.message}`);
      return {
        success: false,
        totalRecords: csvData.length,
        successfulImports: 0,
        failedImports: csvData.length,
        errors: errorMessages
      };
    }

    // Convert to imported recipe format
    const importedRecipes = csvData.map(data => convertExportDataToImportedRecipe(data, userId));

    // Import to database
    const result = await importRecipesToDatabase(importedRecipes, file.name, userId);
    
    console.log('Import completed:', result);
    return result;

  } catch (error) {
    console.error('Error during CSV import:', error);
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