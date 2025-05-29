
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw } from "lucide-react";

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onClearAll: () => void;
  onToggle: () => void;
  isOpen: boolean;
}

export function FilterHeader({
  hasActiveFilters,
  activeFilterCount,
  onClearAll,
  onToggle,
  isOpen
}: FilterHeaderProps) {
  if (!isOpen) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 flex items-center justify-center p-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Filter Recipes</h3>
      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Clear All
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
