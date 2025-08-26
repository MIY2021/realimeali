import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { DiscoverRecipeFilters } from "@/types/edamam";
import { DiscoverRecipesFilters } from "./DiscoverRecipesFilters";
import { DiscoverRecipesResults } from "./DiscoverRecipesResults";

export function DiscoverRecipesContent() {
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [apiFilters, setApiFilters] = useState<DiscoverRecipeFilters | null>(null);
  const [filters, setFilters] = useState({
    mealTypes: [] as string[],
    cuisineTypes: [] as string[],
    cookingDurations: [] as string[],
    dietLifestyle: [] as string[],
  });

  const handleSearch = () => {
    const searchFilters: DiscoverRecipeFilters = {
      keyword: keyword.trim() || undefined,
      mealType: filters.mealTypes[0] || undefined, // Take first selected meal type
      cuisineType: filters.cuisineTypes[0] || undefined, // Take first selected cuisine
      time: filters.cookingDurations[0] || undefined, // Take first selected duration
      diet: filters.dietLifestyle.length > 0 ? filters.dietLifestyle : undefined,
    };

    // Only search if we have some criteria
    if (searchFilters.keyword || searchFilters.mealType || searchFilters.cuisineType || searchFilters.time || searchFilters.diet?.length) {
      setApiFilters(searchFilters);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setSortBy("newest");
    setFilters({
      mealTypes: [],
      cuisineTypes: [],
      cookingDurations: [],
      dietLifestyle: [],
    });
    setApiFilters(null);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            placeholder="Search recipes..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleSearch}
          className="h-10 px-6"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Filters */}
      <DiscoverRecipesFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />

      {/* Results */}
      {apiFilters && (
        <DiscoverRecipesResults filters={apiFilters} />
      )}

      {!apiFilters && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-xl font-semibold text-navy">Ready to discover something tasty? Tap Search to fetch recipes!</h3>
            <p className="text-muted-foreground">
              Use the filters above to search through millions of recipes from around the web!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}