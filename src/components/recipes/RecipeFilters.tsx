
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileLayoutSelector } from "./MobileLayoutSelector";

interface RecipeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortType: string;
  onSortChange: (value: string) => void;
  mobileLayout: string;
  onMobileLayoutChange: (value: string) => void;
}

export function RecipeFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortType,
  onSortChange,
  mobileLayout,
  onMobileLayoutChange,
}: RecipeFiltersProps) {
  const { recipeCategories } = useHouseholdShopping();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
        
        {/* Mobile Layout Dropdown - compact design */}
        {isMobile && (
          <MobileLayoutSelector 
            value={mobileLayout} 
            onChange={onMobileLayoutChange} 
          />
        )}
      </div>
      
      <div className="w-full sm:w-48 relative">
        <select
          value={categoryFilter}
          onChange={e => onCategoryChange(e.target.value)}
          className="w-full border rounded p-2 pr-8 appearance-none bg-white text-sm sm:text-base"
        >
          <option value="all">All Categories</option>
          {recipeCategories.map((category) => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
      </div>
      <div className="w-full sm:w-48">
        <Select value={sortType} onValueChange={onSortChange}>
          <SelectTrigger className="text-sm sm:text-base">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
            <SelectItem value="prep-asc">Prep Time (Low to High)</SelectItem>
            <SelectItem value="prep-desc">Prep Time (High to Low)</SelectItem>
            <SelectItem value="date-newest">Date Added (Newest)</SelectItem>
            <SelectItem value="date-oldest">Date Added (Oldest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
