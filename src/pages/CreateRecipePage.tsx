
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function CreateRecipePage() {
  useDocumentTitle("Add Recipe | RealiMeali");
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CreateRecipeContainer />
    </div>
  );
}
