import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MEAL_TYPES = ["breakfast","lunch","dinner","appetizers","sides","snacks","desserts","drinks","sauce"];
const CUISINES = ["british","american","italian","french","spanish","mexican","indian","chinese","japanese","thai","mediterranean","middle_eastern","african","korean","caribbean","nordic","eastern_european","greek"];
const DIETS = ["vegetarian","vegan","gluten_free","dairy_free","high_protein","kid_friendly","pescatarian","low_carb_keto","paleo","diabetic_friendly","budget_meals","pregnancy_safe","low_fat","batch_cooking"];

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    ingredients: { type: "array", items: { type: "string" } },
    ingredientGroupIndices: { type: "array", items: { type: "integer", minimum: 0 }, description: "Zero-based indices in ingredients for genuine ingredient-section headers only." },
    instructions: { type: "array", items: { type: "string" } },
    prepTime: { type: "integer", minimum: 0 },
    cookTime: { type: "integer", minimum: 0 },
    servings: { type: "integer", minimum: 1 },
    topTip: { type: "string" },
    alcoholicPairing: { type: ["string","null"] },
    nonAlcoholicPairing: { type: ["string","null"] },
    mealType: { type: "string", enum: MEAL_TYPES },
    cuisineRegion: { type: "string", enum: CUISINES },
    dietLifestyle: { type: "array", items: { type: "string", enum: DIETS } }
  },
  required: ["title","description","ingredients","ingredientGroupIndices","instructions","prepTime","cookTime","servings","topTip","alcoholicPairing","nonAlcoholicPairing","mealType","cuisineRegion","dietLifestyle"]
};

const SYSTEM_PROMPT = `You are RealiMeali's recipe text importer.

Turn arbitrary pasted recipe text into ONE structured recipe. SOURCE PRESERVATION IS THE HIGHEST PRIORITY.

INGREDIENTS:
- Extract every actual ingredient from the ingredient section(s). Preserve quantities, units, ingredient names and qualifiers from the source. Do not simplify, combine, substitute, correct or invent.
- Ingredient groups are IMPORTANT because RealiMeali uses them to organise the recipe and deliberately excludes group headers from the shopping list.
- When the source has a genuine ingredient-section heading such as "FOR THE DOUGH", "FOR THE FILLING", "FOR THE SAUCE", "FOR THE TOPPING" or "TO SERVE", include that heading as its own entry in the ingredients array and put its zero-based index in ingredientGroupIndices.
- Every ingredient group entry MUST end with a colon, e.g. "For the sauce:".
- Keep the original group wording where possible; only normalise obvious formatting such as capitalisation and adding the final colon.
- All actual ingredients following a group heading belong to that group until the next group heading.
- Do NOT invent groups merely because ingredients seem related. If the source has no genuine group headings, return an empty ingredientGroupIndices array.
- CRITICAL: a cooking action is NOT an ingredient group. Phrases such as "Combine together", "Mix with a mixer", "Whisk", "Stir", "Add", "Heat", "Cook", "Bake", "Knead", "Beat", "Roll", "Place" and "Pour" are method instructions, not ingredients or groups.
- Do not turn instruction fragments, method headings or explanatory prose into ingredients.

INSTRUCTIONS:
- Preserve the COMPLETE cooking method. Do NOT summarise, shorten, rewrite, improve or omit it.
- Every meaningful instruction in the source must remain represented.
- Preserve temperatures, timings, quantities, actions, warnings and sequence.
- If a numbered step has a heading followed by prose, keep the heading and all prose together in that instruction.
- If source lines wrap a sentence, join them without losing words.
- You may remove only formatting markers such as Markdown hashes, bullets and step numbers. Do not change recipe wording or meaning.
- Never invent missing instructions.

TITLE:
- Use the genuine recipe title when present.
- Ignore conversational introductions and section headings.
- If no title exists, create a short title from the supplied recipe.

METADATA:
- Description: concise 1–2 sentences based only on the recipe.
- Extract prep/cook time and servings when stated. Times are minutes. If genuinely absent, use 0 for prep/cook and 4 servings.
- Choose exactly one mealType and cuisineRegion from the supplied allowed values.
- Be conservative with diet tags. Never mark vegetarian/vegan if meat or fish/seafood is present.
- pregnancy_safe only when clearly supported.
- batch_cooking only when batch/freezer preparation is explicit.
- Provide one useful recipe-specific topTip. Do not invent a technique.
- Pairings should be sensible; use null when inappropriate.

Return only the structured recipe object.`;

function fail(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function callOpenAI(recipeText: string, retry = false) {
  const prompt = retry
    ? `The previous extraction failed validation. Re-extract this recipe and preserve every ingredient and every cooking instruction. Do not summarise or omit source content.

RECIPE TEXT:
\n\n${recipeText}`
    : `Import this recipe. Preserve its ingredients, quantities and complete cooking method exactly as instructed.

RECIPE TEXT:
\n\n${recipeText}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAIApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5.6-luna",
      instructions: SYSTEM_PROMPT,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      max_output_tokens: 10000,
      text: { format: { type: "json_schema", name: "recipe_import", strict: true, schema } }
    }),
    signal: AbortSignal.timeout(90000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("OpenAI recipe text import error", response.status, data);
    throw new Error(data?.error?.message || `OpenAI request failed (${response.status})`);
  }

  const text = typeof data?.output_text === "string"
    ? data.output_text
    : (data?.output || []).flatMap((item: any) => Array.isArray(item?.content) ? item.content : []).map((part: any) => part?.text || "").join("").trim();

  if (!text) throw new Error("OpenAI returned no recipe data.");
  return JSON.parse(text);
}

function validate(recipe: any) {
  if (!recipe?.title?.trim()) throw new Error("Recipe importer did not return a title.");
  if (!Array.isArray(recipe.ingredients) || !recipe.ingredients.length) throw new Error("Recipe importer did not return ingredients.");
  if (!Array.isArray(recipe.instructions) || !recipe.instructions.length) throw new Error("Recipe importer did not return cooking instructions.");
  if (!Number.isInteger(recipe.prepTime) || recipe.prepTime < 0) throw new Error("Invalid prep time.");
  if (!Number.isInteger(recipe.cookTime) || recipe.cookTime < 0) throw new Error("Invalid cook time.");
  if (!Number.isInteger(recipe.servings) || recipe.servings < 1) throw new Error("Invalid servings.");
  if (!MEAL_TYPES.includes(recipe.mealType)) throw new Error("Invalid meal type.");
  if (!CUISINES.includes(recipe.cuisineRegion)) throw new Error("Invalid cuisine.");
  if (!Array.isArray(recipe.dietLifestyle)) throw new Error("Invalid diet tags.");

  recipe.ingredients = recipe.ingredients.map((v: unknown) => String(v).trim()).filter(Boolean);
  recipe.instructions = recipe.instructions.map((v: unknown) => String(v).trim()).filter(Boolean);

  // Group headers are stored inside the ingredients array for backwards compatibility,
  // but must be unmistakable so the UI and shopping-list logic can exclude them.
  const rawGroupIndices = [...new Set(recipe.ingredientGroupIndices || [])]
    .filter((i: number) => Number.isInteger(i) && i >= 0 && i < recipe.ingredients.length)
    .sort((a: number, b: number) => a - b);

  const instructionLikeGroup = /^(combine|mix|whisk|stir|add|heat|cook|bake|knead|beat|roll|place|pour|transfer|divide|shape|season|remove|bring|reduce|simmer|boil|fry|saute|sauté)\\b/i;

  recipe.ingredientGroupIndices = rawGroupIndices.filter((index: number) => {
    const value = recipe.ingredients[index].trim();
    if (instructionLikeGroup.test(value)) {
      console.warn("Rejecting instruction-like ingredient group", { index, value });
      return false;
    }
    if (!value.endsWith(":")) recipe.ingredients[index] = `${value}:`;
    return true;
  });

  recipe.dietLifestyle = recipe.dietLifestyle.filter((v: string) => DIETS.includes(v));
  return recipe;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!openAIApiKey) return fail("OpenAI API key not configured", 500);

    const body = await req.json();
    if (typeof body?.recipeText !== "string" || !body.recipeText.trim()) return fail("Please provide recipeText.");

    const recipeText = body.recipeText.trim();
    if (recipeText.length > 50000) return fail("That recipe is too long to import. Please paste a recipe under 50,000 characters.");

    console.log("Text recipe import started", { characters: recipeText.length, lines: recipeText.split(/\r?\n/).length });

    let recipe;
    try {
      recipe = validate(await callOpenAI(recipeText));
    } catch (firstError) {
      console.warn("Text recipe import validation failed; retrying once", firstError);
      recipe = validate(await callOpenAI(recipeText, true));
    }

    console.log("Text recipe import succeeded", {
      title: recipe.title,
      ingredients: recipe.ingredients.length,
      ingredientGroups: recipe.ingredientGroupIndices,
      groupTitles: recipe.ingredientGroupIndices.map((i: number) => recipe.ingredients[i]),
      instructions: recipe.instructions.length,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings
    });

    return new Response(JSON.stringify({ parsedRecipe: recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Text recipe import failed", error);
    return fail(error instanceof Error ? error.message : "Recipe import failed.", 500);
  }
});
