import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiscoverRecipesContent } from "@/components/discover-recipes/DiscoverRecipesContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search } from "lucide-react";

export default function DiscoverRecipesPage() {
  useDocumentTitle("Discover Recipes | RealiMeali");
  const isMobile = useIsMobile();

  return (
    <div className={`container max-w-7xl mx-auto py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'bg-white min-h-screen' : ''}`} data-scroll-content>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-sage" />
              Discover Recipes
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Recipe discovery features are being restructured
            </p>
          </div>
        </div>
        <DiscoverRecipesContent />
      </div>
    </div>
  );
}