import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DiscoverRecipesContent } from "@/components/discover-recipes/DiscoverRecipesContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { DiscoverRecipeIcon } from "@/components/icons/RealiMealiIcons";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DiscoverRecipesPage() {
  useDocumentTitle("Discover Recipes | RealiMeali");
  const isMobile = useIsMobile();

  return (
    <div className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'min-h-screen' : ''}`} data-scroll-content>
      <PageHeader
        icon={
          <DiscoverRecipeIcon 
            className="h-6 w-6 sm:h-7 sm:w-7" 
            style={{ color: '#F5B82E', stroke: '#F5B82E' }}
            aria-hidden="true"
          />
        }
        title="Discover Recipes"
        description="Browse featured recipes and find inspiration from around the web. Use search and filters to discover millions more recipes."
        visuallyHidden
      />
      <DiscoverRecipesContent />
    </div>
  );
}