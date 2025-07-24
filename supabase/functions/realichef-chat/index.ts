
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  pageContext: {
    page: string;
    data?: any;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// Enhanced content safety filter
const containsInappropriateContent = (message: string): boolean => {
  const inappropriateKeywords = [
    'nazi', 'hitler', 'holocaust', 'genocide', 'fascist', 'white supremacy',
    'hate crime', 'terrorism', 'extremist', 'radical ideology',
    'ethnic cleansing', 'racial superiority', 'antisemitic', 'antisemitism',
    'hack', 'exploit', 'bypass', 'admin', 'root', 'password', 'token', 
    'authentication', 'authorize', 'privilege', 'escalation', 'injection'
  ];
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /expression\(/i
  ];
  
  const normalizedMessage = message.toLowerCase();
  return inappropriateKeywords.some(keyword => normalizedMessage.includes(keyword)) ||
         suspiciousPatterns.some(pattern => pattern.test(message));
};

const getContextualSystemPrompt = (pageContext: any) => {
  const baseName = "RealiChef";
  const basePersonality = `You are ${baseName}, a friendly and knowledgeable AI cooking assistant for the RealiMeali app. You have a warm, welcoming tone and are always helpful, patient, and informative. Always start responses with a chef emoji (👩‍🍳) and keep responses concise but helpful.

IMPORTANT CONTENT GUIDELINES:
- You ONLY discuss cooking, recipes, food, and kitchen-related topics
- You do NOT provide information about inappropriate, harmful, or offensive historical topics
- If asked about anything unrelated to cooking or food, politely redirect to culinary topics
- You maintain a positive, family-friendly environment focused on cooking and food`;
  
  // Handle special recipe editing mode
  if (pageContext.data?.mode === 'recipe-edit') {
    const recipe = pageContext.data?.recipe;
    const recipeContext = recipe ? `

CURRENT RECIPE BEING EDITED:
- Title: ${recipe.title || 'Untitled Recipe'}
- Ingredients: ${recipe.ingredients?.length ? recipe.ingredients.map((ing: any) => `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ing}`.trim()).join(', ') : 'None added yet'}
- Instructions: ${recipe.instructions?.length ? recipe.instructions.map((inst: any, i: number) => `${i + 1}. ${inst.instruction || inst}`).join(' ') : 'None added yet'}
- Servings: ${recipe.servings || 'Not specified'}
- Prep Time: ${recipe.prep_time ? `${recipe.prep_time} minutes` : 'Not specified'}
- Cook Time: ${recipe.cook_time ? `${recipe.cook_time} minutes` : 'Not specified'}
- Meal Types: ${recipe.meal_types?.length ? recipe.meal_types.join(', ') : 'Not specified'}
- Cuisine: ${recipe.cuisine_region || 'Not specified'}
- Complexity: ${recipe.complexity_level || 'Not specified'}
- Diet/Lifestyle: ${recipe.diet_lifestyle?.length ? recipe.diet_lifestyle.join(', ') : 'Not specified'}

RECIPE MODIFICATION INSTRUCTIONS:
When the user asks to modify the recipe (e.g., "make it spicier", "make it vegetarian", "double the recipe"), you should:

1. Provide a complete modified recipe with ALL fields:
   - Title (updated if needed)
   - Ingredients (complete list with quantities and units)
   - Instructions (complete step-by-step list)
   - Servings
   - Prep time
   - Cook time
   - Meal types (array format like ["dinner", "lunch"])
   - Cuisine region
   - Complexity level
   - Diet/lifestyle tags (array format like ["vegetarian", "gluten-free"])

2. Format the response like this:
   - First, explain what changes you're making
   - Then provide the complete modified recipe in this exact format:

   **MODIFIED RECIPE:**
   Title: [new title]
   Servings: [number]
   Prep Time: [minutes]
   Cook Time: [minutes]
   Meal Types: [comma-separated list]
   Cuisine: [cuisine region]
   Complexity: [Easy/Medium/Hard]
   Diet/Lifestyle: [comma-separated list]
   
   **Ingredients:**
   - [ingredient 1]
   - [ingredient 2]
   - [etc...]
   
   **Instructions:**
   1. [instruction 1]
   2. [instruction 2]
   3. [etc...]

3. After showing the modified recipe, ask: "Would you like me to update your recipe with these changes?"

The user is editing this recipe and wants your help. You can suggest specific changes, modifications, or improvements. When they ask for modifications, provide complete updated recipes as described above.` : '';
    
    return `${basePersonality} You're currently helping a user edit their recipe in the recipe editor.${recipeContext}`;
  }
  
  switch (pageContext.page) {
    case 'my-recipes':
      return `${basePersonality} You're currently helping on the My Recipes page. Focus on recipe inspiration, cooking tips, ingredient suggestions, and help with recipe management. You can suggest recipe variations, cooking techniques, and answer questions about the recipes they have.`;
    
    case 'meal-planner':
      return `${basePersonality} You're currently helping on the Meal Planner page. Focus on meal suggestions, menu planning, leftover ideas, and helping balance meals throughout the week. Suggest efficient meal prep strategies and complementary dishes.`;
    
    case 'shopping-list':
      return `${basePersonality} You're currently helping on the Shopping List page. Focus on ingredient substitutions, budget-friendly alternatives, seasonal suggestions, and helping identify or categorize items. You can also suggest ways to optimize shopping trips.`;
    
    case 'recipe-detail':
      const recipeTitle = pageContext.data?.recipeTitle || 'this recipe';
      return `${basePersonality} You're currently helping on a recipe detail page for "${recipeTitle}". Focus on ingredient substitutions, cooking techniques, serving suggestions, pairing ideas, and troubleshooting cooking issues specific to this recipe.`;
    
    case 'find-recipes':
      return `${basePersonality} You're currently helping on the Find Recipes page. Focus on helping users discover new recipes, suggesting search strategies, and providing recommendations based on their preferences, dietary needs, or available ingredients.`;
    
    default:
      return `${basePersonality} You're helping users with general cooking questions, recipe suggestions, and culinary advice. Be ready to assist with any cooking-related queries.`;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Enhanced input validation
    if (!requestBody || typeof requestBody !== 'object') {
      throw new Error('Invalid request body');
    }
    
    const { message, pageContext, conversationHistory = [] }: ChatRequest = requestBody;
    
    // Validate required fields
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }
    
    // Validate message length
    if (message.length > 5000) {
      throw new Error('Message too long (max 5000 characters)');
    }
    
    // Validate conversation history length
    if (conversationHistory && conversationHistory.length > 50) {
      throw new Error('Conversation history too long (max 50 messages)');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Check for inappropriate content
    if (containsInappropriateContent(message)) {
      console.log('Blocked inappropriate content request:', message);
      return new Response(JSON.stringify({ 
        response: "👩‍🍳 I'm here to help with cooking and food questions! Let's keep our conversation focused on delicious recipes and culinary topics. What would you like to cook today?",
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('RealiChef chat request:', { message, pageContext });

    // Build conversation with context
    const systemPrompt = getContextualSystemPrompt(pageContext);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 800, // Increased for complete recipe responses
        temperature: 0.7, // Slightly more deterministic for recipe accuracy
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const realiChefResponse = data.choices[0].message.content;

    console.log('RealiChef response generated successfully');

    return new Response(JSON.stringify({ 
      response: realiChefResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in RealiChef chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Sorry, I had trouble processing that. Please try again!',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
