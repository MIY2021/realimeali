import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import { DiscoverRecipeFilters } from "@/types/edamam";

interface DiscoverRecipesFiltersProps {
  onSearch: (filters: DiscoverRecipeFilters) => void;
  onReset: () => void;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snacks" },
  { value: "teatime", label: "Sides" },
];

const CUISINE_TYPES = [
  { value: "british", label: "British" },
  { value: "american", label: "American" },
  { value: "italian", label: "Italian" },
  { value: "french", label: "French" },
  { value: "mexican", label: "Mexican" },
  { value: "indian", label: "Indian" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "asian", label: "Thai" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "middle eastern", label: "Middle Eastern" },
  { value: "caribbean", label: "Caribbean" },
  { value: "korean", label: "Korean" },
  { value: "nordic", label: "Nordic" },
  { value: "eastern europe", label: "Eastern European" },
  { value: "kosher", label: "Greek" },
];

const TIME_OPTIONS = [
  { value: "1-15", label: "Under 15 mins" },
  { value: "15-30", label: "15-30 mins" },
  { value: "30-60", label: "30-60 mins" },
  { value: "60+", label: "Over 1 hour" },
];

const DIET_OPTIONS = [
  { value: "balanced", label: "Balanced" },
  { value: "high-fiber", label: "High Fiber" },
  { value: "high-protein", label: "High Protein" },
  { value: "low-carb", label: "Low Carb" },
  { value: "low-fat", label: "Low Fat" },
  { value: "low-sodium", label: "Low Sodium" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "paleo", label: "Paleo" },
  { value: "dairy-free", label: "Dairy Free" },
  { value: "gluten-free", label: "Gluten Free" },
  { value: "wheat-free", label: "Wheat Free" },
  { value: "egg-free", label: "Egg Free" },
  { value: "pork-free", label: "Pork Free" },
  { value: "red-meat-free", label: "Red Meat Free" },
  { value: "fish-free", label: "Fish Free" },
  { value: "shellfish-free", label: "Shellfish Free" },
  { value: "tree-nut-free", label: "Tree Nut Free" },
  { value: "peanut-free", label: "Peanut Free" },
];

export function DiscoverRecipesFilters({ onSearch, onReset }: DiscoverRecipesFiltersProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDiet, setSelectedDiet] = useState<string>("");

  const handleSearch = () => {
    const filters: DiscoverRecipeFilters = {
      keyword: keyword.trim() || undefined,
      mealType: selectedMealType || undefined,
      cuisineType: selectedCuisine || undefined,
      time: selectedTime || undefined,
      diet: selectedDiet ? [selectedDiet] : undefined,
    };

    // At least one filter must be selected
    if (!filters.keyword && !filters.mealType && !filters.cuisineType && !filters.time && !filters.diet?.length) {
      return;
    }

    onSearch(filters);
  };

  const handleReset = () => {
    setKeyword("");
    setSelectedMealType("");
    setSelectedCuisine("");
    setSelectedTime("");
    setSelectedDiet("");
    onReset();
  };

  const isSearchDisabled = !keyword.trim() && !selectedMealType && !selectedCuisine && !selectedTime && !selectedDiet;

  return (
    <div className="space-y-4">
      {/* Search Row */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            placeholder="Search by ingredient or dish name..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-10"
          />
        </div>
        <Select value={selectedMealType} onValueChange={setSelectedMealType}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="All recipes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All recipes</SelectItem>
            {MEAL_TYPES.map((meal) => (
              <SelectItem key={meal.value} value={meal.value}>
                {meal.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleSearch}
          disabled={isSearchDisabled}
          className="h-10 px-6"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Filter Buttons Row */}
      <div className="flex flex-wrap gap-2">
        <Select value={selectedMealType} onValueChange={setSelectedMealType}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Meal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Meals</SelectItem>
            {MEAL_TYPES.map((meal) => (
              <SelectItem key={meal.value} value={meal.value}>
                {meal.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Cuisines</SelectItem>
            {CUISINE_TYPES.map((cuisine) => (
              <SelectItem key={cuisine.value} value={cuisine.value}>
                {cuisine.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTime} onValueChange={setSelectedTime}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Duration</SelectItem>
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time.value} value={time.value}>
                {time.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDiet} onValueChange={setSelectedDiet}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Diet & Lifestyle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Diets</SelectItem>
            {DIET_OPTIONS.map((diet) => (
              <SelectItem key={diet.value} value={diet.value}>
                {diet.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={handleReset}
          size="sm"
          className="h-10"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}