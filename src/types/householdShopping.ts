
export interface HouseholdShoppingItem {
  id: string;
  household_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
  is_checked: boolean;
  is_custom: boolean;
  recipe_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdRecipeCategory {
  id: string;
  household_id: string;
  name: string;
  created_by: string;
  created_at: string;
}
