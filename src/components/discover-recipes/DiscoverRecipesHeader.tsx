import { Search } from "lucide-react";

export function DiscoverRecipesHeader() {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-start">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
          <Search className="h-6 w-6 sm:h-8 sm:w-8 text-sage" />
          <span>Discover Recipes</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore thousands of recipes from around the world. Filter by cuisine, meal type, dietary preferences and more.
        </p>
      </div>
    </div>
  );
}