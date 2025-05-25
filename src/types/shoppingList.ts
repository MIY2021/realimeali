
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
  isChecked: boolean;
  isCustom: boolean;
  recipeIds: string[];
}

export interface ShoppingListCategory {
  [key: string]: ShoppingListItem[];
}

export const SHOPPING_CATEGORIES = [
  "Fresh & Chilled Food",
  "Food Cupboard", 
  "Bakery",
  "Frozen Food",
  "Dietary, Lifestyle & World Foods",
  "Soft Drinks, Tea & Coffee",
  "Beer, Wine & Spirits",
  "Health, Beauty & Personal Care",
  "Baby, Parent & Kids",
  "Home Care & Cleaning",
  "Pets, Home & Garden",
  "Occasions & Entertaining",
  "Clothing & Accessories"
];
