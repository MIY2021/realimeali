
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { FindRecipesHeader } from "@/components/find-recipes/FindRecipesHeader";
import { FindRecipesContent } from "@/components/find-recipes/FindRecipesContent";
import { useIsMobile } from "@/hooks/use-mobile";

export default function FindRecipesPage() {
  useDocumentTitle("Find Recipes | RealiMeali");
  const isMobile = useIsMobile();

  return (
    <div className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'bg-white min-h-screen' : ''}`}>
      <FindRecipesHeader />
      <FindRecipesContent />
    </div>
  );
}
