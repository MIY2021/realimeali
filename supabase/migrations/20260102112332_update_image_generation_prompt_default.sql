-- Update the default image generation prompt to create varied cookbook-style food photography.
UPDATE public.app_settings
SET
  value = 'A high-quality editorial food photograph of {title}.

Create a believable, appetising photograph of the finished dish, using the full recipe context below. The food should look like something a great cookbook or food magazine would actually photograph: natural, tactile, delicious and appropriately styled for the cuisine.

Important visual rule: do NOT fall back to a generic centred 45-degree food shot. Each generated image should have its own photographic identity. Vary the camera viewpoint, framing, presentation, setting and lighting while keeping the food itself accurate to the recipe.

The visual direction supplied with this prompt is intentional. Follow it closely, but adapt it naturally to the dish. Props, garnishes and backgrounds must support the food rather than overpower it. Only show ingredients and elements that make sense for the recipe.

Modern cookbook photography with realistic textures, natural colour and believable food styling. No text, labels, borders, collage layouts or artificial-looking food. One coherent photograph.

Recipe context:

{description}

{ingredients}

{instructions}

The image must accurately represent the finished dish based on the recipe details above. The dish should appear as it would when prepared according to the instructions, including its likely texture, colour, shape, portion and serving vessel. Do not invent major ingredients or change the dish into a different cuisine.',
  description = 'The prompt template used for AI image generation. Available placeholders: {title}, {description}, {ingredients}, and {instructions}. The app also adds a rotating photographic direction so images vary in camera angle, composition, presentation, setting and lighting.',
  updated_at = now()
WHERE id = 'image_generation_prompt';
