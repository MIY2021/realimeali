
import { Recipe } from "@/types";
import { bulkRecipes } from "./recipes/recipes_bulk";
import { easyRecipes } from "./recipes/recipes_easy";
import { specialRecipes } from "./recipes/recipes_special";
import { vegetarianRecipes } from "./recipes/recipes_veg";

// Concatenate all arrays to provide a mockRecipes master list
export const mockRecipes: Recipe[] = [
  ...bulkRecipes,
  ...easyRecipes,
  ...specialRecipes,
  ...vegetarianRecipes,
];

// You can add: export * from "./recipes/recipes_bulk"; etc, if direct access is needed

