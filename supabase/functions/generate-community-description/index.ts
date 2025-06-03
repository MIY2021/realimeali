
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const { recipeTitle, originalDescription, sourceUrl } = await req.json();

    if (!recipeTitle) {
      return new Response(
        JSON.stringify({ error: 'Recipe title is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating AI description for recipe:', recipeTitle);

    // Create a prompt that generates an original description based on the recipe title
    const prompt = `Write a compelling, original 2-3 sentence description for a recipe called "${recipeTitle}". 
    ${originalDescription ? `Reference context: ${originalDescription.substring(0, 200)}...` : ''}
    
    The description should be:
    - Completely original and copyright-safe
    - Appetizing and engaging
    - Focused on what makes this dish special
    - 2-3 sentences maximum
    - Written in a friendly, inviting tone
    
    Do not copy any text from the reference context. Create entirely new, original content that describes why someone would want to make this recipe.`;

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
            content: 'You are a food writer creating original, appetizing recipe descriptions. Never copy existing text - always create completely new, original content.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedDescription = data.choices[0]?.message?.content?.trim();

    if (!generatedDescription) {
      throw new Error('No description generated from OpenAI');
    }

    console.log('AI description generated successfully');

    return new Response(
      JSON.stringify({ 
        description: generatedDescription,
        message: 'AI description generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-community-description function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate description',
        details: 'Please try again later'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
