
import { Recipe } from "@/types";

const baseUserId = "user-1";
const now = new Date().toISOString();

export const breakfastRecipes: Recipe[] = [
  {
    id: "breakfast-001",
    title: "Avocado Toast with Poached Egg",
    description: "Simple and nutritious breakfast with creamy avocado and perfectly poached eggs",
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado",
      "2 eggs",
      "1 tbsp vinegar",
      "1/2 lemon, juiced",
      "1/4 tsp red pepper flakes",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Toast the bread until golden brown",
      "Mash the avocado with lemon juice, salt, and pepper",
      "Bring water to a simmer in a pot, add vinegar",
      "Crack each egg into a small bowl then slide into the simmering water",
      "Poach eggs for 3-4 minutes until whites are set but yolks are still runny",
      "Spread mashed avocado on toast, top with poached eggs",
      "Sprinkle with red pepper flakes, salt and pepper"
    ],
    categories: ["Breakfast", "Healthy", "Easy"],
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false
  },
  {
    id: "breakfast-002",
    title: "Greek Yogurt Parfait",
    description: "Layered yogurt parfait with fresh berries, honey and granola",
    ingredients: [
      "1 cup Greek yogurt",
      "1/2 cup mixed berries (strawberries, blueberries, raspberries)",
      "1/4 cup granola",
      "1 tbsp honey",
      "1 tsp chia seeds (optional)"
    ],
    instructions: [
      "In a glass or small bowl, add half of the yogurt as the bottom layer",
      "Top with half of the berries and a sprinkle of granola",
      "Repeat with another layer of yogurt and remaining berries",
      "Top with remaining granola, drizzle with honey and sprinkle chia seeds if using",
      "Serve immediately or refrigerate for up to 1 hour"
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
    title: "Classic Pancakes",
    description: "Fluffy homemade pancakes perfect for a weekend breakfast",
    ingredients: [
      "1 1/2 cups all-purpose flour",
      "2 tbsp sugar",
      "2 tsp baking powder",
      "1/2 tsp salt",
      "1 1/4 cups milk",
      "1 egg",
      "3 tbsp melted butter",
      "1 tsp vanilla extract",
      "Maple syrup for serving"
    ],
    instructions: [
      "In a bowl, whisk together flour, sugar, baking powder, and salt",
      "In another bowl, whisk milk, egg, melted butter, and vanilla",
      "Pour wet ingredients into dry ingredients and stir until just combined (small lumps are okay)",
      "Heat a lightly oiled griddle or frying pan over medium-high heat",
      "Pour 1/4 cup batter onto the griddle for each pancake",
      "Cook until bubbles form on the surface, then flip and cook until golden brown",
      "Serve with maple syrup and butter"
    ],
    categories: ["Breakfast", "Easy"],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false
  },
  {
    id: "breakfast-004",
    title: "Overnight Oats",
    description: "Make-ahead breakfast that's ready when you wake up",
    ingredients: [
      "1/2 cup rolled oats",
      "1/2 cup milk or plant-based alternative",
      "1/4 cup Greek yogurt",
      "1 tbsp chia seeds",
      "1 tbsp honey or maple syrup",
      "1/4 tsp vanilla extract",
      "Pinch of salt",
      "Toppings: fresh fruit, nuts, or nut butter"
    ],
    instructions: [
      "Combine oats, milk, yogurt, chia seeds, sweetener, vanilla, and salt in a jar or container",
      "Stir well until fully mixed",
      "Cover and refrigerate overnight or at least 4 hours",
      "In the morning, add your favorite toppings",
      "Can be stored in refrigerator for up to 3 days"
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
