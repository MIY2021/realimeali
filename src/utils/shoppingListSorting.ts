import { ShoppingListItem } from "@/types/shoppingList";
import { INGREDIENT_CATEGORIES } from "@/types/ingredientCategories";

export type SortOption = "none" | "category";

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
 * Groups shopping list items based on sort option
 */
export function groupShoppingListItems(
  items: ShoppingListItem[],
  sortOption: SortOption
): GroupedShoppingListItem[] | ShoppingListItem[] {
  if (sortOption === "none") {
    return items;
  }
  
  if (sortOption === "category") {
    return groupByCategory(items);
  }
  
  return items;
}
