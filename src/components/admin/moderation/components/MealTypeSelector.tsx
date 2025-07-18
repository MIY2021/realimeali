
import { Label } from "@/components/ui/label";
import { CategoryButton } from "./CategoryButton";
import { MEAL_TYPE_OPTIONS } from "@/utils/recipeClassification";

interface MealTypeSelectorProps {
  value: string | string[]; // Support both single value and array
  onChange: (value: string | string[]) => void;
}

export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  // Normalize value to array for easier handling
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
  
  const handleOptionClick = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      // Remove if already selected
      const newValues = selectedValues.filter(v => v !== optionValue);
      onChange(newValues);
    } else {
      // Add if not selected
      const newValues = [...selectedValues, optionValue];
      onChange(newValues);
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Meal Type</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {MEAL_TYPE_OPTIONS.map((option) => (
          <CategoryButton
            key={option.value}
            option={option}
            isSelected={selectedValues.includes(option.value)}
            onClick={() => handleOptionClick(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
