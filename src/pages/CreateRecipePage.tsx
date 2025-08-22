
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function CreateRecipePage() {
  useDocumentTitle("Add Recipe | RealiMeali");
  const [searchParams] = useSearchParams();
  
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
    // complexity_level removed
    diet_lifestyle: searchParams.get('diet_lifestyle') ? JSON.parse(searchParams.get('diet_lifestyle')!) : [],
    equipment: searchParams.get('equipment') ? JSON.parse(searchParams.get('equipment')!) : [],
    import_method: searchParams.get('import_method') || 'manual'
  };

  // Get the target tab from URL params
  const targetTab = searchParams.get('tab') || 'url';

  // Check if we have AI recipe data
  const hasAiData = aiRecipeData.title && aiRecipeData.ingredients.length > 0;
  
  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      <CreateRecipeContainer 
        editingRecipe={hasAiData ? aiRecipeData : undefined}
        isEditMode={false}
        defaultTab={hasAiData ? targetTab : undefined}
      />
    </div>
  );
}
