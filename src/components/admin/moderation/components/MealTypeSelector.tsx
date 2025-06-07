
import { Label } from "@/components/ui/label";
import { CategoryButton } from "./CategoryButton";
import { MEAL_TYPE_OPTIONS } from "@/utils/recipeClassification";

interface MealTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">Meal Type</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {MEAL_TYPE_OPTIONS.map((option) => (
          <CategoryButton
            key={option.value}
            option={option}
            isSelected={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
