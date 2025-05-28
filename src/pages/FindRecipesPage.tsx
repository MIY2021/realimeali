
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { FindRecipesHeader } from "@/components/find-recipes/FindRecipesHeader";
import { FindRecipesContent } from "@/components/find-recipes/FindRecipesContent";

export default function FindRecipesPage() {
  useDocumentTitle("Find Recipes | RealiMeali");

  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      <FindRecipesHeader />
      <FindRecipesContent />
    </div>
  );
}
