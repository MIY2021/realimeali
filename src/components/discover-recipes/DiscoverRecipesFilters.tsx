import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, Clock, MapPin, UtensilsCrossed, Heart, RotateCcw } from "lucide-react";
import { DiscoverRecipeFilters } from "@/types/edamam";

interface DiscoverRecipesFiltersProps {
  onSearch: (filters: DiscoverRecipeFilters) => void;
  onReset: () => void;
  communityOnly: boolean;
  onCommunityToggle: (enabled: boolean) => void;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", icon: "🌅" },
  { value: "lunch", label: "Lunch", icon: "☀️" },
  { value: "dinner", label: "Dinner", icon: "🌙" },
  { value: "snack", label: "Snacks", icon: "🍿" },
  { value: "teatime", label: "Sides", icon: "🥗" },
];

const CUISINE_TYPES = [
  { value: "british", label: "British", icon: "🫖" },
  { value: "american", label: "American", icon: "🍔" },
  { value: "italian", label: "Italian", icon: "🍝" },
  { value: "french", label: "French", icon: "🥖" },
  { value: "mexican", label: "Mexican", icon: "🌮" },
  { value: "indian", label: "Indian", icon: "🍛" },
  { value: "chinese", label: "Chinese", icon: "🥡" },
  { value: "japanese", label: "Japanese", icon: "🍣" },
  { value: "asian", label: "Thai", icon: "🍜" },
  { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
  { value: "middle eastern", label: "Middle Eastern", icon: "🥙" },
  { value: "caribbean", label: "Caribbean", icon: "🏝️" },
  { value: "korean", label: "Korean", icon: "🍲" },
  { value: "nordic", label: "Nordic", icon: "❄️" },
  { value: "eastern europe", label: "Eastern European", icon: "🏰" },
  { value: "kosher", label: "Greek", icon: "🧄" },
];

const DIET_OPTIONS = [
  { value: "balanced", label: "Balanced" },
  { value: "high-fiber", label: "High Fiber" },
  { value: "high-protein", label: "High Protein" },
  { value: "low-carb", label: "Low Carb" },
  { value: "low-fat", label: "Low Fat" },
  { value: "low-sodium", label: "Low Sodium" },
];

const HEALTH_OPTIONS = [
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

const TIME_OPTIONS = [
  { value: "1-15", label: "Under 15 mins", icon: "⚡" },
  { value: "15-30", label: "15-30 mins", icon: "⏱️" },
  { value: "30-60", label: "30-60 mins", icon: "🕐" },
  { value: "60+", label: "Over 1 hour", icon: "🕰️" },
];

export function DiscoverRecipesFilters({ onSearch, onReset, communityOnly, onCommunityToggle }: DiscoverRecipesFiltersProps) {
  const [keyword, setKeyword] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleDietToggle = (diet: string) => {
    setSelectedDiets(prev => 
      prev.includes(diet) 
        ? prev.filter(d => d !== diet)
        : [...prev, diet]
    );
  };

  const handleSearch = () => {
    const filters: DiscoverRecipeFilters = {
      keyword: keyword.trim() || undefined,
      mealType: selectedMealType || undefined,
      cuisineType: selectedCuisine || undefined,
      diet: selectedDiets.length > 0 ? selectedDiets : undefined,
      time: selectedTime || undefined,
    };

    // At least one filter must be selected
    if (!filters.keyword && !filters.mealType && !filters.cuisineType && !filters.diet?.length && !filters.time) {
      return;
    }

    onSearch(filters);
  };

  const handleReset = () => {
    setKeyword("");
    setSelectedMealType("");
    setSelectedCuisine("");
    setSelectedDiets([]);
    setSelectedTime("");
    onReset();
  };

  const isSearchDisabled = !keyword.trim() && !selectedMealType && !selectedCuisine && selectedDiets.length === 0 && !selectedTime;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Community Only Toggle */}
          <div className="flex items-center justify-between p-4 bg-sage/10 rounded-lg">
            <div className="space-y-1">
              <label className="text-sm font-medium text-navy">
                RealiMeali Community Only
              </label>
              <p className="text-xs text-muted-foreground">
                Show only recipes from our community members
              </p>
            </div>
            <Switch
              checked={communityOnly}
              onCheckedChange={onCommunityToggle}
            />
          </div>
          {/* Keyword Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-navy flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search by ingredient or dish
            </label>
            <Input
              placeholder="e.g., chicken, pasta, chocolate..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Meal Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-navy flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Meal Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {MEAL_TYPES.map((meal) => (
                <Button
                  key={meal.value}
                  variant={selectedMealType === meal.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMealType(selectedMealType === meal.value ? "" : meal.value)}
                  className="h-auto p-3 flex flex-col items-center gap-1"
                >
                  <span className="text-lg">{meal.icon}</span>
                  <span className="text-xs">{meal.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Cuisine Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-navy flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Cuisine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {CUISINE_TYPES.map((cuisine) => (
                <Button
                  key={cuisine.value}
                  variant={selectedCuisine === cuisine.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCuisine(selectedCuisine === cuisine.value ? "" : cuisine.value)}
                  className="h-auto p-3 flex flex-col items-center gap-1"
                >
                  <span className="text-lg">{cuisine.icon}</span>
                  <span className="text-xs">{cuisine.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Complexity */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-navy flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cooking Time
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_OPTIONS.map((time) => (
                <Button
                  key={time.value}
                  variant={selectedTime === time.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(selectedTime === time.value ? "" : time.value)}
                  className="h-auto p-3 flex flex-col items-center gap-1"
                >
                  <span className="text-lg">{time.icon}</span>
                  <span className="text-xs">{time.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Diet & Health Labels */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-navy flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Dietary Preferences
            </label>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Diet Types</h4>
                <div className="flex flex-wrap gap-2">
                  {DIET_OPTIONS.map((diet) => (
                    <Badge
                      key={diet.value}
                      variant={selectedDiets.includes(diet.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleDietToggle(diet.value)}
                    >
                      {diet.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Health Labels</h4>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_OPTIONS.map((health) => (
                    <Badge
                      key={health.value}
                      variant={selectedDiets.includes(health.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleDietToggle(health.value)}
                    >
                      {health.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSearch}
              disabled={isSearchDisabled}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              Discover Recipes
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              size="icon"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}