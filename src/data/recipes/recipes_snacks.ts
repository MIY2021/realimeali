
import { Recipe } from "@/types";

const baseUserId = "user-1";
const baseHouseholdId = "household-1";
const now = new Date().toISOString();

export const snackRecipes: Recipe[] = [
  {
    id: "snack-001",
    title: "Homemade Oat Bars",
    description: "Simple no-bake oat snack bars that are perfect for on-the-go energy",
    ingredients: [
      "2 cups rolled oats",
      "1/2 cup honey or maple syrup",
      "1/2 cup peanut butter",
      "1/4 cup chopped nuts",
      "1/4 cup dried fruits (raisins, cranberries, etc.)",
      "1 tsp vanilla extract",
      "1/4 tsp salt"
    ],
    instructions: [
      "Line a square baking dish with parchment paper",
      "Mix all ingredients together in a large bowl until well combined",
      "Press the mixture firmly into the baking dish",
      "Refrigerate for at least 2 hours until firm",
      "Cut into bars and store in an airtight container"
    ],
    categories: ["Snacks", "Healthy", "Easy"],
    prepTime: 10,
    cookTime: 0,
    servings: 12,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    householdId: baseHouseholdId
  },
  {
    id: "snack-002",
    title: "Greek Yogurt Dip",
    description: "Creamy and flavorful dip for vegetables or crackers",
    ingredients: [
      "1 cup Greek yogurt",
      "1 clove garlic, minced",
      "2 tbsp fresh dill, chopped",
      "1 tbsp lemon juice",
      "1/2 cucumber, grated and drained",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Combine all ingredients in a bowl and mix well",
      "Refrigerate for at least 30 minutes to allow flavors to meld",
      "Serve with fresh vegetables or crackers"
    ],
    categories: ["Snacks", "Healthy", "Easy"],
    prepTime: 10,
    cookTime: 0,
    servings: 6,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    householdId: baseHouseholdId
  },
  {
    id: "snack-003",
    title: "Spiced Nut Mix",
    description: "Savory roasted nuts with herbs and spices",
    ingredients: [
      "2 cups mixed nuts (almonds, walnuts, cashews)",
      "1 tbsp olive oil",
      "1 tsp smoked paprika",
      "1/2 tsp garlic powder",
      "1/2 tsp rosemary, dried",
      "1/4 tsp cayenne pepper (optional)",
      "1 tsp salt"
    ],
    instructions: [
      "Preheat oven to 325°F (160°C)",
      "Toss nuts with olive oil and all spices until evenly coated",
      "Spread on a baking sheet in a single layer",
      "Roast for 15 minutes, stirring halfway through",
      "Let cool completely before storing in an airtight container"
    ],
    categories: ["Snacks", "Easy"],
    prepTime: 5,
    cookTime: 15,
    servings: 8,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    householdId: baseHouseholdId
  },
  {
    id: "snack-004",
    title: "Banana Berry Smoothie",
    description: "Quick and refreshing fruit smoothie",
    ingredients: [
      "1 ripe banana",
      "1 cup mixed berries (fresh or frozen)",
      "1 cup milk or plant-based alternative",
      "1/2 cup Greek yogurt",
      "1 tbsp honey (optional)",
      "Ice cubes"
    ],
    instructions: [
      "Place all ingredients in a blender",
      "Blend until smooth and creamy",
      "Pour into glasses and serve immediately"
    ],
    categories: ["Snacks", "Healthy", "Easy"],
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    createdBy: baseUserId,
    createdAt: now,
    updatedAt: now,
    isFavorite: false,
    householdId: baseHouseholdId
  }
];
