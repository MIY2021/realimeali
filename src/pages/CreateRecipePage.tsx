
import { CreateRecipeContainer } from "@/components/recipes/create/CreateRecipeContainer";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function CreateRecipePage() {
  useDocumentTitle("Add New Recipe | RealiMeali");
  
  return (
    <div className="min-h-screen bg-cream">
      <div className="container max-w-4xl mx-auto py-3 px-4 space-y-6">
        <CreateRecipeContainer />
      </div>
    </div>
  );
}
