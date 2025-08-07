export interface EdamamRecipe {
  uri: string;
  label: string;
  image: string;
  source: string;
  url: string;
  shareAs: string;
  yield: number;
  dietLabels: string[];
  healthLabels: string[];
  cautions: string[];
  ingredientLines: string[];
  ingredients: EdamamIngredient[];
  calories: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  totalNutrients: Record<string, EdamamNutrient>;
}

export interface EdamamIngredient {
  text: string;
  quantity: number;
  measure: string;
  food: string;
  weight: number;
  foodCategory: string;
  foodId: string;
  image: string;
}

export interface EdamamNutrient {
  label: string;
  quantity: number;
  unit: string;
}

export interface EdamamApiResponse {
  q: string;
  from: number;
  to: number;
  more: boolean;
  count: number;
  hits: EdamamHit[];
}

export interface EdamamHit {
  recipe: EdamamRecipe;
  _links: {
    self: {
      href: string;
      title: string;
    };
  };
}

export interface DiscoverRecipeFilters {
  mealType?: string;
  cuisineType?: string;
  diet?: string[];
  time?: string;
  keyword?: string;
  from?: number;
  to?: number;
}

export interface PaginatedEdamamResponse extends EdamamApiResponse {
  hasMore: boolean;
  nextFrom: number;
  totalFetched: number;
}

export interface CachedRecipeResult {
  id: string;
  query_hash: string;
  filters: DiscoverRecipeFilters;
  keyword?: string;
  results: EdamamHit[];
  created_at: string;
  expires_at: string;
}