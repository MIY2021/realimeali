import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import Papa from "papaparse";

export interface RecipeExportData {
  // Basic Info
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  household_id: string;
  
  // Recipe Details
  prep_time: number;
  cook_time: number;
  servings: number;
  meal_types: string;
  cuisine_region: string;
  diet_lifestyle: string;
  
  // Content
  ingredients: string;
  instructions: string;
  image: string;
  source_url: string;
  import_method: string;
  top_tip: string;
  alcoholic_pairing: string;
  non_alcoholic_pairing: string;
  
  // Analytics
  meal_plan_count: number;
  is_favorite: boolean;
  has_cooked: boolean;
  
  // Nutrition
  fruit_veg_portions: number;
  fruit_veg_breakdown: string;
  fruit_veg_total_grams: number;
}

export const fetchAllRecipesForAdmin = async (): Promise<Recipe[]> => {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes for export:', error);
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }

  // Transform database fields to match Recipe interface
  return (recipes || []).map(recipe => ({
    ...recipe,
    created_by: recipe.user_id, // Map user_id to created_by for Recipe interface
  })) as Recipe[];
};

export const convertRecipesToExportFormat = (recipes: Recipe[]): RecipeExportData[] => {
  return recipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description || '',
    created_at: recipe.created_at,
    updated_at: recipe.updated_at,
    created_by: recipe.created_by,
    household_id: recipe.household_id,
    
    prep_time: recipe.prep_time || 0,
    cook_time: recipe.cook_time || 0,
    servings: recipe.servings || 1,
    meal_types: recipe.meal_types?.join('; ') || recipe.meal_type || '',
    cuisine_region: recipe.cuisine_region || '',
    diet_lifestyle: recipe.diet_lifestyle?.join('; ') || '',
    
    ingredients: recipe.ingredients?.join('; ') || '',
    instructions: recipe.instructions?.join('; ') || '',
    image: recipe.image || '',
    source_url: recipe.source_url || '',
    import_method: recipe.import_method || 'manual',
    top_tip: recipe.top_tip || '',
    alcoholic_pairing: recipe.alcoholic_pairing || '',
    non_alcoholic_pairing: recipe.non_alcoholic_pairing || '',
    
    meal_plan_count: (recipe as any).meal_plan_count || 0,
    is_favorite: recipe.is_favorite || false,
    has_cooked: recipe.has_cooked || false,
    
    fruit_veg_portions: recipe.fruit_veg_portions || 0,
    fruit_veg_breakdown: recipe.fruit_veg_breakdown || '',
    fruit_veg_total_grams: recipe.fruit_veg_total_grams || 0,
  }));
};

export const generateCSV = (exportData: RecipeExportData[]): string => {
  const csv = Papa.unparse(exportData, {
    header: true,
    delimiter: ',',
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    columns: [
      'id',
      'title', 
      'description',
      'prep_time',
      'cook_time',
      'servings',
      'meal_types',
      'cuisine_region',
      'diet_lifestyle',
      'ingredients',
      'instructions',
      'image',
      'source_url',
      'import_method',
      'top_tip',
      'alcoholic_pairing',
      'non_alcoholic_pairing',
      'meal_plan_count',
      'is_favorite',
      'has_cooked',
      'fruit_veg_portions',
      'fruit_veg_breakdown',
      'fruit_veg_total_grams',
      'created_at',
      'updated_at',
      'created_by',
      'household_id'
    ]
  });
  
  return csv;
};

export const downloadCSV = (csvContent: string, filename?: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `recipes_export_${timestamp}.csv`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportRecipesToCSV = async (): Promise<{ success: boolean; filename: string; recordCount: number }> => {
  try {
    const recipes = await fetchAllRecipesForAdmin();
    const exportData = convertRecipesToExportFormat(recipes);
    const csvContent = generateCSV(exportData);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `recipes_export_${timestamp}.csv`;
    
    downloadCSV(csvContent, filename);
    
    return {
      success: true,
      filename,
      recordCount: recipes.length
    };
  } catch (error) {
    console.error('Error exporting recipes:', error);
    throw error;
  }
};