
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function CreateRecipePage() {
  useDocumentTitle("Add Recipe | RealiMeali");
  const [searchParams] = useSearchParams();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Extract URL and auto flag
  const urlParam = searchParams.get('url');
  const autoParam = searchParams.get('auto');
  
  // Extract recipe data from URL parameters (from AI chat)
  const aiRecipeData = {
    title: searchParams.get('title') || '',
    ingredients: searchParams.get('ingredients') ? JSON.parse(searchParams.get('ingredients')!) : [],
    instructions: searchParams.get('instructions') ? JSON.parse(searchParams.get('instructions')!) : [],
    servings: parseInt(searchParams.get('servings') || '4'),
    prep_time: parseInt(searchParams.get('prep_time') || '15'),
    cook_time: parseInt(searchParams.get('cook_time') || '20'),
    description: searchParams.get('description') || '',
    meal_types: searchParams.get('meal_types') ? JSON.parse(searchParams.get('meal_types')!) : [],
    cuisine_region: searchParams.get('cuisine_region') || '',
    diet_lifestyle: searchParams.get('diet_lifestyle') ? JSON.parse(searchParams.get('diet_lifestyle')!) : [],
    equipment: searchParams.get('equipment') ? JSON.parse(searchParams.get('equipment')!) : [],
    import_method: searchParams.get('import_method') || 'manual'
  };

  // Get the target tab from URL params
  const targetTab = searchParams.get('tab') || 'url';
  const isCustomMeal = searchParams.get('source') === 'custom-meal';
  const customMealType = searchParams.get('meal_type') || '';
  const customMealTitle = searchParams.get('title') || '';
  const customMealServings = parseInt(searchParams.get('servings') || '1');

  // Check if we have AI recipe data
  const hasAiData = aiRecipeData.title && aiRecipeData.ingredients.length > 0;

  const initialRecipeData = isCustomMeal
    ? {
        ...aiRecipeData,
        title: customMealTitle,
        servings: customMealServings,
        meal_types: customMealType ? [customMealType] : [],
        import_method: 'custom_meal',
      }
    : aiRecipeData;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#FAF9F6]">
      <div className="container max-w-5xl py-4 px-2 sm:py-6 sm:px-4">
        <CreateRecipeContainer 
          editingRecipe={hasAiData ? initialRecipeData : undefined}
          isEditMode={false}
          defaultTab={hasAiData || urlParam ? targetTab : undefined}
        />
      </div>
    </div>
  );
}
