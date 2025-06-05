
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function CreateRecipePage() {
  useDocumentTitle("Add Recipe | RealiMeali");
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl py-6 px-4 sm:py-8 sm:px-6">
        <CreateRecipeContainer />
      </div>
    </div>
  );
}
