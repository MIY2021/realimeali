
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
    import_method: searchParams.get('import_method') || 'manual'
  };

  // Check if we have AI recipe data
  const hasAiData = aiRecipeData.title && aiRecipeData.ingredients.length > 0;
  
  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      <CreateRecipeContainer 
        editingRecipe={hasAiData ? aiRecipeData : undefined}
        isEditMode={false}
      />
    </div>
  );
}
