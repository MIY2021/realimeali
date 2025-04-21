
import { Recipe } from "@/types";
import { bulkRecipes } from "./recipes_bulk";
import { easyRecipes } from "./recipes_easy";
import { specialRecipes } from "./recipes_special";
import { vegetarianRecipes } from "./recipes_veg";

// Export each group in case you need them individually
export { bulkRecipes, easyRecipes, specialRecipes, vegetarianRecipes };

// Concatenate all arrays to provide a mockRecipes master list
export const mockRecipes: Recipe[] = [
  ...bulkRecipes,
  ...easyRecipes,
  ...specialRecipes,
  ...vegetarianRecipes,
];
