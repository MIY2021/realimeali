import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiscoverRecipesHeader } from "@/components/discover-recipes/DiscoverRecipesHeader";
import { DiscoverRecipesContent } from "@/components/discover-recipes/DiscoverRecipesContent";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DiscoverRecipesPage() {
  useDocumentTitle("Discover Recipes | RealiMeali");
  const isMobile = useIsMobile();

  return (
    <div className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'bg-white min-h-screen' : ''}`} data-scroll-content>
      <DiscoverRecipesHeader />
      <DiscoverRecipesContent />
    </div>
  );
}