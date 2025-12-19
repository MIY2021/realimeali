
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
      category: 'Other' // Fallback category
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
