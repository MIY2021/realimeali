
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

serve(async (req) => {
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
    const dryRun = body.dryRun || false;
    const batchSize = Math.min(Math.max(body.batchSize || 10, 1), 50); // Clamp between 1-50

    console.log(`Starting cleaned names backfill (batchSize: ${batchSize}, dryRun: ${dryRun})`);

    // Use RPC function or direct query to find ingredients that need cleaning
    // Query for NULL cleaned_name first (most efficient)
    const { data: nullIngredients, error: nullError } = await supabase
      .from('ingredient_categories')
      .select('ingredient_name, category, cleaned_name')
      .is('cleaned_name', null)
      .limit(10000);

    if (nullError) {
      throw new Error(`Failed to fetch ingredients with NULL cleaned_name: ${nullError.message}`);
    }

    // Query for empty string cleaned_name
    const { data: emptyIngredients, error: emptyError } = await supabase
      .from('ingredient_categories')
      .select('ingredient_name, category, cleaned_name')
      .eq('cleaned_name', '')
      .limit(10000);

    if (emptyError) {
      throw new Error(`Failed to fetch ingredients with empty cleaned_name: ${emptyError.message}`);
    }

    // Get all ingredients to check for fallback cases (where cleaned_name = ingredient_name)
    // We'll filter this in memory since Supabase doesn't support comparing two columns easily
    const { data: allIngredients, error: allError } = await supabase
      .from('ingredient_categories')
      .select('ingredient_name, category, cleaned_name')
      .not('cleaned_name', 'is', null)
      .neq('cleaned_name', '')
      .limit(10000);

    if (allError) {
      throw new Error(`Failed to fetch ingredients: ${allError.message}`);
    }

    // Filter for fallback cases where cleaned_name equals ingredient_name
    const fallbackIngredients = (allIngredients || []).filter(ing => {
      if (!ing.cleaned_name) return false;
      return ing.cleaned_name.toLowerCase().trim() === ing.ingredient_name.toLowerCase().trim();
    });

    // Combine all ingredients that need cleaning, removing duplicates
    const ingredientMap = new Map();
    
    [...(nullIngredients || []), ...(emptyIngredients || []), ...fallbackIngredients].forEach(ing => {
      ingredientMap.set(ing.ingredient_name, ing);
    });

    const ingredients = Array.from(ingredientMap.values());

    if (!ingredients || ingredients.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No ingredients need backfilling',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalIngredients = (nullIngredients?.length || 0) + (emptyIngredients?.length || 0) + (allIngredients?.length || 0);
    console.log(`Found ${ingredients.length} ingredients to backfill:`);
    console.log(`  - NULL cleaned_name: ${nullIngredients?.length || 0}`);
    console.log(`  - Empty cleaned_name: ${emptyIngredients?.length || 0}`);
    console.log(`  - Fallback (equals ingredient_name): ${fallbackIngredients.length}`);
    console.log(`  - Total ingredients in database: ${totalIngredients}`);
    
    // Log some examples of what we found
    if (ingredients.length > 0) {
      console.log(`Sample ingredients to process:`, ingredients.slice(0, 10).map(i => ({
        name: i.ingredient_name,
        currentCleaned: i.cleaned_name === null ? 'NULL' : (i.cleaned_name || 'EMPTY')
      })));
    }

    let processed = 0;
    let updated = 0;
    let errors = 0;
    let skipped = 0;

    // Process in batches to avoid rate limits
    for (let i = 0; i < ingredients.length; i += batchSize) {
      const batch = ingredients.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)...`);

      const batchPromises = batch.map(async (ingredient) => {
        try {
          // Double-check this ingredient still needs cleaning (might have been updated by another process)
          const { data: currentIngredient } = await supabase
            .from('ingredient_categories')
            .select('cleaned_name')
            .eq('ingredient_name', ingredient.ingredient_name)
            .single();

          if (currentIngredient) {
            const currentCleaned = currentIngredient.cleaned_name;
            const hasValidCleanedName = currentCleaned && 
                                       currentCleaned.trim() !== '' && 
                                       currentCleaned.toLowerCase().trim() !== ingredient.ingredient_name.toLowerCase().trim();
            
            if (hasValidCleanedName) {
              console.log(`Skipping ${ingredient.ingredient_name} - already has cleaned name: ${currentCleaned}`);
              skipped++;
              return { success: true, ingredient: ingredient.ingredient_name, cleanedName: currentCleaned, skipped: true };
            }
          }

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
          
          let cleanedName = data.choices[0].message.content.trim();
          
          // Remove any quotes that might wrap the response
          cleanedName = cleanedName.replace(/^["']|["']$/g, '').trim();
          
          if (!cleanedName || cleanedName.length === 0) {
            throw new Error('Empty cleaned name returned from OpenAI');
          }

          // Validate the cleaned name is reasonable (not just whitespace or too short)
          if (cleanedName.length < 1) {
            throw new Error('Cleaned name too short');
          }

          if (!dryRun) {
            // Update the database - ensure we're setting a non-null value
            // Use update with explicit cleaned_name to ensure it's never NULL
            const { data: updateData, error: updateError } = await supabase
              .from('ingredient_categories')
              .update({ 
                cleaned_name: cleanedName.trim(), // Explicitly set the value (non-null, trimmed)
                updated_at: new Date().toISOString()
              })
              .eq('ingredient_name', ingredient.ingredient_name)
              .select('cleaned_name, ingredient_name')
              .single();

            if (updateError) {
              console.error(`Error updating ${ingredient.ingredient_name}:`, updateError);
              return { success: false, ingredient: ingredient.ingredient_name, error: updateError.message };
            }

            // Verify the update worked - check that cleaned_name is not null and matches
            if (!updateData) {
              console.error(`Update returned no data for ${ingredient.ingredient_name}`);
              return { success: false, ingredient: ingredient.ingredient_name, error: 'Update returned no data' };
            }

            if (!updateData.cleaned_name || updateData.cleaned_name === null) {
              console.error(`Update verification failed for ${ingredient.ingredient_name}. cleaned_name is still NULL`);
              return { success: false, ingredient: ingredient.ingredient_name, error: 'Update verification failed - cleaned_name is still NULL' };
            }

            if (updateData.cleaned_name.trim() !== cleanedName.trim()) {
              console.warn(`Update verification: cleaned_name mismatch for ${ingredient.ingredient_name}. Expected: "${cleanedName}", Got: "${updateData.cleaned_name}"`);
              // Still consider it success if it's not NULL
              return { success: true, ingredient: ingredient.ingredient_name, cleanedName: updateData.cleaned_name };
            }

            console.log(`✅ Successfully updated: ${ingredient.ingredient_name} → ${cleanedName}`);
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
            if (!result.value.skipped) {
              updated++;
              if (!dryRun) {
                console.log(`✅ Updated: ${result.value.ingredient} → ${result.value.cleanedName}`);
              } else {
                console.log(`[DRY RUN] Would update: ${result.value.ingredient} → ${result.value.cleanedName}`);
              }
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
      skipped,
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

