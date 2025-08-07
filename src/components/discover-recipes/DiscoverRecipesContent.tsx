import { useState } from "react";
import { DiscoverRecipesFilters } from "./DiscoverRecipesFilters";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";
import { DiscoverRecipeFilters } from "@/types/edamam";

export function DiscoverRecipesContent() {
  const [filters, setFilters] = useState<DiscoverRecipeFilters>({});
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (newFilters: DiscoverRecipeFilters) => {
    setFilters(newFilters);
    setHasSearched(true);
  };

  const handleReset = () => {
    setFilters({});
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      <DiscoverRecipesFilters onSearch={handleSearch} onReset={handleReset} />
      
      {hasSearched && (
        <DiscoverRecipesResults filters={filters} />
      )}
      
      {!hasSearched && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-6xl">🍳</div>
            <h3 className="text-xl font-semibold text-navy">Ready to discover amazing recipes?</h3>
            <p className="text-muted-foreground">
              Use the filters above to find the perfect recipe for your meal. 
              Choose your preferences and let's start cooking!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}