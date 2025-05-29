
export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  instructions?: string;
  extendedIngredients?: Array<{
    id: number;
    original: string;
    name: string;
    amount: number;
    unit: string;
  }>;
}
