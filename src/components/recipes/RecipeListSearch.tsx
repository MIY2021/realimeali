
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipeListSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: "title" | "prepTime" | "cookTime" | "dateAdded";
  setSortBy: (sortBy: "title" | "prepTime" | "cookTime" | "dateAdded") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  isMobile?: boolean;
}

export function RecipeListSearch({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  isMobile = false,
}: RecipeListSearchProps) {
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy as "title" | "prepTime" | "cookTime" | "dateAdded");
    setSortOrder(newSortOrder as "asc" | "desc");
  };

  return (
    <div className={isMobile ? "grid grid-cols-2 gap-2" : "flex gap-3 mb-6"}>
      <div className={isMobile ? "" : "flex-1"}>
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full ${isMobile ? 'text-sm' : ''}`}
        />
      </div>
      
      <div className={isMobile ? "" : "w-32 sm:w-48"}>
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
          <SelectTrigger className={isMobile ? "text-sm" : "text-sm sm:text-base"}>
            <SelectValue placeholder={isMobile ? "Sort" : "Sort by"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateAdded-desc">Newest First</SelectItem>
            <SelectItem value="dateAdded-asc">Oldest First</SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
            <SelectItem value="prepTime-asc">{isMobile ? 'Prep Time ↑' : 'Prep Time (Low to High)'}</SelectItem>
            <SelectItem value="prepTime-desc">{isMobile ? 'Prep Time ↓' : 'Prep Time (High to Low)'}</SelectItem>
            <SelectItem value="cookTime-asc">{isMobile ? 'Cook Time ↑' : 'Cook Time (Low to High)'}</SelectItem>
            <SelectItem value="cookTime-desc">{isMobile ? 'Cook Time ↓' : 'Cook Time (High to Low)'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
