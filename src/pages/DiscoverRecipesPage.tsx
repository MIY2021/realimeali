import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiscoverRecipesContent } from "@/components/discover-recipes/DiscoverRecipesContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search } from "lucide-react";

export default function DiscoverRecipesPage() {
  useDocumentTitle("Discover Recipes | RealiMeali");
  const isMobile = useIsMobile();

  return (
    <div className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'min-h-screen' : ''}`} data-scroll-content>
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] flex items-center gap-2">
            <Search className="h-6 w-6 sm:h-7 sm:w-7 text-[#F5B82E]" />
            Discover Recipes
          </h1>
          <p className="text-sm text-[#6B7280]">
            Browse featured recipes and find inspiration from around the web.
          </p>
        </div>
      </div>
      <DiscoverRecipesContent />
    </div>
  );
}