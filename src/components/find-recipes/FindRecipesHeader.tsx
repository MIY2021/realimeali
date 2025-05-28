
import { Search, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const FindRecipesHeader = () => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-start">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
          <Search className="h-6 w-6 sm:h-8 sm:w-8 text-terracotta" />
          <span>Find Recipes</span>
        </h1>
        <div className="flex items-start gap-2">
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover thousands of free recipes from TheMealDB
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Search by recipe name, ingredient, or use filters to find recipes. Filters automatically apply when selected.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
