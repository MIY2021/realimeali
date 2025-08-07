import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiscoverRecipesContent } from "@/components/discover-recipes/DiscoverRecipesContent";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DiscoverRecipesPage() {
  useDocumentTitle("Discover Recipes | RealiMeali");
  const isMobile = useIsMobile();

  return (
    <div className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'bg-white min-h-screen' : ''}`} data-scroll-content>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Discover Recipes</h1>
            <p className="text-muted-foreground mt-1">
              Explore amazing recipes from our community and beyond
            </p>
          </div>
        </div>
        <DiscoverRecipesContent />
      </div>
    </div>
  );
}