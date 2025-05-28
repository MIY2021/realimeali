
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FindRecipesFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  selectedIngredient: string;
  setSelectedIngredient: (ingredient: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  popularIngredients: string[];
}

export const FindRecipesFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedArea,
  setSelectedArea,
  selectedIngredient,
  setSelectedIngredient,
  onSearch,
  onClearFilters,
  onKeyPress,
  popularIngredients,
}: FindRecipesFiltersProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by recipe name or ingredient (e.g., 'chicken curry' or 'bacon')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={onKeyPress}
            className="w-full"
          />
        </div>
        <Button onClick={onSearch} className="bg-terracotta hover:bg-terracotta/90">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Category</SelectItem>
            <SelectItem value="Beef">Beef</SelectItem>
            <SelectItem value="Chicken">Chicken</SelectItem>
            <SelectItem value="Dessert">Dessert</SelectItem>
            <SelectItem value="Lamb">Lamb</SelectItem>
            <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
            <SelectItem value="Pasta">Pasta</SelectItem>
            <SelectItem value="Pork">Pork</SelectItem>
            <SelectItem value="Seafood">Seafood</SelectItem>
            <SelectItem value="Side">Side</SelectItem>
            <SelectItem value="Starter">Starter</SelectItem>
            <SelectItem value="Vegan">Vegan</SelectItem>
            <SelectItem value="Vegetarian">Vegetarian</SelectItem>
            <SelectItem value="Breakfast">Breakfast</SelectItem>
            <SelectItem value="Goat">Goat</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Cuisine</SelectItem>
            <SelectItem value="American">American</SelectItem>
            <SelectItem value="British">British</SelectItem>
            <SelectItem value="Canadian">Canadian</SelectItem>
            <SelectItem value="Chinese">Chinese</SelectItem>
            <SelectItem value="Croatian">Croatian</SelectItem>
            <SelectItem value="Dutch">Dutch</SelectItem>
            <SelectItem value="Egyptian">Egyptian</SelectItem>
            <SelectItem value="French">French</SelectItem>
            <SelectItem value="Greek">Greek</SelectItem>
            <SelectItem value="Indian">Indian</SelectItem>
            <SelectItem value="Irish">Irish</SelectItem>
            <SelectItem value="Italian">Italian</SelectItem>
            <SelectItem value="Jamaican">Jamaican</SelectItem>
            <SelectItem value="Japanese">Japanese</SelectItem>
            <SelectItem value="Kenyan">Kenyan</SelectItem>
            <SelectItem value="Malaysian">Malaysian</SelectItem>
            <SelectItem value="Mexican">Mexican</SelectItem>
            <SelectItem value="Moroccan">Moroccan</SelectItem>
            <SelectItem value="Polish">Polish</SelectItem>
            <SelectItem value="Portuguese">Portuguese</SelectItem>
            <SelectItem value="Russian">Russian</SelectItem>
            <SelectItem value="Spanish">Spanish</SelectItem>
            <SelectItem value="Thai">Thai</SelectItem>
            <SelectItem value="Tunisian">Tunisian</SelectItem>
            <SelectItem value="Turkish">Turkish</SelectItem>
            <SelectItem value="Unknown">Unknown</SelectItem>
            <SelectItem value="Vietnamese">Vietnamese</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Main Ingredient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Ingredient</SelectItem>
            {popularIngredients.map((ingredient) => (
              <SelectItem key={ingredient} value={ingredient}>
                {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onClearFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
};
