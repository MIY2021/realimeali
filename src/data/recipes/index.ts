import { Recipe } from "@/types";
import { bulkRecipes } from "./recipes_bulk";
import { easyRecipes } from "./recipes_easy";
import { specialRecipes } from "./recipes_special";
import { vegetarianRecipes } from "./recipes_veg";

export { bulkRecipes, easyRecipes, specialRecipes, vegetarianRecipes };

// Remove duplicate recipes by title+first category
function dedupe(recipes: Recipe[]): Recipe[] {
  const seen = new Set();
  return recipes.filter((r) => {
    const key = r.title.trim().toLowerCase() + "|" + (r.categories[0] || "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Already deduping — but let's reinforce strict deduplication by title + all categories as a stable key
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
]);
