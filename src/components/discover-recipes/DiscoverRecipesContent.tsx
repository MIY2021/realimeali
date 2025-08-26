import { useState } from "react";
import { DiscoverRecipeFilters } from "@/types/edamam";
import { DiscoverRecipesFilters } from "./DiscoverRecipesFilters";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";

export function DiscoverRecipesContent() {
  const [apiFilters, setApiFilters] = useState<DiscoverRecipeFilters | null>(null);

  const handleSearch = (filters: DiscoverRecipeFilters) => {
    setApiFilters(filters);
  };

  const handleReset = () => {
    setApiFilters(null);
  };

  return (
    <div className="space-y-6">
      <DiscoverRecipesFilters 
        onSearch={handleSearch}
        onReset={handleReset}
      />
      
      {apiFilters && (
        <DiscoverRecipesResults filters={apiFilters} />
      )}

      {!apiFilters && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-xl font-semibold text-navy">Ready to discover something tasty?</h3>
            <p className="text-muted-foreground">
              Use the filters above to search through millions of recipes from around the web!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}