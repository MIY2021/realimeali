import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiscoverRecipesContent } from "@/components/discover-recipes/DiscoverRecipesContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DiscoverRecipesPage() {
  useDocumentTitle("Discover Recipes | RealiMeali");
  const isMobile = useIsMobile();

  return (
    <div className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'min-h-screen' : ''}`} data-scroll-content>
      <PageHeader
        icon={Search}
        title="Discover Recipes"
        description="Browse featured recipes and find inspiration from around the web."
      />
      <DiscoverRecipesContent />
    </div>
  );
}