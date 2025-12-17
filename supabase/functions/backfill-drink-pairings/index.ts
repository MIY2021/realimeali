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

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  cuisine_region: string | null;
  meal_type: string | null;
}

// Generate drink pairings for a recipe using OpenAI
async function generatePairings(recipe: Recipe): Promise<{ alcoholic: string; nonAlcoholic: string }> {
  const ingredientsList = recipe.ingredients?.slice(0, 10).join(', ') || 'various ingredients';
  
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
          content: 'You are a sommelier and beverage expert. Provide specific drink pairing suggestions. Keep suggestions concise (1-2 sentences max). Be specific with drink names/types.'
        },
        {
          role: 'user',
          content: `Suggest drink pairings for this recipe:
Title: ${recipe.title}
Cuisine: ${recipe.cuisine_region || 'International'}
Main ingredients: ${ingredientsList}

Return JSON only: { "alcoholic": "specific wine/beer/cocktail suggestion", "nonAlcoholic": "specific mocktail/tea/beverage suggestion" }`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Clean and parse the response
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  try {
    const parsed = JSON.parse(cleaned);
    return {
      alcoholic: parsed.alcoholic || parsed.alcoholicPairing || 'Pairs well with a crisp white wine or light beer.',
      nonAlcoholic: parsed.nonAlcoholic || parsed.nonAlcoholicPairing || 'Try sparkling water with lemon or a fruit-infused iced tea.',
    };
  } catch (e) {
    console.error('Failed to parse OpenAI response:', cleaned);
    return {
      alcoholic: 'Pairs well with a crisp white wine or light beer.',
      nonAlcoholic: 'Try sparkling water with lemon or a fruit-infused iced tea.',
    };
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
    const batchSize = body.batchSize || 10;
    const dryRun = body.dryRun || false;

    console.log(`Starting drink pairing backfill (batchSize: ${batchSize}, dryRun: ${dryRun})`);

    // Fetch recipes without drink pairings
    const { data: recipes, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title, ingredients, cuisine_region, meal_type')
      .is('alcoholic_pairing', null)
      .is('is_deleted', false)
      .limit(batchSize);

    if (fetchError) {
      throw new Error(`Failed to fetch recipes: ${fetchError.message}`);
    }

    if (!recipes || recipes.length === 0) {
      console.log('No recipes need drink pairing updates');
      return new Response(JSON.stringify({
        success: true,
        message: 'No recipes need updates',
        updated: 0,
        remaining: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${recipes.length} recipes to process`);

    const results = {
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each recipe
    for (const recipe of recipes) {
      try {
        console.log(`Processing: ${recipe.title} (${recipe.id})`);
        
        const pairings = await generatePairings(recipe);
        
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('recipes')
            .update({
              alcoholic_pairing: pairings.alcoholic,
              non_alcoholic_pairing: pairings.nonAlcoholic,
            })
            .eq('id', recipe.id);

          if (updateError) {
            console.error(`Failed to update ${recipe.id}:`, updateError);
            results.failed++;
            results.errors.push(`${recipe.title}: ${updateError.message}`);
          } else {
            console.log(`✅ Updated: ${recipe.title}`);
            console.log(`   Alcoholic: ${pairings.alcoholic}`);
            console.log(`   Non-alcoholic: ${pairings.nonAlcoholic}`);
            results.updated++;
          }
        } else {
          console.log(`[DRY RUN] Would update: ${recipe.title}`);
          console.log(`   Alcoholic: ${pairings.alcoholic}`);
          console.log(`   Non-alcoholic: ${pairings.nonAlcoholic}`);
          results.updated++;
        }

        // Small delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error processing ${recipe.id}:`, error);
        results.failed++;
        results.errors.push(`${recipe.title}: ${error.message}`);
      }
    }

    // Count remaining recipes
    const { count: remaining } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .is('alcoholic_pairing', null)
      .is('is_deleted', false);

    console.log(`Backfill complete: ${results.updated} updated, ${results.failed} failed, ${remaining || 0} remaining`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${recipes.length} recipes`,
      updated: results.updated,
      failed: results.failed,
      remaining: remaining || 0,
      errors: results.errors.length > 0 ? results.errors : undefined,
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
