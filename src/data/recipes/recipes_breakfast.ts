
import { Recipe } from "@/types";

const baseUserId = "user-1";
const now = new Date().toISOString();

export const breakfastRecipes: Recipe[] = [
  {
    id: "breakfast-001",
    title: "Avocado Toast with Poached Eggs",
    description: "Simple and nutritious breakfast with creamy avocado and perfectly poached eggs",
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado",
      "2 eggs",
      "1 tbsp white vinegar",
      "Salt and pepper to taste",
      "Red pepper flakes (optional)",
      "1 tbsp fresh lemon juice"
    ],
    instructions: [
      "Toast the bread slices until golden brown",
      "Halve the avocado, remove the pit, and mash the flesh in a bowl",
      "Season the avocado with lemon juice, salt, and pepper",
      "Bring a pot of water to a simmer, add vinegar",
      "Crack each egg into a small bowl, then gently slide into the simmering water",
      "Cook for 3-4 minutes for a runny yolk",
      "Spread mashed avocado on the toast slices",
      "Remove eggs with a slotted spoon, drain, and place on top of avocado toast",
      "Season with salt, pepper, and red pepper flakes if desired"
    ],
    categories: ["Breakfast", "Healthy", "Vegetarian"],
    prepTime: 10,
    cookTime: 5,
    servings: 1,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false
  },
  {
    id: "breakfast-002",
    title: "Overnight Oats with Berries",
    description: "No-cook breakfast prepared the night before for busy mornings",
    ingredients: [
      "1/2 cup rolled oats",
      "1/2 cup milk or plant-based alternative",
      "1/4 cup Greek yogurt",
      "1 tbsp chia seeds",
      "1 tbsp honey or maple syrup",
      "1/2 cup mixed berries (fresh or frozen)",
      "1/4 tsp vanilla extract"
    ],
    instructions: [
      "Combine oats, milk, yogurt, chia seeds, honey, and vanilla in a jar or container",
      "Stir well until all ingredients are mixed",
      "Cover and refrigerate overnight or at least 4 hours",
      "Before serving, top with mixed berries",
      "Enjoy cold or warm it up if preferred"
    ],
    categories: ["Breakfast", "Healthy", "Easy"],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false
  },
  {
    id: "breakfast-003",
    title: "Breakfast Burrito",
    description: "Hearty and filling breakfast wrap that's perfect for on-the-go mornings",
    ingredients: [
      "2 large eggs",
      "1 large flour tortilla",
      "1/4 cup black beans, drained and rinsed",
      "1/4 cup grated cheddar cheese",
      "2 tbsp salsa",
      "1/2 avocado, sliced",
      "1 tbsp olive oil",
      "Salt and pepper to taste",
      "Hot sauce (optional)"
    ],
    instructions: [
      "Heat olive oil in a pan over medium heat",
      "Beat eggs with salt and pepper, then pour into the pan",
      "Scramble until just set but still slightly wet",
      "Warm the tortilla in a separate pan or microwave",
      "Place eggs in the center of the tortilla",
      "Add black beans, cheese, avocado slices, and salsa",
      "Fold in the sides of the tortilla, then roll up tightly",
      "Return the burrito to the pan and cook seam-side down until golden",
      "Cut in half and serve with hot sauce if desired"
    ],
    categories: ["Breakfast", "Easy"],
    prepTime: 10,
    cookTime: 7,
    servings: 1,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false
  },
  {
    id: "breakfast-004",
    title: "Greek Yogurt Parfait",
    description: "Layered breakfast with protein-rich yogurt, crunchy granola, and fresh fruit",
    ingredients: [
      "1 cup Greek yogurt",
      "1/4 cup granola",
      "1/4 cup mixed berries",
      "1 tbsp honey",
      "1 tbsp chopped nuts",
      "1/2 tsp cinnamon (optional)"
    ],
    instructions: [
      "In a glass or jar, add a layer of Greek yogurt",
      "Add a layer of granola on top",
      "Add a layer of mixed berries",
      "Repeat layers until all ingredients are used",
      "Drizzle with honey and sprinkle with chopped nuts and cinnamon if desired",
      "Serve immediately to keep the granola crunchy"
    ],
    categories: ["Breakfast", "Healthy", "Easy"],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false
  }
];
