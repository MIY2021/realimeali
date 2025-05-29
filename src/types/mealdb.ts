
export interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  ingredients: string[];
  strSource?: string;
}
