
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Parse request body for optional parameters
    let body = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        body = JSON.parse(bodyText);
      }
    } catch (e) {
      // Body is optional, use defaults
    }

    const dryRun = body.dryRun || false;
    const batchSize = body.batchSize || 10;

    console.log(`Starting cleaned names backfill (batchSize: ${batchSize}, dryRun: ${dryRun})`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all ingredients that need cleaned_name backfilled
    // This includes:
    // 1. Ingredients where cleaned_name is null or empty
    // 2. Ingredients where cleaned_name equals ingredient_name (fallback from migration)
    const { data: allIngredients, error: fetchError } = await supabase
      .from('ingredient_categories')
      .select('ingredient_name, category, cleaned_name')
      .limit(10000); // Get all to filter properly

    if (fetchError) {
      throw new Error(`Failed to fetch ingredients: ${fetchError.message}`);
    }

    // Filter to only those that need cleaning:
    // - cleaned_name is null/empty, OR
    // - cleaned_name equals ingredient_name (meaning it was set by migration fallback)
    const ingredients = (allIngredients || []).filter(ing => {
      const hasCleanedName = ing.cleaned_name && ing.cleaned_name.trim() !== '';
      const cleanedEqualsOriginal = hasCleanedName && 
        ing.cleaned_name.toLowerCase().trim() === ing.ingredient_name.toLowerCase().trim();
      return !hasCleanedName || cleanedEqualsOriginal;
    });

    if (!ingredients || ingredients.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No ingredients need backfilling',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${ingredients.length} ingredients to backfill`);

    let processed = 0;
    let updated = 0;
    let errors = 0;

    // Process in batches to avoid rate limits
    for (let i = 0; i < ingredients.length; i += batchSize) {
      const batch = ingredients.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)...`);

      const batchPromises = batch.map(async (ingredient) => {
        try {
          // Call OpenAI to get cleaned name
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
                  content: `You are an ingredient formatting expert. Create a clean, shopping list-ready version of the ingredient name.

CLEANED INGREDIENT NAME RULES:
- Keep quantities and measurements exactly as written (e.g., "4", "2–3 tbsp", "1/2 cup")
- Remove descriptive text after commas (e.g., "thinly sliced, green and white parts separated" → remove)
- Remove parenthetical notes (e.g., "(add more/less depending on how spicy you like it)" → remove)
- Capitalize each word properly (Title Case)
- Fix spelling mistakes
- Keep units and measurements with proper formatting (e.g., "tbsp", "cup", "g", "kg")
- NEVER change the ingredient itself (e.g., "cheese" must stay "cheese", never change to "duck" or anything else)
- Preserve the core ingredient name exactly as it is, just clean up formatting and remove extra descriptions

Examples:
- "4 salad onions, thinly sliced, green and white parts separated" → "4 Salad Onions"
- "2–3 tbsp good quality jerk seasoning (add more/less depending on how spicy you like it)" → "2–3 tbsp Good Quality Jerk Seasoning"
- "G cheddar cheese, grated" → "G Cheddar Cheese"
- "1 cup all-purpose flour" → "1 Cup All-Purpose Flour"

Return ONLY the cleaned ingredient name, nothing else.`
                },
                {
                  role: 'user',
                  content: `Clean this ingredient name: ${ingredient.ingredient_name}`
                }
              ],
              temperature: 0.1,
              max_tokens: 100
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          
          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response from OpenAI API');
          }
          
          const cleanedName = data.choices[0].message.content.trim();
          
          if (!cleanedName || cleanedName.length === 0) {
            throw new Error('Empty cleaned name returned from OpenAI');
          }

          if (!dryRun) {
            // Update the database
            const { error: updateError } = await supabase
              .from('ingredient_categories')
              .update({ 
                cleaned_name: cleanedName,
                updated_at: new Date().toISOString()
              })
              .eq('ingredient_name', ingredient.ingredient_name);

            if (updateError) {
              console.error(`Error updating ${ingredient.ingredient_name}:`, updateError);
              return { success: false, ingredient: ingredient.ingredient_name, error: updateError.message };
            }

            return { success: true, ingredient: ingredient.ingredient_name, cleanedName };
          } else {
            return { success: true, ingredient: ingredient.ingredient_name, cleanedName, dryRun: true };
          }
        } catch (error: any) {
          console.error(`Error processing ${ingredient.ingredient_name}:`, error);
          return { success: false, ingredient: ingredient.ingredient_name, error: error.message };
        }
      });

      const results = await Promise.allSettled(batchPromises);
      
      results.forEach((result) => {
        processed++;
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            updated++;
            if (!dryRun) {
              console.log(`✅ Updated: ${result.value.ingredient} → ${result.value.cleanedName}`);
            } else {
              console.log(`[DRY RUN] Would update: ${result.value.ingredient} → ${result.value.cleanedName}`);
            }
          } else {
            errors++;
            console.error(`❌ Failed: ${result.value.ingredient} - ${result.value.error}`);
          }
        } else {
          errors++;
          console.error(`❌ Failed: ${result.reason}`);
        }
      });

      // Small delay between batches to avoid rate limits
      if (i + batchSize < ingredients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(JSON.stringify({
      message: dryRun ? 'Dry run completed' : 'Backfill completed',
      total: ingredients.length,
      processed,
      updated,
      errors,
      dryRun
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in backfill-cleaned-names function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      processed: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

