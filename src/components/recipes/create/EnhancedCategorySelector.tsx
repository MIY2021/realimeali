
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RecipeCategory } from "@/types";
import { X, Plus, Tag } from "lucide-react";

const PREDEFINED_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", "Super Tasty",
  "Pasta", "Tapas", "Winter", "BBQ", "Faffy", "Pricey!", "Not Yet Made",
  "Snacks", "Breakfast", "Lunch"
];

const CATEGORY_COLORS: Record<string, string> = {
  "Easy": "bg-green-100 text-green-800 hover:bg-green-200",
  "Healthy": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "Vegetarian": "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  "Super Tasty": "bg-orange-100 text-orange-800 hover:bg-orange-200",
  "Cheap": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  "Pricey!": "bg-red-100 text-red-800 hover:bg-red-200",
  "Faffy": "bg-purple-100 text-purple-800 hover:bg-purple-200",
  "BBQ": "bg-amber-100 text-amber-800 hover:bg-amber-200",
  "Winter": "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
};

interface EnhancedCategorySelectorProps {
  selectedCategories: RecipeCategory[];
  onCategoriesChange: (categories: RecipeCategory[]) => void;
}

export function EnhancedCategorySelector({ selectedCategories, onCategoriesChange }: EnhancedCategorySelectorProps) {
  const [customCategory, setCustomCategory] = useState("");

  const addCategory = (category: RecipeCategory) => {
    if (!selectedCategories.includes(category)) {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const removeCategory = (category: RecipeCategory) => {
    onCategoriesChange(selectedCategories.filter(cat => cat !== category));
  };

  const addCustomCategory = () => {
    if (customCategory.trim() && !selectedCategories.includes(customCategory as RecipeCategory)) {
      onCategoriesChange([...selectedCategories, customCategory as RecipeCategory]);
      setCustomCategory("");
    }
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Tag className="h-5 w-5 mr-2 text-blue-500" />
          Categories
        </h3>
        <Badge variant="secondary" className="bg-purple-50 text-purple-700">
          {selectedCategories.length} selected
        </Badge>
      </div>

      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected Categories:</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                className={`${getCategoryColor(category)} cursor-pointer transition-colors flex items-center gap-1`}
                onClick={() => removeCategory(category)}
              >
                {category}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Popular Categories:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PREDEFINED_CATEGORIES
            .filter(cat => !selectedCategories.includes(cat))
            .map(category => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => addCategory(category)}
                className={`justify-start text-left ${getCategoryColor(category)} border-current`}
              >
                <Plus className="h-3 w-3 mr-1" />
                {category}
              </Button>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Add Custom Category:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g., Desserts, Spicy, Low-carb"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
          />
          <Button 
            onClick={addCustomCategory} 
            disabled={!customCategory.trim()}
            size="sm"
            className="px-4"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        💡 Tip: Categories help you organize and find your recipes quickly.
      </p>
    </Card>
  );
}
