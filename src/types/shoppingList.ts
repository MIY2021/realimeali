
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  consolidatedQuantity?: number;
  consolidatedUnit?: string;
  sourceIngredients?: string[];
  isChecked: boolean;
  isCustom: boolean;
  recipeIds: string[];
  createdAt?: string;
  createdBy?: string;
}

export interface ConsolidatedShoppingList {
  [key: string]: ShoppingListItem[];
}

// Remove categories since we're going category-free
export const SHOPPING_CATEGORIES: string[] = [];
