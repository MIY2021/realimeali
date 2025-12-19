export type IngredientCategory = 
  | "Fruit & Vegetables"
  | "Meat & Fish"
  | "Chilled Food"
  | "Bakery"
  | "Frozen Food"
  | "Food Cupboard"
  | "Snacks & Treats"
  | "World & Dietary"
  | "Drinks"
  | "Alcohol"
  | "Other";

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "Fruit & Vegetables",
  "Meat & Fish",
  "Chilled Food",
  "Bakery",
  "Frozen Food",
  "Food Cupboard",
  "Snacks & Treats",
  "World & Dietary",
  "Drinks",
  "Alcohol",
  "Other"
];

export const DEFAULT_INGREDIENT_CATEGORY: IngredientCategory = "Other";
