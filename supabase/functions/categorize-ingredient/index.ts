
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredient } = await req.json();
    
    if (!ingredient) {
      throw new Error('Ingredient name is required');
    }

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

- Fresh & Chilled Food
- Food Cupboard
- Bakery
- Frozen Food
- Dietary, Lifestyle & World Foods
- Soft Drinks, Tea & Coffee
- Beer, Wine & Spirits

Rules:
- Return ONLY the category name, nothing else
- Fresh & Chilled Food: Fresh produce, meat, dairy, eggs, fresh herbs
- Food Cupboard: Pantry staples, dry goods, canned items, spices, oils, pasta, rice
- Bakery: Bread, rolls, pastries, fresh baked goods
- Frozen Food: Any frozen items including vegetables, ready meals, ice cream
- Dietary, Lifestyle & World Foods: Specialty diet foods, international cuisine items, organic/health foods
- Soft Drinks, Tea & Coffee: Non-alcoholic beverages, tea, coffee
- Beer, Wine & Spirits: Alcoholic beverages

If unsure, default to "Food Cupboard".`
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

    const data = await response.json();
    const category = data.choices[0].message.content.trim();
    
    console.log(`Categorized "${ingredient}" as "${category}"`);

    return new Response(JSON.stringify({ category }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in categorize-ingredient function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      category: 'Food Cupboard' // Fallback category
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
