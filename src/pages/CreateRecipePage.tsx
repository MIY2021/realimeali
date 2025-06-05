
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function CreateRecipePage() {
  useDocumentTitle("Add Recipe | RealiMeali");
  
  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      <CreateRecipeContainer />
    </div>
  );
}
