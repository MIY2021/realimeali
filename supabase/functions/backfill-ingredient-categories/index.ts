import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid categories
const VALID_CATEGORIES = [
  "Fruit & Vegetables",
  "Meat & Fish",
  "Chilled Food",
  "Bakery",
  "Frozen Food",
  "Food Cupboard",
  "Snacks & Treats",
  "World & Dietary",
  "Drinks",
  "Alcohol",
  "Other"
];

// Normalize ingredient name (simple version for edge function)
function normalizeIngredientName(ingredient: string): string {
  let cleanText = ingredient.trim().toLowerCase();
  
  // Remove quantities and units at the start
  cleanText = cleanText.replace(/^[\d½¼¾⅓⅔⅛⅜⅝⅞]+(\s*[./]\s*[\d½¼¾⅓⅔⅛⅜⅝⅞]+)?\s*/g, '');
  cleanText = cleanText.replace(/^\d+\s*(g|kg|ml|l|oz|lb|cups?|cup|tbsp|tsp|teaspoons?|tablespoons?|pieces?|slices?|cloves?|pounds?|ounces?|grams?|liters?|milliliters?)\s+/gi, '');
  
  // Remove parenthetical descriptions
  cleanText = cleanText.replace(/\s*\([^)]*\)/g, '');
  
  // Remove descriptive terms after commas
  cleanText = cleanText.replace(/,\s*(toasted|chopped|diced|minced|sliced|grated|fresh|dried|ground|whole|crushed|powder|paste|sauce|oil|extract|juice|zest|peeled|canned|frozen|cooked|raw|organic|unsalted|salted|extra virgin|virgin|light|dark|heavy|thick|thin|fine|coarse|large|small|medium|pitted|halved|rinsed|drained|and.*$).*$/gi, '');
  
  // Remove trailing descriptive words
  cleanText = cleanText.replace(/\s+(toasted|chopped|diced|minced|sliced|grated|fresh|dried|ground|whole|crushed|powder|paste|sauce|oil|extract|juice|zest|peeled|canned|frozen|cooked|raw|organic|unsalted|salted|extra virgin|virgin|light|dark|heavy|thick|thin|fine|coarse|large|small|medium|pitted|halved|rinsed|drained).*$/gi, '');
  
  return cleanText.trim();
}

// Categorize ingredient using OpenAI
async function categorizeIngredient(ingredient: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a grocery categorization expert. Given an ingredient name, categorize it into ONE of these exact categories:

- Fruit & Vegetables
- Meat & Fish
- Chilled Food
- Bakery
- Frozen Food
- Food Cupboard
- Snacks & Treats
- World & Dietary
- Drinks
- Alcohol
- Other

Rules:
- Return ONLY the category name, nothing else
- Fruit & Vegetables: Fresh fruits, vegetables, salad items, fresh herbs
- Meat & Fish: Fresh meat, poultry, fish, seafood
- Chilled Food: Dairy products, chilled ready meals, deli items, cheese, yogurt
- Bakery: Bread, rolls, pastries, fresh baked goods, cakes
- Frozen Food: Any frozen items including vegetables, ready meals, ice cream, frozen meat
- Food Cupboard: Pantry staples, dry goods, canned items, spices, oils, pasta, rice, flour, sugar, baking ingredients
- Snacks & Treats: Chips, crackers, cookies, sweets, chocolate, nuts
- World & Dietary: Specialty diet foods, international cuisine items, organic/health foods, gluten-free, vegan specialty items
- Drinks: Non-alcoholic beverages, tea, coffee, juice, soft drinks, water
- Alcohol: Beer, wine, spirits, liqueurs, alcoholic beverages
- Other: Anything that doesn't fit the above categories

If unsure, default to "Other".`
          },
          {
            role: 'user',
            content: `Categorize this ingredient: ${ingredient}`
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const category = data.choices[0].message.content.trim();
    
    // Validate category
    if (VALID_CATEGORIES.includes(category)) {
      return category;
    }
    
    console.warn(`Invalid category returned: ${category}, using "Other"`);
    return "Other";
  } catch (error) {
    console.error(`Error categorizing ingredient "${ingredient}":`, error);
    return "Other";
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional parameters
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || 50; // Process 50 ingredients at a time
    const dryRun = body.dryRun || false;

    console.log(`Starting ingredient category backfill (batchSize: ${batchSize}, dryRun: ${dryRun})`);

    // Fetch all recipes to extract ingredients
    const { data: recipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id, ingredients')
      .eq('is_deleted', false)
      .not('ingredients', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch recipes: ${fetchError.message}`);
    }

    if (!recipes || recipes.length === 0) {
      console.log('No recipes found');
      return new Response(JSON.stringify({
        success: true,
        message: 'No recipes found',
        processed: 0,
        saved: 0,
        skipped: 0,
        failed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${recipes.length} recipes to process`);

    // Extract all unique ingredients
    const ingredientSet = new Set<string>();
    recipes.forEach(recipe => {
      if (Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ing => {
          if (ing && typeof ing === 'string') {
            const trimmed = ing.trim();
            // Filter out empty ingredients and section headers
            if (trimmed && trimmed.length > 0 && 
                trimmed !== 'undefined' && 
                trimmed !== 'null' &&
                !trimmed.endsWith(':')) {
              ingredientSet.add(trimmed);
            }
          }
        });
      }
    });

    console.log(`Found ${ingredientSet.size} unique ingredients`);

    // Get already categorized ingredients from database
    const { data: existingCategories } = await supabase
      .from('ingredient_categories')
      .select('ingredient_name');

    const existingSet = new Set<string>();
    if (existingCategories) {
      existingCategories.forEach(item => {
        existingSet.add(item.ingredient_name.toLowerCase());
      });
    }

    console.log(`Found ${existingSet.size} already categorized ingredients`);

    // Filter out already categorized ingredients
    const ingredientsToProcess: string[] = [];
    ingredientSet.forEach(ingredient => {
      const normalized = normalizeIngredientName(ingredient);
      if (normalized && !existingSet.has(normalized)) {
        ingredientsToProcess.push(ingredient);
      }
    });

    console.log(`Need to categorize ${ingredientsToProcess.length} ingredients`);

    // Process in batches
    const results = {
      processed: 0,
      saved: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    const batch = ingredientsToProcess.slice(0, batchSize);
    
    for (const ingredient of batch) {
      try {
        const normalized = normalizeIngredientName(ingredient);
        
        if (!normalized || normalized.length === 0) {
          results.skipped++;
          continue;
        }

        // Check again if it was added while processing
        const { data: existing } = await supabase
          .from('ingredient_categories')
          .select('category')
          .eq('ingredient_name', normalized)
          .single();

        if (existing) {
          console.log(`Already exists: ${normalized}`);
          results.skipped++;
          continue;
        }

        console.log(`Categorizing: ${ingredient} -> ${normalized}`);
        
        const category = await categorizeIngredient(ingredient);
        
        if (!dryRun) {
          const { error: insertError } = await supabase
            .from('ingredient_categories')
            .upsert({
              ingredient_name: normalized,
              category: category,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'ingredient_name'
            });

          if (insertError) {
            console.error(`Failed to save ${normalized}:`, insertError);
            results.failed++;
            results.errors.push(`${ingredient}: ${insertError.message}`);
          } else {
            console.log(`✅ Saved: ${normalized} -> ${category}`);
            results.saved++;
          }
        } else {
          console.log(`[DRY RUN] Would save: ${normalized} -> ${category}`);
          results.saved++;
        }

        results.processed++;

        // Small delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`Error processing ingredient "${ingredient}":`, error);
        results.failed++;
        results.errors.push(`${ingredient}: ${error.message}`);
      }
    }

    const remaining = ingredientsToProcess.length - batch.length;

    console.log(`Backfill batch complete: ${results.processed} processed, ${results.saved} saved, ${results.skipped} skipped, ${results.failed} failed, ${remaining} remaining`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed batch of ${batch.length} ingredients`,
      processed: results.processed,
      saved: results.saved,
      skipped: results.skipped,
      failed: results.failed,
      remaining: remaining,
      errors: results.errors.length > 0 ? results.errors.slice(0, 10) : undefined, // Limit errors in response
      dryRun,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in backfill function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
