import { Recipe } from "@/types";

export const vegetarianRecipes: Recipe[] = [
  {
    id: "recipe-7",
    title: "Avocado Toast",
    description: "Crunchy toast topped with creamy avocado.",
    ingredients: [
      "2 slices bread",
      "1 ripe avocado",
      "Salt and pepper to taste",
      "Lemon juice",
      "Chili flakes (optional)"
    ],
    instructions: [
      "Toast the bread slices.",
      "Mash avocado with lemon juice, salt, and pepper.",
      "Spread avocado on toast and sprinkle chili flakes if desired."
    ],
    categories: ["Healthy", "Vegetarian", "Easy"],
    prepTime: 5,
    cookTime: 2,
    servings: 1,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    createdBy: "user-1",
    createdAt: "2023-05-20T08:00:00Z",
    updatedAt: "2023-05-20T08:00:00Z",
    isFavorite: false,
  },
  {
    id: "recipe-10",
    title: "Vegetarian Chili",
    description: "Hearty and spicy vegetarian chili with beans and vegetables.",
    ingredients: [
      "1 tbsp olive oil",
      "1 onion, diced",
      "1 bell pepper, diced",
      "2 cloves garlic, minced",
      "2 cans kidney beans",
      "1 can diced tomatoes",
      "2 tbsp chili powder",
      "1 tsp cumin",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Heat olive oil in a pot over medium heat.",
      "Add onion, bell pepper, and garlic and sauté until soft.",
      "Add beans, tomatoes, chili powder, cumin, salt, and pepper.",
      "Simmer for 30 minutes.",
      "Serve hot with rice or bread."
    ],
    categories: ["Vegetarian", "Cheap", "Healthy", "Bulk"],
    prepTime: 15,
    cookTime: 30,
    servings: 6,
    image: "https://images.unsplash.com/photo-1601050698431-9b3482a9e92e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    createdBy: "user-1",
    createdAt: "2023-07-12T09:00:00Z",
    updatedAt: "2023-07-12T09:00:00Z",
    isFavorite: false,
  },
  {
    id: "recipe-13",
    title: "Winter Vegetable Soup",
    description: "A hearty and warming soup perfect for cold winter days.",
    ingredients: [
      "2 tbsp olive oil",
      "1 onion, diced",
      "2 carrots, diced",
      "2 celery stalks, diced",
      "1 parsnip, diced",
      "2 potatoes, cubed",
      "1 liter vegetable stock",
      "1 tsp thyme",
      "Salt and pepper to taste",
      "Fresh parsley for garnish"
    ],
    instructions: [
      "Heat olive oil in a large pot over medium heat.",
      "Add onion, carrots, and celery, cook until softened.",
      "Add parsnip, potatoes, stock, and thyme.",
      "Bring to a boil, then reduce heat and simmer for 25 minutes.",
      "Season with salt and pepper.",
      "Garnish with fresh parsley before serving."
    ],
    categories: ["Winter", "Vegetarian", "Healthy", "Bulk"],
    prepTime: 15,
    cookTime: 30,
    servings: 6,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    createdBy: "user-1",
    createdAt: "2023-11-25T14:30:00Z",
    updatedAt: "2023-11-25T14:30:00Z",
    isFavorite: false,
  },
  {
    id: "recipe-21",
    title: "Spanish Tortilla",
    description: "Traditional Spanish potato and onion omelette.",
    ingredients: [
      "6 medium potatoes, peeled and sliced",
      "1 large onion, thinly sliced",
      "6 eggs",
      "200ml olive oil",
      "Salt to taste",
      "Fresh parsley for garnish"
    ],
    instructions: [
      "Heat olive oil in a large pan and add potatoes and onions.",
      "Cook on low heat for 20 minutes, turning occasionally.",
      "Beat eggs in a large bowl, add salt.",
      "Drain potatoes and onions, add to eggs, and let sit for 5 minutes.",
      "Heat 2 tbsp oil in a pan, add mixture, and cook on low for 5 minutes.",
      "Flip tortilla using a plate and cook for another 5 minutes.",
      "Serve warm or at room temperature."
    ],
    categories: ["Tapas", "Vegetarian", "Bulk"],
    prepTime: 15,
    cookTime: 35,
    servings: 6,
    image: "https://images.unsplash.com/photo-1607631568010-a87245c0dbd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    createdBy: "user-1",
    createdAt: "2023-06-10T11:00:00Z",
    updatedAt: "2023-06-10T11:00:00Z",
    isFavorite: false,
  }
  // More vegetarian recipes can be added here
];
