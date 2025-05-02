
import { Recipe } from "@/types";
import { bulkRecipes } from "./recipes_bulk";
import { easyRecipes } from "./recipes_easy";
import { specialRecipes } from "./recipes_special";
import { vegetarianRecipes } from "./recipes_veg";
import { snackRecipes } from "./recipes_snacks";

export { bulkRecipes, easyRecipes, specialRecipes, vegetarianRecipes, snackRecipes };

// Dedupe recipes by title + categories as a stable key
function dedupe(recipes: Recipe[]): Recipe[] {
  const seen = new Set();
  return recipes.filter((r) => {
    const key = r.title.trim().toLowerCase() + "|" + (r.categories?.join(",") || "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const mockRecipes: Recipe[] = dedupe([
  ...bulkRecipes,
  ...easyRecipes,
  ...specialRecipes,
  ...vegetarianRecipes,
  ...snackRecipes,
]);
