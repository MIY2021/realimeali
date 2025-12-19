import { ShoppingListItem } from "@/types/shoppingList";
import { INGREDIENT_CATEGORIES } from "@/types/ingredientCategories";

export type SortOption = "none" | "category" | "recipe";

export interface GroupedShoppingListItem {
  groupKey: string;
  groupLabel: string;
  items: ShoppingListItem[];
}

/**
 * Groups shopping list items by category
 */
export function groupByCategory(items: ShoppingListItem[]): GroupedShoppingListItem[] {
  const grouped = new Map<string, ShoppingListItem[]>();
  
  // Define category order
  const categoryOrder = INGREDIENT_CATEGORIES;
  
  items.forEach(item => {
    const category = item.category || "Other";
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(item);
  });
  
  // Sort categories according to defined order, then alphabetically for any extras
  const sortedGroups: GroupedShoppingListItem[] = [];
  
  // Add categories in defined order
  categoryOrder.forEach(category => {
    if (grouped.has(category)) {
      sortedGroups.push({
        groupKey: category,
        groupLabel: category,
        items: grouped.get(category)!
      });
      grouped.delete(category);
    }
  });
  
  // Add any remaining categories alphabetically
  Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([category, items]) => {
      sortedGroups.push({
        groupKey: category,
        groupLabel: category,
        items
      });
    });
  
  return sortedGroups;
}

/**
 * Groups shopping list items by recipe
 */
export function groupByRecipe(
  items: ShoppingListItem[],
  getRecipeNames: (recipeIds: string[]) => string
): GroupedShoppingListItem[] {
  const grouped = new Map<string, ShoppingListItem[]>();
  
  items.forEach(item => {
    const recipeIds = item.recipeIds || [];
    let groupKey: string;
    let groupLabel: string;
    
    if (recipeIds.length === 0) {
      // Custom items or items without recipes
      groupKey = "Custom Items";
      groupLabel = "Custom Items";
    } else {
      // Use the first recipe name as the group key
      const recipeName = getRecipeNames(recipeIds);
      groupKey = recipeName;
      groupLabel = recipeName;
    }
    
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }
    grouped.get(groupKey)!.push(item);
  });
  
  // Sort groups alphabetically, but put "Custom Items" at the end
  const sortedGroups: GroupedShoppingListItem[] = [];
  const customItems = grouped.get("Custom Items");
  
  Array.from(grouped.entries())
    .filter(([key]) => key !== "Custom Items")
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([key, items]) => {
      sortedGroups.push({
        groupKey: key,
        groupLabel: key,
        items
      });
    });
  
  if (customItems) {
    sortedGroups.push({
      groupKey: "Custom Items",
      groupLabel: "Custom Items",
      items: customItems
    });
  }
  
  return sortedGroups;
}

/**
 * Groups shopping list items based on sort option
 */
export function groupShoppingListItems(
  items: ShoppingListItem[],
  sortOption: SortOption,
  getRecipeNames: (recipeIds: string[]) => string
): GroupedShoppingListItem[] | ShoppingListItem[] {
  if (sortOption === "none") {
    return items;
  }
  
  if (sortOption === "category") {
    return groupByCategory(items);
  }
  
  if (sortOption === "recipe") {
    return groupByRecipe(items, getRecipeNames);
  }
  
  return items;
}
